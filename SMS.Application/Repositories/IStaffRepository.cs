using SMS.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IStaffRepository
    {
        Task<IEnumerable<StaffFormDto>> GetByTenantAsync(Guid tenantId);
        Task<StaffFormDto?> GetByIdAsync(Guid id);
        Task<bool> ExistsCnicAsync(Guid tenantId, string cnic);
        Task<StaffFormDto> CreateStaffWithUserAsync(StaffFormDto dto);
        Task UpdateStaffWithUserAsync(StaffFormDto dto);
        Task DeleteAsync(Guid id);
    }
}