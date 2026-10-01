using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IStudentTransportRepository
    {
        Task<IEnumerable<StudentTransport>> GetByTenantAsync(Guid tenantId);
        Task<StudentTransport?> GetByIdAsync(Guid id);
        Task<IEnumerable<StudentTransport>> GetByStudentAsync(Guid tenantId, Guid studentId);
        Task<IEnumerable<StudentTransport>> GetByRouteAsync(Guid tenantId, Guid routeId);
        Task AddAsync(StudentTransport studentTransport);
        void Update(StudentTransport studentTransport);
        Task DeleteAsync(Guid id);
        Task SaveChangesAsync();
    }
}
