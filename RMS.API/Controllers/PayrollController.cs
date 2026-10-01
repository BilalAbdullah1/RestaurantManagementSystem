using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RMS.Application.DTOs;
using RMS.Application.Repositories;
using RMS.Infrastructure.Security;
using System;
using System.Threading.Tasks;

namespace RMS.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SalarySlipsController : ControllerBase
    {
        private readonly ISalarySlipRepository _repository;

        public SalarySlipsController(ISalarySlipRepository repository)
        {
            _repository = repository;
        }

        // GET: api/salaryslips/tenant/{tenantId}?salaryMonth=Oct-2026
        [HttpGet("tenant/{tenantId}")]
        [HasPermission("payroll.manage")]
        public async Task<IActionResult> GetSlips(Guid tenantId, [FromQuery] string salaryMonth)
        {
            var slips = await _repository.GetSlipsAsync(tenantId, salaryMonth);
            return Ok(slips);
        }

        // POST: api/salaryslips/generate-bulk
        [HttpPost("generate-bulk")]
        [HasPermission("payroll.manage")]
        public async Task<IActionResult> GenerateBulk([FromBody] GenerateBulkSalarySlipsDto dto)
        {
            try
            {
                int count = await _repository.GenerateBulkSlipsAsync(dto);
                if (count == 0)
                {
                    return Ok(new { message = "No new salary slips generated. Either no active staff found or slips already exist for this month." });
                }

                return Ok(new { message = $"Successfully generated {count} salary slips." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT/POST: api/salaryslips/{id}/pay
        [HttpPut("{id}/pay")]
        [HttpPost("{id}/pay")]
        [HasPermission("payroll.manage")]
        public async Task<IActionResult> MarkAsPaid(Guid id)
        {
            bool success = await _repository.MarkAsPaidAsync(id);
            if (!success) return BadRequest(new { message = "Salary slip could not be marked as paid. It may already be paid or does not exist." });

            return Ok(new { message = "Salary slip successfully marked as Paid." });
        }
    }
}