using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using RMS.Infrastructure.Persistence;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace RMS.API.Middlewares
{
    public class TenantResolverMiddleware
    {
        private readonly RequestDelegate _next;

        public TenantResolverMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // If the user is already authenticated and has a tenant_id claim, skip subdomain resolution
            var tenantClaim = context.User.Claims.FirstOrDefault(c => c.Type == "tenant_id")?.Value;
            if (!string.IsNullOrEmpty(tenantClaim) && Guid.TryParse(tenantClaim, out _))
            {
                await _next(context);
                return;
            }

            // Extract subdomain from Origin or Referer (for frontend SPA requests)
            string origin = context.Request.Headers["Origin"].FirstOrDefault() ?? context.Request.Headers["Referer"].FirstOrDefault();
            
            if (!string.IsNullOrEmpty(origin) && Uri.TryCreate(origin, UriKind.Absolute, out var uri))
            {
                var host = uri.Host; // e.g., "bistro.vokesolutions.com" or "rms-pos.vercel.app"
                
                // Ignore Vercel, MonsterASP, RunASP, Render, Localhost host origins
                if (!host.EndsWith(".vercel.app") && 
                    !host.EndsWith(".runasp.net") && 
                    !host.EndsWith(".monsterasp.net") && 
                    !host.EndsWith(".onrender.com") && 
                    host != "localhost" && 
                    host != "127.0.0.1")
                {
                    var parts = host.Split('.');
                    if (parts.Length >= 2)
                    {
                        var subdomain = parts[0];

                        // Ignore common non-tenant subdomains
                        if (subdomain != "www" && subdomain != "api" && subdomain != "app")
                        {
                            using var scope = context.RequestServices.CreateScope();
                            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                            // Find the tenant by subdomain
                            var tenant = await dbContext.Tenants
                                .Where(t => t.subdomain == subdomain && t.is_active)
                                .Select(t => t.id)
                                .FirstOrDefaultAsync();

                            if (tenant != Guid.Empty)
                            {
                                context.Items["TenantId"] = tenant;
                            }
                        }
                    }
                }
            }

            await _next(context);
        }
    }
}
