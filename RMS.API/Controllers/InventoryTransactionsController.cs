using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RMS.Application.Repositories;
using RMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMS.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryTransactionsController : ControllerBase
    {
        private readonly IInventoryTransactionRepository _transactionRepo;
        private readonly IInventoryItemRepository _itemRepo;

        public InventoryTransactionsController(
            IInventoryTransactionRepository transactionRepo,
            IInventoryItemRepository itemRepo)
        {
            _transactionRepo = transactionRepo;
            _itemRepo = itemRepo;
        }

        [HttpGet("tenant/{tenantId}")]
        public async Task<ActionResult<IEnumerable<InventoryTransaction>>> GetByTenant(Guid tenantId) =>
            Ok(await _transactionRepo.GetByTenantAsync(tenantId));

        [HttpGet("{id}")]
        public async Task<ActionResult<InventoryTransaction>> GetById(Guid id)
        {
            var transaction = await _transactionRepo.GetByIdAsync(id);
            if (transaction == null) return NotFound(new { message = "Inventory transaction not found" });
            return Ok(transaction);
        }

        [HttpGet("item/{tenantId}/{itemId}")]
        public async Task<ActionResult<IEnumerable<InventoryTransaction>>> GetByItem(Guid tenantId, Guid itemId) =>
            Ok(await _transactionRepo.GetByItemAsync(tenantId, itemId));

        [HttpPost]
        public async Task<ActionResult<InventoryTransaction>> Create(InventoryTransaction transaction)
        {
            // Update inventory stock based on transaction type
            var item = await _itemRepo.GetByIdAsync(transaction.item_id);
            if (item == null) return NotFound(new { message = "Inventory item not found" });

            if (transaction.transaction_type == "Purchase" || transaction.transaction_type == "Return")
                item.quantity += transaction.quantity;
            else if (transaction.transaction_type == "Issue" || transaction.transaction_type == "Adjustment")
            {
                if (item.quantity < transaction.quantity)
                    return BadRequest(new { message = $"Insufficient stock. Available: {item.quantity}" });
                item.quantity -= transaction.quantity;
            }

            _itemRepo.Update(item);

            transaction.id = Guid.NewGuid();
            transaction.created_at = DateTime.UtcNow;

            await _transactionRepo.AddAsync(transaction);
            await _transactionRepo.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = transaction.id }, transaction);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existing = await _transactionRepo.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = "Inventory transaction not found" });

            await _transactionRepo.DeleteAsync(id);
            await _transactionRepo.SaveChangesAsync();

            return Ok(new { message = "Inventory transaction deleted successfully" });
        }
    }
}
