using Microsoft.EntityFrameworkCore;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using SMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Infrastructure.Repositories
{
    public class LibraryBookRepository : ILibraryBookRepository
    {
        private readonly ApplicationDbContext _context;
        public LibraryBookRepository(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<LibraryBook>> GetByTenantAsync(Guid tenantId) =>
            await _context.LibraryBooks.AsNoTracking()
                .Where(b => b.tenant_id == tenantId)
                .OrderBy(b => b.title)
                .ToListAsync();

        public async Task<LibraryBook?> GetByIdAsync(Guid id) =>
            await _context.LibraryBooks.AsNoTracking()
                .FirstOrDefaultAsync(b => b.id == id);

        public async Task<IEnumerable<LibraryBook>> SearchAsync(Guid tenantId, string keyword) =>
            await _context.LibraryBooks.AsNoTracking()
                .Where(b => b.tenant_id == tenantId
                    && (b.title.Contains(keyword) || b.author.Contains(keyword) || (b.isbn != null && b.isbn.Contains(keyword))))
                .OrderBy(b => b.title)
                .ToListAsync();

        public async Task<bool> ExistsIsbnAsync(Guid tenantId, string isbn, Guid? excludeId = null) =>
            await _context.LibraryBooks.AsNoTracking()
                .AnyAsync(b => b.tenant_id == tenantId
                            && b.isbn == isbn
                            && (excludeId == null || b.id != excludeId));

        public async Task AddAsync(LibraryBook book) =>
            await _context.LibraryBooks.AddAsync(book);

        public void Update(LibraryBook book) =>
            _context.LibraryBooks.Update(book);

        public async Task DeleteAsync(Guid id)
        {
            var book = await _context.LibraryBooks.FindAsync(id);
            if (book != null)
                _context.LibraryBooks.Remove(book);
        }

        public async Task SaveChangesAsync() =>
            await _context.SaveChangesAsync();
    }
}
