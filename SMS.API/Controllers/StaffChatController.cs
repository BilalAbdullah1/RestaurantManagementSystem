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
    public class StaffChatController : ControllerBase
    {
        private readonly IApplicationDbContext _context;

        public StaffChatController(IApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/staffchat/channel/{channel}/tenant/{tenantId}
        [HttpGet("channel/{channel}/tenant/{tenantId}")]
        public async Task<IActionResult> GetChannelMessages(string channel, Guid tenantId)
        {
            var messages = await _context.StaffChatMessages
                .Where(m => m.tenant_id == tenantId && m.channel.ToLower() == channel.ToLower() && m.receiver_id == null)
                .OrderBy(m => m.sent_at)
                .Take(100)
                .ToListAsync();

            return Ok(messages);
        }

        // GET: api/staffchat/direct/tenant/{tenantId}
        [HttpGet("direct/tenant/{tenantId}")]
        public async Task<IActionResult> GetDirectMessages(Guid tenantId, [FromQuery] Guid user1, [FromQuery] Guid user2)
        {
            var messages = await _context.StaffChatMessages
                .Where(m => m.tenant_id == tenantId &&
                            ((m.sender_id == user1 && m.receiver_id == user2) || (m.sender_id == user2 && m.receiver_id == user1)))
                .OrderBy(m => m.sent_at)
                .Take(100)
                .ToListAsync();

            return Ok(messages);
        }

        // POST: api/staffchat/send
        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] StaffChatMessage message)
        {
            if (string.IsNullOrWhiteSpace(message.message_text) && string.IsNullOrWhiteSpace(message.attachment_url))
                return BadRequest(new { message = "Cannot send an empty message." });

            message.id = Guid.NewGuid();
            message.sent_at = DateTime.UtcNow;

            await _context.StaffChatMessages.AddAsync(message);
            await ((DbContext)_context).SaveChangesAsync();

            return Ok(new { message = "Message sent.", data = message });
        }
    }
}
