using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SMS.Application.DTOs;
using SMS.Application.Repositories;
using SMS.Infrastructure.Security;
using System;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ExamMarksController : ControllerBase
    {
        private readonly IExamMarkRepository _repository;

        public ExamMarksController(IExamMarkRepository repository)
        {
            _repository = repository;
        }

        // GET: api/exammarks/tenant/{tenantId}/sheet?examId=...&classId=...&subjectId=...
        [HttpGet("tenant/{tenantId}/sheet")]
        [HasPermission("exams.view")]
        public async Task<IActionResult> GetMarksSheet(Guid tenantId, [FromQuery] Guid examId, [FromQuery] Guid classId, [FromQuery] Guid subjectId)
        {
            if (tenantId == Guid.Empty || examId == Guid.Empty || classId == Guid.Empty || subjectId == Guid.Empty) 
                return BadRequest(new { message = "All parameters (Tenant, Exam, Class, Subject) are required." });

            var sheet = await _repository.GetMarksSheetAsync(tenantId, examId, classId, subjectId);
            return Ok(sheet);
        }

        // POST: api/exammarks/bulk-save
        [HttpPost("bulk-save")]
        [HasPermission("marks.entry")]
        public async Task<IActionResult> SaveBulkMarks([FromBody] BulkSaveMarksDto dto)
        {
            try
            {
                if (!ModelState.IsValid) return BadRequest(ModelState);
                if (dto.marks == null || dto.marks.Count == 0)
                    return BadRequest(new { message = "No marks data provided to save." });

                int processedRecords = await _repository.SaveBulkMarksAsync(dto);
                return Ok(new { message = $"Successfully processed and saved marks for {processedRecords} student(s)." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}