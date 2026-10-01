using SMS.Core.Entities;
using SMS.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface ISalarySlipRepository
    {
        Task<int> GenerateBulkSlipsAsync(GenerateBulkSalarySlipsDto dto);
        
        Task<IEnumerable<SalarySlipResponseDto>> GetSlipsAsync(Guid tenantId, string salaryMonth);
        
        Task<bool> MarkAsPaidAsync(Guid id);
    }
}