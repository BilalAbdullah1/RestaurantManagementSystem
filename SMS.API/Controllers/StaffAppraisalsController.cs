using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SMS.Application.Interfaces;
using SMS.Core.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class StaffAppraisalsController : ControllerBase
    {
        private readonly IApplicationDbContext _context;

        public StaffAppraisalsController(IApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/staffappraisals/tenant/{tenantId}
        [HttpGet("tenant/{tenantId}")]
        public async Task<IActionResult> GetByTenant(Guid tenantId)
        {
            var appraisals = await (from a in _context.StaffAppraisals
                                    where a.tenant_id == tenantId
                                    join st in _context.Staff on a.staff_id equals st.id
                                    join u in _context.Users on st.user_id equals u.id
                                    select new
                                    {
                                        a.id,
                                        a.tenant_id,
                                        a.staff_id,
                                        staff_name = u.first_name + " " + u.last_name,
                                        designation = st.designation,
                                        a.appraisal_year,
                                        a.performance_rating,
                                        a.is_teacher_of_the_month,
                                        a.award_month,
                                        a.recommended_increment_pct,
                                        a.previous_basic_salary,
                                        a.new_basic_salary,
                                        a.is_increment_applied,
                                        a.comments,
                                        a.created_at
                                    })
                                    .OrderByDescending(x => x.created_at)
                                    .ToListAsync();

            return Ok(appraisals);
        }

        // POST: api/staffappraisals
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] StaffAppraisal appraisal)
        {
            var staff = await _context.Staff.FindAsync(appraisal.staff_id);
            if (staff == null) return NotFound(new { message = "Staff member not found." });

            appraisal.id = Guid.NewGuid();
            appraisal.previous_basic_salary = staff.basic_salary;
            
            if (appraisal.recommended_increment_pct > 0)
            {
                appraisal.new_basic_salary = Math.Round(staff.basic_salary * (1 + (appraisal.recommended_increment_pct / 100m)), 2);
            }
            else
            {
                appraisal.new_basic_salary = staff.basic_salary;
            }

            appraisal.created_at = DateTime.UtcNow;

            await _context.StaffAppraisals.AddAsync(appraisal);
            await ((DbContext)_context).SaveChangesAsync();

            return Ok(new { message = "Staff Appraisal record created successfully.", data = appraisal });
        }

        // POST: api/staffappraisals/{id}/apply-increment
        [HttpPost("{id}/apply-increment")]
        public async Task<IActionResult> ApplyIncrement(Guid id)
        {
            var appraisal = await _context.StaffAppraisals.FindAsync(id);
            if (appraisal == null) return NotFound(new { message = "Appraisal record not found." });

            if (appraisal.is_increment_applied)
            {
                return BadRequest(new { message = "Salary increment has already been applied for this appraisal." });
            }

            var staff = await _context.Staff.FindAsync(appraisal.staff_id);
            if (staff == null) return NotFound(new { message = "Associated staff member not found." });

            staff.basic_salary = appraisal.new_basic_salary;
            appraisal.is_increment_applied = true;

            _context.Staff.Update(staff);
            _context.StaffAppraisals.Update(appraisal);
            await ((DbContext)_context).SaveChangesAsync();

            return Ok(new { message = "Annual salary increment applied successfully!", new_salary = staff.basic_salary });
        }
    }
}
