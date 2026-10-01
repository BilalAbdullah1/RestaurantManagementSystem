using Microsoft.AspNetCore.Mvc;
using RMS.Application.Repositories;
using RMS.Core.Entities;
using RMS.Infrastructure.Persistence;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace RMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChartOfAccountsController : ControllerBase
    {
        private readonly IChartOfAccountRepository _repository;
        private readonly ApplicationDbContext _context;

        public ChartOfAccountsController(IChartOfAccountRepository repository, ApplicationDbContext context)
        {
            _repository = repository;
            _context = context;
        }

        // GET: api/chartofaccounts/tenant/{tenantId}
        [HttpGet("tenant/{tenantId}")]
        public async Task<IActionResult> GetByTenant(Guid tenantId)
        {
            if (tenantId == Guid.Empty) return BadRequest(new { message = "Tenant ID is required." });
            
            var accounts = (await _repository.GetByTenantAsync(tenantId)).ToList();

            // If tenant has no Chart of Accounts, auto-seed standard enterprise accounts
            if (!accounts.Any())
            {
                await DatabaseSeeder.SeedChartOfAccountsForTenantAsync(_context, tenantId);
                accounts = (await _repository.GetByTenantAsync(tenantId)).ToList();
            }

            return Ok(accounts);
        }

        // POST: api/chartofaccounts/tenant/{tenantId}/seed-default
        [HttpPost("tenant/{tenantId}/seed-default")]
        public async Task<IActionResult> SeedDefaultAccounts(Guid tenantId)
        {
            if (tenantId == Guid.Empty) return BadRequest(new { message = "Tenant ID is required." });

            var addedCount = await DatabaseSeeder.SeedChartOfAccountsForTenantAsync(_context, tenantId);
            var accounts = await _repository.GetByTenantAsync(tenantId);

            return Ok(new 
            { 
                message = $"Successfully verified Master Chart of Accounts ({addedCount} new ledger heads added).", 
                count = addedCount,
                data = accounts 
            });
        }

        // POST: api/chartofaccounts
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] ChartOfAccount account)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            account.id = Guid.NewGuid();
            account.created_at = DateTime.UtcNow;
            if (string.IsNullOrWhiteSpace(account.currency)) account.currency = "PKR";
            if (!account.exchange_rate.HasValue || account.exchange_rate.Value <= 0) account.exchange_rate = 1.0m;

            await _repository.AddAsync(account);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Account created successfully.", data = account });
        }

        // PUT: api/chartofaccounts/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] ChartOfAccount dto)
        {
            var account = await _repository.GetByIdAsync(id);
            if (account == null) return NotFound(new { message = "Account head not found." });

            account.code = dto.code;
            account.name = dto.name;
            account.type = dto.type;
            account.sub_category = dto.sub_category;
            account.balance = dto.balance;
            account.currency = dto.currency ?? "PKR";
            account.exchange_rate = dto.exchange_rate ?? 1.0m;
            account.is_active = dto.is_active;

            _repository.Update(account);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Account updated successfully.", data = account });
        }

        // DELETE: api/chartofaccounts/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var account = await _repository.GetByIdAsync(id);
            if (account == null) return NotFound(new { message = "Account head not found." });

            _repository.Delete(account);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Account deleted successfully." });
        }
    }
}
