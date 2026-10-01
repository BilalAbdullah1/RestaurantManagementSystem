using SMS.Core.Entities;
using SMS.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IFeeStructureRepository
    {
        Task<IEnumerable<FeeStructureResponseDto>> GetByAcademicYearAsync(Guid tenantId, Guid academicYearId);
        
        Task<FeeStructure> GetByIdAsync(Guid id);
        Task AddAsync(FeeStructure feeStructure);
        void Update(FeeStructure feeStructure);
        void Delete(FeeStructure feeStructure);
        Task<bool> IsDuplicateAsync(Guid academicYearId, Guid classId, Guid feeTypeId, string category);
        Task<bool> SaveChangesAsync();
    }
}