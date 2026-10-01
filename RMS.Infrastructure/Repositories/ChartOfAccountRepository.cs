using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RMS.Application.Repositories;
using RMS.Core.Entities;
using RMS.Infrastructure.Persistence;

namespace RMS.Infrastructure.Repositories
{
    public class ChartOfAccountRepository : IChartOfAccountRepository
    {
        private readonly ApplicationDbContext _context;

        public ChartOfAccountRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ChartOfAccount>> GetByTenantAsync(Guid tenantId)
        {
            return await _context.ChartOfAccounts
                .Where(a => a.tenant_id == tenantId)
                .OrderBy(a => a.code)
                .ToListAsync();
        }

        public async Task<ChartOfAccount?> GetByIdAsync(Guid id)
        {
            return await _context.ChartOfAccounts.FindAsync(id);
        }

        public async Task AddAsync(ChartOfAccount account)
        {
            await _context.ChartOfAccounts.AddAsync(account);
        }

        public void Update(ChartOfAccount account)
        {
            _context.ChartOfAccounts.Update(account);
        }

        public void Delete(ChartOfAccount account)
        {
            _context.ChartOfAccounts.Remove(account);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}
