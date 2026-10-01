using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IEmailService
    {
        Task SendPasswordResetEmail(string email, string resetToken, Guid tenantId);
        Task SendFeeChallanEmailAsync(string email, string studentName, string challanMonth, decimal amount, DateTime dueDate);
        Task SendFeeReceiptEmailAsync(string email, string studentName, string challanMonth, decimal amountPaid);
        Task SendMassEmailAsync(System.Collections.Generic.List<string> emails, string subject, string htmlBody);
    }
}