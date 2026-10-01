using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface ISubjectRepository
    {
        Task<IEnumerable<Subject>> GetByTenantAsync(Guid tenantId);
        Task<Subject?> GetByIdAsync(Guid id);
        Task<bool> ExistsByNameAsync(Guid tenantId, string name, Guid? excludeId = null);
        Task AddAsync(Subject subject);
        void Update(Subject subject);
        void Delete(Subject subject);
        Task SaveChangesAsync();
    }
}