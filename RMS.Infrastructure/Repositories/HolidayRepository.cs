using Microsoft.EntityFrameworkCore;
using RMS.Application.Interfaces;
using RMS.Application.Repositories;
using RMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMS.Infrastructure.Repositories
{
    public class HolidayRepository : IHolidayRepository
    {
        private readonly IApplicationDbContext _context;

        public HolidayRepository(IApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Holiday>> GetAllHolidaysAsync()
        {
            return await _context.Holidays.ToListAsync();
        }

        public async Task<Holiday?> GetHolidayByIdAsync(Guid id)
        {
            return await _context.Holidays.FindAsync(id);
        }

        public async Task<Holiday> AddHolidayAsync(Holiday holiday)
        {
            holiday.id = Guid.NewGuid();
            holiday.created_at = DateTime.UtcNow;
            _context.Holidays.Add(holiday);
            await _context.SaveChangesAsync();
            return holiday;
        }

        public async Task<Holiday> UpdateHolidayAsync(Holiday holiday)
        {
            _context.Holidays.Update(holiday);
            await _context.SaveChangesAsync();
            return holiday;
        }

        public async Task<bool> DeleteHolidayAsync(Guid id)
        {
            var holiday = await _context.Holidays.FindAsync(id);
            if (holiday == null) return false;

            _context.Holidays.Remove(holiday);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
