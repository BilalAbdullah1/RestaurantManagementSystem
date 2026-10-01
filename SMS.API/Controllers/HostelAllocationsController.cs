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
    public class HostelAllocationsController : ControllerBase
    {
        private readonly IHostelAllocationRepository _repository;
        public HostelAllocationsController(IHostelAllocationRepository repository) => _repository = repository;

        [HttpGet("tenant/{tenantId}")]
        public async Task<ActionResult<IEnumerable<HostelAllocation>>> GetByTenant(Guid tenantId) =>
            Ok(await _repository.GetByTenantAsync(tenantId));

        [HttpGet("{id}")]
        public async Task<ActionResult<HostelAllocation>> GetById(Guid id)
        {
            var allocation = await _repository.GetByIdAsync(id);
            if (allocation == null) return NotFound(new { message = "Hostel allocation not found" });
            return Ok(allocation);
        }

        [HttpGet("student/{tenantId}/{studentId}")]
        public async Task<ActionResult<IEnumerable<HostelAllocation>>> GetByStudent(Guid tenantId, Guid studentId) =>
            Ok(await _repository.GetByStudentAsync(tenantId, studentId));

        [HttpGet("room/{tenantId}/{roomId}")]
        public async Task<ActionResult<IEnumerable<HostelAllocation>>> GetByRoom(Guid tenantId, Guid roomId) =>
            Ok(await _repository.GetByRoomAsync(tenantId, roomId));

        [HttpPost]
        public async Task<ActionResult<HostelAllocation>> Create(HostelAllocation allocation)
        {
            allocation.id = Guid.NewGuid();
            allocation.created_at = DateTime.UtcNow;

            await _repository.AddAsync(allocation);
            await _repository.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = allocation.id }, allocation);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, HostelAllocation allocation)
        {
            if (id != allocation.id) return BadRequest(new { message = "Identity mismatch in update parameters" });

            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = "Hostel allocation not found" });

            allocation.created_at = existing.created_at;
            _repository.Update(allocation);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Hostel allocation updated successfully", data = allocation });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = "Hostel allocation not found" });

            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Hostel allocation deleted successfully" });
        }
    }
}
