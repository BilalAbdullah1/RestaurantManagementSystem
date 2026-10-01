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
    public class HostelRoomsController : ControllerBase
    {
        private readonly IHostelRoomRepository _repository;
        public HostelRoomsController(IHostelRoomRepository repository) => _repository = repository;

        [HttpGet("tenant/{tenantId}")]
        public async Task<ActionResult<IEnumerable<HostelRoom>>> GetByTenant(Guid tenantId) =>
            Ok(await _repository.GetByTenantAsync(tenantId));

        [HttpGet("{id}")]
        public async Task<ActionResult<HostelRoom>> GetById(Guid id)
        {
            var room = await _repository.GetByIdAsync(id);
            if (room == null) return NotFound(new { message = "Hostel room not found" });
            return Ok(room);
        }

        [HttpPost]
        public async Task<ActionResult<HostelRoom>> Create(HostelRoom room)
        {
            if (await _repository.ExistsRoomNumberAsync(room.tenant_id, room.room_number))
                return BadRequest(new { message = $"Room number '{room.room_number}' already exists." });

            room.id = Guid.NewGuid();
            room.created_at = DateTime.UtcNow;

            await _repository.AddAsync(room);
            await _repository.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = room.id }, room);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, HostelRoom room)
        {
            if (id != room.id) return BadRequest(new { message = "Identity mismatch in update parameters" });

            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = "Hostel room not found" });

            if (await _repository.ExistsRoomNumberAsync(room.tenant_id, room.room_number, excludeId: id))
                return BadRequest(new { message = $"Room number '{room.room_number}' is already assigned to another room." });

            room.created_at = existing.created_at;
            _repository.Update(room);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Hostel room updated successfully", data = room });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = "Hostel room not found" });

            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Hostel room deleted successfully" });
        }
    }
}
