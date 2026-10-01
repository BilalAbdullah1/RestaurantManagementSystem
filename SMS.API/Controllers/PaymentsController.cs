using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SMS.Application.DTOs;
using SMS.Application.Repositories;
using System;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentsController : ControllerBase
    {
        private readonly IFeeChallanRepository _feeChallanRepository;

        public PaymentsController(IFeeChallanRepository feeChallanRepository)
        {
            _feeChallanRepository = feeChallanRepository;
        }

        [HttpPost("process")]
        public async Task<IActionResult> ProcessPayment([FromBody] ProcessPaymentDto dto)
        {
            if (dto.ChallanId == Guid.Empty)
                return BadRequest(new PaymentResponseDto { Success = false, Message = "Invalid Challan ID." });

            // Simulate payment gateway processing latency
            await Task.Delay(1500); 

            // Basic Mock Validation
            if (string.IsNullOrEmpty(dto.TransactionReference))
            {
                return BadRequest(new PaymentResponseDto { Success = false, Message = "Transaction Reference / OTP is missing." });
            }

            // Assume payment is successful if it reaches here in our simulation
            var paymentDto = new ReceivePaymentDto 
            { 
                amount_received = dto.Amount, 
                payment_method = dto.PaymentGateway,
                remarks = $"Online Payment Ref: {dto.TransactionReference}"
            };
            bool success = await _feeChallanRepository.MarkChallanAsPaidAsync(dto.ChallanId, paymentDto);

            if (!success)
            {
                return BadRequest(new PaymentResponseDto 
                { 
                    Success = false, 
                    Message = "Payment was captured, but we failed to update the challan. It might already be paid or invalid." 
                });
            }

            return Ok(new PaymentResponseDto
            {
                Success = true,
                Message = $"Payment of Rs {dto.Amount} via {dto.PaymentGateway} processed successfully.",
                TransactionId = $"TXN-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}"
            });
        }
    }
}
