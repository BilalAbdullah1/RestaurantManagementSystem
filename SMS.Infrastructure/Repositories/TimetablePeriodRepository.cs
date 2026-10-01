using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using SMS.Infrastructure.Persistence;

namespace SMS.Infrastructure.Repositories
{
    public class TimetablePeriodRepository : ITimetablePeriodRepository
    {
        private readonly ApplicationDbContext _context;

        public TimetablePeriodRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<TimetablePeriod>> GetWeeklyScheduleAsync(Guid tenantId, Guid sectionId)
        {
            return await _context.TimetablePeriods
                .Where(p => p.tenant_id == tenantId && p.section_id == sectionId)
                .OrderBy(p => p.day_of_week).ThenBy(p => p.start_time)
                .ToListAsync();
        }

        public async Task<TimetablePeriod> AddAsync(TimetablePeriod period)
        {
            period.id = Guid.NewGuid();
            period.created_at = DateTime.UtcNow;
            _context.TimetablePeriods.Add(period);
            await _context.SaveChangesAsync();
            return period;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var period = await _context.TimetablePeriods.FindAsync(id);
            if (period == null) return false;

            _context.TimetablePeriods.Remove(period);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> HasTeacherConflictAsync(Guid tenantId, Guid staffId, int dayOfWeek, TimeSpan start, TimeSpan end)
        {
            return await _context.TimetablePeriods.AnyAsync(p => 
                p.tenant_id == tenantId &&
                p.staff_id == staffId &&
                p.day_of_week == dayOfWeek &&
                p.start_time < end && p.end_time > start);
        }

        public async Task<bool> HasRoomConflictAsync(Guid tenantId, string roomName, int dayOfWeek, TimeSpan start, TimeSpan end)
        {
            if (string.IsNullOrWhiteSpace(roomName)) return false;

            return await _context.TimetablePeriods.AnyAsync(p => 
                p.tenant_id == tenantId &&
                p.room_name == roomName &&
                p.day_of_week == dayOfWeek &&
                p.start_time < end && p.end_time > start);
        }

        public async Task<IEnumerable<TimetablePeriod>> GetTeacherWeeklyScheduleAsync(Guid tenantId, Guid staffId)
        {
            return await _context.TimetablePeriods
                .Where(p => p.tenant_id == tenantId && p.staff_id == staffId)
                .OrderBy(p => p.day_of_week).ThenBy(p => p.start_time)
                .ToListAsync();
        }

        public async Task<IEnumerable<SMS.Application.DTOs.StaffFormDto>> GetFreeTeachersAsync(Guid tenantId, int dayOfWeek, TimeSpan start, TimeSpan end, DateTime dateOfProxy)
        {
            var dateOnly = dateOfProxy.Date;

            var activeStaffQuery = _context.Staff.Where(s => s.tenant_id == tenantId && s.is_active);

            var busyInRegularPeriods = _context.TimetablePeriods
                .Where(p => p.tenant_id == tenantId && p.day_of_week == dayOfWeek && p.start_time < end && p.end_time > start)
                .Select(p => p.staff_id);

            var busyInProxyPeriods = _context.TimetableProxyAllocations
                .Join(_context.TimetablePeriods, a => a.timetable_period_id, p => p.id, (a, p) => new { a, p })
                .Where(x => x.a.tenant_id == tenantId && x.a.date_of_proxy.Date == dateOnly && x.p.start_time < end && x.p.end_time > start)
                .Select(x => x.a.substitute_staff_id);

            return await (from s in activeStaffQuery
                          where !busyInRegularPeriods.Contains(s.id) && !busyInProxyPeriods.Contains(s.id)
                          join u in _context.Users on s.user_id equals u.id into uGroup
                          from u in uGroup.DefaultIfEmpty()
                          select new SMS.Application.DTOs.StaffFormDto
                          {
                              id = s.id,
                              tenant_id = s.tenant_id,
                              user_id = s.user_id,
                              first_name = u != null ? u.first_name : "",
                              last_name = u != null ? u.last_name : "",
                              designation = s.designation,
                              cnic = s.cnic,
                              is_active = s.is_active
                          }).ToListAsync();
        }
    }
}
