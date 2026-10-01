using System;

namespace SMS.Application.DTOs
{
    public class ReceivePaymentDto
    {
        public decimal amount_received { get; set; }
        public string payment_method { get; set; } = "Cash";
        public string? remarks { get; set; }
        public bool use_wallet_balance { get; set; } = false;
    }
}
