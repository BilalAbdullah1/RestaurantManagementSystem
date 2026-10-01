using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RMS.Application.DTOs;
using RMS.Application.Repositories;
using RMS.Core.Entities;
using RMS.Infrastructure.Security;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace RMS.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    [Route("api/expenses")]
    [Route("api/restaurant-expenses")]
    [Route("api/SchoolExpenses")] // Backwards compatibility for existing client requests
    public class RestaurantExpensesController : ControllerBase
    {
        private readonly IRestaurantExpenseRepository _repository;
        private readonly IChartOfAccountRepository _coaRepository;

        public RestaurantExpensesController(IRestaurantExpenseRepository repository, IChartOfAccountRepository coaRepository)
        {
            _repository = repository;
            _coaRepository = coaRepository;
        }

        // GET: api/expenses/tenant/{tenantId}?month=10&year=2026
        [HttpGet("tenant/{tenantId}")]
        [HasPermission("expenses.manage")]
        public async Task<IActionResult> GetExpenses(Guid tenantId, [FromQuery] int? month, [FromQuery] int? year)
        {
            if (tenantId == Guid.Empty) return BadRequest(new { message = "Tenant ID is required." });

            var expenses = await _repository.GetExpensesAsync(tenantId, month, year);
            return Ok(expenses);
        }

        // POST: api/expenses
        [HttpPost]
        [HasPermission("expenses.manage")]
        public async Task<IActionResult> Create([FromBody] CreateRestaurantExpenseDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var expense = new RestaurantExpense
            {
                id = Guid.NewGuid(),
                tenant_id = dto.tenant_id,
                category = dto.category,
                title = dto.title,
                amount = dto.amount,
                expense_date = DateTime.SpecifyKind(dto.expense_date, DateTimeKind.Utc),
                description = dto.description,
                paid_to = dto.paid_to,
                payment_method = dto.payment_method,
                receipt_no = dto.receipt_no,
                receipt_image_url = dto.receipt_image_url,
                approval_status = dto.approval_status ?? "Pending",
                recorded_by_user_id = dto.recorded_by_user_id,
                created_at = DateTime.UtcNow
            };

            await _repository.AddAsync(expense);
            await _repository.SaveChangesAsync();

            return Ok(expense);
        }

        // PUT: api/expenses/{id}
        [HttpPut("{id}")]
        [HasPermission("expenses.manage")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateRestaurantExpenseDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var expense = await _repository.GetByIdAsync(id);
            if (expense == null) return NotFound(new { message = "Expense not found." });

            expense.category = dto.category;
            expense.title = dto.title;
            expense.amount = dto.amount;
            expense.expense_date = DateTime.SpecifyKind(dto.expense_date, DateTimeKind.Utc);
            expense.description = dto.description;
            expense.paid_to = dto.paid_to;
            expense.payment_method = dto.payment_method;
            expense.receipt_no = dto.receipt_no;
            expense.receipt_image_url = dto.receipt_image_url;
            expense.approval_status = dto.approval_status ?? expense.approval_status;

            _repository.Update(expense);
            await _repository.SaveChangesAsync();

            return Ok(expense);
        }

        // DELETE: api/expenses/{id}
        [HttpDelete("{id}")]
        [HasPermission("expenses.manage")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var expense = await _repository.GetByIdAsync(id);
            if (expense == null) return NotFound(new { message = "Expense not found." });

            _repository.Delete(expense);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Expense deleted successfully." });
        }
    }
}
