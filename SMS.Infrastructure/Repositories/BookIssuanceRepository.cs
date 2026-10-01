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
    public class BookIssuanceRepository : IBookIssuanceRepository
    {
        private readonly ApplicationDbContext _context;
        public BookIssuanceRepository(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<BookIssuance>> GetByTenantAsync(Guid tenantId) =>
            await _context.BookIssuances.AsNoTracking()
                .Where(i => i.tenant_id == tenantId)
                .OrderByDescending(i => i.issue_date)
                .ToListAsync();

        public async Task<BookIssuance> GetByIdAsync(Guid id) =>
            await _context.BookIssuances.AsNoTracking()
                .FirstOrDefaultAsync(i => i.id == id);

        public async Task<IEnumerable<BookIssuance>> GetByStudentAsync(Guid tenantId, Guid studentId) =>
            await _context.BookIssuances.AsNoTracking()
                .Where(i => i.tenant_id == tenantId && i.student_id == studentId)
                .OrderByDescending(i => i.issue_date)
                .ToListAsync();

        public async Task<IEnumerable<BookIssuance>> GetByStaffAsync(Guid tenantId, Guid staffId) =>
            await _context.BookIssuances.AsNoTracking()
                .Where(i => i.tenant_id == tenantId && i.staff_id == staffId)
                .OrderByDescending(i => i.issue_date)
                .ToListAsync();

        public async Task<IEnumerable<BookIssuance>> GetOverdueAsync(Guid tenantId) =>
            await _context.BookIssuances.AsNoTracking()
                .Where(i => i.tenant_id == tenantId
                         && i.status == "Issued"
                         && i.due_date < DateTime.UtcNow)
                .OrderBy(i => i.due_date)
                .ToListAsync();

        public async Task<IEnumerable<BookIssuance>> GetByBookAsync(Guid tenantId, Guid bookId) =>
            await _context.BookIssuances.AsNoTracking()
                .Where(i => i.tenant_id == tenantId && i.book_id == bookId)
                .OrderByDescending(i => i.issue_date)
                .ToListAsync();

        public async Task AddAsync(BookIssuance issuance) =>
            await _context.BookIssuances.AddAsync(issuance);

        public void Update(BookIssuance issuance) =>
            _context.BookIssuances.Update(issuance);

        public async Task DeleteAsync(Guid id)
        {
            var issuance = await _context.BookIssuances.FindAsync(id);
            if (issuance != null)
                _context.BookIssuances.Remove(issuance);
        }

        public async Task SaveChangesAsync() =>
            await _context.SaveChangesAsync();
    }
}
