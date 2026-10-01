using RMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMS.Application.Repositories
{
    public interface IInventoryTransactionRepository
    {
        Task<IEnumerable<InventoryTransaction>> GetByTenantAsync(Guid tenantId);
        Task<InventoryTransaction?> GetByIdAsync(Guid id);
        Task<IEnumerable<InventoryTransaction>> GetByItemAsync(Guid tenantId, Guid itemId);
        Task AddAsync(InventoryTransaction transaction);
        void Update(InventoryTransaction transaction);
        Task DeleteAsync(Guid id);
        Task SaveChangesAsync();
    }
}
