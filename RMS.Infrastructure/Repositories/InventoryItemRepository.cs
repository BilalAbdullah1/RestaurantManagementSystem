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
    public class InventoryItemRepository : IInventoryItemRepository
    {
        private readonly ApplicationDbContext _context;
        public InventoryItemRepository(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<InventoryItem>> GetByTenantAsync(Guid tenantId) =>
            await _context.InventoryItems.AsNoTracking()
                .Where(i => i.tenant_id == tenantId)
                .OrderBy(i => i.category)
                .ThenBy(i => i.item_name)
                .ToListAsync();

        public async Task<InventoryItem?> GetByIdAsync(Guid id) =>
            await _context.InventoryItems.AsNoTracking()
                .FirstOrDefaultAsync(i => i.id == id);

        public async Task<IEnumerable<InventoryItem>> GetLowStockAsync(Guid tenantId) =>
            await _context.InventoryItems.AsNoTracking()
                .Where(i => i.tenant_id == tenantId && i.quantity <= i.reorder_level)
                .OrderBy(i => i.quantity)
                .ToListAsync();

        public async Task<bool> ExistsItemNameAsync(Guid tenantId, string itemName, string category, Guid? excludeId = null) =>
            await _context.InventoryItems.AsNoTracking()
                .AnyAsync(i => i.tenant_id == tenantId
                            && i.item_name == itemName
                            && i.category == category
                            && (excludeId == null || i.id != excludeId));

        public async Task AddAsync(InventoryItem item) =>
            await _context.InventoryItems.AddAsync(item);

        public void Update(InventoryItem item) =>
            _context.InventoryItems.Update(item);

        public async Task DeleteAsync(Guid id)
        {
            var item = await _context.InventoryItems.FindAsync(id);
            if (item != null)
                _context.InventoryItems.Remove(item);
        }

        public async Task SaveChangesAsync() =>
            await _context.SaveChangesAsync();
    }
}
