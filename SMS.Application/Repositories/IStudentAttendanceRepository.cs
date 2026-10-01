using SMS.Core.Entities;
using SMS.Application.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Application.Repositories
{
    public interface IStudentAttendanceRepository
    {
        Task<IEnumerable<object>> GetDailyAttendanceAsync(Guid academicYearId, Guid classId, Guid sectionId, DateTime date);
        Task SaveBulkAttendanceAsync(Guid tenantId, Guid academicYearId, DateTime date, List<AttendanceRecordDto> records, Guid? classId = null, Guid? sectionId = null);
        Task<IEnumerable<StudentAttendance>> GetMonthlyAttendanceAsync(Guid studentId, int month, int year);
        Task<IEnumerable<AttendanceReportResponseDto>> GetAttendanceReportAsync(Guid academicYearId, Guid classId, Guid sectionId, DateTime startDate, DateTime endDate);
        Task<IEnumerable<WeeklyAttendanceDto>> GetWeeklyMatrixAsync(Guid academicYearId, Guid classId, Guid sectionId, DateTime startDate, DateTime endDate);
        Task<IEnumerable<AttendanceHeatmapDto>> GetAttendanceHeatmapAsync(Guid tenantId, Guid? classId, Guid? sectionId, DateTime startDate, DateTime endDate);
        Task<bool> SaveChangesAsync();
    }
}