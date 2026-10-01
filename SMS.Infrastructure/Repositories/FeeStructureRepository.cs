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
    public class FeeStructureRepository : IFeeStructureRepository
    {
        private readonly ApplicationDbContext _context;

        public FeeStructureRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<FeeStructureResponseDto>> GetByAcademicYearAsync(Guid tenantId, Guid academicYearId)
        {
            return await _context.FeeStructures
                .Where(fs => fs.tenant_id == tenantId && fs.academic_year_id == academicYearId)
                .Join(_context.Classes, fs => fs.class_id, c => c.id, (fs, c) => new { fs, c })
                .Join(_context.FeeTypes, temp => temp.fs.fee_type_id, ft => ft.id, (temp, ft) => new FeeStructureResponseDto
                {
                    id = temp.fs.id,
                    class_id = temp.fs.class_id,
                    class_name = temp.c.name,
                    fee_type_id = temp.fs.fee_type_id,
                    fee_type_name = ft.name,
                    frequency = ft.frequency,
                    category = temp.fs.category ?? "Normal",
                    amount = temp.fs.amount,
                    created_at = temp.fs.created_at
                })
                .OrderBy(x => x.class_name)
                .ThenBy(x => x.fee_type_name)
                .ToListAsync();
        }

        public async Task<FeeStructure> GetByIdAsync(Guid id)
        {
            return await _context.FeeStructures.FindAsync(id)!;
        }

        public async Task AddAsync(FeeStructure feeStructure)
        {
            await _context.FeeStructures.AddAsync(feeStructure);
        }

        public void Update(FeeStructure feeStructure)
        {
            _context.FeeStructures.Update(feeStructure);
        }

        public void Delete(FeeStructure feeStructure)
        {
            _context.FeeStructures.Remove(feeStructure);
        }

        public async Task<bool> IsDuplicateAsync(Guid academicYearId, Guid classId, Guid feeTypeId, string category)
        {
            return await _context.FeeStructures.AnyAsync(fs => 
                fs.academic_year_id == academicYearId && 
                fs.class_id == classId && 
                fs.fee_type_id == feeTypeId &&
                fs.category == category); // FIX: category must be part of uniqueness check
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}