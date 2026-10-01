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
    public class HelpdeskController : ControllerBase
    {
        private readonly IApplicationDbContext _context;

        public HelpdeskController(IApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/helpdesk/tenant/{tenantId}
        [HttpGet("tenant/{tenantId}")]
        public async Task<IActionResult> GetByTenant(Guid tenantId)
        {
            var tickets = await _context.HelpdeskTickets
                .Where(t => t.tenant_id == tenantId)
                .OrderByDescending(t => t.created_at)
                .ToListAsync();

            return Ok(tickets);
        }

        // POST: api/helpdesk
        [HttpPost]
        public async Task<IActionResult> CreateTicket([FromBody] HelpdeskTicket ticket)
        {
            if (string.IsNullOrWhiteSpace(ticket.subject) || string.IsNullOrWhiteSpace(ticket.description))
                return BadRequest(new { message = "Subject and Description are required." });

            ticket.id = Guid.NewGuid();
            ticket.ticket_number = "TICK-" + new Random().Next(1000, 9999);
            ticket.status = "Open";
            ticket.created_at = DateTime.UtcNow;

            await _context.HelpdeskTickets.AddAsync(ticket);
            await ((DbContext)_context).SaveChangesAsync();

            return Ok(new { message = "Helpdesk complaint ticket submitted successfully.", data = ticket });
        }

        public class UpdateTicketStatusDto
        {
            public string status { get; set; } = "Resolved"; // Open, In Progress, Resolved, Closed
            public string resolution_remarks { get; set; } = string.Empty;
        }

        // PUT: api/helpdesk/{id}/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateTicketStatusDto dto)
        {
            var ticket = await _context.HelpdeskTickets.FindAsync(id);
            if (ticket == null) return NotFound(new { message = "Ticket not found." });

            ticket.status = dto.status;
            ticket.resolution_remarks = dto.resolution_remarks;

            _context.HelpdeskTickets.Update(ticket);
            await ((DbContext)_context).SaveChangesAsync();

            return Ok(new { message = $"Ticket {ticket.ticket_number} status updated to {dto.status}.", data = ticket });
        }
    }
}
