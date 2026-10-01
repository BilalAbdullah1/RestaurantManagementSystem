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
    public class HomeworkCommentRepository : IHomeworkCommentRepository
    {
        private readonly ApplicationDbContext _context;

        public HomeworkCommentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<HomeworkComment?> GetByIdAsync(Guid id)
        {
            return await _context.HomeworkComments.FindAsync(id);
        }

        public async Task<IEnumerable<HomeworkComment>> GetByHomeworkIdAsync(Guid tenantId, Guid homeworkId)
        {
            return await _context.HomeworkComments
                .Where(c => c.tenant_id == tenantId && c.homework_id == homeworkId)
                .OrderBy(c => c.created_at)
                .ToListAsync();
        }

        public async Task AddAsync(HomeworkComment comment)
        {
            await _context.HomeworkComments.AddAsync(comment);
        }

        public void Delete(HomeworkComment comment)
        {
            _context.HomeworkComments.Remove(comment);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
