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
    public class TransportRouteRepository : ITransportRouteRepository
    {
        private readonly ApplicationDbContext _context;
        public TransportRouteRepository(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<TransportRoute>> GetByTenantAsync(Guid tenantId) =>
            await _context.TransportRoutes.AsNoTracking()
                .Where(r => r.tenant_id == tenantId)
                .OrderBy(r => r.route_name)
                .ToListAsync();

        public async Task<TransportRoute?> GetByIdAsync(Guid id) =>
            await _context.TransportRoutes.AsNoTracking()
                .FirstOrDefaultAsync(r => r.id == id);

        public async Task<bool> ExistsRouteNameAsync(Guid tenantId, string routeName, Guid? excludeId = null) =>
            await _context.TransportRoutes.AsNoTracking()
                .AnyAsync(r => r.tenant_id == tenantId
                            && r.route_name == routeName
                            && (excludeId == null || r.id != excludeId));

        public async Task AddAsync(TransportRoute route) =>
            await _context.TransportRoutes.AddAsync(route);

        public void Update(TransportRoute route) =>
            _context.TransportRoutes.Update(route);

        public async Task DeleteAsync(Guid id)
        {
            var route = await _context.TransportRoutes.FindAsync(id);
            if (route != null)
                _context.TransportRoutes.Remove(route);
        }

        public async Task SaveChangesAsync() =>
            await _context.SaveChangesAsync();
    }
}
