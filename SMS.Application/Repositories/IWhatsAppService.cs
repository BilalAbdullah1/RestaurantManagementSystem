using System;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IWhatsAppService
    {
        Task SendFeeReminderAsync(string phoneNumber, string studentName, string challanMonth, decimal amount, DateTime dueDate);
        Task SendPaymentConfirmationAsync(string phoneNumber, string studentName, string challanMonth, decimal amountPaid);
        Task SendMessageAsync(string phoneNumber, string message);
        Task SendBulkWhatsAppAsync(System.Collections.Generic.List<string> phoneNumbers, string message);
    }
}
