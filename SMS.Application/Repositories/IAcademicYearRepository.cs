using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IAcademicYearRepository
    {
        Task<IEnumerable<AcademicYear>> GetByTenantAsync(Guid tenantId);
        Task<AcademicYear?> GetByIdAsync(Guid id);
        Task<AcademicYear?> GetCurrentByTenantAsync(Guid tenantId);
        Task<bool> ExistsTitleAsync(Guid tenantId, string title);
        Task AddAsync(AcademicYear academicYear);
        void Update(AcademicYear academicYear);
        void Delete(AcademicYear academicYear);
        Task SaveChangesAsync();
        Task UnsetAllCurrentAsync(Guid tenantId);
    }
}