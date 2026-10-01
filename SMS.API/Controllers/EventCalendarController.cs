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
    public class EventCalendarController : ControllerBase
    {
        private readonly IApplicationDbContext _context;

        public EventCalendarController(IApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/eventcalendar/tenant/{tenantId}
        [HttpGet("tenant/{tenantId}")]
        public async Task<IActionResult> GetByTenant(Guid tenantId)
        {
            var events = await _context.EventCalendarItems
                .Where(e => e.tenant_id == tenantId)
                .OrderBy(e => e.start_date)
                .ToListAsync();

            return Ok(events);
        }

        // POST: api/eventcalendar
        [HttpPost]
        public async Task<IActionResult> CreateEvent([FromBody] EventCalendarItem item)
        {
            if (string.IsNullOrWhiteSpace(item.title))
                return BadRequest(new { message = "Event title is required." });

            item.id = Guid.NewGuid();
            item.created_at = DateTime.UtcNow;

            await _context.EventCalendarItems.AddAsync(item);
            await ((DbContext)_context).SaveChangesAsync();

            return Ok(new { message = "Calendar event added successfully.", data = item });
        }

        // DELETE: api/eventcalendar/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEvent(Guid id)
        {
            var item = await _context.EventCalendarItems.FindAsync(id);
            if (item == null) return NotFound(new { message = "Event not found." });

            _context.EventCalendarItems.Remove(item);
            await ((DbContext)_context).SaveChangesAsync();

            return Ok(new { message = "Calendar event deleted." });
        }
    }
}
