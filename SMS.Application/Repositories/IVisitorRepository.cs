using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IVisitorRepository
    {
        Task<Visitor?> GetByIdAsync(Guid id);
        Task<IEnumerable<Visitor>> GetByTenantAsync(Guid tenantId);
        Task<IEnumerable<Visitor>> GetTodayVisitorsAsync(Guid tenantId);
        Task AddAsync(Visitor visitor);
        void Update(Visitor visitor);
        void Delete(Visitor visitor);
        Task SaveChangesAsync();
    }
}
