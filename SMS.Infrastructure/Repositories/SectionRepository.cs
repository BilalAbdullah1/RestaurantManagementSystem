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
    public class SectionRepository : ISectionRepository
    {
        private readonly ApplicationDbContext _context;
        public SectionRepository(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<Section>> GetByTenantAsync(Guid tenantId) =>
            await _context.Sections.AsNoTracking()
                .Where(s => s.tenant_id == tenantId)
                .OrderBy(s => s.name)
                .ToListAsync();

        public async Task<IEnumerable<Section>> GetByClassAsync(Guid classId) =>
            await _context.Sections.AsNoTracking()
                .Where(s => s.class_id == classId)
                .OrderBy(s => s.name)
                .ToListAsync();

        public async Task<Section?> GetByIdAsync(Guid id) =>
            await _context.Sections.AsNoTracking()
                .FirstOrDefaultAsync(s => s.id == id);

        // Enforces "unique_class_section" (class_id, name) at the app level
        // so we can return a clean 409 instead of a raw DB exception.
        public async Task<bool> ExistsByNameAsync(Guid classId, string name, Guid? excludeId = null) =>
            await _context.Sections.AsNoTracking()
                .AnyAsync(s => s.class_id == classId
                            && s.name.ToLower() == name.ToLower()
                            && (excludeId == null || s.id != excludeId));

        public async Task AddAsync(Section section) =>
            await _context.Sections.AddAsync(section);

        public void Update(Section section) =>
            _context.Sections.Update(section);

        public void Delete(Section section) =>
            _context.Sections.Remove(section);

        public async Task SaveChangesAsync() =>
            await _context.SaveChangesAsync();
    }
}