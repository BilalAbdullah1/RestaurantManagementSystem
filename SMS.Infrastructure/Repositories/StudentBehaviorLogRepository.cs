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
    public class StudentBehaviorLogRepository : IStudentBehaviorLogRepository
    {
        private readonly ApplicationDbContext _context;

        public StudentBehaviorLogRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<BehaviorLogResponseDto>> GetAllLogsAsync(Guid tenantId, Guid academicYearId)
        {
            return await _context.StudentBehaviorLogs
                .Where(l => l.tenant_id == tenantId && l.academic_year_id == academicYearId)
                .Join(_context.Students, l => l.student_id, s => s.id, (l, s) => new { l, s })
                .Join(_context.Users, temp => temp.l.reported_by_user_id, u => u.id, (temp, u) => new BehaviorLogResponseDto
                {
                    id = temp.l.id,
                    student_id = temp.s.id,
                    student_name = temp.s.first_name + " " + temp.s.last_name,
                    admission_number = temp.s.admission_number,
                    incident_date = temp.l.incident_date,
                    incident_type = temp.l.incident_type,
                    points_affected = temp.l.points_affected,
                    action_taken = temp.l.action_taken,
                    reported_by_name = u.first_name + " " + u.last_name
                })
                .OrderByDescending(x => x.incident_date)
                .ToListAsync();
        }

        public async Task<IEnumerable<BehaviorLogResponseDto>> GetLogsByStudentAsync(Guid studentId, Guid academicYearId)
        {
            return await _context.StudentBehaviorLogs
                .Where(l => l.student_id == studentId && l.academic_year_id == academicYearId)
                .Join(_context.Students, l => l.student_id, s => s.id, (l, s) => new { l, s })
                .Join(_context.Users, temp => temp.l.reported_by_user_id, u => u.id, (temp, u) => new BehaviorLogResponseDto
                {
                    id = temp.l.id,
                    student_id = temp.s.id,
                    student_name = temp.s.first_name + " " + temp.s.last_name,
                    admission_number = temp.s.admission_number,
                    incident_date = temp.l.incident_date,
                    incident_type = temp.l.incident_type,
                    points_affected = temp.l.points_affected,
                    action_taken = temp.l.action_taken,
                    reported_by_name = u.first_name + " " + u.last_name
                })
                .OrderByDescending(x => x.incident_date)
                .ToListAsync();
        }

        public async Task<StudentBehaviorLog> GetByIdAsync(Guid id)
        {
            return await _context.StudentBehaviorLogs.FindAsync(id)!;
        }

        public async Task AddAsync(StudentBehaviorLog log)
        {
            await _context.StudentBehaviorLogs.AddAsync(log);
        }

        public void Update(StudentBehaviorLog log)
        {
            _context.StudentBehaviorLogs.Update(log);
        }

        public void Delete(StudentBehaviorLog log)
        {
            _context.StudentBehaviorLogs.Remove(log);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}