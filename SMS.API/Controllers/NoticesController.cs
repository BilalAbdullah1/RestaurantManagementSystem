using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SMS.Application.Interfaces;
using SMS.Core.Entities;
using SMS.Infrastructure.Security;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class NoticesController : ControllerBase
    {
        private readonly IApplicationDbContext _context;

        public NoticesController(IApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/notices/tenant/{tenantId}
        [HttpGet("tenant/{tenantId}")]
        public async Task<IActionResult> GetByTenant(Guid tenantId)
        {
            var notices = await _context.Notices
                .Where(n => n.tenant_id == tenantId)
                .OrderByDescending(n => n.created_at)
                .ToListAsync();

            return Ok(notices);
        }

        // GET: api/notices/active/tenant/{tenantId}
        [HttpGet("active/tenant/{tenantId}")]
        public async Task<IActionResult> GetActiveNotices(Guid tenantId)
        {
            var notices = await _context.Notices
                .Where(n => n.tenant_id == tenantId && n.is_active)
                .OrderByDescending(n => n.created_at)
                .ToListAsync();

            return Ok(notices);
        }

        // POST: api/notices
        [HttpPost]
        [HasPermission("notices.manage")]
        public async Task<IActionResult> Create([FromBody] Notice notice)
        {
            if (string.IsNullOrWhiteSpace(notice.title) || string.IsNullOrWhiteSpace(notice.content))
                return BadRequest(new { message = "Title and Content are required." });

            notice.id = Guid.NewGuid();
            notice.created_at = DateTime.UtcNow;
            if (notice.published_at == default) notice.published_at = DateTime.UtcNow;
            if (string.IsNullOrWhiteSpace(notice.category)) notice.category = "Academic";
            if (string.IsNullOrWhiteSpace(notice.target_audience)) notice.target_audience = "All";
            if (string.IsNullOrWhiteSpace(notice.posted_by)) notice.posted_by = "Principal Office";

            await _context.Notices.AddAsync(notice);
            await ((DbContext)_context).SaveChangesAsync();

            return Ok(new { message = "Digital Notice published successfully.", data = notice });
        }

        // PUT: api/notices/{id}
        [HttpPut("{id}")]
        [HasPermission("notices.manage")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Notice updatedNotice)
        {
            var notice = await _context.Notices.FindAsync(id);
            if (notice == null) return NotFound(new { message = "Notice not found." });

            if (string.IsNullOrWhiteSpace(updatedNotice.title) || string.IsNullOrWhiteSpace(updatedNotice.content))
                return BadRequest(new { message = "Title and Content are required." });

            notice.title = updatedNotice.title;
            notice.content = updatedNotice.content;
            notice.category = !string.IsNullOrWhiteSpace(updatedNotice.category) ? updatedNotice.category : notice.category;
            notice.target_audience = !string.IsNullOrWhiteSpace(updatedNotice.target_audience) ? updatedNotice.target_audience : notice.target_audience;
            notice.attachment_url = updatedNotice.attachment_url;
            notice.posted_by = !string.IsNullOrWhiteSpace(updatedNotice.posted_by) ? updatedNotice.posted_by : notice.posted_by;
            notice.is_active = updatedNotice.is_active;
            notice.expires_at = updatedNotice.expires_at;

            await ((DbContext)_context).SaveChangesAsync();

            return Ok(new { message = "Notice updated successfully.", data = notice });
        }

        // DELETE: api/notices/{id}
        [HttpDelete("{id}")]
        [HasPermission("notices.manage")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var notice = await _context.Notices.FindAsync(id);
            if (notice == null) return NotFound(new { message = "Notice not found." });

            _context.Notices.Remove(notice);
            await ((DbContext)_context).SaveChangesAsync();

            return Ok(new { message = "Notice deleted successfully." });
        }
    }
}
