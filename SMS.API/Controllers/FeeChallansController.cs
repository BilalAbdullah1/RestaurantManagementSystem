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
    public class FeeChallansController : ControllerBase
    {
        private readonly IFeeChallanRepository _repository;

        public FeeChallansController(IFeeChallanRepository repository)
        {
            _repository = repository;
        }

        // GET: api/feechallans/tenant/{tenantId}?billingMonth=Oct-2026&classId=...
        [HttpGet("tenant/{tenantId}")]
        [HasPermission("fees.view")]
        public async Task<IActionResult> GetChallans(Guid tenantId, [FromQuery] string? billingMonth = null, [FromQuery] Guid? classId = null)
        {
            var challans = await _repository.GetChallansAsync(tenantId, billingMonth, classId);
            return Ok(challans);
        }

        // POST: api/feechallans/generate-bulk
        [HttpPost("generate-bulk")]
        [HasPermission("fees.vouchers")]
        public async Task<IActionResult> GenerateBulk([FromBody] GenerateBulkChallansDto dto)
        {
            try
            {
                int count = await _repository.GenerateBulkChallansAsync(dto);
                if (count == 0)
                {
                    return Ok(new { message = "No new challans generated. Either no active students found or challans already exist for this month." });
                }

                return Ok(new { message = $"Successfully generated {count} new fee challan(s)." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/feechallans/{id}/pay
        [HttpPut("{id}/pay")]
        [HasPermission("fees.collect")]
        public async Task<IActionResult> MarkAsPaid(Guid id, [FromBody] ReceivePaymentDto dto)
        {
            if (dto.amount_received <= 0 && !dto.use_wallet_balance)
            {
                return BadRequest(new { message = "Payment amount must be greater than zero, or wallet balance must be used." });
            }

            bool success = await _repository.MarkChallanAsPaidAsync(id, dto);
            if (!success) return BadRequest(new { message = "Challan could not be marked as paid. It may already be paid or does not exist." });

            return Ok(new { message = "Payment processed successfully." });
        }

        // POST: api/feechallans/{id}/send-reminder
        [HttpPost("{id}/send-reminder")]
        [HasPermission("fees.vouchers")]
        public async Task<IActionResult> SendReminder(Guid id)
        {
            bool success = await _repository.SendReminderAsync(id);
            if (!success) return BadRequest(new { message = "Failed to send reminder. Ensure challan is unpaid and student has valid contact details." });

            return Ok(new { message = "Reminder sent successfully via Email/WhatsApp." });
        }

        // POST: api/feechallans/send-reminder-by-student/{studentId}
        [HttpPost("send-reminder-by-student/{studentId}")]
        [HasPermission("fees.vouchers")]
        public async Task<IActionResult> SendReminderByStudent(Guid studentId)
        {
            bool success = await _repository.SendReminderByStudentAsync(studentId);
            if (!success) return BadRequest(new { message = "Failed to send reminder. Ensure student has unpaid challan and valid phone number." });

            return Ok(new { message = "WhatsApp fee reminder sent successfully to student guardian." });
        }

        // DELETE: api/feechallans/{id}
        [HttpDelete("{id}")]
        [HasPermission("fees.collect")]
        public async Task<IActionResult> CancelChallan(Guid id)
        {
            bool success = await _repository.CancelChallanAsync(id);
            if (!success) return BadRequest(new { message = "Challan could not be cancelled or deleted." });

            return Ok(new { message = "Fee Challan cancelled and deleted successfully." });
        }
    }
}