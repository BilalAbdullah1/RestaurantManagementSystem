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
    public class SectionsController : ControllerBase
    {
        private readonly ISectionRepository _repository;
        public SectionsController(ISectionRepository repository) => _repository = repository;

        [HttpGet("tenant/{tenantId}")]
        [HasPermission("academic.view")]
        public async Task<ActionResult<IEnumerable<Section>>> GetByTenant(Guid tenantId) =>
            Ok(await _repository.GetByTenantAsync(tenantId));

        [HttpGet("class/{classId}")]
        [HasPermission("academic.view")]
        public async Task<ActionResult<IEnumerable<Section>>> GetByClass(Guid classId) =>
            Ok(await _repository.GetByClassAsync(classId));

        [HttpGet("{id}")]
        [HasPermission("academic.view")]
        public async Task<ActionResult<Section>> GetById(Guid id)
        {
            var section = await _repository.GetByIdAsync(id);
            if (section == null) return NotFound(new { message = "Section not found" });
            return Ok(section);
        }

        [HttpPost]
        [HasPermission("classes.manage")]
        public async Task<ActionResult<Section>> Create(Section section)
        {
            if (string.IsNullOrWhiteSpace(section.name))
                return BadRequest(new { message = "Section name is required" });

            var duplicate = await _repository.ExistsByNameAsync(section.class_id, section.name);
            if (duplicate)
                return Conflict(new { message = $"A section named '{section.name}' already exists for this class" });

            section.id = Guid.NewGuid();
            section.created_at = DateTime.UtcNow;

            await _repository.AddAsync(section);
            await _repository.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = section.id }, section);
        }

        [HttpPut("{id}")]
        [HasPermission("classes.manage")]
        public async Task<IActionResult> Update(Guid id, Section section)
        {
            if (id != section.id) return BadRequest(new { message = "ID mismatch" });

            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = "Section not found" });

            if (string.IsNullOrWhiteSpace(section.name))
                return BadRequest(new { message = "Section name is required" });

            var duplicate = await _repository.ExistsByNameAsync(section.class_id, section.name, excludeId: id);
            if (duplicate)
                return Conflict(new { message = $"A section named '{section.name}' already exists for this class" });

            section.created_at = existing.created_at;
            _repository.Update(section);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Section updated successfully" });
        }

        [HttpDelete("{id}")]
        [HasPermission("classes.manage")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = "Section not found" });

            try
            {
                _repository.Delete(existing);
                await _repository.SaveChangesAsync();
                return Ok(new { message = "Section deleted successfully" });
            }
            catch (DbUpdateException)
            {
                // student_enrollments references section_id without cascade delete.
                return Conflict(new
                {
                    message = "This section cannot be deleted because students are enrolled in it. Reassign or remove those enrollments first."
                });
            }
        }
    }
}