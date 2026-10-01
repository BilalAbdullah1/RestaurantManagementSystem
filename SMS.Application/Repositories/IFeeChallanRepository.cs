using SMS.Core.Entities;
using SMS.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IFeeChallanRepository
    {
        Task<int> GenerateBulkChallansAsync(GenerateBulkChallansDto dto);
        Task<IEnumerable<FeeChallanResponseDto>> GetChallansAsync(Guid tenantId, string billingMonth, Guid? classId);
        Task<bool> MarkChallanAsPaidAsync(Guid challanId, ReceivePaymentDto dto);
        Task<bool> SendReminderAsync(Guid challanId);
        Task<bool> SendReminderByStudentAsync(Guid studentId);
        Task<bool> CancelChallanAsync(Guid challanId);
    }
}