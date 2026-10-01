using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IHostelRoomRepository
    {
        Task<IEnumerable<HostelRoom>> GetByTenantAsync(Guid tenantId);
        Task<HostelRoom?> GetByIdAsync(Guid id);
        Task<bool> ExistsRoomNumberAsync(Guid tenantId, string roomNumber, Guid? excludeId = null);
        Task AddAsync(HostelRoom room);
        void Update(HostelRoom room);
        Task DeleteAsync(Guid id);
        Task SaveChangesAsync();
    }
}
