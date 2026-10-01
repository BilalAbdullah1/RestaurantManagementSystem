using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RMS.Application.Repositories;
using RMS.Core.Entities;
using RMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMS.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PermissionsController : ControllerBase
    {
        private readonly IPermissionRepository _repository;
        private readonly IRoleRepository _roleRepository;
        private readonly ApplicationDbContext _context;

        public PermissionsController(IPermissionRepository repository, IRoleRepository roleRepository, ApplicationDbContext context)
        {
            _repository = repository;
            _roleRepository = roleRepository;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Permission>>> GetAllPermissions()
        {
            // Fetches the master list of all available permissions in the system
            var permissions = await _repository.GetAllPermissionsAsync();
            return Ok(permissions);
        }

        [HttpGet("role/{roleId}")]
        public async Task<ActionResult<IEnumerable<Permission>>> GetPermissionsByRole(Guid roleId)
        {
            var permissions = await _repository.GetPermissionsByRoleIdAsync(roleId);
            return Ok(permissions);
        }

        [HttpPost("role/{roleId}/assign")]
        public async Task<ActionResult> AssignPermissions(Guid roleId, [FromBody] AssignPermissionsRequest request)
        {
            await _repository.AssignPermissionsToRoleAsync(roleId, request.permission_ids);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Permissions successfully updated for this role." });
        }

        // GET: api/permissions/tenant/{tenantId}/matrix
        [HttpGet("tenant/{tenantId}/matrix")]
        public async Task<IActionResult> GetMatrix(Guid tenantId)
        {
            if (tenantId == Guid.Empty) return BadRequest(new { message = "Tenant ID is required." });

            // Ensure roles & permissions exist
            await DatabaseSeeder.SeedPermissionsAsync(_context);
            var roles = (await _roleRepository.GetByTenantAsync(tenantId)).ToList();
            if (!roles.Any())
            {
                await DatabaseSeeder.SeedRolesForTenantAsync(_context, tenantId);
                roles = (await _roleRepository.GetByTenantAsync(tenantId)).ToList();
            }

            var permissions = await _repository.GetAllPermissionsAsync();

            var roleIds = roles.Select(r => r.id).ToList();
            var rolePermissions = await _context.RolePermissions
                .Where(rp => roleIds.Contains(rp.role_id))
                .ToListAsync();

            var matrixMap = new Dictionary<string, List<Guid>>();
            foreach (var r in roles)
            {
                matrixMap[r.id.ToString()] = rolePermissions
                    .Where(rp => rp.role_id == r.id)
                    .Select(rp => rp.permission_id)
                    .ToList();
            }

            return Ok(new
            {
                roles,
                permissions,
                rolePermissions = matrixMap
            });
        }

        // POST: api/permissions/tenant/{tenantId}/seed-preset
        [HttpPost("tenant/{tenantId}/seed-preset")]
        public async Task<IActionResult> SeedPresets(Guid tenantId)
        {
            if (tenantId == Guid.Empty) return BadRequest(new { message = "Tenant ID is required." });

            await DatabaseSeeder.SeedPermissionsAsync(_context);
            await DatabaseSeeder.SeedRolesForTenantAsync(_context, tenantId);
            await DatabaseSeeder.SeedRolePermissionsForTenantInternalAsync(_context, tenantId);

            return Ok(new { message = "Standard role permissions matrix initialized successfully." });
        }
    }
}