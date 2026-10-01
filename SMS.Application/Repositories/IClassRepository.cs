using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IClassRepository
    {
        Task<IEnumerable<SchoolClass>> GetByTenantAsync(Guid tenantId);
        Task<SchoolClass?> GetByIdAsync(Guid id);
        Task<bool> ExistsByNameAsync(Guid tenantId, string name, Guid? excludeId = null);
        Task AddAsync(SchoolClass schoolClass);
        void Update(SchoolClass schoolClass);
        void Delete(SchoolClass schoolClass);
        Task SaveChangesAsync();
    }
}