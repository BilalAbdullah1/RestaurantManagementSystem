using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using SMS.Infrastructure.Persistence;

namespace SMS.Infrastructure.Repositories
{
    public class TimetableProxyRepository : ITimetableProxyRepository
    {
        private readonly ApplicationDbContext _context;

        public TimetableProxyRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<TimetableProxyAllocation> AllocateProxyAsync(TimetableProxyAllocation allocation)
        {
            allocation.id = Guid.NewGuid();
            allocation.created_at = DateTime.UtcNow;
            
            // Normalize date to DateOnly
            allocation.date_of_proxy = allocation.date_of_proxy.Date;

            _context.TimetableProxyAllocations.Add(allocation);
            await _context.SaveChangesAsync();
            return allocation;
        }

        public async Task<IEnumerable<TimetableProxyAllocation>> GetProxiesForDateAsync(Guid tenantId, DateTime date)
        {
            var dateOnly = date.Date;
            return await _context.TimetableProxyAllocations
                .Where(a => a.tenant_id == tenantId && a.date_of_proxy.Date == dateOnly)
                .ToListAsync();
        }

        public async Task<bool> DeleteProxyAsync(Guid id)
        {
            var allocation = await _context.TimetableProxyAllocations.FindAsync(id);
            if (allocation == null) return false;

            _context.TimetableProxyAllocations.Remove(allocation);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
