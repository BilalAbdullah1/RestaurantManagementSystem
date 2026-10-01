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
    public class ExamSetupRepository : IExamSetupRepository
    {
        private readonly ApplicationDbContext _context;

        public ExamSetupRepository(ApplicationDbContext context)    
        {
            _context = context;
        }

        public async Task<IEnumerable<ExamSetup>> GetAllAsync(Guid tenantId)
        {
            // Sabse naye exams upar dikhane ke liye descending order
            return await _context.ExamSetups
                .Where(e => e.tenant_id == tenantId)
                .OrderByDescending(e => e.start_date)
                .ToListAsync();
        }

        public async Task<ExamSetup> GetByIdAsync(Guid id)
        {
            return await _context.ExamSetups.FindAsync(id)!;
        }

        public async Task AddAsync(ExamSetup examSetup)
        {
            await _context.ExamSetups.AddAsync(examSetup);
        }

        public void Update(ExamSetup examSetup)
        {
            _context.ExamSetups.Update(examSetup);
        }

        public void Delete(ExamSetup examSetup)
        {
            _context.ExamSetups.Remove(examSetup);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}