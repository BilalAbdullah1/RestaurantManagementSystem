using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using SMS.Core.Entities;

namespace SMS.Application.Repositories
{
    public interface IChartOfAccountRepository
    {
        Task<IEnumerable<ChartOfAccount>> GetByTenantAsync(Guid tenantId);
        Task<ChartOfAccount?> GetByIdAsync(Guid id);
        Task AddAsync(ChartOfAccount account);
        void Update(ChartOfAccount account);
        void Delete(ChartOfAccount account);
        Task<bool> SaveChangesAsync();
    }
}
