using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IHostelAllocationRepository
    {
        Task<IEnumerable<HostelAllocation>> GetByTenantAsync(Guid tenantId);
        Task<HostelAllocation?> GetByIdAsync(Guid id);
        Task<IEnumerable<HostelAllocation>> GetByStudentAsync(Guid tenantId, Guid studentId);
        Task<IEnumerable<HostelAllocation>> GetByRoomAsync(Guid tenantId, Guid roomId);
        Task AddAsync(HostelAllocation allocation);
        void Update(HostelAllocation allocation);
        Task DeleteAsync(Guid id);
        Task SaveChangesAsync();
    }
}
