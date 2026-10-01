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
    public class FinanceReportsController : ControllerBase
    {
        private readonly IFinanceReportRepository _repository;
        private readonly ITenantProvider _tenantProvider;

        public FinanceReportsController(IFinanceReportRepository repository, ITenantProvider tenantProvider)
        {
            _repository = repository;
            _tenantProvider = tenantProvider;
        }

        [HttpGet("defaulters")]
        public async Task<IActionResult> GetDefaulters()
        {
            var tenantId = _tenantProvider.GetTenantId();
            if (tenantId == Guid.Empty)
                return BadRequest(new { message = "Invalid Tenant ID." });

            var report = await _repository.GetDefaultersAsync(tenantId);
            return Ok(report);
        }

        [HttpGet("profit-loss")]
        public async Task<IActionResult> GetProfitAndLoss([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var tenantId = _tenantProvider.GetTenantId();
            if (tenantId == Guid.Empty)
                return BadRequest(new { message = "Invalid Tenant ID." });

            // Default to current month if dates not provided
            var start = startDate ?? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1);
            var end = endDate ?? start.AddMonths(1).AddDays(-1);

            var pnl = await _repository.GetProfitAndLossAsync(tenantId, start, end);
            return Ok(pnl);
        }

        [HttpGet("daily-collection")]
        public async Task<IActionResult> GetDailyCollection([FromQuery] DateTime? date)
        {
            var tenantId = _tenantProvider.GetTenantId();
            if (tenantId == Guid.Empty)
                return BadRequest(new { message = "Invalid Tenant ID." });

            var targetDate = date ?? DateTime.UtcNow.Date;

            var collection = await _repository.GetDailyCollectionAsync(tenantId, targetDate);
            return Ok(collection);
        }

        [HttpGet("general-ledger")]
        public async Task<IActionResult> GetGeneralLedger([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            var tenantId = _tenantProvider.GetTenantId();
            if (tenantId == Guid.Empty)
                return BadRequest(new { message = "Invalid Tenant ID." });

            var transactions = await _repository.GetGeneralLedgerAsync(tenantId, startDate, endDate);
            return Ok(transactions);
        }
    }
}

