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
    public class FeedbackSuggestionsController : ControllerBase
    {
        private readonly IApplicationDbContext _context;

        public FeedbackSuggestionsController(IApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/feedbacksuggestions/tenant/{tenantId}
        [HttpGet("tenant/{tenantId}")]
        public async Task<IActionResult> GetByTenant(Guid tenantId)
        {
            var items = await _context.FeedbackSuggestions
                .Where(f => f.tenant_id == tenantId)
                .OrderByDescending(f => f.created_at)
                .ToListAsync();

            return Ok(items);
        }

        // POST: api/feedbacksuggestions
        [HttpPost]
        public async Task<IActionResult> SubmitFeedback([FromBody] FeedbackSuggestion item)
        {
            if (string.IsNullOrWhiteSpace(item.subject) || string.IsNullOrWhiteSpace(item.feedback_text))
                return BadRequest(new { message = "Subject and Feedback text are required." });

            item.id = Guid.NewGuid();
            item.status = "Under Review";
            item.created_at = DateTime.UtcNow;

            if (item.is_anonymous)
            {
                item.submitted_by_name = "Anonymous Stakeholder";
            }

            await _context.FeedbackSuggestions.AddAsync(item);
            await ((DbContext)_context).SaveChangesAsync();

            return Ok(new { message = "Feedback submitted to Principal Office box.", data = item });
        }

        public class RespondFeedbackDto
        {
            public string status { get; set; } = "Reviewed"; // Under Review, Reviewed, Action Taken
            public string admin_response { get; set; } = string.Empty;
        }

        // PUT: api/feedbacksuggestions/{id}/respond
        [HttpPut("{id}/respond")]
        public async Task<IActionResult> Respond(Guid id, [FromBody] RespondFeedbackDto dto)
        {
            var item = await _context.FeedbackSuggestions.FindAsync(id);
            if (item == null) return NotFound(new { message = "Feedback entry not found." });

            item.status = dto.status;
            item.admin_response = dto.admin_response;

            _context.FeedbackSuggestions.Update(item);
            await ((DbContext)_context).SaveChangesAsync();

            return Ok(new { message = "Principal response recorded successfully.", data = item });
        }
    }
}
