using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SMS.Application.DTOs;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using SMS.Infrastructure.Security;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SchoolExpensesController : ControllerBase
    {
        private readonly ISchoolExpenseRepository _repository;
        private readonly IChartOfAccountRepository _coaRepository;

        public SchoolExpensesController(ISchoolExpenseRepository repository, IChartOfAccountRepository coaRepository)
        {
            _repository = repository;
            _coaRepository = coaRepository;
        }

        // GET: api/schoolexpenses/tenant/{tenantId}?month=10&year=2026
        [HttpGet("tenant/{tenantId}")]
        [HasPermission("expenses.manage")]
        public async Task<IActionResult> GetExpenses(Guid tenantId, [FromQuery] int? month, [FromQuery] int? year)
        {
            if (tenantId == Guid.Empty) return BadRequest(new { message = "Tenant ID is required." });

            var expenses = await _repository.GetExpensesAsync(tenantId, month, year);
            return Ok(expenses);
        }

        // POST: api/schoolexpenses
        [HttpPost]
        [HasPermission("expenses.manage")]
        public async Task<IActionResult> Create([FromBody] CreateSchoolExpenseDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var expense = new SchoolExpense
            {
                id = Guid.NewGuid(),
                tenant_id = dto.tenant_id,
                category = dto.category,
                title = dto.title,
                amount = dto.amount,
                expense_date = dto.expense_date,
                description = dto.description,
                paid_to = dto.paid_to,
                payment_method = dto.payment_method ?? "Petty Cash Vault",
                receipt_no = dto.receipt_no,
                receipt_image_url = dto.receipt_image_url,
                approval_status = dto.approval_status ?? (dto.amount > 50000 ? "Pending Approval" : "Approved"),
                recorded_by_user_id = dto.recorded_by_user_id,
                created_at = DateTime.UtcNow
            };

            await _repository.AddAsync(expense);
            await _repository.SaveChangesAsync();

            // Auto-Impact Double Entry GL Vault
            try
            {
                if (expense.approval_status == "Approved")
                {
                    var vaultAccounts = await _coaRepository.GetByTenantAsync(dto.tenant_id);
                    if (vaultAccounts != null && vaultAccounts.Any())
                    {
                        var vaultCode = (dto.payment_method ?? "").Contains("Bank") ? "1002" : "1001";
                        var vaultHead = vaultAccounts.FirstOrDefault(a => a.code == vaultCode) ?? vaultAccounts.FirstOrDefault(a => a.type == "Asset");

                        if (vaultHead != null)
                        {
                            vaultHead.balance -= dto.amount;
                            _coaRepository.Update(vaultHead);
                            await _repository.SaveChangesAsync();
                        }
                    }
                }
            }
            catch
            {
                // Non-blocking for GL synchronization
            }

            return Ok(new { message = "School operational expense recorded successfully.", data = expense });
        }

        // PUT: api/schoolexpenses/{id}
        [HttpPut("{id}")]
        [HasPermission("expenses.manage")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSchoolExpenseDto dto)
        {
            var expense = await _repository.GetByIdAsync(id);
            if (expense == null) return NotFound(new { message = "Expense voucher not found." });

            expense.category = dto.category;
            expense.title = dto.title;
            expense.amount = dto.amount;
            expense.expense_date = dto.expense_date;
            expense.description = dto.description;
            expense.paid_to = dto.paid_to;
            expense.payment_method = dto.payment_method;
            expense.receipt_no = dto.receipt_no;
            expense.receipt_image_url = dto.receipt_image_url;
            expense.approval_status = dto.approval_status;

            _repository.Update(expense);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Expense voucher details updated successfully.", data = expense });
        }

        // DELETE: api/schoolexpenses/{id}
        [HttpDelete("{id}")]
        [HasPermission("expenses.manage")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var expense = await _repository.GetByIdAsync(id);
            if (expense == null) return NotFound(new { message = "Expense voucher not found." });

            _repository.Delete(expense);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Expense record deleted successfully." });
        }
    }
}