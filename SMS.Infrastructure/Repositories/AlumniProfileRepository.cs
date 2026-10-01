using Microsoft.EntityFrameworkCore;
using SMS.Application.DTOs;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using SMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Infrastructure.Repositories
{
    public class AlumniProfileRepository : IAlumniProfileRepository
    {
        private readonly ApplicationDbContext _context;

        public AlumniProfileRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AlumniProfileResponseDto>> GetAllAlumniAsync(Guid tenantId)
        {
            return await _context.AlumniProfiles
                .Where(a => a.tenant_id == tenantId)
                .Join(_context.Students, a => a.student_id, s => s.id, (a, s) => new AlumniProfileResponseDto
                {
                    id = a.id,
                    student_id = s.id,
                    student_name = s.first_name + " " + s.last_name,
                    admission_number = s.admission_number,
                    gender = s.gender,
                    phone_number = s.guardian_phone,
                    graduation_year = a.graduation_year,
                    current_occupation = a.current_occupation,
                    current_organization = a.current_organization,
                    higher_education_details = a.higher_education_details
                })
                .OrderByDescending(x => x.graduation_year) // Recent graduates upar ayenge
                .ThenBy(x => x.student_name)
                .ToListAsync();
        }

        public async Task<AlumniProfile> GetByIdAsync(Guid id)
        {
            return await _context.AlumniProfiles.FindAsync(id)!;
        }

        public async Task<AlumniProfile> GetByStudentIdAsync(Guid studentId)
        {
            return await _context.AlumniProfiles.FirstOrDefaultAsync(a => a.student_id == studentId)!;
        }

        public async Task AddAsync(AlumniProfile profile)
        {
            await _context.AlumniProfiles.AddAsync(profile);
        }

        public void Update(AlumniProfile profile)
        {
            _context.AlumniProfiles.Update(profile);
        }

        public void Delete(AlumniProfile profile)
        {
            _context.AlumniProfiles.Remove(profile);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}