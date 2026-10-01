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
    public class HomeworkRepository : IHomeworkRepository
    {
        private readonly ApplicationDbContext _context;

        public HomeworkRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Homework> GetByIdAsync(Guid id)
        {
            return await _context.Homeworks.FindAsync(id);
        }

        public async Task<IEnumerable<Homework>> GetByTenantAsync(Guid tenantId)
        {
            return await _context.Homeworks
                .Where(h => h.tenant_id == tenantId)
                .OrderByDescending(h => h.created_at)
                .ToListAsync();
        }

        public async Task<IEnumerable<Homework>> GetByClassAndSectionAsync(Guid tenantId, Guid classId, Guid sectionId)
        {
            return await _context.Homeworks
                .Where(h => h.tenant_id == tenantId && h.class_id == classId && h.section_id == sectionId)
                .OrderByDescending(h => h.due_date)
                .ToListAsync();
        }

        public async Task<IEnumerable<Homework>> GetByTeacherAsync(Guid tenantId, Guid staffId)
        {
            return await _context.Homeworks
                .Where(h => h.tenant_id == tenantId && h.staff_id == staffId)
                .OrderByDescending(h => h.created_at)
                .ToListAsync();
        }

        public async Task AddAsync(Homework homework)
        {
            await _context.Homeworks.AddAsync(homework);
        }

        public void Update(Homework homework)
        {
            _context.Homeworks.Update(homework);
        }

        public void Delete(Homework homework)
        {
            _context.Homeworks.Remove(homework);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
