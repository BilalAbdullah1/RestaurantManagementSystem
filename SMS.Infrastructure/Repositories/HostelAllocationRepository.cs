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
    public class HostelAllocationRepository : IHostelAllocationRepository
    {
        private readonly ApplicationDbContext _context;
        public HostelAllocationRepository(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<HostelAllocation>> GetByTenantAsync(Guid tenantId) =>
            await _context.HostelAllocations.AsNoTracking()
                .Where(a => a.tenant_id == tenantId)
                .OrderByDescending(a => a.allocation_date)
                .ToListAsync();

        public async Task<HostelAllocation?> GetByIdAsync(Guid id) =>
            await _context.HostelAllocations.AsNoTracking()
                .FirstOrDefaultAsync(a => a.id == id);

        public async Task<IEnumerable<HostelAllocation>> GetByStudentAsync(Guid tenantId, Guid studentId) =>
            await _context.HostelAllocations.AsNoTracking()
                .Where(a => a.tenant_id == tenantId && a.student_id == studentId)
                .OrderByDescending(a => a.allocation_date)
                .ToListAsync();

        public async Task<IEnumerable<HostelAllocation>> GetByRoomAsync(Guid tenantId, Guid roomId) =>
            await _context.HostelAllocations.AsNoTracking()
                .Where(a => a.tenant_id == tenantId && a.room_id == roomId)
                .OrderByDescending(a => a.allocation_date)
                .ToListAsync();

        public async Task AddAsync(HostelAllocation allocation) =>
            await _context.HostelAllocations.AddAsync(allocation);

        public void Update(HostelAllocation allocation) =>
            _context.HostelAllocations.Update(allocation);

        public async Task DeleteAsync(Guid id)
        {
            var allocation = await _context.HostelAllocations.FindAsync(id);
            if (allocation != null)
                _context.HostelAllocations.Remove(allocation);
        }

        public async Task SaveChangesAsync() =>
            await _context.SaveChangesAsync();
    }
}
