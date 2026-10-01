using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SMS.Core.Entities;
using SMS.Infrastructure.Persistence;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class LessonPlansController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LessonPlansController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/lessonplans/tenant/{tenantId}
        [HttpGet("tenant/{tenantId}")]
        public async Task<IActionResult> GetByTenant(Guid tenantId)
        {
            var plans = await (from lp in _context.LessonPlans.AsNoTracking()
                               where lp.tenant_id == tenantId
                               join c in _context.Classes on lp.class_id equals c.id into cGroup
                               from c in cGroup.DefaultIfEmpty()
                               join s in _context.Subjects on lp.subject_id equals s.id into sGroup
                               from s in sGroup.DefaultIfEmpty()
                               join st in _context.Staff on lp.teacher_id equals st.id into stGroup
                               from st in stGroup.DefaultIfEmpty()
                               join u in _context.Users on st.user_id equals u.id into uGroup
                               from u in uGroup.DefaultIfEmpty()
                               select new
                               {
                                   lp.id,
                                   lp.tenant_id,
                                   lp.class_id,
                                   lp.subject_id,
                                   lp.teacher_id,
                                   lp.title,
                                   lp.description,
                                   lp.target_date,
                                   lp.completion_percentage,
                                   lp.status,
                                   lp.created_at,
                                   class_name = c != null ? c.name : "",
                                   subject_name = s != null ? s.name : "",
                                   teacher_name = u != null ? $"{u.first_name} {u.last_name}".Trim() : ""
                               }).ToListAsync();

            return Ok(plans);
        }

        // POST: api/lessonplans
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] LessonPlan plan)
        {
            plan.id = Guid.NewGuid();
            plan.created_at = DateTime.UtcNow;
            if (plan.completion_percentage >= 100) plan.status = "Completed";
            else if (plan.completion_percentage > 0) plan.status = "In Progress";
            else plan.status = "Pending";

            await _context.LessonPlans.AddAsync(plan);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Lesson plan created successfully.", data = plan });
        }

        // PUT: api/lessonplans/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] LessonPlan plan)
        {
            var existing = await _context.LessonPlans.FindAsync(id);
            if (existing == null) return NotFound(new { message = "Lesson plan not found." });

            existing.title = plan.title;
            existing.description = plan.description;
            existing.target_date = plan.target_date;
            existing.completion_percentage = plan.completion_percentage;
            
            if (plan.completion_percentage >= 100) existing.status = "Completed";
            else if (plan.completion_percentage > 0) existing.status = "In Progress";
            else existing.status = "Pending";

            _context.LessonPlans.Update(existing);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Lesson plan updated.", data = existing });
        }

        // DELETE: api/lessonplans/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existing = await _context.LessonPlans.FindAsync(id);
            if (existing == null) return NotFound(new { message = "Lesson plan not found." });

            _context.LessonPlans.Remove(existing);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Lesson plan deleted." });
        }
    }
}
