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
    public class HostelRoomRepository : IHostelRoomRepository
    {
        private readonly ApplicationDbContext _context;
        public HostelRoomRepository(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<HostelRoom>> GetByTenantAsync(Guid tenantId) =>
            await _context.HostelRooms.AsNoTracking()
                .Where(r => r.tenant_id == tenantId)
                .OrderBy(r => r.room_number)
                .ToListAsync();

        public async Task<HostelRoom> GetByIdAsync(Guid id) =>
            await _context.HostelRooms.AsNoTracking()
                .FirstOrDefaultAsync(r => r.id == id);

        public async Task<bool> ExistsRoomNumberAsync(Guid tenantId, string roomNumber, Guid? excludeId = null) =>
            await _context.HostelRooms.AsNoTracking()
                .AnyAsync(r => r.tenant_id == tenantId
                            && r.room_number == roomNumber
                            && (excludeId == null || r.id != excludeId));

        public async Task AddAsync(HostelRoom room) =>
            await _context.HostelRooms.AddAsync(room);

        public void Update(HostelRoom room) =>
            _context.HostelRooms.Update(room);

        public async Task DeleteAsync(Guid id)
        {
            var room = await _context.HostelRooms.FindAsync(id);
            if (room != null)
                _context.HostelRooms.Remove(room);
        }

        public async Task SaveChangesAsync() =>
            await _context.SaveChangesAsync();
    }
}
