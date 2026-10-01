using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IHolidayRepository
    {
        Task<IEnumerable<Holiday>> GetAllHolidaysAsync();
        Task<Holiday?> GetHolidayByIdAsync(Guid id);
        Task<Holiday> AddHolidayAsync(Holiday holiday);
        Task<Holiday> UpdateHolidayAsync(Holiday holiday);
        Task<bool> DeleteHolidayAsync(Guid id);
    }
}
