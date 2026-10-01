using Microsoft.EntityFrameworkCore;
using RMS.Application.Repositories;
using RMS.Core.Entities;
using RMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMS.Infrastructure.Repositories
{
    public class TenantRepository : ITenantRepository
    {
        private readonly ApplicationDbContext _context;
        public TenantRepository(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<Tenant>> GetAllAsync() => 
            await _context.Tenants.AsNoTracking().ToListAsync();

        public async Task<Tenant?> GetByIdAsync(Guid id) => 
            await _context.Tenants.AsNoTracking().FirstOrDefaultAsync(t => t.id == id);

        public async Task AddAsync(Tenant tenant) => 
            await _context.Tenants.AddAsync(tenant);

        public void Update(Tenant tenant) => 
            _context.Tenants.Update(tenant);

        public async Task SaveChangesAsync() => 
            await _context.SaveChangesAsync();
    }
}