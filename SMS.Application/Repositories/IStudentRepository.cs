using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IStudentRepository
    {
        Task<IEnumerable<Student>> GetByTenantAsync(Guid tenantId);
        Task<Student?> GetByIdAsync(Guid id);
        Task<bool> ExistsAdmissionNumberAsync(Guid tenantId, string admissionNumber, Guid? excludeId = null);
        Task<bool> ExistsBFormNumberAsync(Guid tenantId, string bFormNumber, Guid? excludeId = null);
        Task<string> GenerateNextGrNumberAsync(Guid tenantId);
        Task AddAsync(Student student);
        void Update(Student student);
        Task DeleteAsync(Guid id);
        Task SaveChangesAsync();
    }
}