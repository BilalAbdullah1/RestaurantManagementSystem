using Microsoft.AspNetCore.Http;
using System;
using System.Linq;

namespace RMS.Infrastructure.Services
{
    public interface ITenantProvider
    {
        Guid GetTenantId();
    }

    public class TenantProvider : ITenantProvider
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TenantProvider(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Guid GetTenantId()
        {
            var tenantClaim = _httpContextAccessor.HttpContext?.User.Claims
                .FirstOrDefault(c => c.Type == "tenant_id")?.Value;

            if (Guid.TryParse(tenantClaim, out var tenantId))
            {
                return tenantId;
            }

            // Fallback: check if middleware resolved it from Subdomain (Origin/Referer)
            if (_httpContextAccessor.HttpContext?.Items["TenantId"] is Guid resolvedTenantId)
            {
                return resolvedTenantId;
            }

            return Guid.Empty;
        }
    }
}