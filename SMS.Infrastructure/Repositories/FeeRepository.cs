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
    public class FeeTypeRepository : IFeeTypeRepository
    {
        private readonly ApplicationDbContext _context;

        public FeeTypeRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<FeeType>> GetAllAsync(Guid tenantId)
        {
            // Active records upar, Inactive neechay
            return await _context.FeeTypes
                .Where(f => f.tenant_id == tenantId)
                .OrderByDescending(f => f.is_active)
                .ThenBy(f => f.name)
                .ToListAsync();
        }

        public async Task<FeeType> GetByIdAsync(Guid id)
        {
            return await _context.FeeTypes.FindAsync(id)!;
        }

        public async Task AddAsync(FeeType feeType)
        {
            await _context.FeeTypes.AddAsync(feeType);
        }

        public void Update(FeeType feeType)
        {
            _context.FeeTypes.Update(feeType);
        }

        public void Delete(FeeType feeType)
        {
            _context.FeeTypes.Remove(feeType);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}