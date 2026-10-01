using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface ITransportVehicleRepository
    {
        Task<IEnumerable<TransportVehicle>> GetByTenantAsync(Guid tenantId);
        Task<TransportVehicle?> GetByIdAsync(Guid id);
        Task<bool> ExistsVehicleNumberAsync(Guid tenantId, string vehicleNumber, Guid? excludeId = null);
        Task AddAsync(TransportVehicle vehicle);
        void Update(TransportVehicle vehicle);
        Task DeleteAsync(Guid id);
        Task SaveChangesAsync();
    }
}
