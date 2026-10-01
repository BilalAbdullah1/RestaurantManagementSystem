using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IPermissionRepository
    {
        Task<IEnumerable<Permission>> GetAllPermissionsAsync();
        Task<IEnumerable<Permission>> GetPermissionsByRoleIdAsync(Guid roleId);
        Task AssignPermissionsToRoleAsync(Guid roleId, List<Guid> permissionIds);
        Task SaveChangesAsync();
    }
}