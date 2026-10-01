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
    public class SubjectRepository : ISubjectRepository
    {
        private readonly ApplicationDbContext _context;
        public SubjectRepository(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<Subject>> GetByTenantAsync(Guid tenantId) =>
            await _context.Subjects.AsNoTracking()
                .Where(s => s.tenant_id == tenantId)
                .OrderBy(s => s.name)
                .ToListAsync();

        public async Task<Subject?> GetByIdAsync(Guid id) =>
            await _context.Subjects.AsNoTracking()
                .FirstOrDefaultAsync(s => s.id == id);

        // Enforces "unique_tenant_subject" (tenant_id, name) at the app level
        // so we can return a clean 409 instead of a raw DB exception.
        public async Task<bool> ExistsByNameAsync(Guid tenantId, string name, Guid? excludeId = null) =>
            await _context.Subjects.AsNoTracking()
                .AnyAsync(s => s.tenant_id == tenantId
                            && s.name.ToLower() == name.ToLower()
                            && (excludeId == null || s.id != excludeId));

        public async Task AddAsync(Subject subject) =>
            await _context.Subjects.AddAsync(subject);

        public void Update(Subject subject) =>
            _context.Subjects.Update(subject);

        public void Delete(Subject subject) =>
            _context.Subjects.Remove(subject);

        public async Task SaveChangesAsync() =>
            await _context.SaveChangesAsync();
    }
}