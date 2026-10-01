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
    public class StudentEnrollmentRepository : IStudentEnrollmentRepository
    {
        private readonly ApplicationDbContext _context;

        public StudentEnrollmentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<StudentEnrollment> GetByIdAsync(Guid id)
        {
            return await _context.StudentEnrollments.FindAsync(id)!;
        }

        public async Task<IEnumerable<StudentEnrollment>> GetHistoryByStudentAsync(Guid studentId)
        {
            return await _context.StudentEnrollments
                                 .Where(e => e.student_id == studentId)
                                 .OrderByDescending(e => e.created_at)
                                 .ToListAsync();
        }

        public async Task<IEnumerable<StudentEnrollment>> GetEnrollmentsByFilterAsync(Guid yearId, Guid classId, Guid sectionId)
        {
            return await _context.StudentEnrollments
                                 .Where(e => e.academic_year_id == yearId &&
                                             e.class_id == classId &&
                                             e.section_id == sectionId)
                                 .ToListAsync();
        }

        public async Task<IEnumerable<object>> GetByTenantAsync(Guid tenantId)
        {
            return await (from e in _context.StudentEnrollments.AsNoTracking()
                          where e.tenant_id == tenantId
                          join c in _context.Classes on e.class_id equals c.id into cGroup
                          from c in cGroup.DefaultIfEmpty()
                          join s in _context.Sections on e.section_id equals s.id into sGroup
                          from s in sGroup.DefaultIfEmpty()
                          select new
                          {
                              e.id,
                              e.tenant_id,
                              e.student_id,
                              e.academic_year_id,
                              e.class_id,
                              e.section_id,
                              e.roll_number,
                              e.status,
                              e.created_at,
                              class_name = c != null ? c.name : "",
                              section_name = s != null ? s.name : ""
                          }).ToListAsync();
        }

        public async Task<StudentEnrollment> GetActiveEnrollmentAsync(Guid studentId, Guid academicYearId)
        {
            return await _context.StudentEnrollments
                                 .FirstOrDefaultAsync(e => e.student_id == studentId && e.academic_year_id == academicYearId);
        }

        public async Task<bool> IsRollNumberTakenAsync(Guid academicYearId, Guid classId, Guid sectionId, int rollNumber, Guid? excludeEnrollmentId = null)
        {
            return await _context.StudentEnrollments
                                 .AnyAsync(e => e.academic_year_id == academicYearId &&
                                                e.class_id == classId &&
                                                e.section_id == sectionId &&
                                                e.roll_number == rollNumber &&
                                                (excludeEnrollmentId == null || e.id != excludeEnrollmentId));
        }

        public async Task AddAsync(StudentEnrollment enrollment)
        {
            await _context.StudentEnrollments.AddAsync(enrollment);
        }

        public void Update(StudentEnrollment enrollment)
        {
            _context.StudentEnrollments.Update(enrollment);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}