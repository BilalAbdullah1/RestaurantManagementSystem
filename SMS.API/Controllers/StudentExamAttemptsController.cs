using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SMS.Application.Interfaces;
using SMS.Core.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentExamAttemptsController : ControllerBase
    {
        private readonly IApplicationDbContext _context;

        public StudentExamAttemptsController(IApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("start")]
        public async Task<IActionResult> StartAttempt([FromBody] StartAttemptDto dto)
        {
            var existing = await _context.StudentExamAttempts
                .FirstOrDefaultAsync(a => a.online_exam_id == dto.online_exam_id && a.student_id == dto.student_id);

            if (existing != null)
            {
                if (existing.is_completed) return BadRequest(new { message = "Exam already completed." });
                return Ok(new { message = "Resuming exam", attempt = existing });
            }

            var attempt = new StudentExamAttempt
            {
                id = Guid.NewGuid(),
                tenant_id = dto.tenant_id,
                online_exam_id = dto.online_exam_id,
                student_id = dto.student_id,
                score = 0,
                start_time = DateTime.UtcNow,
                is_completed = false
            };

            _context.StudentExamAttempts.Add(attempt);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Exam started", attempt });
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitAttempt([FromBody] SubmitAttemptDto dto)
        {
            var attempt = await _context.StudentExamAttempts.FindAsync(dto.attempt_id);
            if (attempt == null) return NotFound(new { message = "Attempt not found" });

            if (attempt.is_completed) return BadRequest(new { message = "Exam already submitted" });

            attempt.is_completed = true;
            attempt.end_time = DateTime.UtcNow;
            attempt.responses_json = dto.responses_json;
            attempt.score = dto.score;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Exam submitted successfully", score = attempt.score });
        }
    }

    public class StartAttemptDto
    {
        public Guid tenant_id { get; set; }
        public Guid online_exam_id { get; set; }
        public Guid student_id { get; set; }
    }

    public class SubmitAttemptDto
    {
        public Guid attempt_id { get; set; }
        public string responses_json { get; set; } = default!;
        public int score { get; set; }
    }
}
