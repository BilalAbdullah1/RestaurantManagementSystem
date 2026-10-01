using Microsoft.EntityFrameworkCore;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using SMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly ApplicationDbContext _context;
        public UserRepository(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<User>> GetByTenantAsync(Guid tenantId) =>
            await _context.Users.AsNoTracking().Where(u => u.tenant_id == tenantId).ToListAsync();

        public async Task<User?> GetByIdAsync(Guid id) =>
            await _context.Users.AsNoTracking().FirstOrDefaultAsync(u => u.id == id);

        public async Task AddAsync(User user) => await _context.Users.AddAsync(user);
        public void Update(User user) => _context.Users.Update(user);
        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();

        public async Task<User?> GetByEmailAndTenantAsync(string email, Guid tenantId)
        {
            var normalized = (email ?? string.Empty).Trim().ToLower();
            return await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.email.ToLower() == normalized && u.tenant_id == tenantId);
        }

        public async Task<User?> GetByResetTokenAsync(string token)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.refresh_token == token && u.refresh_token_expiry > DateTime.UtcNow);
        }
        public async Task DeleteAsync(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user != null)
            {
                _context.Users.Remove(user);
                await _context.SaveChangesAsync();
            }
        }
    }
}