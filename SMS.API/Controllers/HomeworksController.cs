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
    public class HomeworksController : ControllerBase
    {
        private readonly IHomeworkRepository _repository;
        private readonly SMS.Application.Interfaces.INotificationService _notificationService;

        public HomeworksController(IHomeworkRepository repository, SMS.Application.Interfaces.INotificationService notificationService)
        {
            _repository = repository;
            _notificationService = notificationService;
        }

        [HttpGet("tenant/{tenantId}")]
        public async Task<ActionResult<IEnumerable<HomeworkResponseDto>>> GetByTenant(Guid tenantId)
        {
            var homeworks = await _repository.GetByTenantAsync(tenantId);
            return Ok(homeworks.Select(MapToDto));
        }

        [HttpGet("tenant/{tenantId}/class/{classId}/section/{sectionId}")]
        public async Task<ActionResult<IEnumerable<HomeworkResponseDto>>> GetByClassAndSection(Guid tenantId, Guid classId, Guid sectionId)
        {
            var homeworks = await _repository.GetByClassAndSectionAsync(tenantId, classId, sectionId);
            return Ok(homeworks.Select(MapToDto));
        }

        [HttpGet("tenant/{tenantId}/teacher/{teacherId}")]
        public async Task<ActionResult<IEnumerable<HomeworkResponseDto>>> GetByTeacher(Guid tenantId, Guid teacherId)
        {
            var homeworks = await _repository.GetByTeacherAsync(tenantId, teacherId);
            return Ok(homeworks.Select(MapToDto));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<HomeworkResponseDto>> GetById(Guid id)
        {
            var homework = await _repository.GetByIdAsync(id);
            if (homework == null) return NotFound();
            return Ok(MapToDto(homework));
        }

        [HttpPost]
        public async Task<ActionResult<HomeworkResponseDto>> Create(HomeworkRequestDto dto)
        {
            var homework = new Homework
            {
                id = Guid.NewGuid(),
                tenant_id = dto.tenant_id,
                class_id = dto.class_id,
                section_id = dto.section_id,
                subject_id = dto.subject_id,
                staff_id = dto.staff_id,
                title = dto.title,
                description = dto.description,
                homework_date = dto.homework_date,
                due_date = dto.due_date,
                max_marks = dto.max_marks,
                attachment_urls = dto.attachment_urls,
                created_at = DateTime.UtcNow
            };

            await _repository.AddAsync(homework);
            await _repository.SaveChangesAsync();

            // Notify students and parents about the new homework
            var notificationDto = new SMS.Application.DTOs.CreateNotificationDto
            {
                Title = $"New Homework: {dto.title}",
                Message = $"A new homework has been uploaded. Due Date: {dto.due_date:MMM dd, yyyy}",
                Type = "Homework"
            };

            // Send to Students
            notificationDto.TargetRole = "Student";
            await _notificationService.SendNotificationAsync(notificationDto);

            // Send to Parents
            notificationDto.TargetRole = "Parent";
            await _notificationService.SendNotificationAsync(notificationDto);

            return CreatedAtAction(nameof(GetById), new { id = homework.id }, MapToDto(homework));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, HomeworkRequestDto dto)
        {
            var homework = await _repository.GetByIdAsync(id);
            if (homework == null) return NotFound();

            homework.class_id = dto.class_id;
            homework.section_id = dto.section_id;
            homework.subject_id = dto.subject_id;
            homework.title = dto.title;
            homework.description = dto.description;
            homework.homework_date = dto.homework_date;
            homework.due_date = dto.due_date;
            homework.max_marks = dto.max_marks;
            homework.attachment_urls = dto.attachment_urls;

            _repository.Update(homework);
            await _repository.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var homework = await _repository.GetByIdAsync(id);
            if (homework == null) return NotFound();

            _repository.Delete(homework);
            await _repository.SaveChangesAsync();

            return NoContent();
        }

        private static HomeworkResponseDto MapToDto(Homework h)
        {
            return new HomeworkResponseDto
            {
                id = h.id,
                tenant_id = h.tenant_id,
                class_id = h.class_id,
                section_id = h.section_id,
                subject_id = h.subject_id,
                staff_id = h.staff_id,
                title = h.title,
                description = h.description,
                homework_date = h.homework_date,
                due_date = h.due_date,
                max_marks = h.max_marks,
                attachment_urls = h.attachment_urls,
                created_at = h.created_at
            };
        }
    }
}
