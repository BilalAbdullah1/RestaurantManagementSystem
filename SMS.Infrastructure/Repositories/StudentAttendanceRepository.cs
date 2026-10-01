using Microsoft.EntityFrameworkCore;
using SMS.Application.DTOs;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using SMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Infrastructure.Repositories
{
    public class StudentAttendanceRepository : IStudentAttendanceRepository
    {
        private readonly ApplicationDbContext _context;

        public StudentAttendanceRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // 1. DAILY ATTENDANCE - Poori class ki attendance fetch karna specific date par
        public async Task<IEnumerable<object>> GetDailyAttendanceAsync(Guid academicYearId, Guid classId, Guid sectionId, DateTime date)
        {
            // Enrollment active list se students uthayenge aur attendance check karenge
            return await _context.StudentEnrollments
                .Where(e => e.academic_year_id == academicYearId && e.class_id == classId && e.section_id == sectionId && e.status == "Active")
                .Join(_context.Students,
                    e => e.student_id,
                    s => s.id,
                    (e, s) => new { e, s })
                .Select(x => new
                {
                    student_id = x.s.id,
                    student_name = x.s.first_name + " " + x.s.last_name,
                    roll_number = x.e.roll_number,
                    admission_number = x.s.admission_number,
                    // Check if attendance already marked for this date
                    attendance_status = _context.StudentAttendances
                        .Where(sa => sa.student_id == x.s.id && sa.date.Date == date.Date)
                        .Select(sa => sa.status)
                        .FirstOrDefault() ?? "Present", // Default presentation mode
                    remarks = _context.StudentAttendances
                        .Where(sa => sa.student_id == x.s.id && sa.date.Date == date.Date)
                        .Select(sa => sa.remarks)
                        .FirstOrDefault() ?? ""
                })
                .OrderBy(x => x.roll_number)
                .ToListAsync();
        }

        // BULK UPSERT LOGIC - Naya record insert karega ya existing record update karega
        public async Task SaveBulkAttendanceAsync(Guid tenantId, Guid academicYearId, DateTime date, List<AttendanceRecordDto> records, Guid? classId = null, Guid? sectionId = null)
        {
            var studentIds = records.Select(r => r.student_id).ToList();

            // Pehle se majood records ko date aur student id ke mutabiq laayein
            var existingAttendance = await _context.StudentAttendances
                .Where(a => a.date.Date == date.Date && studentIds.Contains(a.student_id))
                .ToListAsync();

            foreach (var record in records)
            {
                var existing = existingAttendance.FirstOrDefault(a => a.student_id == record.student_id);

                if (existing != null)
                {
                    // Update record if exists
                    existing.status = record.status;
                    existing.remarks = record.remarks;
                    existing.check_in_time = record.check_in_time;
                    existing.check_out_time = record.check_out_time;
                    existing.is_late = record.is_late;
                    existing.is_half_day = record.is_half_day;
                    existing.fine_amount = record.fine_amount;
                    if (classId.HasValue) existing.class_id = classId.Value;
                    if (sectionId.HasValue) existing.section_id = sectionId.Value;
                    _context.StudentAttendances.Update(existing);
                }
                else
                {
                    // Insert new record if not exists
                    var newAttendance = new StudentAttendance
                    {
                        id = Guid.NewGuid(),
                        tenant_id = tenantId,
                        student_id = record.student_id,
                        academic_year_id = academicYearId,
                        class_id = classId,
                        section_id = sectionId,
                        date = date.Date,
                        status = record.status,
                        remarks = record.remarks,
                        check_in_time = record.check_in_time,
                        check_out_time = record.check_out_time,
                        is_late = record.is_late,
                        is_half_day = record.is_half_day,
                        fine_amount = record.fine_amount,
                        created_at = DateTime.UtcNow
                    };
                    await _context.StudentAttendances.AddAsync(newAttendance);
                }
            }
        }

        // 2. MONTHLY ATTENDANCE SUMMARY - Aik student ki monthly summary view grid ke liye
        public async Task<IEnumerable<StudentAttendance>> GetMonthlyAttendanceAsync(Guid studentId, int month, int year)
        {
            return await _context.StudentAttendances
                .Where(a => a.student_id == studentId && a.date.Month == month && a.date.Year == year)
                .OrderBy(a => a.date)
                .ToListAsync();
        }

        // 3. ATTENDANCE REPORT ENGINE - Poori class ki analytics report percentages ke sath
        public async Task<IEnumerable<AttendanceReportResponseDto>> GetAttendanceReportAsync(Guid academicYearId, Guid classId, Guid sectionId, DateTime startDate, DateTime endDate)
        {
            var studentsInSection = await _context.StudentEnrollments
                .Where(e => e.academic_year_id == academicYearId && e.class_id == classId && e.section_id == sectionId)
                .Join(_context.Students, e => e.student_id, s => s.id, (e, s) => new { e, s })
                .ToListAsync();

            var distinctStudents = studentsInSection
                .GroupBy(x => x.s.id)
                .Select(g => g.First())
                .ToList();

            var studentIds = distinctStudents.Select(x => x.s.id).ToList();

            var attendanceData = await _context.StudentAttendances
                .Where(a => studentIds.Contains(a.student_id) && a.date.Date >= startDate.Date && a.date.Date <= endDate.Date)
                .ToListAsync();

            var reportList = new List<AttendanceReportResponseDto>();

            foreach (var target in distinctStudents)
            {
                var targetAttendance = attendanceData.Where(a => a.student_id == target.s.id).ToList();
                int totalDays = targetAttendance.Count;
                int presents = targetAttendance.Count(a => a.status == "Present");
                int absents = targetAttendance.Count(a => a.status == "Absent");
                int leaves = targetAttendance.Count(a => a.status == "Leave");
                int lates = targetAttendance.Count(a => a.status == "Late");

                decimal percentage = totalDays > 0 ? ((decimal)(presents + lates) / totalDays) * 100 : 0;

                reportList.Add(new AttendanceReportResponseDto
                {
                    student_id = target.s.id,
                    student_name = $"{target.s.first_name ?? ""} {target.s.last_name ?? ""}".Trim(),
                    admission_number = target.s.admission_number ?? "",
                    roll_number = target.e.roll_number,
                    total_days = totalDays,
                    presents = presents,
                    absents = absents,
                    leaves = leaves,
                    lates = lates,
                    attendance_percentage = Math.Round(percentage, 2)
                });
            }

            return reportList.OrderBy(r => r.roll_number);
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<WeeklyAttendanceDto>> GetWeeklyMatrixAsync(Guid academicYearId, Guid classId, Guid sectionId, DateTime startDate, DateTime endDate)
        {
            var studentsList = await _context.StudentEnrollments
                .Where(e => e.academic_year_id == academicYearId && e.class_id == classId && e.section_id == sectionId && e.status == "Active")
                .Join(_context.Students, e => e.student_id, s => s.id, (e, s) => new { e, s })
                .OrderBy(x => x.e.roll_number)
                .ToListAsync();

            var studentIds = studentsList.Select(x => x.s.id).ToList();

            var attendanceRecords = await _context.StudentAttendances
                .Where(a => studentIds.Contains(a.student_id) && a.date.Date >= startDate.Date && a.date.Date <= endDate.Date)
                .ToListAsync();

            var result = new List<WeeklyAttendanceDto>();

            foreach (var stu in studentsList)
            {
                var studentRecords = attendanceRecords.Where(a => a.student_id == stu.s.id).ToList();
                var recordsDict = new Dictionary<string, AttendanceDetailDto>();

                foreach (var att in studentRecords)
                {
                    recordsDict[att.date.ToString("yyyy-MM-dd")] = new AttendanceDetailDto
                    {
                        status = att.status,
                        reason = att.remarks ?? ""
                    };
                }
                int totalDays = studentRecords.Count;
                int presentsAndLates = studentRecords.Count(a => a.status == "Present" || a.status == "Late");
                decimal percentage = totalDays > 0 ? Math.Round(((decimal)presentsAndLates / totalDays) * 100, 2) : 0;
                result.Add(new WeeklyAttendanceDto
                {
                    student_id = stu.s.id,
                    student_name = $"{stu.s.first_name} {stu.s.last_name}",
                    admission_number = stu.s.admission_number,
                    overall_percentage = percentage,
                    records = recordsDict
                });
            }

            return result;
        }

        public async Task<IEnumerable<AttendanceHeatmapDto>> GetAttendanceHeatmapAsync(Guid tenantId, Guid? classId, Guid? sectionId, DateTime startDate, DateTime endDate)
        {
            var query = _context.StudentAttendances
                .Where(a => a.tenant_id == tenantId && a.date.Date >= startDate.Date && a.date.Date <= endDate.Date);

            if (classId.HasValue && classId.Value != Guid.Empty && sectionId.HasValue && sectionId.Value != Guid.Empty)
            {
                query = query.Where(a => 
                    (a.class_id == classId.Value && a.section_id == sectionId.Value) ||
                    _context.StudentEnrollments.Any(e => e.student_id == a.student_id && e.class_id == classId.Value && e.section_id == sectionId.Value)
                );
            }
            else if (classId.HasValue && classId.Value != Guid.Empty)
            {
                query = query.Where(a => 
                    a.class_id == classId.Value ||
                    _context.StudentEnrollments.Any(e => e.student_id == a.student_id && e.class_id == classId.Value)
                );
            }
            else if (sectionId.HasValue && sectionId.Value != Guid.Empty)
            {
                query = query.Where(a => 
                    a.section_id == sectionId.Value ||
                    _context.StudentEnrollments.Any(e => e.student_id == a.student_id && e.section_id == sectionId.Value)
                );
            }

            var rawData = await query
                .GroupBy(a => a.date.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    PresentCount = g.Count(a => a.status == "Present" || a.status == "Late"),
                    TotalCount = g.Count()
                })
                .ToListAsync();

            var result = rawData.Select(x => new AttendanceHeatmapDto
            {
                Date = x.Date.ToString("yyyy-MM-dd"),
                PresentCount = x.PresentCount,
                TotalCount = x.TotalCount,
                Percentage = x.TotalCount > 0 
                    ? Math.Round((decimal)x.PresentCount / x.TotalCount * 100, 1)
                    : 0
            })
            .OrderBy(r => r.Date)
            .ToList();

            return result;
        }
    }
}