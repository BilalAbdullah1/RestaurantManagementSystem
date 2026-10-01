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
    public class InventoryItemsController : ControllerBase
    {
        private readonly IInventoryItemRepository _repository;
        public InventoryItemsController(IInventoryItemRepository repository) => _repository = repository;

        [HttpGet("tenant/{tenantId}")]
        public async Task<ActionResult<IEnumerable<InventoryItem>>> GetByTenant(Guid tenantId) =>
            Ok(await _repository.GetByTenantAsync(tenantId));

        [HttpGet("{id}")]
        public async Task<ActionResult<InventoryItem>> GetById(Guid id)
        {
            var item = await _repository.GetByIdAsync(id);
            if (item == null) return NotFound(new { message = "Inventory item not found" });
            return Ok(item);
        }

        [HttpGet("low-stock/{tenantId}")]
        public async Task<ActionResult<IEnumerable<InventoryItem>>> GetLowStock(Guid tenantId) =>
            Ok(await _repository.GetLowStockAsync(tenantId));

        [HttpPost]
        public async Task<ActionResult<InventoryItem>> Create(InventoryItem item)
        {
            if (await _repository.ExistsItemNameAsync(item.tenant_id, item.item_name, item.category))
                return BadRequest(new { message = $"Item '{item.item_name}' already exists in category '{item.category}'." });

            item.id = Guid.NewGuid();
            item.created_at = DateTime.UtcNow;

            await _repository.AddAsync(item);
            await _repository.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = item.id }, item);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, InventoryItem item)
        {
            if (id != item.id) return BadRequest(new { message = "Identity mismatch in update parameters" });

            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = "Inventory item not found" });

            if (await _repository.ExistsItemNameAsync(item.tenant_id, item.item_name, item.category, excludeId: id))
                return BadRequest(new { message = $"Item '{item.item_name}' already exists in category '{item.category}'." });

            item.created_at = existing.created_at;
            _repository.Update(item);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Inventory item updated successfully", data = item });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = "Inventory item not found" });

            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Inventory item deleted successfully" });
        }
    }
}
