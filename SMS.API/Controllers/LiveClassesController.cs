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
    public class LiveClassesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LiveClassesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/liveclasses/tenant/{tenantId}
        [HttpGet("tenant/{tenantId}")]
        public async Task<IActionResult> GetByTenant(Guid tenantId)
        {
            var list = await (from lc in _context.LiveClasses.AsNoTracking()
                              where lc.tenant_id == tenantId
                              join c in _context.Classes on lc.class_id equals c.id into cGroup
                              from c in cGroup.DefaultIfEmpty()
                              join s in _context.Subjects on lc.subject_id equals s.id into sGroup
                              from s in sGroup.DefaultIfEmpty()
                              join st in _context.Staff on lc.teacher_id equals st.id into stGroup
                              from st in stGroup.DefaultIfEmpty()
                              join u in _context.Users on st.user_id equals u.id into uGroup
                              from u in uGroup.DefaultIfEmpty()
                              select new
                              {
                                  lc.id,
                                  lc.tenant_id,
                                  lc.class_id,
                                  lc.subject_id,
                                  lc.teacher_id,
                                  lc.topic,
                                  lc.platform,
                                  lc.meeting_link,
                                  lc.start_time,
                                  lc.duration_minutes,
                                  lc.status,
                                  lc.created_at,
                                  class_name = c != null ? c.name : "",
                                  subject_name = s != null ? s.name : "",
                                  teacher_name = u != null ? $"{u.first_name} {u.last_name}".Trim() : ""
                              }).ToListAsync();

            return Ok(list);
        }

        // POST: api/liveclasses
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] LiveClass liveClass)
        {
            liveClass.id = Guid.NewGuid();
            liveClass.created_at = DateTime.UtcNow;
            if (string.IsNullOrEmpty(liveClass.status)) liveClass.status = "Scheduled";

            await _context.LiveClasses.AddAsync(liveClass);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Live class scheduled successfully.", data = liveClass });
        }

        // PUT: api/liveclasses/{id}/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] string status)
        {
            var item = await _context.LiveClasses.FindAsync(id);
            if (item == null) return NotFound(new { message = "Live class session not found." });

            item.status = status;
            _context.LiveClasses.Update(item);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Status updated.", data = item });
        }

        // DELETE: api/liveclasses/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var item = await _context.LiveClasses.FindAsync(id);
            if (item == null) return NotFound(new { message = "Session not found." });

            _context.LiveClasses.Remove(item);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Live class cancelled." });
        }
    }
}
