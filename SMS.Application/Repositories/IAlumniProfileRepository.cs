using SMS.Core.Entities;
using SMS.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IAlumniProfileRepository
    {
        Task<IEnumerable<AlumniProfileResponseDto>> GetAllAlumniAsync(Guid tenantId);
        Task<AlumniProfile> GetByIdAsync(Guid id);
        Task<AlumniProfile> GetByStudentIdAsync(Guid studentId);
        Task AddAsync(AlumniProfile profile);
        void Update(AlumniProfile profile);
        void Delete(AlumniProfile profile);
        Task<bool> SaveChangesAsync();
    }
}