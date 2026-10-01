using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RMS.Application.Repositories;
using RMS.Infrastructure.Services;
using System;
using System.Threading.Tasks;

namespace RMS.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardRepository _dashboardRepository;
        private readonly ITenantProvider _tenantProvider;

        public DashboardController(IDashboardRepository dashboardRepository, ITenantProvider tenantProvider)
        {
            _dashboardRepository = dashboardRepository;
            _tenantProvider = tenantProvider;
        }

        /// <summary>
        /// Returns all dashboard KPIs, charts data, and activity feed for the current tenant.
        /// GET /api/dashboard/stats
        /// </summary>
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var tenantId = _tenantProvider.GetTenantId();

            if (tenantId == Guid.Empty)
                return BadRequest(new { message = "Tenant context could not be resolved. Please ensure you are logged in." });

            var stats = await _dashboardRepository.GetDashboardStatsAsync(tenantId);
            return Ok(stats);
        }

        [HttpGet("finance-trend")]
        public async Task<IActionResult> GetFinanceTrend()
        {
            var tenantId = _tenantProvider.GetTenantId();

            if (tenantId == Guid.Empty)
                return BadRequest(new { message = "Tenant context could not be resolved. Please ensure you are logged in." });

            var trend = await _dashboardRepository.GetFinanceTrendAsync(tenantId);
            return Ok(trend);
        }
    }
}
