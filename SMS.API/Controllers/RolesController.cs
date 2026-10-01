using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SMS.Application.Repositories;
using SMS.Application.DTOs;
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
    public class RolesController : ControllerBase
    {
        private readonly IRoleRepository _repository;

        public RolesController(IRoleRepository repository) => _repository = repository;

        [HttpGet("tenant/{tenantId}")]
        [HasPermission("roles.manage")]
        public async Task<ActionResult<IEnumerable<RoleDto>>> GetRolesByTenant(Guid tenantId)
        {
            var roles = await _repository.GetByTenantAsync(tenantId);
            return Ok(roles);
        }

        [HttpGet("{id}")]
        [HasPermission("roles.manage")]
        public async Task<ActionResult<RoleDto>> GetRoleById(Guid id)
        {
            var role = await _repository.GetByIdAsync(id);
            if (role == null) return NotFound(new { message = "Role not found." });
            return Ok(role);
        }

        [HttpPost]
        [HasPermission("roles.manage")]
        public async Task<ActionResult> CreateRole(Role role)
        {
            role.id = Guid.NewGuid();
            role.created_at = DateTime.UtcNow;

            await _repository.AddAsync(role);
            await _repository.SaveChangesAsync();

            return CreatedAtAction(nameof(GetRoleById), new { id = role.id }, role);
        }

        [HttpPut("{id}")]
        [HasPermission("roles.manage")]
        public async Task<ActionResult> UpdateRole(Guid id, Role role)
        {
            if (id != role.id) return BadRequest(new { message = "Role ID mismatch." });

            var existingRole = await _repository.GetEntityByIdAsync(id);
            if (existingRole == null) return NotFound(new { message = "Role not found." });

            // Protect system roles from being renamed or altered in structure maliciously
            if (existingRole.is_system_role)
                return BadRequest(new { message = "System roles cannot be modified." });

            role.created_at = existingRole.created_at;
            role.updated_at = DateTime.UtcNow;

            _repository.Update(role);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Role updated successfully." });
        }

        [HttpDelete("{id}")]
        [HasPermission("roles.manage")]
        public async Task<ActionResult> DeleteRole(Guid id)
        {
            var role = await _repository.GetByIdAsync(id);
            if (role == null) return NotFound(new { message = "Role not found." });

            if (role.is_system_role)
                return BadRequest(new { message = "System roles cannot be deleted." });

            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Role deleted successfully." });
        }
    }
}