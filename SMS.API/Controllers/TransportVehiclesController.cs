using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TransportVehiclesController : ControllerBase
    {
        private readonly ITransportVehicleRepository _repository;
        public TransportVehiclesController(ITransportVehicleRepository repository) => _repository = repository;

        [HttpGet("tenant/{tenantId}")]
        public async Task<ActionResult<IEnumerable<TransportVehicle>>> GetByTenant(Guid tenantId) =>
            Ok(await _repository.GetByTenantAsync(tenantId));

        [HttpGet("{id}")]
        public async Task<ActionResult<TransportVehicle>> GetById(Guid id)
        {
            var vehicle = await _repository.GetByIdAsync(id);
            if (vehicle == null) return NotFound(new { message = "Vehicle not found" });
            return Ok(vehicle);
        }

        [HttpPost]
        public async Task<ActionResult<TransportVehicle>> Create(TransportVehicle vehicle)
        {
            if (await _repository.ExistsVehicleNumberAsync(vehicle.tenant_id, vehicle.vehicle_number))
                return BadRequest(new { message = $"Vehicle number '{vehicle.vehicle_number}' already exists." });

            vehicle.id = Guid.NewGuid();
            vehicle.created_at = DateTime.UtcNow;

            await _repository.AddAsync(vehicle);
            await _repository.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = vehicle.id }, vehicle);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, TransportVehicle vehicle)
        {
            if (id != vehicle.id) return BadRequest(new { message = "Identity mismatch in update parameters" });

            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = "Vehicle not found" });

            if (await _repository.ExistsVehicleNumberAsync(vehicle.tenant_id, vehicle.vehicle_number, excludeId: id))
                return BadRequest(new { message = $"Vehicle number '{vehicle.vehicle_number}' is already in use." });

            vehicle.created_at = existing.created_at;
            _repository.Update(vehicle);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Vehicle updated successfully", data = vehicle });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = "Vehicle not found" });

            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Vehicle deleted successfully" });
        }
    }
}
