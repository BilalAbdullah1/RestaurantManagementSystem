using Microsoft.Extensions.Logging;
using RMS.Application.Repositories;
using System;
using System.Threading.Tasks;

namespace RMS.Infrastructure.Repositories
{
    public class WhatsAppService : IWhatsAppService
    {
        private readonly ILogger<WhatsAppService> _logger;

        public WhatsAppService(ILogger<WhatsAppService> logger)
        {
            _logger = logger;
        }

        public async Task SendFeeReminderAsync(string phoneNumber, string studentName, string challanMonth, decimal amount, DateTime dueDate)
        {
            // Simulate API call delay to Twilio/UltraMsg
            await Task.Delay(500);

            _logger.LogInformation($"[WhatsApp Mock] Sent Fee Reminder to {phoneNumber} for {studentName}. Amount: {amount}, Due: {dueDate:dd MMM yyyy}");
        }

        public async Task SendPaymentConfirmationAsync(string phoneNumber, string studentName, string challanMonth, decimal amountPaid)
        {
            // Simulate API call delay
            await Task.Delay(500);

            _logger.LogInformation($"[WhatsApp Mock] Sent Payment Receipt to {phoneNumber} for {studentName}. Amount Paid: {amountPaid}");
        }

        public async Task SendMessageAsync(string phoneNumber, string message)
        {
            // Simulate API call delay
            await Task.Delay(200);
            
            _logger.LogInformation($"[WhatsApp API] Sent Message to {phoneNumber}: {message}");
        }

        public async Task SendBulkWhatsAppAsync(System.Collections.Generic.List<string> phoneNumbers, string message)
        {
            await Task.Delay(500);
            _logger.LogInformation($"[WhatsApp Cloud API] Broadcasted message to {phoneNumbers.Count} recipients: {message}");
        }
    }
}
