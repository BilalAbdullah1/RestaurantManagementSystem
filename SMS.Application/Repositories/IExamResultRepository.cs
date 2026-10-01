using SMS.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IExamResultRepository
    {
        Task<int> GenerateClassResultsAsync(GenerateResultRequestDto dto);
        
        Task<IEnumerable<StudentReportCardDto>> GetClassResultsAsync(Guid tenantId, Guid examSetupId, Guid classId);
    }
}