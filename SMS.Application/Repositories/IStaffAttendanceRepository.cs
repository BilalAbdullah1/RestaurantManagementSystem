using SMS.Core.Entities;
using SMS.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IStaffAttendanceRepository
    {
        Task<IEnumerable<object>> GetDailyAttendanceAsync(Guid tenantId, DateTime date);
        Task SaveBulkAttendanceAsync(Guid tenantId, DateTime date, List<StaffAttendanceRecordDto> records);
        Task<IEnumerable<StaffAttendance>> GetMonthlyAttendanceAsync(Guid staffId, int month, int year);
        Task<IEnumerable<StaffAttendanceReportResponseDto>> GetAttendanceReportAsync(Guid tenantId, DateTime startDate, DateTime endDate);
        Task<IEnumerable<StaffWeeklyAttendanceDto>> GetWeeklyMatrixAsync(Guid tenantId, DateTime startDate, DateTime endDate);
        Task<bool> SaveChangesAsync();
        Task SaveBiometricSyncAsync(Guid tenant_id, DateTime date);
        Task<IEnumerable<PayrollAttendanceSummaryDto>> CalculateMonthlyPayrollAttendanceAsync(Guid tenantId, int month, int year, int latesPerAbsent = 3, int halfDaysPerAbsent = 2, int allowedLeavesPerMonth = 2);
    }
}