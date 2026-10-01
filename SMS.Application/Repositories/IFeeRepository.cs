using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IFeeTypeRepository
    {
        Task<IEnumerable<FeeType>> GetAllAsync(Guid tenantId);
        Task<FeeType> GetByIdAsync(Guid id);
        Task AddAsync(FeeType feeType);
        void Update(FeeType feeType);
        void Delete(FeeType feeType);
        Task<bool> SaveChangesAsync();
    }
}