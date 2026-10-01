using Microsoft.AspNetCore.Mvc;
using SMS.Application.DTOs;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentBehaviorLogsController : ControllerBase
    {
        private readonly IStudentBehaviorLogRepository _repository;

        public StudentBehaviorLogsController(IStudentBehaviorLogRepository repository)
        {
            _repository = repository;
        }

        // GET: api/studentbehaviorlogs/tenant/{tenantId}/year/{academicYearId}
        [HttpGet("tenant/{tenantId}/year/{academicYearId}")]
        public async Task<IActionResult> GetAllLogs(Guid tenantId, Guid academicYearId)
        {
            var logs = await _repository.GetAllLogsAsync(tenantId, academicYearId);
            return Ok(logs);
        }

        // GET: api/studentbehaviorlogs/student/{studentId}/year/{academicYearId}
        [HttpGet("student/{studentId}/year/{academicYearId}")]
        public async Task<IActionResult> GetStudentLogs(Guid studentId, Guid academicYearId)
        {
            var logs = await _repository.GetLogsByStudentAsync(studentId, academicYearId);
            return Ok(logs);
        }

        // POST: api/studentbehaviorlogs
        [HttpPost]
        public async Task<IActionResult> CreateLog([FromBody] CreateBehaviorLogDto dto)
        {
            var log = new StudentBehaviorLog
            {
                id = Guid.NewGuid(),
                tenant_id = dto.tenant_id,
                student_id = dto.student_id,
                academic_year_id = dto.academic_year_id,
                incident_date = dto.incident_date,
                incident_type = dto.incident_type,
                points_affected = dto.points_affected,
                action_taken = dto.action_taken,
                reported_by_user_id = dto.reported_by_user_id
            };

            await _repository.AddAsync(log);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Behavior log added successfully.", data = log });
        }

        // DELETE: api/studentbehaviorlogs/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLog(Guid id)
        {
            var log = await _repository.GetByIdAsync(id);
            if (log == null) return NotFound(new { message = "Log entry not found." });

            _repository.Delete(log);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Behavior log deleted successfully." });
        }
    }
}