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
    public class AcademicYearsController : ControllerBase
    {
        private readonly IAcademicYearRepository _repository;
        public AcademicYearsController(IAcademicYearRepository repository) => _repository = repository;

        [HttpGet("tenant/{tenantId}")]
        public async Task<ActionResult<IEnumerable<AcademicYear>>> GetByTenant(Guid tenantId) =>
            Ok(await _repository.GetByTenantAsync(tenantId));

        [HttpGet("{id}")]
        public async Task<ActionResult<AcademicYear>> GetById(Guid id)
        {
            var year = await _repository.GetByIdAsync(id);
            if (year == null) return NotFound(new { message = "Academic Year not found" });
            return Ok(year);
        }

        [HttpPost]
        public async Task<ActionResult<AcademicYear>> Create(AcademicYear academicYear)
        {
            if (await _repository.ExistsTitleAsync(academicYear.tenant_id, academicYear.title))
                return BadRequest(new { message = $"Academic year '{academicYear.title}' already exists." });

            academicYear.id = Guid.NewGuid();
            academicYear.created_at = DateTime.UtcNow;

            // Enforce business rule: Only one academic year can be current
            if (academicYear.is_current)
                await _repository.UnsetAllCurrentAsync(academicYear.tenant_id);

            await _repository.AddAsync(academicYear);
            await _repository.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = academicYear.id }, academicYear);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, AcademicYear academicYear)
        {
            if (id != academicYear.id) return BadRequest(new { message = "Identity mismatch" });

            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = "Academic Year not found" });

            // Enforce business rule: Only one academic year can be current
            if (academicYear.is_current && !existing.is_current)
                await _repository.UnsetAllCurrentAsync(academicYear.tenant_id);

            academicYear.created_at = existing.created_at;
            _repository.Update(academicYear);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Academic Year updated successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = "Academic Year not found" });

            if (existing.is_current) return BadRequest(new { message = "Cannot delete the currently active academic year." });

            _repository.Delete(existing);
            await _repository.SaveChangesAsync();
            return Ok(new { message = "Academic Year deleted successfully" });
        }
    }
}