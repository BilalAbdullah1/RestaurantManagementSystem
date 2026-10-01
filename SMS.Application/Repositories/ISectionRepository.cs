using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface ISectionRepository
    {
        Task<IEnumerable<Section>> GetByTenantAsync(Guid tenantId);
        Task<IEnumerable<Section>> GetByClassAsync(Guid classId);
        Task<Section?> GetByIdAsync(Guid id);
        Task<bool> ExistsByNameAsync(Guid classId, string name, Guid? excludeId = null);
        Task AddAsync(Section section);
        void Update(Section section);
        void Delete(Section section);
        Task SaveChangesAsync();
    }
}