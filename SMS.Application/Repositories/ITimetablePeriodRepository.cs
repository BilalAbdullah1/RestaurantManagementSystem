using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SMS.Core.Entities;

namespace SMS.Application.Repositories
{
    public interface ITimetablePeriodRepository
    {
        Task<IEnumerable<TimetablePeriod>> GetWeeklyScheduleAsync(Guid tenantId, Guid sectionId);
        Task<TimetablePeriod> AddAsync(TimetablePeriod period);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> HasTeacherConflictAsync(Guid tenantId, Guid staffId, int dayOfWeek, TimeSpan start, TimeSpan end);
        Task<bool> HasRoomConflictAsync(Guid tenantId, string roomName, int dayOfWeek, TimeSpan start, TimeSpan end);
        Task<IEnumerable<TimetablePeriod>> GetTeacherWeeklyScheduleAsync(Guid tenantId, Guid staffId);
        Task<IEnumerable<SMS.Application.DTOs.StaffFormDto>> GetFreeTeachersAsync(Guid tenantId, int dayOfWeek, TimeSpan start, TimeSpan end, DateTime dateOfProxy);
    }
}
