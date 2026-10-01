using SMS.Core.Entities;
using System;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IStudentMedicalRepository
    {
        Task<StudentMedicalRecord?> GetByStudentIdAsync(Guid studentId);
        Task<StudentMedicalRecord?> GetByIdAsync(Guid id);
        Task AddAsync(StudentMedicalRecord record);
        void Update(StudentMedicalRecord record);
        Task SaveChangesAsync();
    }
}
