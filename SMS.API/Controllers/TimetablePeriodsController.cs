using Microsoft.AspNetCore.Mvc;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using SMS.Domain.Common;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TimetablePeriodsController : ControllerBase
    {
        private readonly ITimetablePeriodRepository _repository;

        public TimetablePeriodsController(ITimetablePeriodRepository repository)
        {
            _repository = repository;
        }

        [HttpGet("tenant/{tenantId}/section/{sectionId}")]
        public async Task<IActionResult> GetWeeklySchedule(Guid tenantId, Guid sectionId)
        {
            var periods = await _repository.GetWeeklyScheduleAsync(tenantId, sectionId);
            
            var result = periods.Select(p => new TimetablePeriodResponseDto
            {
                id = p.id,
                tenant_id = p.tenant_id,
                class_id = p.class_id,
                section_id = p.section_id,
                subject_id = p.subject_id,
                staff_id = p.staff_id,
                day_of_week = p.day_of_week,
                start_time = p.start_time,
                end_time = p.end_time,
                room_name = p.room_name,
                created_at = p.created_at
            });

            return Ok(result);
        }

        [HttpGet("tenant/{tenantId}/teacher/{staffId}")]
        public async Task<IActionResult> GetTeacherWeeklySchedule(Guid tenantId, Guid staffId)
        {
            var periods = await _repository.GetTeacherWeeklyScheduleAsync(tenantId, staffId);
            
            var result = periods.Select(p => new TimetablePeriodResponseDto
            {
                id = p.id,
                tenant_id = p.tenant_id,
                class_id = p.class_id,
                section_id = p.section_id,
                subject_id = p.subject_id,
                staff_id = p.staff_id,
                day_of_week = p.day_of_week,
                start_time = p.start_time,
                end_time = p.end_time,
                room_name = p.room_name,
                created_at = p.created_at
            });

            return Ok(result);
        }

        [HttpGet("tenant/{tenantId}/free-teachers")]
        public async Task<IActionResult> GetFreeTeachers(Guid tenantId, [FromQuery] int dayOfWeek, [FromQuery] string start, [FromQuery] string end, [FromQuery] DateTime date)
        {
            if (!TimeSpan.TryParse(start, out var startTime) || !TimeSpan.TryParse(end, out var endTime))
                return BadRequest("Invalid time format. Use HH:mm:ss");

            var teachers = await _repository.GetFreeTeachersAsync(tenantId, dayOfWeek, startTime, endTime, date);
            return Ok(teachers);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTimetablePeriodDto dto)
        {
            if (dto.start_time >= dto.end_time)
                return BadRequest(new { message = "Start time must be before end time." });

            if (await _repository.HasTeacherConflictAsync(dto.tenant_id, dto.staff_id, dto.day_of_week, dto.start_time, dto.end_time))
                return BadRequest(new { message = "Teacher is already scheduled for another class at this time." });

            if (!string.IsNullOrEmpty(dto.room_name) && await _repository.HasRoomConflictAsync(dto.tenant_id, dto.room_name, dto.day_of_week, dto.start_time, dto.end_time))
                return BadRequest(new { message = "Room is already booked at this time." });

            var period = new TimetablePeriod
            {
                tenant_id = dto.tenant_id,
                class_id = dto.class_id,
                section_id = dto.section_id,
                subject_id = dto.subject_id,
                staff_id = dto.staff_id,
                day_of_week = dto.day_of_week,
                start_time = dto.start_time,
                end_time = dto.end_time,
                room_name = dto.room_name
            };

            var created = await _repository.AddAsync(period);
            return Ok(created);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var success = await _repository.DeleteAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

        public class AutoGenerateTimetableDto
        {
            public Guid tenant_id { get; set; }
            public Guid class_id { get; set; }
            public Guid section_id { get; set; }
        }

        // POST: api/timetableperiods/auto-generate
        [HttpPost("auto-generate")]
        public async Task<IActionResult> AutoGenerate([FromBody] AutoGenerateTimetableDto dto, [FromServices] SMS.Infrastructure.Persistence.ApplicationDbContext dbContext)
        {
            // 1. Get all class subjects for this class
            var classSubjects = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync(
                dbContext.ClassSubjects.Where(cs => cs.tenant_id == dto.tenant_id && cs.class_id == dto.class_id));

            if (!classSubjects.Any())
                return BadRequest(new { message = "No subjects assigned to this class yet. Please assign subjects first." });

            // 2. Get active staff teachers
            var teachers = await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.ToListAsync(
                dbContext.Staff.Where(s => s.tenant_id == dto.tenant_id && s.is_active));

            if (!teachers.Any())
                return BadRequest(new { message = "No active staff teachers found for this school." });

            // Standard 6 periods per day (Monday=1 to Friday=5)
            var timeSlots = new[]
            {
                (Start: new TimeSpan(8, 30, 0), End: new TimeSpan(9, 15, 0)),
                (Start: new TimeSpan(9, 15, 0), End: new TimeSpan(10, 0, 0)),
                (Start: new TimeSpan(10, 15, 0), End: new TimeSpan(11, 0, 0)),
                (Start: new TimeSpan(11, 0, 0), End: new TimeSpan(11, 45, 0)),
                (Start: new TimeSpan(12, 0, 0), End: new TimeSpan(12, 45, 0)),
                (Start: new TimeSpan(12, 45, 0), End: new TimeSpan(13, 30, 0)),
            };

            int generatedCount = 0;
            int subjectIdx = 0;

            for (int day = 1; day <= 5; day++) // Monday to Friday
            {
                for (int slotIdx = 0; slotIdx < timeSlots.Length; slotIdx++)
                {
                    var slot = timeSlots[slotIdx];
                    var classSub = classSubjects[subjectIdx % classSubjects.Count];
                    var assignedTeacher = teachers[subjectIdx % teachers.Count];

                    // Check for teacher clash
                    bool hasTeacherClash = await _repository.HasTeacherConflictAsync(dto.tenant_id, assignedTeacher.id, day, slot.Start, slot.End);
                    if (hasTeacherClash)
                    {
                        // Try finding an un-conflicted teacher
                        var freeTeacher = teachers.FirstOrDefault(t => 
                            !_repository.HasTeacherConflictAsync(dto.tenant_id, t.id, day, slot.Start, slot.End).Result);
                        if (freeTeacher != null) assignedTeacher = freeTeacher;
                    }

                    var period = new TimetablePeriod
                    {
                        id = Guid.NewGuid(),
                        tenant_id = dto.tenant_id,
                        class_id = dto.class_id,
                        section_id = dto.section_id,
                        subject_id = classSub.subject_id,
                        staff_id = assignedTeacher.id,
                        day_of_week = day,
                        start_time = slot.Start,
                        end_time = slot.End,
                        room_name = $"Room-{(slotIdx % 5) + 1}",
                        created_at = DateTime.UtcNow
                    };

                    await _repository.AddAsync(period);
                    generatedCount++;
                    subjectIdx++;
                }
            }

            return Ok(new { message = $"Smart Timetable generated successfully with {generatedCount} slots!", count = generatedCount });
        }
    }
}
