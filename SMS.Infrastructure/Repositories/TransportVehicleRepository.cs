using Microsoft.EntityFrameworkCore;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using SMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Infrastructure.Repositories
{
    public class TransportVehicleRepository : ITransportVehicleRepository
    {
        private readonly ApplicationDbContext _context;
        public TransportVehicleRepository(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<TransportVehicle>> GetByTenantAsync(Guid tenantId) =>
            await _context.TransportVehicles.AsNoTracking()
                .Where(v => v.tenant_id == tenantId)
                .OrderBy(v => v.vehicle_number)
                .ToListAsync();

        public async Task<TransportVehicle?> GetByIdAsync(Guid id) =>
            await _context.TransportVehicles.AsNoTracking()
                .FirstOrDefaultAsync(v => v.id == id);

        public async Task<bool> ExistsVehicleNumberAsync(Guid tenantId, string vehicleNumber, Guid? excludeId = null) =>
            await _context.TransportVehicles.AsNoTracking()
                .AnyAsync(v => v.tenant_id == tenantId
                            && v.vehicle_number == vehicleNumber
                            && (excludeId == null || v.id != excludeId));

        public async Task AddAsync(TransportVehicle vehicle) =>
            await _context.TransportVehicles.AddAsync(vehicle);

        public void Update(TransportVehicle vehicle) =>
            _context.TransportVehicles.Update(vehicle);

        public async Task DeleteAsync(Guid id)
        {
            var vehicle = await _context.TransportVehicles.FindAsync(id);
            if (vehicle != null)
                _context.TransportVehicles.Remove(vehicle);
        }

        public async Task SaveChangesAsync() =>
            await _context.SaveChangesAsync();
    }
}
