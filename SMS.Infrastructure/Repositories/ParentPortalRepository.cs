using Microsoft.EntityFrameworkCore;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using SMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Infrastructure.Repositories
{
    public class ParentPortalRepository : IParentPortalRepository
    {
        private readonly ApplicationDbContext _context;

        public ParentPortalRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<MyKidDto>> GetKidsByParentIdAsync(Guid parentId, Guid tenantId)
        {
            var kids = await _context.Students
                .Where(s => s.tenant_id == tenantId && s.parent_id == parentId && s.is_active)
                .Join(_context.StudentEnrollments, 
                      s => s.id, 
                      e => e.student_id, 
                      (s, e) => new { s, e })
                .Where(se => se.e.status == "Active")
                .Join(_context.Classes, 
                      se => se.e.class_id, 
                      c => c.id, 
                      (se, c) => new { se.s, se.e, c })
                .Join(_context.Sections, 
                      sec => sec.e.section_id, 
                      sct => sct.id, 
                      (sec, sct) => new MyKidDto
                      {
                          student_id = sec.s.id,
                          first_name = sec.s.first_name,
                          last_name = sec.s.last_name,
                          admission_number = sec.s.admission_number,
                          gender = sec.s.gender,
                          class_name = sec.c.name,
                          section_name = sct.name
                      })
                .ToListAsync();

            return kids;
        }

        public async Task<ParentDashboardSummaryDto> GetDashboardSummaryForKidAsync(Guid studentId, Guid tenantId)
        {
            var student = await _context.Students.FirstOrDefaultAsync(s => s.id == studentId && s.tenant_id == tenantId);
            if (student == null) return null!;

            var summary = new ParentDashboardSummaryDto
            {
                student_id = studentId,
                student_name = $"{student.first_name} {student.last_name}"
            };

            // 1. Attendance Percentage
            var totalAttendances = await _context.StudentAttendances
                .Where(a => a.student_id == studentId && a.tenant_id == tenantId)
                .CountAsync();
            
            var presentAttendances = await _context.StudentAttendances
                .Where(a => a.student_id == studentId && a.tenant_id == tenantId && (a.status == "Present" || a.status == "Late"))
                .CountAsync();

            summary.attendance_percentage = totalAttendances > 0 
                ? Math.Round((double)presentAttendances / totalAttendances * 100, 2) 
                : 100;

            // 2. Pending & Paid Fees
            var allChallans = await _context.FeeChallans
                .Where(fc => fc.student_id == studentId && fc.tenant_id == tenantId)
                .Select(fc => new PendingFeeDto
                {
                    challan_id = fc.id,
                    challan_number = fc.challan_number,
                    amount = fc.net_payable,
                    due_date = fc.due_date,
                    status = fc.status
                }).ToListAsync();

            var pendingChallans = allChallans.Where(c => c.status != "Paid").ToList();
            var paidChallans = allChallans.Where(c => c.status == "Paid").ToList();

            summary.pending_fees = pendingChallans;
            summary.paid_fees = paidChallans;
            summary.total_pending_fees = pendingChallans.Sum(c => c.amount);

            // 3. Recent Homework
            // Note: We need the student's class and section to get homework
            var enrollment = await _context.StudentEnrollments
                .Where(e => e.student_id == studentId && e.tenant_id == tenantId && e.status == "Active")
                .FirstOrDefaultAsync();

            if (enrollment != null)
            {
                var recentHomework = await _context.Homeworks
                    .Where(h => h.class_id == enrollment.class_id && h.section_id == enrollment.section_id && h.tenant_id == tenantId)
                    .OrderByDescending(h => h.created_at)
                    .Take(5)
                    .Join(_context.Subjects, 
                          h => h.subject_id, 
                          sub => sub.id, 
                          (h, sub) => new { h, sub })
                    .Select(x => new RecentHomeworkDto
                    {
                        homework_id = x.h.id,
                        subject_name = x.sub.name,
                        title = x.h.title,
                        due_date = x.h.due_date,
                        status = _context.HomeworkSubmissions.Any(s => s.homework_id == x.h.id && s.student_id == studentId) ? "Submitted" : "Pending"
                    })
                    .ToListAsync();

                summary.recent_homework = recentHomework;
            }

            // 4. Recent Exams
            var recentExams = await _context.ExamMarks
                .Where(m => m.student_id == studentId && m.tenant_id == tenantId)
                .OrderByDescending(m => m.created_at)
                .Take(5)
                .Join(_context.ExamSetups, 
                      m => m.exam_setup_id, 
                      es => es.id, 
                      (m, es) => new { m, es })
                .Join(_context.Subjects, 
                      x => x.m.subject_id, 
                      sub => sub.id, 
                      (x, sub) => new RecentExamDto
                      {
                          exam_title = x.es.title,
                          subject_name = sub.name,
                          marks_obtained = x.m.obtained_marks,
                          total_marks = 100, // Hardcoded or needs schedule join if total marks is in schedule
                          grade = "A" // In reality, calculate via GradingScale
                      })
                .ToListAsync();

            summary.recent_exams = recentExams;

            return summary;
        }
    }
}
