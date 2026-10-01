using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IBookIssuanceRepository
    {
        Task<IEnumerable<BookIssuance>> GetByTenantAsync(Guid tenantId);
        Task<BookIssuance?> GetByIdAsync(Guid id);
        Task<IEnumerable<BookIssuance>> GetByStudentAsync(Guid tenantId, Guid studentId);
        Task<IEnumerable<BookIssuance>> GetByStaffAsync(Guid tenantId, Guid staffId);
        Task<IEnumerable<BookIssuance>> GetOverdueAsync(Guid tenantId);
        Task<IEnumerable<BookIssuance>> GetByBookAsync(Guid tenantId, Guid bookId);
        Task AddAsync(BookIssuance issuance);
        void Update(BookIssuance issuance);
        Task DeleteAsync(Guid id);
        Task SaveChangesAsync();
    }
}
