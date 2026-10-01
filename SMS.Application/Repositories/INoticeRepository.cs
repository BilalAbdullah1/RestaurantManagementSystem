using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface INoticeRepository
    {
        Task<Notice?> GetByIdAsync(Guid id);
        Task<IEnumerable<Notice>> GetByTenantAsync(Guid tenantId);
        Task<IEnumerable<Notice>> GetActiveNoticesAsync(Guid tenantId);
        Task AddAsync(Notice notice);
        void Update(Notice notice);
        void Delete(Notice notice);
        Task SaveChangesAsync();
    }
}
