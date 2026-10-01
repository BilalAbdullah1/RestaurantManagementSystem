using Microsoft.EntityFrameworkCore;
using RMS.Application.Interfaces;
using RMS.Core.Entities;
using RMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMS.Infrastructure.Repositories
{
    public class LeaveApplicationRepository : ILeaveApplicationRepository
    {
        private readonly ApplicationDbContext _context;

        public LeaveApplicationRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<LeaveApplication> AddAsync(LeaveApplication leaveApplication)
        {
            if (leaveApplication.staff_id.HasValue)
            {
                var staff = await _context.Staff.FirstOrDefaultAsync(s => s.user_id == leaveApplication.staff_id);
                if (staff != null) leaveApplication.staff_id = staff.id;
            }

            _context.LeaveApplications.Add(leaveApplication);
            await _context.SaveChangesAsync();
            return leaveApplication;
        }

        public async Task<LeaveApplication> GetByIdAsync(Guid id)
        {
            return await _context.LeaveApplications.FirstOrDefaultAsync(l => l.id == id);
        }

        public async Task<IEnumerable<LeaveApplication>> GetByStaffIdAsync(Guid tenantId, Guid staffId)
        {
            var staff = await _context.Staff.FirstOrDefaultAsync(s => s.user_id == staffId || s.id == staffId);
            var actualStaffId = staff != null ? staff.id : staffId;

            return await _context.LeaveApplications
                .Where(l => l.tenant_id == tenantId && l.staff_id == actualStaffId)
                .OrderByDescending(l => l.applied_on)
                .ToListAsync();
        }

        public async Task<IEnumerable<LeaveApplication>> GetByStudentIdAsync(Guid tenantId, Guid studentId)
        {
            return await Task.FromResult(new List<LeaveApplication>());
        }

        public async Task<IEnumerable<LeaveApplication>> GetByTenantIdAsync(Guid tenantId)
        {
            return await _context.LeaveApplications
                .Where(l => l.tenant_id == tenantId)
                .OrderByDescending(l => l.applied_on)
                .ToListAsync();
        }

        public async Task<IEnumerable<LeaveApplication>> GetPendingByTenantIdAsync(Guid tenantId)
        {
            return await _context.LeaveApplications
                .Where(l => l.tenant_id == tenantId && l.status == "Pending")
                .OrderByDescending(l => l.applied_on)
                .ToListAsync();
        }

        public async Task UpdateAsync(LeaveApplication leaveApplication)
        {
            _context.LeaveApplications.Update(leaveApplication);
            await _context.SaveChangesAsync();
        }
    }
}
