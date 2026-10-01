using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using SMS.Infrastructure.Security;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ClassesController : ControllerBase
    {
        private readonly IClassRepository _repository;
        public ClassesController(IClassRepository repository) => _repository = repository;

        [HttpGet("tenant/{tenantId}")]
        [HasPermission("academic.view")]
        public async Task<ActionResult<IEnumerable<SchoolClass>>> GetByTenant(Guid tenantId) =>
            Ok(await _repository.GetByTenantAsync(tenantId));

        [HttpGet("{id}")]
        [HasPermission("academic.view")]
        public async Task<ActionResult<SchoolClass>> GetById(Guid id)
        {
            var schoolClass = await _repository.GetByIdAsync(id);
            if (schoolClass == null) return NotFound(new { message = "Class not found" });
            return Ok(schoolClass);
        }

        [HttpPost]
        [HasPermission("classes.manage")]
        public async Task<ActionResult<SchoolClass>> Create(SchoolClass schoolClass)
        {
            if (string.IsNullOrWhiteSpace(schoolClass.name))
                return BadRequest(new { message = "Class name is required" });

            var duplicate = await _repository.ExistsByNameAsync(schoolClass.tenant_id, schoolClass.name);
            if (duplicate)
                return Conflict(new { message = $"A class named '{schoolClass.name}' already exists" });

            schoolClass.id = Guid.NewGuid();
            schoolClass.created_at = DateTime.UtcNow;

            await _repository.AddAsync(schoolClass);
            await _repository.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = schoolClass.id }, schoolClass);
        }

        [HttpPut("{id}")]
        [HasPermission("classes.manage")]
        public async Task<IActionResult> Update(Guid id, SchoolClass schoolClass)
        {
            if (id != schoolClass.id) return BadRequest(new { message = "ID mismatch" });

            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = "Class not found" });

            if (string.IsNullOrWhiteSpace(schoolClass.name))
                return BadRequest(new { message = "Class name is required" });

            var duplicate = await _repository.ExistsByNameAsync(schoolClass.tenant_id, schoolClass.name, excludeId: id);
            if (duplicate)
                return Conflict(new { message = $"A class named '{schoolClass.name}' already exists" });

            schoolClass.created_at = existing.created_at;
            _repository.Update(schoolClass);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Class updated successfully" });
        }

        [HttpDelete("{id}")]
        [HasPermission("classes.manage")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = "Class not found" });

            try
            {
                _repository.Delete(existing);
                await _repository.SaveChangesAsync();
                return Ok(new { message = "Class deleted successfully" });
            }
            catch (DbUpdateException)
            {
                // Sections/subjects/enrollments etc. reference this class.
                return Conflict(new
                {
                    message = "This class cannot be deleted because it has related records (sections, students, or subjects). Remove those first."
                });
            }
        }
    }
}
