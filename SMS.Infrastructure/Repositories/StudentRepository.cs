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
    public class StudentRepository : IStudentRepository
    {
        private readonly ApplicationDbContext _context;
        public StudentRepository(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<Student>> GetByTenantAsync(Guid tenantId) =>
            await _context.Students.AsNoTracking()
                .Where(s => s.tenant_id == tenantId)
                .OrderBy(s => s.first_name)
                .ToListAsync();

        public async Task<Student?> GetByIdAsync(Guid id) =>
            await _context.Students.AsNoTracking()
                .FirstOrDefaultAsync(s => s.id == id);

        public async Task<bool> ExistsAdmissionNumberAsync(Guid tenantId, string admissionNumber, Guid? excludeId = null) =>
            await _context.Students.AsNoTracking()
                .AnyAsync(s => s.tenant_id == tenantId
                            && s.admission_number == admissionNumber
                            && (excludeId == null || s.id != excludeId));

        public async Task<bool> ExistsBFormNumberAsync(Guid tenantId, string bFormNumber, Guid? excludeId = null) =>
            await _context.Students.AsNoTracking()
                .AnyAsync(s => s.tenant_id == tenantId
                            && s.b_form_number == bFormNumber
                            && (excludeId == null || s.id != excludeId));

        public async Task<string> GenerateNextGrNumberAsync(Guid tenantId)
        {
            var year = DateTime.UtcNow.Year;
            var prefix = $"GR-{year}-";

            // Get the highest existing GR number for this tenant & year
            var existing = await _context.Students.AsNoTracking()
                .Where(s => s.tenant_id == tenantId && s.admission_number.StartsWith(prefix))
                .Select(s => s.admission_number)
                .ToListAsync();

            int nextSeq = 1;
            if (existing.Any())
            {
                var maxSeq = existing
                    .Select(n => {
                        var parts = n.Split('-');
                        return parts.Length == 3 && int.TryParse(parts[2], out int seq) ? seq : 0;
                    })
                    .Max();
                nextSeq = maxSeq + 1;
            }

            return $"{prefix}{nextSeq:D3}";
        }

        public async Task AddAsync(Student student) =>
            await _context.Students.AddAsync(student);

        public void Update(Student student) =>
            _context.Students.Update(student);

        public async Task DeleteAsync(Guid id)
        {
            var student = await _context.Students.FindAsync(id);
            if (student != null)
            {
                _context.Students.Remove(student);
            }
        }

        public async Task SaveChangesAsync() =>
            await _context.SaveChangesAsync();
    }
}