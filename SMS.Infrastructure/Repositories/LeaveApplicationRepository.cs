using Microsoft.EntityFrameworkCore;
using SMS.Application.Interfaces;
using SMS.Core.Entities;
using SMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Infrastructure.Repositories
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
            // The frontend might be sending user_id instead of actual staff/student id. Resolve it.
            if (leaveApplication.student_id.HasValue)
            {
                var student = await _context.Students.FirstOrDefaultAsync(s => s.user_id == leaveApplication.student_id);
                if (student != null) leaveApplication.student_id = student.id;
            }
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
            // staffId could be a user_id
            var staff = await _context.Staff.FirstOrDefaultAsync(s => s.user_id == staffId || s.id == staffId);
            var actualStaffId = staff != null ? staff.id : staffId;

            return await _context.LeaveApplications
                .Where(l => l.tenant_id == tenantId && l.staff_id == actualStaffId)
                .OrderByDescending(l => l.applied_on)
                .ToListAsync();
        }

        public async Task<IEnumerable<LeaveApplication>> GetByStudentIdAsync(Guid tenantId, Guid studentId)
        {
            // studentId could be a user_id
            var student = await _context.Students.FirstOrDefaultAsync(s => s.user_id == studentId || s.id == studentId);
            var actualStudentId = student != null ? student.id : studentId;

            return await _context.LeaveApplications
                .Where(l => l.tenant_id == tenantId && l.student_id == actualStudentId)
                .OrderByDescending(l => l.applied_on)
                .ToListAsync();
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
            
            // If the leave is approved, mark attendance
            if (leaveApplication.status == "Approved")
            {
                var startDate = leaveApplication.start_date.Date;
                var endDate = leaveApplication.end_date.Date;
                
                for (var date = startDate; date <= endDate; date = date.AddDays(1))
                {
                    // Skip weekends (optional, but typical)
                    if (date.DayOfWeek == DayOfWeek.Saturday || date.DayOfWeek == DayOfWeek.Sunday) continue;

                    if (leaveApplication.student_id.HasValue)
                    {
                        var isStudent = await _context.Students.AnyAsync(s => s.id == leaveApplication.student_id.Value);
                        if (isStudent)
                        {
                            // Get active academic year for student attendance
                            var activeYear = await _context.AcademicYears
                                .Where(y => y.tenant_id == leaveApplication.tenant_id && y.is_current)
                                .FirstOrDefaultAsync();

                            if (activeYear != null)
                            {
                                var existingAttendance = await _context.StudentAttendances
                                    .FirstOrDefaultAsync(a => a.tenant_id == leaveApplication.tenant_id && a.student_id == leaveApplication.student_id && a.date.Date == date);
                                
                                if (existingAttendance == null)
                                {
                                    _context.StudentAttendances.Add(new StudentAttendance
                                    {
                                        id = Guid.NewGuid(),
                                        tenant_id = leaveApplication.tenant_id,
                                        student_id = leaveApplication.student_id.Value,
                                        academic_year_id = activeYear.id,
                                        date = date,
                                        status = "Leave",
                                        remarks = $"Leave Approved: {leaveApplication.reason}"
                                    });
                                }
                                else
                                {
                                    existingAttendance.status = "Leave";
                                    existingAttendance.remarks = $"Leave Approved: {leaveApplication.reason}";
                                    _context.StudentAttendances.Update(existingAttendance);
                                }
                            }
                        }
                    }
                    else if (leaveApplication.staff_id.HasValue)
                    {
                        var isStaff = await _context.Staff.AnyAsync(s => s.id == leaveApplication.staff_id.Value);
                        if (isStaff)
                        {
                            var existingAttendance = await _context.StaffAttendances
                                    .FirstOrDefaultAsync(a => a.tenant_id == leaveApplication.tenant_id && a.staff_id == leaveApplication.staff_id && a.date.Date == date);
                                
                            if (existingAttendance == null)
                            {
                                _context.StaffAttendances.Add(new StaffAttendance
                                {
                                    id = Guid.NewGuid(),
                                    tenant_id = leaveApplication.tenant_id,
                                    staff_id = leaveApplication.staff_id.Value,
                                    date = date,
                                    status = "Leave"
                                });
                            }
                            else
                            {
                                existingAttendance.status = "Leave";
                                _context.StaffAttendances.Update(existingAttendance);
                            }
                        }
                    }
                }
            }

            await _context.SaveChangesAsync();
        }
    }
}
