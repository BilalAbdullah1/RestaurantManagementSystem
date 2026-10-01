using Microsoft.AspNetCore.Mvc;
using SMS.Application.DTOs;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using System;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExamSchedulesController : ControllerBase
    {
        private readonly IExamScheduleRepository _repository;

        public ExamSchedulesController(IExamScheduleRepository repository)
        {
            _repository = repository;
        }

        [HttpGet("tenant/{tenantId}/datesheet")]
        public async Task<IActionResult> GetDateSheet(Guid tenantId, [FromQuery] Guid examId, [FromQuery] Guid classId)
        {
            if (tenantId == Guid.Empty || examId == Guid.Empty || classId == Guid.Empty) 
                return BadRequest(new { message = "Tenant ID, Exam ID, and Class ID are required." });

            var dateSheet = await _repository.GetDateSheetAsync(tenantId, examId, classId);
            return Ok(dateSheet);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateExamScheduleDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (dto.passing_marks > dto.total_marks)
                return BadRequest(new { message = "Passing marks cannot be greater than Total marks." });

            bool isDuplicate = await _repository.IsDuplicatePaperAsync(dto.exam_setup_id, dto.class_id, dto.subject_id);
            if (isDuplicate)
                return BadRequest(new { message = "A paper for this subject is already scheduled for this class in the selected exam." });

            var schedule = new ExamSchedule
            {
                id = Guid.NewGuid(),
                tenant_id = dto.tenant_id,
                exam_setup_id = dto.exam_setup_id,
                class_id = dto.class_id,
                subject_id = dto.subject_id,
                exam_date = dto.exam_date,
                start_time = dto.start_time,
                end_time = dto.end_time,
                total_marks = dto.total_marks,
                passing_marks = dto.passing_marks,
                room_number = dto.room_number,
                invigilator_name = dto.invigilator_name,
                created_at = DateTime.UtcNow
            };

            await _repository.AddAsync(schedule);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Paper scheduled successfully.", data = schedule });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateExamScheduleDto dto)
        {
            if (dto.passing_marks > dto.total_marks)
                return BadRequest(new { message = "Passing marks cannot be greater than Total marks." });

            var schedule = await _repository.GetByIdAsync(id);
            if (schedule == null) return NotFound(new { message = "Schedule record not found." });

            schedule.exam_date = dto.exam_date;
            schedule.start_time = dto.start_time;
            schedule.end_time = dto.end_time;
            schedule.total_marks = dto.total_marks;
            schedule.passing_marks = dto.passing_marks;
            schedule.room_number = dto.room_number;
            schedule.invigilator_name = dto.invigilator_name;

            _repository.Update(schedule);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Paper schedule updated successfully.", data = schedule });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var schedule = await _repository.GetByIdAsync(id);
            if (schedule == null) return NotFound(new { message = "Schedule record not found." });

            _repository.Delete(schedule);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Schedule entry deleted successfully." });
        }
    }
}