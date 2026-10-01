using Microsoft.EntityFrameworkCore;
using SMS.Application.DTOs;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using SMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Infrastructure.Repositories
{
    public class ExamResultRepository : IExamResultRepository
    {
        private readonly ApplicationDbContext _context;

        public ExamResultRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<int> GenerateClassResultsAsync(GenerateResultRequestDto dto)
        {
            // 1. Get all active students in the class
            var students = await _context.StudentEnrollments
                .Where(e => e.tenant_id == dto.tenant_id && e.class_id == dto.class_id && e.status == "Active")
                .Select(e => e.student_id)
                .ToListAsync();

            if (!students.Any()) return 0;

            // 2. Get the Date Sheet (Exam Schedules) to know Max Marks for this class
            var schedules = await _context.ExamSchedules
                .Where(s => s.exam_setup_id == dto.exam_setup_id && s.class_id == dto.class_id)
                .ToListAsync();

            // 3. Get all entered marks for this exam and class
            var allMarks = await _context.ExamMarks
                .Where(m => m.exam_setup_id == dto.exam_setup_id && m.class_id == dto.class_id)
                .ToListAsync();

            decimal classTotalMaxMarks = schedules.Sum(s => s.total_marks);

            // Fallback: If no date sheet schedule exists, compute total max marks from entered subject marks or distinct subjects count
            if (classTotalMaxMarks == 0 && allMarks.Any())
            {
                int distinctSubjectsCount = allMarks.Select(m => m.subject_id).Distinct().Count();
                classTotalMaxMarks = Math.Max(100, distinctSubjectsCount * 100);
            }

            if (classTotalMaxMarks == 0)
            {
                throw new Exception("Date Sheet schedule not found for this class. Please schedule paper slots in 'Date Sheets' screen or enter student marks first.");
            }

            // 4. Get Grading Scales (Rules)
            var gradingScales = await _context.GradingScales
                .Where(g => g.tenant_id == dto.tenant_id)
                .OrderByDescending(g => g.min_percentage) // Highest first
                .ToListAsync();

            // 5. Existing results (to Update instead of Insert)
            var existingResults = await _context.ExamResults
                .Where(r => r.exam_setup_id == dto.exam_setup_id && r.class_id == dto.class_id)
                .ToListAsync();

            var resultsToSave = new List<ExamResult>();
            int processedCount = 0;

            // 6. ENGINE CORE: Loop over every student and calculate
            foreach (var studentId in students)
            {
                var studentMarks = allMarks.Where(m => m.student_id == studentId).ToList();
                decimal totalObtained = studentMarks.Sum(m => m.is_absent ? 0 : m.obtained_marks);
                
                // Calculate Percentage
                decimal percentage = classTotalMaxMarks > 0 ? Math.Round((totalObtained / classTotalMaxMarks) * 100, 2) : 0;

                // Determine Grade & GPA from Scale
                var matchedGrade = gradingScales.FirstOrDefault(g => percentage >= g.min_percentage && percentage <= g.max_percentage);
                
                string gradeName = matchedGrade?.grade_name ?? (percentage >= 50 ? "P" : "F");
                decimal gpa = matchedGrade?.gpa_point ?? (percentage >= 50 ? 2.00m : 0.00m);
                string status = (gradeName == "F" || gradeName == "U") ? "Fail" : "Pass";

                // Upsert Logic
                var existingRecord = existingResults.FirstOrDefault(r => r.student_id == studentId);
                if (existingRecord != null)
                {
                    existingRecord.total_max_marks = classTotalMaxMarks;
                    existingRecord.total_obtained_marks = totalObtained;
                    existingRecord.percentage = percentage;
                    existingRecord.grade = gradeName;
                    existingRecord.gpa = gpa;
                    existingRecord.status = status;
                    existingRecord.remarks = existingRecord.remarks ?? "";
                    _context.ExamResults.Update(existingRecord);
                }
                else
                {
                    resultsToSave.Add(new ExamResult
                    {
                        id = Guid.NewGuid(),
                        tenant_id = dto.tenant_id,
                        exam_setup_id = dto.exam_setup_id,
                        class_id = dto.class_id,
                        student_id = studentId,
                        total_max_marks = classTotalMaxMarks,
                        total_obtained_marks = totalObtained,
                        percentage = percentage,
                        grade = gradeName,
                        gpa = gpa,
                        status = status,
                        remarks = "",
                        created_at = DateTime.UtcNow
                    });
                }
                processedCount++;
            }

            if (resultsToSave.Any()) await _context.ExamResults.AddRangeAsync(resultsToSave);
            await _context.SaveChangesAsync();

            return processedCount;
        }

        public async Task<IEnumerable<StudentReportCardDto>> GetClassResultsAsync(Guid tenantId, Guid examSetupId, Guid classId)
        {
            // 1. Get active students in this class
            var activeStudents = await _context.StudentEnrollments
                .Where(e => e.tenant_id == tenantId && e.class_id == classId && e.status == "Active")
                .Join(_context.Students, e => e.student_id, s => s.id, (e, s) => s)
                .ToListAsync();

            var studentIds = activeStudents.Select(s => s.id).ToList();

            // 2. Fetch compiled ExamResults
            var resultsMap = await _context.ExamResults
                .Where(r => r.tenant_id == tenantId && r.exam_setup_id == examSetupId && r.class_id == classId)
                .ToDictionaryAsync(r => r.student_id);

            // 3. Fetch all ExamMarks for these students
            var allMarks = await _context.ExamMarks
                .Where(m => m.tenant_id == tenantId && m.exam_setup_id == examSetupId && m.class_id == classId)
                .ToListAsync();

            // 4. Fetch Subjects for names
            var subjectsMap = await _context.Subjects
                .Where(s => s.tenant_id == tenantId)
                .ToDictionaryAsync(s => s.id, s => s.name);

            // 5. Fetch ExamSchedules for subject max marks
            var schedulesMap = await _context.ExamSchedules
                .Where(s => s.tenant_id == tenantId && s.exam_setup_id == examSetupId && s.class_id == classId)
                .ToDictionaryAsync(s => s.subject_id);

            var reportCards = new List<StudentReportCardDto>();

            foreach (var student in activeStudents)
            {
                resultsMap.TryGetValue(student.id, out var resRecord);
                var studentMarks = allMarks.Where(m => m.student_id == student.id).ToList();

                var subjectBreakdowns = new List<SubjectMarkBreakdownDto>();
                foreach (var mark in studentMarks)
                {
                    subjectsMap.TryGetValue(mark.subject_id, out var subName);
                    schedulesMap.TryGetValue(mark.subject_id, out var sched);

                    subjectBreakdowns.Add(new SubjectMarkBreakdownDto
                    {
                        subject_name = subName ?? "Subject",
                        max_marks = sched?.total_marks ?? 100,
                        passing_marks = sched?.passing_marks ?? 40,
                        theory_marks = mark.theory_marks,
                        practical_marks = mark.practical_marks,
                        assignment_marks = mark.assignment_marks,
                        obtained_marks = mark.obtained_marks,
                        is_absent = mark.is_absent
                    });
                }

                reportCards.Add(new StudentReportCardDto
                {
                    student_id = student.id,
                    student_name = $"{student.first_name} {student.last_name}",
                    admission_number = student.admission_number,
                    class_name = "",
                    exam_title = "",
                    total_max_marks = resRecord?.total_max_marks ?? 0,
                    total_obtained_marks = resRecord?.total_obtained_marks ?? 0,
                    percentage = resRecord?.percentage ?? 0,
                    grade = resRecord?.grade ?? "N/A",
                    gpa = resRecord?.gpa ?? 0,
                    status = resRecord?.status ?? "N/A",
                    subjects = subjectBreakdowns
                });
            }

            return reportCards.OrderByDescending(r => r.percentage);
        }
    }
}