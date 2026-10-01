using SMS.Core.Entities;
using SMS.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IExamScheduleRepository
    {
        Task<IEnumerable<ExamScheduleResponseDto>> GetDateSheetAsync(Guid tenantId, Guid examSetupId, Guid classId);
        Task<ExamSchedule> GetByIdAsync(Guid id);
        Task AddAsync(ExamSchedule schedule);
        void Update(ExamSchedule schedule);
        void Delete(ExamSchedule schedule);
        Task<bool> IsDuplicatePaperAsync(Guid examSetupId, Guid classId, Guid subjectId);
        Task<bool> SaveChangesAsync();
    }
}