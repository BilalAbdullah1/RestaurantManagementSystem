using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IClassSubjectRepository
    {
        Task<IEnumerable<ClassSubject>> GetByClassAsync(Guid classId);
        Task<ClassSubject> GetByIdAsync(Guid id);
        Task AddAsync(ClassSubject classSubject);
        void Remove(ClassSubject classSubject);
        Task<bool> SaveChangesAsync();
    }
}