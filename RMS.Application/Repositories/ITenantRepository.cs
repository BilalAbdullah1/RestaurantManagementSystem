using RMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMS.Application.Repositories
{
  public interface ITenantRepository
    {
        Task<IEnumerable<Tenant>> GetAllAsync();
        Task<Tenant?> GetByIdAsync(Guid id);
        Task AddAsync(Tenant tenant);
        void Update(Tenant tenant);
        Task SaveChangesAsync();
    }
}