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
    public class GradingScaleRepository : IGradingScaleRepository
    {
        private readonly ApplicationDbContext _context;

        public GradingScaleRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<GradingScale>> GetAllAsync(Guid tenantId)
        {
            // Highest percentages (like 90%, 80%) will appear first
            return await _context.GradingScales
                .Where(g => g.tenant_id == tenantId)
                .OrderByDescending(g => g.min_percentage)
                .ToListAsync();
        }

        public async Task<GradingScale> GetByIdAsync(Guid id)
        {
            return await _context.GradingScales.FindAsync(id)!;
        }

        public async Task AddAsync(GradingScale gradingScale)
        {
            await _context.GradingScales.AddAsync(gradingScale);
        }

        public void Update(GradingScale gradingScale)
        {
            _context.GradingScales.Update(gradingScale);
        }

        public void Delete(GradingScale gradingScale)
        {
            _context.GradingScales.Remove(gradingScale);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}