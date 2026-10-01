using Microsoft.AspNetCore.Mvc;
using RMS.Application.DTOs;
using RMS.Application.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StaffAttendancesController : ControllerBase
    {
        private readonly IStaffAttendanceRepository _repository;

        public StaffAttendancesController(IStaffAttendanceRepository repository)
        {
            _repository = repository;
        }

        // ==========================================
        // 1. GET DAILY GRID
        // ==========================================
        [HttpGet("daily-list")]
        public async Task<IActionResult> GetDailyList([FromQuery] Guid tenantId, [FromQuery] DateTime date)
        {
            if (tenantId == Guid.Empty)
                return BadRequest(new { message = "Tenant ID is missing." });

            var result = await _repository.GetDailyAttendanceAsync(tenantId, date);
            return Ok(result);
        }

        // ==========================================
        // 2. BULK MARK STAFF ATTENDANCE
        // ==========================================
        [HttpPost("bulk-mark")]
        public async Task<IActionResult> BulkMarkAttendance([FromBody] BulkMarkStaffAttendanceDto dto)
        {
            if (dto == null || dto.records == null || dto.records.Count == 0)
                return BadRequest(new { message = "Attendance payload cannot be empty." });

            await _repository.SaveBulkAttendanceAsync(dto.tenant_id, dto.date, dto.records);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Staff attendance has been synchronized and saved successfully." });
        }

        // ==========================================
        // 3. MONTHLY TIMELINE
        // ==========================================
        [HttpGet("monthly-summary")]
        public async Task<IActionResult> GetMonthlySummary([FromQuery] Guid staffId, [FromQuery] int month, [FromQuery] int year)
        {
            if (staffId == Guid.Empty || month < 1 || month > 12 || year < 2000)
                return BadRequest(new { message = "Invalid calendar parameters." });

            var summary = await _repository.GetMonthlyAttendanceAsync(staffId, month, year);
            return Ok(summary);
        }

        // ==========================================
        // 4. STAFF ANALYTICS REPORT
        // ==========================================
        [HttpGet("report-stats")]
        public async Task<IActionResult> GetReportStats([FromQuery] Guid tenantId,[FromQuery] DateTime startDate,[FromQuery] DateTime endDate)
        {
            if (startDate > endDate)
                return BadRequest(new { message = "Start date cannot be greater than End date." });

            var reports = await _repository.GetAttendanceReportAsync(tenantId, startDate, endDate);
            return Ok(reports);
        }
        [HttpGet("weekly-matrix")]
        public async Task<IActionResult> GetWeeklyMatrix([FromQuery] Guid tenantId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var data = await _repository.GetWeeklyMatrixAsync(tenantId, startDate, endDate);
            return Ok(data);
        }

        [HttpPost("sync-biometric")]
        public async Task<IActionResult> SyncBiometric([FromBody] SyncBiometricDto dto)
        {
            if (dto.tenant_id == Guid.Empty) return BadRequest(new { message = "Invalid Tenant ID." });

            await _repository.SaveBiometricSyncAsync(dto.tenant_id, dto.date);
            await _repository.SaveChangesAsync();

            return Ok(new { message = $"Biometric data synced successfully for {dto.date.ToString("yyyy-MM-dd")}." });
        }

        // ==========================================
        // 5. PAYROLL ATTENDANCE DEDUCTION ENGINE
        // ==========================================
        [HttpGet("payroll-summary")]
        public async Task<IActionResult> GetPayrollSummary([FromQuery] Guid tenantId,[FromQuery] int month,[FromQuery] int year,[FromQuery] int latesPerAbsent = 3,[FromQuery] int halfDaysPerAbsent = 2,[FromQuery] int allowedLeaves = 2)
        {
            if (tenantId == Guid.Empty || month < 1 || month > 12 || year < 2000)
                return BadRequest(new { message = "Invalid parameters for payroll summary." });

            var summary = await _repository.CalculateMonthlyPayrollAttendanceAsync(
                tenantId, month, year, latesPerAbsent, halfDaysPerAbsent, allowedLeaves);

            return Ok(summary);
        }
    }
}