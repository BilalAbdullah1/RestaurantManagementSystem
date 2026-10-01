using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SMS.Core.Entities;

namespace SMS.Application.Repositories
{
    public interface ITimetableProxyRepository
    {
        Task<TimetableProxyAllocation> AllocateProxyAsync(TimetableProxyAllocation allocation);
        Task<IEnumerable<TimetableProxyAllocation>> GetProxiesForDateAsync(Guid tenantId, DateTime date);
        Task<bool> DeleteProxyAsync(Guid id);
    }
}
