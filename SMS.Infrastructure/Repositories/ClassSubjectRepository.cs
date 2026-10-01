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
    public class ClassSubjectRepository : IClassSubjectRepository
    {
        private readonly ApplicationDbContext _context;

        public ClassSubjectRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ClassSubject>> GetByClassAsync(Guid classId)
        {
            return await _context.ClassSubjects
                                 .Where(cs => cs.class_id == classId)
                                 .ToListAsync();
        }

        public async Task<ClassSubject> GetByIdAsync(Guid id)
        {
            return await _context.ClassSubjects.FindAsync(id);
        }

        public async Task AddAsync(ClassSubject classSubject)
        {
            await _context.ClassSubjects.AddAsync(classSubject);
        }

        public void Remove(ClassSubject classSubject)
        {
            _context.ClassSubjects.Remove(classSubject);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}