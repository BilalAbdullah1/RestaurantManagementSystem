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
    public class ClassRepository : IClassRepository
    {
        private readonly ApplicationDbContext _context;
        public ClassRepository(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<SchoolClass>> GetByTenantAsync(Guid tenantId) =>
            await _context.Classes.AsNoTracking()
                .Where(c => c.tenant_id == tenantId)
                .OrderBy(c => c.name)
                .ToListAsync();

        public async Task<SchoolClass> GetByIdAsync(Guid id) =>
            await _context.Classes.AsNoTracking()
                .FirstOrDefaultAsync(c => c.id == id);

        // Enforces the "unique_tenant_class" constraint at the app level
        // so we can return a clean 409 instead of a raw DB exception.
        public async Task<bool> ExistsByNameAsync(Guid tenantId, string name, Guid? excludeId = null) =>
            await _context.Classes.AsNoTracking()
                .AnyAsync(c => c.tenant_id == tenantId
                            && c.name.ToLower() == name.ToLower()
                            && (excludeId == null || c.id != excludeId));

        public async Task AddAsync(SchoolClass schoolClass) =>
            await _context.Classes.AddAsync(schoolClass);

        public void Update(SchoolClass schoolClass) =>
            _context.Classes.Update(schoolClass);

        public void Delete(SchoolClass schoolClass) =>
            _context.Classes.Remove(schoolClass);

        public async Task SaveChangesAsync() =>
            await _context.SaveChangesAsync();
    }
}