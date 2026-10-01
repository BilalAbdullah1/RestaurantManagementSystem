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
    public class SubjectsController : ControllerBase
    {
        private readonly ISubjectRepository _repository;
        public SubjectsController(ISubjectRepository repository) => _repository = repository;

        [HttpGet("tenant/{tenantId}")]
        [HasPermission("academic.view")]
        public async Task<ActionResult<IEnumerable<Subject>>> GetByTenant(Guid tenantId) =>
            Ok(await _repository.GetByTenantAsync(tenantId));

        [HttpGet("{id}")]
        [HasPermission("academic.view")]
        public async Task<ActionResult<Subject>> GetById(Guid id)
        {
            var subject = await _repository.GetByIdAsync(id);
            if (subject == null) return NotFound(new { message = "Subject not found" });
            return Ok(subject);
        }

        [HttpPost]
        [HasPermission("subjects.manage")]
        public async Task<ActionResult<Subject>> Create(Subject subject)
        {
            if (string.IsNullOrWhiteSpace(subject.name))
                return BadRequest(new { message = "Subject name is required" });

            var duplicate = await _repository.ExistsByNameAsync(subject.tenant_id, subject.name);
            if (duplicate)
                return Conflict(new { message = $"A subject named '{subject.name}' already exists" });

            subject.id = Guid.NewGuid();
            await _repository.AddAsync(subject);
            await _repository.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = subject.id }, subject);
        }

        [HttpPut("{id}")]
        [HasPermission("subjects.manage")]
        public async Task<IActionResult> Update(Guid id, Subject subject)
        {
            if (id != subject.id) return BadRequest(new { message = "ID mismatch" });

            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = "Subject not found" });

            if (string.IsNullOrWhiteSpace(subject.name))
                return BadRequest(new { message = "Subject name is required" });

            var duplicate = await _repository.ExistsByNameAsync(subject.tenant_id, subject.name, excludeId: id);
            if (duplicate)
                return Conflict(new { message = $"A subject named '{subject.name}' already exists" });

            _repository.Update(subject);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Subject updated successfully" });
        }

        [HttpDelete("{id}")]
        [HasPermission("subjects.manage")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = "Subject not found" });

            try
            {
                _repository.Delete(existing);
                await _repository.SaveChangesAsync();
                return Ok(new { message = "Subject deleted successfully" });
            }
            catch (DbUpdateException)
            {
                return Conflict(new
                {
                    message = "This subject cannot be deleted because it has related records. Remove those first."
                });
            }
        }
    }
}