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
    public class ExamMarkRepository : IExamMarkRepository
    {
        private readonly ApplicationDbContext _context;

        public ExamMarkRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<StudentMarkSheetDto>> GetMarksSheetAsync(Guid tenantId, Guid examSetupId, Guid classId, Guid subjectId)
        {
            // 1. Pehle us class ke saare ACTIVE bachon ki list nikalein
            var activeStudents = await _context.StudentEnrollments
                .Where(e => e.tenant_id == tenantId && e.class_id == classId && e.status == "Active")
                .Join(_context.Students, e => e.student_id, s => s.id, (e, s) => s)
                .OrderBy(s => s.first_name)
                .ToListAsync();

            // 2. Phir check karein ke kya is Exam+Class+Subject ke marks pehle se save hain?
            var existingMarks = await _context.ExamMarks
                .Where(m => m.exam_setup_id == examSetupId && m.class_id == classId && m.subject_id == subjectId)
                .ToListAsync();

            // 3. Dono ko merge karke frontend ke liye tayar karein
            var result = new List<StudentMarkSheetDto>();

            foreach (var student in activeStudents)
            {
                var markRecord = existingMarks.FirstOrDefault(m => m.student_id == student.id);
                
                result.Add(new StudentMarkSheetDto
                {
                    student_id = student.id,
                    student_name = $"{student.first_name} {student.last_name}",
                    admission_number = student.admission_number,
                    mark_id = markRecord?.id, // Null if not entered yet
                    theory_marks = markRecord?.theory_marks ?? 0,
                    practical_marks = markRecord?.practical_marks ?? 0,
                    assignment_marks = markRecord?.assignment_marks ?? 0,
                    obtained_marks = markRecord?.obtained_marks ?? 0,
                    is_absent = markRecord?.is_absent ?? false,
                    remarks = markRecord?.remarks ?? ""
                });
            }

            return result;
        }

        public async Task<int> SaveBulkMarksAsync(BulkSaveMarksDto dto)
        {
            int updatedOrInsertedCount = 0;

            // Fetch existing marks for this specific exam + class + subject
            var existingMarks = await _context.ExamMarks
                .Where(m => m.exam_setup_id == dto.exam_setup_id && m.class_id == dto.class_id && m.subject_id == dto.subject_id)
                .ToListAsync();

            foreach (var incomingMark in dto.marks)
            {
                var existingRecord = existingMarks.FirstOrDefault(m => m.student_id == incomingMark.student_id);

                if (existingRecord != null)
                {
                    // UPDATE: Agar record mojood hai toh update kardo
                    existingRecord.theory_marks = incomingMark.theory_marks;
                    existingRecord.practical_marks = incomingMark.practical_marks;
                    existingRecord.assignment_marks = incomingMark.assignment_marks;
                    existingRecord.obtained_marks = incomingMark.theory_marks + incomingMark.practical_marks + incomingMark.assignment_marks;
                    existingRecord.is_absent = incomingMark.is_absent;
                    existingRecord.remarks = incomingMark.remarks;
                    _context.ExamMarks.Update(existingRecord);
                }
                else
                {
                    // INSERT: Agar record nahi hai toh naya bana do
                    var newRecord = new ExamMark
                    {
                        id = Guid.NewGuid(),
                        tenant_id = dto.tenant_id,
                        exam_setup_id = dto.exam_setup_id,
                        class_id = dto.class_id,
                        subject_id = dto.subject_id,
                        student_id = incomingMark.student_id,
                        theory_marks = incomingMark.theory_marks,
                        practical_marks = incomingMark.practical_marks,
                        assignment_marks = incomingMark.assignment_marks,
                        obtained_marks = incomingMark.theory_marks + incomingMark.practical_marks + incomingMark.assignment_marks,
                        is_absent = incomingMark.is_absent,
                        remarks = incomingMark.remarks,
                        created_at = DateTime.UtcNow
                    };
                    await _context.ExamMarks.AddAsync(newRecord);
                }
                updatedOrInsertedCount++;
            }

            await _context.SaveChangesAsync();
            return updatedOrInsertedCount;
        }
    }
}