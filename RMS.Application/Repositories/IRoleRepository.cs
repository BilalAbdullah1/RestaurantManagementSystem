using RMS.Core.Entities;
using RMS.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMS.Application.Repositories
{
    public interface IRoleRepository
    {
        Task<IEnumerable<RoleDto>> GetByTenantAsync(Guid tenantId);
        Task<RoleDto?> GetByIdAsync(Guid id);
        Task<Role?> GetEntityByIdAsync(Guid id);
        Task AddAsync(Role role);
        void Update(Role role);
        Task DeleteAsync(Guid id);
        Task SaveChangesAsync();
    }
}