using Microsoft.EntityFrameworkCore;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using SMS.Infrastructure.Persistence;
using System;
using System.Threading.Tasks;

namespace SMS.Infrastructure.Repositories
{
    public class StudentMedicalRepository : IStudentMedicalRepository
    {
        private readonly ApplicationDbContext _context;
        public StudentMedicalRepository(ApplicationDbContext context) => _context = context;

        public async Task<StudentMedicalRecord?> GetByStudentIdAsync(Guid studentId) =>
            await _context.StudentMedicalRecords.AsNoTracking()
                .FirstOrDefaultAsync(r => r.student_id == studentId);

        public async Task<StudentMedicalRecord?> GetByIdAsync(Guid id) =>
            await _context.StudentMedicalRecords.AsNoTracking()
                .FirstOrDefaultAsync(r => r.id == id);

        public async Task AddAsync(StudentMedicalRecord record) =>
            await _context.StudentMedicalRecords.AddAsync(record);

        public void Update(StudentMedicalRecord record) =>
            _context.StudentMedicalRecords.Update(record);

        public async Task SaveChangesAsync() =>
            await _context.SaveChangesAsync();
    }
}
