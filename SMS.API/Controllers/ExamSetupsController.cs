using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SMS.Application.DTOs;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using SMS.Infrastructure.Security;
using System;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ExamSetupsController : ControllerBase
    {
        private readonly IExamSetupRepository _repository;

        public ExamSetupsController(IExamSetupRepository repository)
        {
            _repository = repository;
        }

        // GET: api/examsetups/tenant/{tenantId}
        [HttpGet("tenant/{tenantId}")]
        [HasPermission("exams.view")]
        public async Task<IActionResult> GetAll(Guid tenantId)
        {
            if (tenantId == Guid.Empty) return BadRequest(new { message = "Tenant ID is required." });

            var exams = await _repository.GetAllAsync(tenantId);
            bool updatedAny = false;

            // Auto-Check Deadline Lock Scheduler
            foreach (var exam in exams)
            {
                if (exam.marks_entry_deadline.HasValue && DateTime.UtcNow > exam.marks_entry_deadline.Value && !exam.is_locked)
                {
                    exam.is_locked = true;
                    _repository.Update(exam);
                    updatedAny = true;
                }
            }

            if (updatedAny)
            {
                await _repository.SaveChangesAsync();
            }

            return Ok(exams);
        }

        // POST: api/examsetups
        [HttpPost]
        [HasPermission("exams.manage")]
        public async Task<IActionResult> Create([FromBody] CreateExamSetupDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (dto.start_date > dto.end_date)
                return BadRequest(new { message = "Start date cannot be greater than end date." });

            var examSetup = new ExamSetup
            {
                id = Guid.NewGuid(),
                tenant_id = dto.tenant_id,
                title = dto.title,
                start_date = dto.start_date,
                end_date = dto.end_date,
                description = dto.description,
                weightage_percentage = dto.weightage_percentage,
                marks_entry_deadline = dto.marks_entry_deadline,
                target_class_ids = dto.target_class_ids,
                academic_session = dto.academic_session,
                is_published = dto.is_published ?? false,
                is_locked = false,
                created_at = DateTime.UtcNow
            };

            await _repository.AddAsync(examSetup);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Exam Term / Session created successfully.", data = examSetup });
        }

        // PUT: api/examsetups/{id}
        [HttpPut("{id}")]
        [HasPermission("exams.manage")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateExamSetupDto dto)
        {
            var exam = await _repository.GetByIdAsync(id);
            if (exam == null) return NotFound(new { message = "Exam configuration not found." });

            if (dto.start_date > dto.end_date)
                return BadRequest(new { message = "Start date cannot be greater than end date." });

            exam.title = dto.title;
            exam.start_date = dto.start_date;
            exam.end_date = dto.end_date;
            exam.status = dto.status;
            exam.description = dto.description;
            exam.weightage_percentage = dto.weightage_percentage;
            exam.marks_entry_deadline = dto.marks_entry_deadline;
            exam.target_class_ids = dto.target_class_ids;
            exam.academic_session = dto.academic_session;
            if (dto.is_published.HasValue)
            {
                exam.is_published = dto.is_published.Value;
            }

            _repository.Update(exam);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Exam configuration updated successfully.", data = exam });
        }

        // PATCH: api/examsetups/{id}/toggle-lock
        [HttpPatch("{id}/toggle-lock")]
        [HasPermission("marks.lock")]
        public async Task<IActionResult> ToggleLock(Guid id)
        {
            var exam = await _repository.GetByIdAsync(id);
            if (exam == null) return NotFound(new { message = "Exam not found." });

            exam.is_locked = !exam.is_locked;
            _repository.Update(exam);
            await _repository.SaveChangesAsync();

            var status = exam.is_locked ? "Locked (Marks Entry Closed)" : "Unlocked (Marks Entry Open)";
            return Ok(new { message = $"Exam session has been {status}.", is_locked = exam.is_locked });
        }

        // PATCH: api/examsetups/{id}/toggle-publish
        [HttpPatch("{id}/toggle-publish")]
        [HasPermission("marks.lock")]
        public async Task<IActionResult> TogglePublish(Guid id)
        {
            var exam = await _repository.GetByIdAsync(id);
            if (exam == null) return NotFound(new { message = "Exam not found." });

            exam.is_published = !exam.is_published;
            _repository.Update(exam);
            await _repository.SaveChangesAsync();

            var status = exam.is_published ? "Published to Parents/Students" : "Unpublished / Hidden";
            return Ok(new { message = $"Exam result has been {status}.", is_published = exam.is_published });
        }

        // DELETE: api/examsetups/{id}
        [HttpDelete("{id}")]
        [HasPermission("exams.manage")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var exam = await _repository.GetByIdAsync(id);
            if (exam == null) return NotFound(new { message = "Exam configuration not found." });

            _repository.Delete(exam);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Exam configuration deleted successfully." });
        }
    }
}