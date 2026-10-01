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
    public class HomeworkSubmissionsController : ControllerBase
    {
        private readonly IHomeworkSubmissionRepository _repository;

        public HomeworkSubmissionsController(IHomeworkSubmissionRepository repository)
        {
            _repository = repository;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<HomeworkSubmissionResponseDto>> GetById(Guid id)
        {
            var submission = await _repository.GetByIdAsync(id);
            if (submission == null) return NotFound();
            return Ok(MapToDto(submission));
        }

        [HttpGet("tenant/{tenantId}/homework/{homeworkId}")]
        public async Task<ActionResult<IEnumerable<HomeworkSubmissionResponseDto>>> GetByHomework(Guid tenantId, Guid homeworkId)
        {
            var submissions = await _repository.GetByHomeworkIdAsync(tenantId, homeworkId);
            return Ok(submissions.Select(MapToDto));
        }

        [HttpGet("tenant/{tenantId}/student/{studentId}")]
        public async Task<ActionResult<IEnumerable<HomeworkSubmissionResponseDto>>> GetByStudent(Guid tenantId, Guid studentId)
        {
            var submissions = await _repository.GetByStudentIdAsync(tenantId, studentId);
            return Ok(submissions.Select(MapToDto));
        }

        [HttpPost("submit")]
        public async Task<ActionResult<HomeworkSubmissionResponseDto>> SubmitHomework(HomeworkSubmissionRequestDto dto)
        {
            // Check if already submitted
            var existing = await _repository.GetByHomeworkAndStudentAsync(dto.tenant_id, dto.homework_id, dto.student_id);
            if (existing != null)
            {
                // Update existing submission
                existing.student_notes = dto.student_notes;
                existing.attachment_urls = dto.attachment_urls;
                existing.status = "Submitted";
                existing.submission_date = DateTime.UtcNow;

                _repository.Update(existing);
                await _repository.SaveChangesAsync();
                return Ok(MapToDto(existing));
            }

            var submission = new HomeworkSubmission
            {
                id = Guid.NewGuid(),
                tenant_id = dto.tenant_id,
                homework_id = dto.homework_id,
                student_id = dto.student_id,
                submission_date = DateTime.UtcNow,
                status = "Submitted",
                student_notes = dto.student_notes,
                attachment_urls = dto.attachment_urls
            };

            await _repository.AddAsync(submission);
            await _repository.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = submission.id }, MapToDto(submission));
        }

        [HttpPut("{id}/grade")]
        public async Task<IActionResult> GradeSubmission(Guid id, [FromBody] HomeworkSubmissionRequestDto dto)
        {
            var submission = await _repository.GetByIdAsync(id);
            if (submission == null) return NotFound();

            submission.marks_obtained = dto.marks_obtained;
            submission.teacher_remarks = dto.teacher_remarks;
            submission.status = "Graded";

            _repository.Update(submission);
            await _repository.SaveChangesAsync();

            return NoContent();
        }

        private static HomeworkSubmissionResponseDto MapToDto(HomeworkSubmission s)
        {
            return new HomeworkSubmissionResponseDto
            {
                id = s.id,
                tenant_id = s.tenant_id,
                homework_id = s.homework_id,
                student_id = s.student_id,
                submission_date = s.submission_date,
                status = s.status,
                student_notes = s.student_notes,
                attachment_urls = s.attachment_urls,
                marks_obtained = s.marks_obtained,
                teacher_remarks = s.teacher_remarks
            };
        }
    }
}
