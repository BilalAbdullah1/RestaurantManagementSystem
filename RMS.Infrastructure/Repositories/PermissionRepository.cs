using Microsoft.EntityFrameworkCore;
using RMS.Application.Repositories;
using RMS.Core.Entities;
using RMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMS.Infrastructure.Repositories
{
    public class PermissionRepository : IPermissionRepository
    {
        private readonly ApplicationDbContext _context;

        public PermissionRepository(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<Permission>> GetAllPermissionsAsync()
        {
            return await _context.Permissions
                .AsNoTracking()
                .OrderBy(p => p.module_name)
                .ThenBy(p => p.name)
                .ToListAsync();
        }

        public async Task<IEnumerable<Permission>> GetPermissionsByRoleIdAsync(Guid roleId)
        {
            return await _context.RolePermissions
                .AsNoTracking()
                .Where(rp => rp.role_id == roleId)
                .Join(_context.Permissions,
                      rp => rp.permission_id,
                      p => p.id,
                      (rp, p) => p)
                .ToListAsync();
        }

        public async Task AssignPermissionsToRoleAsync(Guid roleId, List<Guid> permissionIds)
        {
            // 1. Remove all existing permissions for this role
            var existingPermissions = await _context.RolePermissions
                .Where(rp => rp.role_id == roleId)
                .ToListAsync();
            
            _context.RolePermissions.RemoveRange(existingPermissions);

            // 2. Add the newly selected permissions
            var newAssignments = permissionIds.Select(permissionId => new RolePermission
            {
                role_id = roleId,
                permission_id = permissionId
            });

            await _context.RolePermissions.AddRangeAsync(newAssignments);
        }

        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    }
}