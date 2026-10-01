using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IStudentEnrollmentRepository
    {
        Task<StudentEnrollment> GetByIdAsync(Guid id);
        Task<IEnumerable<StudentEnrollment>> GetHistoryByStudentAsync(Guid studentId);
        Task<StudentEnrollment> GetActiveEnrollmentAsync(Guid studentId, Guid academicYearId);
        Task<IEnumerable<StudentEnrollment>> GetEnrollmentsByFilterAsync(Guid yearId, Guid classId, Guid sectionId);
        Task<IEnumerable<object>> GetByTenantAsync(Guid tenantId);
        Task<bool> IsRollNumberTakenAsync(Guid academicYearId, Guid classId, Guid sectionId, int rollNumber, Guid? excludeEnrollmentId = null);
        Task AddAsync(StudentEnrollment enrollment);
        void Update(StudentEnrollment enrollment);
        Task<bool> SaveChangesAsync();
    }
}