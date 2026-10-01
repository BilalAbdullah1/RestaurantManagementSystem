using System;

namespace RMS.Application.DTOs
{
    public class ProcessPaymentDto
    {
        public Guid ChallanId { get; set; }
        public decimal Amount { get; set; }
        public string PaymentGateway { get; set; } = string.Empty; // "Stripe", "JazzCash", "EasyPaisa", "Bank"
        public string TransactionReference { get; set; } = string.Empty; // Token, OTP, or Receipt URL
    }

    public class PaymentResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string TransactionId { get; set; } = string.Empty;
    }
}
