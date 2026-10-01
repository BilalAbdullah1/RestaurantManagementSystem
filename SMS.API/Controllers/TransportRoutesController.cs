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
    public class TransportRoutesController : ControllerBase
    {
        private readonly ITransportRouteRepository _repository;
        public TransportRoutesController(ITransportRouteRepository repository) => _repository = repository;

        [HttpGet("tenant/{tenantId}")]
        public async Task<ActionResult<IEnumerable<TransportRoute>>> GetByTenant(Guid tenantId) =>
            Ok(await _repository.GetByTenantAsync(tenantId));

        [HttpGet("{id}")]
        public async Task<ActionResult<TransportRoute>> GetById(Guid id)
        {
            var route = await _repository.GetByIdAsync(id);
            if (route == null) return NotFound(new { message = "Transport route not found" });
            return Ok(route);
        }

        [HttpPost]
        public async Task<ActionResult<TransportRoute>> Create(TransportRoute route)
        {
            if (await _repository.ExistsRouteNameAsync(route.tenant_id, route.route_name))
                return BadRequest(new { message = $"Route name '{route.route_name}' already exists." });

            route.id = Guid.NewGuid();
            route.created_at = DateTime.UtcNow;

            await _repository.AddAsync(route);
            await _repository.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = route.id }, route);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, TransportRoute route)
        {
            if (id != route.id) return BadRequest(new { message = "Identity mismatch in update parameters" });

            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = "Transport route not found" });

            if (await _repository.ExistsRouteNameAsync(route.tenant_id, route.route_name, excludeId: id))
                return BadRequest(new { message = $"Route name '{route.route_name}' is already in use." });

            route.created_at = existing.created_at;
            _repository.Update(route);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Transport route updated successfully", data = route });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = "Transport route not found" });

            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Transport route deleted successfully" });
        }
    }
}
