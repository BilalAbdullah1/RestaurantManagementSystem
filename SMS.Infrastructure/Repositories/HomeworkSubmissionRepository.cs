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
    public class HomeworkSubmissionRepository : IHomeworkSubmissionRepository
    {
        private readonly ApplicationDbContext _context;

        public HomeworkSubmissionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<HomeworkSubmission> GetByIdAsync(Guid id)
        {
            return await _context.HomeworkSubmissions.FindAsync(id);
        }

        public async Task<IEnumerable<HomeworkSubmission>> GetByHomeworkIdAsync(Guid tenantId, Guid homeworkId)
        {
            return await _context.HomeworkSubmissions
                .Where(s => s.tenant_id == tenantId && s.homework_id == homeworkId)
                .OrderByDescending(s => s.submission_date)
                .ToListAsync();
        }

        public async Task<IEnumerable<HomeworkSubmission>> GetByStudentIdAsync(Guid tenantId, Guid studentId)
        {
            return await _context.HomeworkSubmissions
                .Where(s => s.tenant_id == tenantId && s.student_id == studentId)
                .OrderByDescending(s => s.submission_date)
                .ToListAsync();
        }

        public async Task<HomeworkSubmission> GetByHomeworkAndStudentAsync(Guid tenantId, Guid homeworkId, Guid studentId)
        {
            return await _context.HomeworkSubmissions
                .FirstOrDefaultAsync(s => s.tenant_id == tenantId && s.homework_id == homeworkId && s.student_id == studentId);
        }

        public async Task AddAsync(HomeworkSubmission submission)
        {
            await _context.HomeworkSubmissions.AddAsync(submission);
        }

        public void Update(HomeworkSubmission submission)
        {
            _context.HomeworkSubmissions.Update(submission);
        }

        public void Delete(HomeworkSubmission submission)
        {
            _context.HomeworkSubmissions.Remove(submission);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
