using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IInventoryItemRepository
    {
        Task<IEnumerable<InventoryItem>> GetByTenantAsync(Guid tenantId);
        Task<InventoryItem?> GetByIdAsync(Guid id);
        Task<IEnumerable<InventoryItem>> GetLowStockAsync(Guid tenantId);
        Task<bool> ExistsItemNameAsync(Guid tenantId, string itemName, string category, Guid? excludeId = null);
        Task AddAsync(InventoryItem item);
        void Update(InventoryItem item);
        Task DeleteAsync(Guid id);
        Task SaveChangesAsync();
    }
}
