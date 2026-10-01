using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IGradingScaleRepository
    {
        Task<IEnumerable<GradingScale>> GetAllAsync(Guid tenantId);
        Task<GradingScale> GetByIdAsync(Guid id);
        Task AddAsync(GradingScale gradingScale);
        void Update(GradingScale gradingScale);
        void Delete(GradingScale gradingScale);
        Task<bool> SaveChangesAsync();
    }
}