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
    public class NoticeRepository : INoticeRepository
    {
        private readonly ApplicationDbContext _context;

        public NoticeRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Notice?> GetByIdAsync(Guid id)
        {
            return await _context.Notices.FindAsync(id);
        }

        public async Task<IEnumerable<Notice>> GetByTenantAsync(Guid tenantId)
        {
            return await _context.Notices
                .Where(n => n.tenant_id == tenantId)
                .OrderByDescending(n => n.published_at)
                .ToListAsync();
        }

        public async Task<IEnumerable<Notice>> GetActiveNoticesAsync(Guid tenantId)
        {
            var now = DateTime.UtcNow;
            return await _context.Notices
                .Where(n => n.tenant_id == tenantId && n.is_active && (n.expires_at == null || n.expires_at > now))
                .OrderByDescending(n => n.published_at)
                .ToListAsync();
        }

        public async Task AddAsync(Notice notice)
        {
            await _context.Notices.AddAsync(notice);
        }

        public void Update(Notice notice)
        {
            _context.Notices.Update(notice);
        }

        public void Delete(Notice notice)
        {
            _context.Notices.Remove(notice);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
