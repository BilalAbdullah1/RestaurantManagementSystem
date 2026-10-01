using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface ILibraryBookRepository
    {
        Task<IEnumerable<LibraryBook>> GetByTenantAsync(Guid tenantId);
        Task<LibraryBook?> GetByIdAsync(Guid id);
        Task<IEnumerable<LibraryBook>> SearchAsync(Guid tenantId, string keyword);
        Task<bool> ExistsIsbnAsync(Guid tenantId, string isbn, Guid? excludeId = null);
        Task AddAsync(LibraryBook book);
        void Update(LibraryBook book);
        Task DeleteAsync(Guid id);
        Task SaveChangesAsync();
    }
}
