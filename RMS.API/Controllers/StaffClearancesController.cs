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
    public class StaffClearancesController : ControllerBase
    {
        private readonly IApplicationDbContext _context;

        public StaffClearancesController(IApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/staffclearances/tenant/{tenantId}
        [HttpGet("tenant/{tenantId}")]
        public async Task<IActionResult> GetByTenant(Guid tenantId)
        {
            var clearances = await (from c in _context.StaffClearances
                                    where c.tenant_id == tenantId
                                    join st in _context.Staff on c.staff_id equals st.id
                                    join u in _context.Users on st.user_id equals u.id
                                    select new
                                    {
                                        c.id,
                                        c.tenant_id,
                                        c.staff_id,
                                        staff_name = u.first_name + " " + u.last_name,
                                        designation = st.designation,
                                        c.resignation_date,
                                        c.relieving_date,
                                        c.notice_period_days,
                                        c.unpaid_salary_amount,
                                        c.leave_encashment_amount,
                                        c.loan_deduction_amount,
                                        c.net_settlement_amount,
                                        c.clearance_status,
                                        c.remarks,
                                        c.created_at
                                    })
                                    .OrderByDescending(x => x.created_at)
                                    .ToListAsync();

            return Ok(clearances);
        }

        // POST: api/staffclearances
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] StaffClearance clearance)
        {
            var staff = await _context.Staff.FindAsync(clearance.staff_id);
            if (staff == null) return NotFound(new { message = "Staff member not found." });

            // 1. Calculate Remaining Active Loan Balance
            var activeLoan = await _context.StaffLoans
                .FirstOrDefaultAsync(l => l.staff_id == staff.id && l.status == "Approved" && l.remaining_balance > 0);

            if (activeLoan != null)
            {
                clearance.loan_deduction_amount = activeLoan.remaining_balance;
                activeLoan.remaining_balance = 0;
                activeLoan.status = "Repaid";
                _context.StaffLoans.Update(activeLoan);
            }

            // 2. Net Settlement Calculation
            clearance.id = Guid.NewGuid();
            clearance.net_settlement_amount = (clearance.unpaid_salary_amount + clearance.leave_encashment_amount) - clearance.loan_deduction_amount;
            clearance.clearance_status = "Completed";
            clearance.created_at = DateTime.UtcNow;

            // 3. Deactivate Staff Member Account
            staff.is_active = false;
            _context.Staff.Update(staff);

            await _context.StaffClearances.AddAsync(clearance);
            await ((DbContext)_context).SaveChangesAsync();

            return Ok(new { message = "Full & Final Settlement generated and staff account deactivated.", data = clearance });
        }

        // DELETE: api/staffclearances/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var clearance = await _context.StaffClearances.FindAsync(id);
            if (clearance == null) return NotFound(new { message = "Clearance record not found." });

            _context.StaffClearances.Remove(clearance);
            await ((DbContext)_context).SaveChangesAsync();

            return Ok(new { message = "Clearance record deleted successfully." });
        }
    }
}
