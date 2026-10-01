using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;
using RMS.Infrastructure.Persistence;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace RMS.Infrastructure.Security
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
    public class HasPermissionAttribute : Attribute, IAsyncActionFilter
    {
        private readonly string _requiredPermission;

        public HasPermissionAttribute(string requiredPermission)
        {
            _requiredPermission = requiredPermission;
        }

        public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            var user = context.HttpContext.User;
            if (user?.Identity == null || !user.Identity.IsAuthenticated)
            {
                context.Result = new ObjectResult(new { message = "Unauthorized: Please log in to perform this action." })
                {
                    StatusCode = 401
                };
                return;
            }

            var dbContext = context.HttpContext.RequestServices.GetRequiredService<ApplicationDbContext>();

            // 1. Resolve role_id from JWT claims
            Guid roleId = Guid.Empty;
            var roleIdClaim = user.Claims.FirstOrDefault(c => c.Type == "role_id");
            if (roleIdClaim != null && Guid.TryParse(roleIdClaim.Value, out var parsedRoleId))
            {
                roleId = parsedRoleId;
            }

            // 2. Fallback: If role_id not found directly in claims, resolve from database via userId
            if (roleId == Guid.Empty)
            {
                var userIdClaim = user.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
                if (!string.IsNullOrEmpty(userIdClaim) && Guid.TryParse(userIdClaim, out var userId))
                {
                    var dbUser = await dbContext.Users.FindAsync(userId);
                    if (dbUser != null)
                    {
                        roleId = dbUser.role_id;
                    }
                }
            }

            if (roleId == Guid.Empty)
            {
                context.Result = new ObjectResult(new { message = "Forbidden: User role identity could not be verified." })
                {
                    StatusCode = 403
                };
                return;
            }

            // 3. Check if the user's role has the required permission assigned
            var hasPermission = dbContext.RolePermissions
                .Where(rp => rp.role_id == roleId)
                .Join(
                    dbContext.Permissions,
                    rp => rp.permission_id,
                    p => p.id,
                    (rp, p) => p.description
                )
                .Any(permissionKey => permissionKey == _requiredPermission);

            if (!hasPermission)
            {
                context.Result = new ObjectResult(new { message = $"Access Denied: Missing required permission '{_requiredPermission}'." })
                {
                    StatusCode = 403
                };
                return;
            }

            await next();
        }
    }
}