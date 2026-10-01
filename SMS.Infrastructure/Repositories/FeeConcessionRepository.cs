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
    public class FeeConcessionRepository : IFeeConcessionRepository
    {
        private readonly ApplicationDbContext _context;

        public FeeConcessionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<FeeConcessionResponseDto>> GetAllAsync(Guid tenantId)
        {
            return await _context.FeeConcessions
                .Where(fc => fc.tenant_id == tenantId)
                .Join(_context.Students, fc => fc.student_id, s => s.id, (fc, s) => new { fc, s })
                .Join(_context.FeeTypes, temp => temp.fc.fee_type_id, ft => ft.id, (temp, ft) => new FeeConcessionResponseDto
                {
                    id = temp.fc.id,
                    student_id = temp.fc.student_id,
                    student_name = temp.s.first_name + " " + temp.s.last_name,
                    admission_number = temp.s.admission_number,
                    fee_type_id = temp.fc.fee_type_id,
                    fee_type_name = ft.name,
                    name = temp.fc.name,
                    discount_type = temp.fc.discount_type,
                    discount_value = temp.fc.discount_value,
                    is_active = temp.fc.is_active,
                    created_at = temp.fc.created_at
                })
                .OrderByDescending(x => x.created_at)
                .ToListAsync();
        }

        public async Task<FeeConcession> GetByIdAsync(Guid id)
        {
            return await _context.FeeConcessions.FindAsync(id)!;
        }

        public async Task AddAsync(FeeConcession concession)
        {
            await _context.FeeConcessions.AddAsync(concession);
        }

        public void Update(FeeConcession concession)
        {
            _context.FeeConcessions.Update(concession);
        }

        public void Delete(FeeConcession concession)
        {
            _context.FeeConcessions.Remove(concession);
        }

        public async Task<bool> IsDuplicateAsync(Guid studentId, Guid feeTypeId)
        {
            return await _context.FeeConcessions.AnyAsync(fc => 
                fc.student_id == studentId && 
                fc.fee_type_id == feeTypeId);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}