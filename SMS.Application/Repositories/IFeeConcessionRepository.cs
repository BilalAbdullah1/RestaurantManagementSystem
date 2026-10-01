using SMS.Core.Entities;
using SMS.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IFeeConcessionRepository
    {
        Task<IEnumerable<FeeConcessionResponseDto>> GetAllAsync(Guid tenantId);
        Task<FeeConcession> GetByIdAsync(Guid id);
        Task AddAsync(FeeConcession concession);
        void Update(FeeConcession concession);
        void Delete(FeeConcession concession);
        Task<bool> IsDuplicateAsync(Guid studentId, Guid feeTypeId);
        Task<bool> SaveChangesAsync();
    }
}