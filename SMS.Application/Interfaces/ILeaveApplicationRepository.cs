using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Interfaces
{
    public interface ILeaveApplicationRepository
    {
        Task<LeaveApplication> GetByIdAsync(Guid id);
        Task<IEnumerable<LeaveApplication>> GetByTenantIdAsync(Guid tenantId);
        Task<IEnumerable<LeaveApplication>> GetByStudentIdAsync(Guid tenantId, Guid studentId);
        Task<IEnumerable<LeaveApplication>> GetByStaffIdAsync(Guid tenantId, Guid staffId);
        Task<IEnumerable<LeaveApplication>> GetPendingByTenantIdAsync(Guid tenantId);
        Task<LeaveApplication> AddAsync(LeaveApplication leaveApplication);
        Task UpdateAsync(LeaveApplication leaveApplication);
    }
}
