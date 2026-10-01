using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SMS.Application.DTOs;
using SMS.Application.Repositories;
using SMS.Infrastructure.Security;
using SMS.Infrastructure.Services;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class StudentAttendancesController : ControllerBase
    {
        private readonly IStudentAttendanceRepository _repository;
        private readonly ITenantProvider _tenantProvider;

        public StudentAttendancesController(IStudentAttendanceRepository repository, ITenantProvider tenantProvider)
        {
            _repository = repository;
            _tenantProvider = tenantProvider;
        }

        // ==========================================
        // 1. GET DAILY GRID (Fetch Class List For Date)
        // ==========================================
        [HttpGet("daily-list")]
        [HasPermission("attendance.view")]
        public async Task<IActionResult> GetDailyList(
            [FromQuery] Guid academicYearId,
            [FromQuery] Guid classId,
            [FromQuery] Guid sectionId,
            [FromQuery] DateTime date)
        {
            if (academicYearId == Guid.Empty || classId == Guid.Empty || sectionId == Guid.Empty)
                return BadRequest(new { message = "Parameters missing or invalid grid mapping." });

            var result = await _repository.GetDailyAttendanceAsync(academicYearId, classId, sectionId, date);
            return Ok(result);
        }

        // ==========================================
        // 2. SUBMIT / SAVE DAILY ATTENDANCE (Bulk Post)
        // ==========================================
        [HttpPost("bulk-mark")]
        [HasPermission("attendance.mark")]
        public async Task<IActionResult> BulkMarkAttendance([FromBody] BulkMarkAttendanceDto dto)
        {
            if (dto == null || dto.records == null || dto.records.Count == 0)
                return BadRequest(new { message = "Attendance payload matrix cannot be empty." });

            await _repository.SaveBulkAttendanceAsync(dto.tenant_id, dto.academic_year_id, dto.date, dto.records, dto.class_id, dto.section_id);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Attendance logs successfully synchronized and saved." });
        }

        // ==========================================
        // 3. VIEW MONTHLY LOGS (Student Specific Summary)
        // ==========================================
        [HttpGet("monthly-summary")]
        [HasPermission("attendance.view")]
        public async Task<IActionResult> GetMonthlySummary(
            [FromQuery] Guid studentId,
            [FromQuery] int month,
            [FromQuery] int year)
        {
            if (studentId == Guid.Empty)
                return BadRequest(new { message = "Student identifier missing." });

            var result = await _repository.GetMonthlyAttendanceAsync(studentId, month, year);
            return Ok(result);
        }

        // ==========================================
        // 4. STATS HEATMAP LOG (For High-Chart Visuals)
        // ==========================================
        [HttpGet("heatmap/tenant/{tenantId}")]
        [HasPermission("attendance.view")]
        public async Task<IActionResult> GetHeatmapStats(
            Guid tenantId,
            [FromQuery] Guid? classId,
            [FromQuery] Guid? sectionId,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
            var end = endDate ?? DateTime.UtcNow;
            var logs = await _repository.GetAttendanceHeatmapAsync(tenantId, classId, sectionId, start, end);
            return Ok(logs);
        }

        [HttpGet("heatmap-stats")]
        [HttpGet("heatmap")]
        [HasPermission("attendance.view")]
        public async Task<IActionResult> GetHeatmapStatsFromQuery(
            [FromQuery] Guid? tenantId,
            [FromQuery] Guid? classId,
            [FromQuery] Guid? sectionId,
            [FromQuery] DateTime? startDate,
            [FromQuery] DateTime? endDate)
        {
            var effectiveTenantId = tenantId.HasValue && tenantId.Value != Guid.Empty
                ? tenantId.Value
                : _tenantProvider.GetTenantId();

            var start = startDate ?? DateTime.UtcNow.AddMonths(-1);
            var end = endDate ?? DateTime.UtcNow;
            var logs = await _repository.GetAttendanceHeatmapAsync(effectiveTenantId, classId, sectionId, start, end);
            return Ok(logs);
        }

        // ==========================================
        // 5. CLASS ATTENDANCE REPORT (Broadsheet / Analytics)
        // ==========================================
        [HttpGet("report")]
        [HttpGet("report-stats")]
        [HasPermission("attendance.view")]
        public async Task<IActionResult> GetAttendanceReport(
            [FromQuery] Guid academicYearId,
            [FromQuery] Guid classId,
            [FromQuery] Guid sectionId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            if (academicYearId == Guid.Empty || classId == Guid.Empty || sectionId == Guid.Empty)
                return BadRequest(new { message = "Academic Year, Class, and Section identifiers required." });

            var result = await _repository.GetAttendanceReportAsync(academicYearId, classId, sectionId, startDate, endDate);
            return Ok(result);
        }

        // ==========================================
        // 6. WEEKLY MATRIX
        // ==========================================
        [HttpGet("weekly-matrix")]
        [HasPermission("attendance.view")]
        public async Task<IActionResult> GetWeeklyMatrix(
            [FromQuery] Guid academicYearId,
            [FromQuery] Guid classId,
            [FromQuery] Guid sectionId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            if (academicYearId == Guid.Empty || classId == Guid.Empty || sectionId == Guid.Empty)
                return BadRequest(new { message = "Academic Year, Class, and Section identifiers required." });

            var result = await _repository.GetWeeklyMatrixAsync(academicYearId, classId, sectionId, startDate, endDate);
            return Ok(result);
        }
    }
}