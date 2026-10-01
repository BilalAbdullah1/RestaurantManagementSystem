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
    public class QuestionBanksController : ControllerBase
    {
        private readonly IApplicationDbContext _context;

        public QuestionBanksController(IApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("tenant/{tenantId}")]
        public async Task<IActionResult> GetQuestions(Guid tenantId, [FromQuery] Guid? classId, [FromQuery] Guid? subjectId)
        {
            var query = _context.QuestionBanks.Where(q => q.tenant_id == tenantId);
            
            if (classId.HasValue) query = query.Where(q => q.class_id == classId);
            if (subjectId.HasValue) query = query.Where(q => q.subject_id == subjectId);

            var questions = await query.OrderByDescending(q => q.created_at).ToListAsync();
            return Ok(questions);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] QuestionBank question)
        {
            question.id = Guid.NewGuid();
            question.created_at = DateTime.UtcNow;
            if (string.IsNullOrEmpty(question.question_type)) question.question_type = "MCQ";
            
            _context.QuestionBanks.Add(question);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Question added to bank successfully", question });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] QuestionBank question)
        {
            var existing = await _context.QuestionBanks.FindAsync(id);
            if (existing == null) return NotFound();

            existing.class_id = question.class_id;
            existing.subject_id = question.subject_id;
            existing.question_text = question.question_text;
            existing.option_a = question.option_a;
            existing.option_b = question.option_b;
            existing.option_c = question.option_c;
            existing.option_d = question.option_d;
            existing.correct_option = question.correct_option;
            existing.marks = question.marks;
            existing.difficulty_level = question.difficulty_level;
            existing.topic_name = question.topic_name;
            existing.explanation = question.explanation;
            existing.question_type = string.IsNullOrEmpty(question.question_type) ? "MCQ" : question.question_type;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Question updated successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var question = await _context.QuestionBanks.FindAsync(id);
            if (question == null) return NotFound();

            _context.QuestionBanks.Remove(question);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Question deleted successfully" });
        }
    }
}
