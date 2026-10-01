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
    public class AcademicYearRepository : IAcademicYearRepository
    {
        private readonly ApplicationDbContext _context;
        public AcademicYearRepository(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<AcademicYear>> GetByTenantAsync(Guid tenantId) =>
            await _context.AcademicYears.AsNoTracking()
                .Where(ay => ay.tenant_id == tenantId)
                .OrderByDescending(ay => ay.start_date)
                .ToListAsync();

        public async Task<AcademicYear> GetByIdAsync(Guid id) =>
            await _context.AcademicYears.AsNoTracking()
                .FirstOrDefaultAsync(ay => ay.id == id);

        public async Task<AcademicYear> GetCurrentByTenantAsync(Guid tenantId) =>
            await _context.AcademicYears.AsNoTracking()
                .FirstOrDefaultAsync(ay => ay.tenant_id == tenantId && ay.is_current);

        public async Task<bool> ExistsTitleAsync(Guid tenantId, string title) =>
            await _context.AcademicYears.AsNoTracking()
                .AnyAsync(ay => ay.tenant_id == tenantId && ay.title.ToLower() == title.ToLower());

        public async Task AddAsync(AcademicYear academicYear) =>
            await _context.AcademicYears.AddAsync(academicYear);

        public void Update(AcademicYear academicYear) =>
            _context.AcademicYears.Update(academicYear);

        public void Delete(AcademicYear academicYear) =>
            _context.AcademicYears.Remove(academicYear);

        public async Task SaveChangesAsync() =>
            await _context.SaveChangesAsync();

        public async Task UnsetAllCurrentAsync(Guid tenantId)
        {
            var activeYears = await _context.AcademicYears
                .Where(ay => ay.tenant_id == tenantId && ay.is_current)
                .ToListAsync();

            foreach (var year in activeYears)
            {
                year.is_current = false;
                _context.AcademicYears.Update(year);
            }
        }
    }
}