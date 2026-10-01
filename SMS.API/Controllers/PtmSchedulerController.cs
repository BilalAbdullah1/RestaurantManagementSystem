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
    public class PtmSchedulerController : ControllerBase
    {
        private readonly IApplicationDbContext _context;

        public PtmSchedulerController(IApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/ptmscheduler/tenant/{tenantId}
        [HttpGet("tenant/{tenantId}")]
        public async Task<IActionResult> GetByTenant(Guid tenantId)
        {
            var slots = await _context.PtmSlots
                .Where(s => s.tenant_id == tenantId)
                .OrderBy(s => s.meeting_date)
                .ThenBy(s => s.start_time)
                .ToListAsync();

            return Ok(slots);
        }

        // POST: api/ptmscheduler/slots
        [HttpPost("slots")]
        public async Task<IActionResult> CreateSlot([FromBody] PtmSlot slot)
        {
            slot.id = Guid.NewGuid();
            slot.is_booked = false;
            slot.created_at = DateTime.UtcNow;

            await _context.PtmSlots.AddAsync(slot);
            await ((DbContext)_context).SaveChangesAsync();

            return Ok(new { message = "PTM slot created successfully.", data = slot });
        }

        public class BookPtmSlotDto
        {
            public string parent_name { get; set; } = string.Empty;
            public string student_name { get; set; } = string.Empty;
            public string notes { get; set; } = string.Empty;
        }

        // POST: api/ptmscheduler/slots/{id}/book
        [HttpPost("slots/{id}/book")]
        public async Task<IActionResult> BookSlot(Guid id, [FromBody] BookPtmSlotDto dto)
        {
            var slot = await _context.PtmSlots.FindAsync(id);
            if (slot == null) return NotFound(new { message = "PTM slot not found." });

            if (slot.is_booked)
                return BadRequest(new { message = "This PTM slot has already been booked by another parent." });

            slot.is_booked = true;
            slot.booked_by_parent_name = dto.parent_name;
            slot.booked_by_student_name = dto.student_name;
            slot.meeting_notes = dto.notes;

            _context.PtmSlots.Update(slot);
            await ((DbContext)_context).SaveChangesAsync();

            return Ok(new { message = "PTM slot booked successfully!", data = slot });
        }
    }
}
