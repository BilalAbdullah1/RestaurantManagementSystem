using RMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMS.Application.Repositories
{
 public interface IUserRepository
    {
        Task<IEnumerable<User>> GetByTenantAsync(Guid tenantId);
        Task<User?> GetByIdAsync(Guid id);
        Task AddAsync(User user);
        void Update(User user);
        Task<User?> GetByEmailAndTenantAsync(string email, Guid tenantId);
        Task<User?> GetByResetTokenAsync(string token);
        Task SaveChangesAsync();
        Task DeleteAsync(Guid id);
    }
}