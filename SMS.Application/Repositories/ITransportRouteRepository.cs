using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface ITransportRouteRepository
    {
        Task<IEnumerable<TransportRoute>> GetByTenantAsync(Guid tenantId);
        Task<TransportRoute?> GetByIdAsync(Guid id);
        Task<bool> ExistsRouteNameAsync(Guid tenantId, string routeName, Guid? excludeId = null);
        Task AddAsync(TransportRoute route);
        void Update(TransportRoute route);
        Task DeleteAsync(Guid id);
        Task SaveChangesAsync();
    }
}
