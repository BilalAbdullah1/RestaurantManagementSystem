using Microsoft.AspNetCore.Mvc;
using SMS.Application.DTOs;
using SMS.Application.Repositories;
using System;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ExamResultsController : ControllerBase
    {
        private readonly IExamResultRepository _repository;

        public ExamResultsController(IExamResultRepository repository)
        {
            _repository = repository;
        }

        // POST: api/examresults/generate
        [HttpPost("generate")]
        public async Task<IActionResult> GenerateResults([FromBody] GenerateResultRequestDto dto)
        {
            try
            {
                int count = await _repository.GenerateClassResultsAsync(dto);
                if (count == 0)
                    return BadRequest(new { message = "No active students found in this class to generate results." });

                return Ok(new { message = $"Successfully processed and generated results for {count} students." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // GET: api/examresults/tenant/{tenantId}/class/{classId}?examId=...
        [HttpGet("tenant/{tenantId}/class/{classId}")]
        public async Task<IActionResult> GetClassResults(Guid tenantId, Guid classId, [FromQuery] Guid examId)
        {
            if (tenantId == Guid.Empty || classId == Guid.Empty || examId == Guid.Empty)
                return BadRequest(new { message = "Missing required parameters." });

            var results = await _repository.GetClassResultsAsync(tenantId, examId, classId);
            return Ok(results);
        }
    }
}