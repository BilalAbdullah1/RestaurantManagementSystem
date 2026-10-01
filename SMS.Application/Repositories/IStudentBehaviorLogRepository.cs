using SMS.Core.Entities;
using SMS.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IStudentBehaviorLogRepository
    {
        Task<IEnumerable<BehaviorLogResponseDto>> GetAllLogsAsync(Guid tenantId, Guid academicYearId);
        Task<IEnumerable<BehaviorLogResponseDto>> GetLogsByStudentAsync(Guid studentId, Guid academicYearId);
        Task<StudentBehaviorLog> GetByIdAsync(Guid id);
        Task AddAsync(StudentBehaviorLog log);
        void Update(StudentBehaviorLog log);
        void Delete(StudentBehaviorLog log);
        Task<bool> SaveChangesAsync();
    }
}