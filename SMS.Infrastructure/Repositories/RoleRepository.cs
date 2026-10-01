using Microsoft.EntityFrameworkCore;
using SMS.Application.Repositories;
using SMS.Application.DTOs;
using SMS.Core.Entities;
using SMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Infrastructure.Repositories
{
    public class RoleRepository : IRoleRepository
    {
        private readonly ApplicationDbContext _context;

        public RoleRepository(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<RoleDto>> GetByTenantAsync(Guid tenantId)
        {
            return await _context.Roles
                .AsNoTracking()
                .Where(r => r.tenant_id == tenantId)
                .GroupJoin(
                    _context.Users.AsNoTracking(),
                    r => r.id,
                    u => u.role_id,
                    (role, users) => new RoleDto
                    {
                        id = role.id,
                        tenant_id = role.tenant_id,
                        name = role.name,
                        description = role.description,
                        is_system_role = role.is_system_role,
                        created_at = role.created_at,
                        updated_at = role.updated_at,
                        users_count = users.Count()
                    }
                )
                .OrderBy(r => r.name)
                .ToListAsync();
        }

        public async Task<RoleDto?> GetByIdAsync(Guid id)
        {
            return await _context.Roles
                .AsNoTracking()
                .Where(r => r.id == id)
                .GroupJoin(
                    _context.Users.AsNoTracking(),
                    r => r.id,
                    u => u.role_id,
                    (role, users) => new RoleDto
                    {
                        id = role.id,
                        tenant_id = role.tenant_id,
                        name = role.name,
                        description = role.description,
                        is_system_role = role.is_system_role,
                        created_at = role.created_at,
                        updated_at = role.updated_at,
                        users_count = users.Count()
                    }
                )
                .FirstOrDefaultAsync();
        }

        public async Task<Role?> GetEntityByIdAsync(Guid id)
        {
            return await _context.Roles
                .AsNoTracking()
                .FirstOrDefaultAsync(r => r.id == id);
        }

        public async Task AddAsync(Role role) => await _context.Roles.AddAsync(role);

        public void Update(Role role) => _context.Roles.Update(role);

        public async Task DeleteAsync(Guid id)
        {
            var role = await _context.Roles.FindAsync(id);
            if (role != null)
            {
                _context.Roles.Remove(role);
            }
        }

        public async Task SaveChangesAsync() => await _context.SaveChangesAsync();
    }
}