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
    public class StudentTransportController : ControllerBase
    {
        private readonly IStudentTransportRepository _repository;
        public StudentTransportController(IStudentTransportRepository repository) => _repository = repository;

        [HttpGet("tenant/{tenantId}")]
        public async Task<ActionResult<IEnumerable<StudentTransport>>> GetByTenant(Guid tenantId) =>
            Ok(await _repository.GetByTenantAsync(tenantId));

        [HttpGet("{id}")]
        public async Task<ActionResult<StudentTransport>> GetById(Guid id)
        {
            var record = await _repository.GetByIdAsync(id);
            if (record == null) return NotFound(new { message = "Student transport record not found" });
            return Ok(record);
        }

        [HttpGet("student/{tenantId}/{studentId}")]
        public async Task<ActionResult<IEnumerable<StudentTransport>>> GetByStudent(Guid tenantId, Guid studentId) =>
            Ok(await _repository.GetByStudentAsync(tenantId, studentId));

        [HttpGet("route/{tenantId}/{routeId}")]
        public async Task<ActionResult<IEnumerable<StudentTransport>>> GetByRoute(Guid tenantId, Guid routeId) =>
            Ok(await _repository.GetByRouteAsync(tenantId, routeId));

        [HttpPost]
        public async Task<ActionResult<StudentTransport>> Create(StudentTransport studentTransport)
        {
            studentTransport.id = Guid.NewGuid();
            studentTransport.created_at = DateTime.UtcNow;

            await _repository.AddAsync(studentTransport);
            await _repository.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = studentTransport.id }, studentTransport);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, StudentTransport studentTransport)
        {
            if (id != studentTransport.id) return BadRequest(new { message = "Identity mismatch in update parameters" });

            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = "Student transport record not found" });

            studentTransport.created_at = existing.created_at;
            _repository.Update(studentTransport);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Student transport record updated successfully", data = studentTransport });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = "Student transport record not found" });

            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Student transport record deleted successfully" });
        }
    }
}
