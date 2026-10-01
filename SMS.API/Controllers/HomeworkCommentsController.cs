using Microsoft.AspNetCore.Mvc;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using SMS.Domain.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HomeworkCommentsController : ControllerBase
    {
        private readonly IHomeworkCommentRepository _repository;

        public HomeworkCommentsController(IHomeworkCommentRepository repository)
        {
            _repository = repository;
        }

        [HttpGet("tenant/{tenantId}/homework/{homeworkId}")]
        public async Task<ActionResult<IEnumerable<HomeworkCommentDto>>> GetByHomework(Guid tenantId, Guid homeworkId)
        {
            var comments = await _repository.GetByHomeworkIdAsync(tenantId, homeworkId);
            return Ok(comments.Select(c => new HomeworkCommentDto
            {
                id = c.id,
                tenant_id = c.tenant_id,
                homework_id = c.homework_id,
                user_id = c.user_id,
                comment_text = c.comment_text,
                created_at = c.created_at
            }));
        }

        [HttpPost]
        public async Task<ActionResult<HomeworkCommentDto>> Create(HomeworkCommentDto dto)
        {
            var comment = new HomeworkComment
            {
                id = Guid.NewGuid(),
                tenant_id = dto.tenant_id,
                homework_id = dto.homework_id,
                user_id = dto.user_id,
                comment_text = dto.comment_text,
                created_at = DateTime.UtcNow
            };

            await _repository.AddAsync(comment);
            await _repository.SaveChangesAsync();

            dto.id = comment.id;
            dto.created_at = comment.created_at;

            return CreatedAtAction(nameof(GetByHomework), new { tenantId = dto.tenant_id, homeworkId = dto.homework_id }, dto);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var comment = await _repository.GetByIdAsync(id);
            if (comment == null) return NotFound();

            _repository.Delete(comment);
            await _repository.SaveChangesAsync();

            return NoContent();
        }
    }
}
