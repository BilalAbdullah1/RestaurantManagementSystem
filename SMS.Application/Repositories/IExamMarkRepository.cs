using SMS.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IExamMarkRepository
    {
        Task<IEnumerable<StudentMarkSheetDto>> GetMarksSheetAsync(Guid tenantId, Guid examSetupId, Guid classId, Guid subjectId);
        Task<int> SaveBulkMarksAsync(BulkSaveMarksDto dto);
    }
}