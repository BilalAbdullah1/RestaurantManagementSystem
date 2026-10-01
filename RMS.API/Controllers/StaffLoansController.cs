using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RMS.Application.Interfaces;
using RMS.Core.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace RMS.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class StaffLoansController : ControllerBase
    {
        private readonly IApplicationDbContext _context;

        public StaffLoansController(IApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/staffloans/tenant/{tenantId}
        [HttpGet("tenant/{tenantId}")]
        public async Task<IActionResult> GetByTenant(Guid tenantId)
        {
            var loans = await (from l in _context.StaffLoans
                               where l.tenant_id == tenantId
                               join st in _context.Staff on l.staff_id equals st.id
                               join u in _context.Users on st.user_id equals u.id
                               select new
                               {
                                   l.id,
                                   l.tenant_id,
                                   l.staff_id,
                                   staff_name = u.first_name + " " + u.last_name,
                                   designation = st.designation,
                                   l.loan_amount,
                                   l.monthly_installment,
                                   l.remaining_balance,
                                   l.status,
                                   l.reason,
                                   l.issue_date,
                                   l.created_at
                               })
                               .OrderByDescending(x => x.created_at)
                               .ToListAsync();

            return Ok(loans);
        }

        // POST: api/staffloans
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] StaffLoan loan)
        {
            if (loan.loan_amount <= 0 || loan.monthly_installment <= 0)
            {
                return BadRequest(new { message = "Loan amount and monthly installment must be greater than 0." });
            }

            loan.id = Guid.NewGuid();
            loan.remaining_balance = loan.loan_amount;
            loan.status = "Approved";
            loan.created_at = DateTime.UtcNow;

            await _context.StaffLoans.AddAsync(loan);
            await ((DbContext)_context).SaveChangesAsync();

            return Ok(new { message = "Staff Advance Loan issued successfully.", data = loan });
        }

        // DELETE: api/staffloans/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var loan = await _context.StaffLoans.FindAsync(id);
            if (loan == null) return NotFound(new { message = "Loan record not found." });

            _context.StaffLoans.Remove(loan);
            await ((DbContext)_context).SaveChangesAsync();

            return Ok(new { message = "Loan record cancelled successfully." });
        }
    }
}
