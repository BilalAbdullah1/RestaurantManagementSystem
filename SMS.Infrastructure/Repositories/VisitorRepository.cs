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
    public class VisitorRepository : IVisitorRepository
    {
        private readonly ApplicationDbContext _context;

        public VisitorRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Visitor?> GetByIdAsync(Guid id)
        {
            return await _context.Visitors.FindAsync(id);
        }

        public async Task<IEnumerable<Visitor>> GetByTenantAsync(Guid tenantId)
        {
            return await _context.Visitors
                .Where(v => v.tenant_id == tenantId)
                .OrderByDescending(v => v.check_in_time)
                .ToListAsync();
        }

        public async Task<IEnumerable<Visitor>> GetTodayVisitorsAsync(Guid tenantId)
        {
            var today = DateTime.UtcNow.Date;
            return await _context.Visitors
                .Where(v => v.tenant_id == tenantId && v.check_in_time.Date == today)
                .OrderByDescending(v => v.check_in_time)
                .ToListAsync();
        }

        public async Task AddAsync(Visitor visitor)
        {
            await _context.Visitors.AddAsync(visitor);
        }

        public void Update(Visitor visitor)
        {
            _context.Visitors.Update(visitor);
        }

        public void Delete(Visitor visitor)
        {
            _context.Visitors.Remove(visitor);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
