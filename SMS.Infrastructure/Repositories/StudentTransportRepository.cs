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
    public class StudentTransportRepository : IStudentTransportRepository
    {
        private readonly ApplicationDbContext _context;
        public StudentTransportRepository(ApplicationDbContext context) => _context = context;

        public async Task<IEnumerable<StudentTransport>> GetByTenantAsync(Guid tenantId) =>
            await _context.StudentTransports.AsNoTracking()
                .Where(st => st.tenant_id == tenantId)
                .OrderByDescending(st => st.start_date)
                .ToListAsync();

        public async Task<StudentTransport?> GetByIdAsync(Guid id) =>
            await _context.StudentTransports.AsNoTracking()
                .FirstOrDefaultAsync(st => st.id == id);

        public async Task<IEnumerable<StudentTransport>> GetByStudentAsync(Guid tenantId, Guid studentId) =>
            await _context.StudentTransports.AsNoTracking()
                .Where(st => st.tenant_id == tenantId && st.student_id == studentId)
                .OrderByDescending(st => st.start_date)
                .ToListAsync();

        public async Task<IEnumerable<StudentTransport>> GetByRouteAsync(Guid tenantId, Guid routeId) =>
            await _context.StudentTransports.AsNoTracking()
                .Where(st => st.tenant_id == tenantId && st.route_id == routeId)
                .OrderByDescending(st => st.start_date)
                .ToListAsync();

        public async Task AddAsync(StudentTransport studentTransport) =>
            await _context.StudentTransports.AddAsync(studentTransport);

        public void Update(StudentTransport studentTransport) =>
            _context.StudentTransports.Update(studentTransport);

        public async Task DeleteAsync(Guid id)
        {
            var record = await _context.StudentTransports.FindAsync(id);
            if (record != null)
                _context.StudentTransports.Remove(record);
        }

        public async Task SaveChangesAsync() =>
            await _context.SaveChangesAsync();
    }
}
