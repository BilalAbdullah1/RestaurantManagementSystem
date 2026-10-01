using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SMS.Application.Interfaces;
using SMS.Core.Entities;
using SMS.Infrastructure.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentSubjectAttendanceController : ControllerBase
    {
        private readonly IApplicationDbContext _context;
        private readonly ITenantProvider _tenantProvider;

        public StudentSubjectAttendanceController(IApplicationDbContext context, ITenantProvider tenantProvider)
        {
            _context = context;
            _tenantProvider = tenantProvider;
        }

        [HttpGet("by-period")]
        public async Task<IActionResult> GetByPeriod(
            [FromQuery] Guid classId,
            [FromQuery] Guid sectionId,
            [FromQuery] Guid periodId,
            [FromQuery] DateTime date)
        {
            var students = await _context.StudentEnrollments
                .Where(e => e.class_id == classId && e.section_id == sectionId && e.status == "Active")
                .Join(_context.Students, e => e.student_id, s => s.id, (e, s) => new { e, s })
                .ToListAsync();

            var studentIds = students.Select(x => x.s.id).ToList();

            var attendances = await _context.StudentSubjectAttendances
                .Where(a => a.timetable_period_id == periodId && a.date.Date == date.Date && studentIds.Contains(a.student_id))
                .ToListAsync();

            var result = students.Select(x => new
            {
                student_id = x.s.id,
                student_name = $"{x.s.first_name} {x.s.last_name}",
                roll_number = x.e.roll_number,
                attendance_status = attendances.FirstOrDefault(a => a.student_id == x.s.id)?.status ?? "Present",
                remarks = attendances.FirstOrDefault(a => a.student_id == x.s.id)?.remarks ?? ""
            }).OrderBy(r => r.roll_number);

            return Ok(result);
        }

        [HttpPost("bulk-mark")]
        public async Task<IActionResult> BulkMark([FromBody] SubjectBulkMarkDto dto)
        {
            var tenantId = _tenantProvider.GetTenantId();
            var existing = await _context.StudentSubjectAttendances
                .Where(a => a.timetable_period_id == dto.periodId && a.date.Date == dto.date.Date)
                .ToListAsync();

            foreach (var record in dto.records)
            {
                var match = existing.FirstOrDefault(a => a.student_id == record.studentId);
                if (match != null)
                {
                    match.status = record.status;
                    match.remarks = record.remarks;
                    _context.StudentSubjectAttendances.Update(match);
                }
                else
                {
                    _context.StudentSubjectAttendances.Add(new StudentSubjectAttendance
                    {
                        id = Guid.NewGuid(),
                        tenant_id = tenantId,
                        student_id = record.studentId,
                        timetable_period_id = dto.periodId,
                        date = dto.date.Date,
                        status = record.status,
                        remarks = record.remarks,
                        created_at = DateTime.UtcNow
                    });
                }
            }
            await _context.SaveChangesAsync();
            return Ok(new { message = "Subject-wise attendance saved successfully." });
        }
    }

    public class SubjectBulkMarkDto
    {
        public Guid periodId { get; set; }
        public DateTime date { get; set; }
        public List<SubjectAttendanceRecordDto> records { get; set; } = new();
    }

    public class SubjectAttendanceRecordDto
    {
        public Guid studentId { get; set; }
        public string status { get; set; } = "Present";
        public string remarks { get; set; } = string.Empty;
    }
}
