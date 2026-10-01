using Microsoft.EntityFrameworkCore;
using RMS.Application.Repositories;
using RMS.Core.Entities;
using RMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMS.Infrastructure.Repositories
{
    public class InventoryTransactionRepository : IInventoryTransactionRepository
    {
        private readonly ApplicationDbContext _context;
        public InventoryTransactionRepository(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<InventoryTransaction>> GetByTenantAsync(Guid tenantId) =>
            await _context.InventoryTransactions.AsNoTracking()
                .Where(t => t.tenant_id == tenantId)
                .OrderByDescending(t => t.transaction_date)
                .ToListAsync();

        public async Task<InventoryTransaction?> GetByIdAsync(Guid id) =>
            await _context.InventoryTransactions.AsNoTracking()
                .FirstOrDefaultAsync(t => t.id == id);

        public async Task<IEnumerable<InventoryTransaction>> GetByItemAsync(Guid tenantId, Guid itemId) =>
            await _context.InventoryTransactions.AsNoTracking()
                .Where(t => t.tenant_id == tenantId && t.item_id == itemId)
                .OrderByDescending(t => t.transaction_date)
                .ToListAsync();

        public async Task AddAsync(InventoryTransaction transaction) =>
            await _context.InventoryTransactions.AddAsync(transaction);

        public void Update(InventoryTransaction transaction) =>
            _context.InventoryTransactions.Update(transaction);

        public async Task DeleteAsync(Guid id)
        {
            var transaction = await _context.InventoryTransactions.FindAsync(id);
            if (transaction != null)
                _context.InventoryTransactions.Remove(transaction);
        }

        public async Task SaveChangesAsync() =>
            await _context.SaveChangesAsync();
    }
}
