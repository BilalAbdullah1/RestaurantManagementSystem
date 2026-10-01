using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IHomeworkRepository
    {
        Task<Homework?> GetByIdAsync(Guid id);
        Task<IEnumerable<Homework>> GetByTenantAsync(Guid tenantId);
        Task<IEnumerable<Homework>> GetByClassAndSectionAsync(Guid tenantId, Guid classId, Guid sectionId);
        Task<IEnumerable<Homework>> GetByTeacherAsync(Guid tenantId, Guid staffId);
        Task AddAsync(Homework homework);
        void Update(Homework homework);
        void Delete(Homework homework);
        Task SaveChangesAsync();
    }
}
