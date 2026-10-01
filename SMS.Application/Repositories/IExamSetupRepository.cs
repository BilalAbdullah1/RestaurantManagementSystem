using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IExamSetupRepository
    {
        Task<IEnumerable<ExamSetup>> GetAllAsync(Guid tenantId);
        Task<ExamSetup> GetByIdAsync(Guid id);
        Task AddAsync(ExamSetup examSetup);
        void Update(ExamSetup examSetup);
        void Delete(ExamSetup examSetup);
        Task<bool> SaveChangesAsync();
    }
}