using Microsoft.AspNetCore.Mvc;
using SMS.Application.DTOs;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StudentEnrollmentsController : ControllerBase
    {
        private readonly IStudentEnrollmentRepository _repository;
        private readonly ISectionRepository _sectionRepo;

        public StudentEnrollmentsController(IStudentEnrollmentRepository repository, ISectionRepository sectionRepo)
        {
            _repository = repository;
            _sectionRepo = sectionRepo;
        }

        // GET: api/studentenrollments/tenant/{tenantId}
        [HttpGet("tenant/{tenantId}")]
        public async Task<IActionResult> GetByTenant(Guid tenantId)
        {
            if (tenantId == Guid.Empty) return BadRequest(new { message = "Invalid tenant ID." });
            var enrollments = await _repository.GetByTenantAsync(tenantId);
            return Ok(enrollments);
        }

        // =======================================================
        // FIX: GET LIST BY FILTERS (Missing Action for Frontend Grid)
        // =======================================================
        [HttpGet("list")]
        public async Task<ActionResult<IEnumerable<StudentEnrollment>>> GetEnrollmentsList(
            [FromQuery] Guid yearId, 
            [FromQuery] Guid classId, 
            [FromQuery] Guid sectionId)
        {
            if (yearId == Guid.Empty || classId == Guid.Empty || sectionId == Guid.Empty)
            {
                return BadRequest(new { message = "Invalid filter parameters." });
            }

            var enrollments = await _repository.GetEnrollmentsByFilterAsync(yearId, classId, sectionId);
            return Ok(enrollments);
        }

        // ==========================================
        // 1. ENROLL STUDENT (New Admission / Session)
        // ==========================================
        [HttpPost("enroll")]
        public async Task<IActionResult> EnrollStudent([FromBody] EnrollStudentDto dto)
        {
            var existingEnrollment = await _repository.GetActiveEnrollmentAsync(dto.student_id, dto.academic_year_id);
            if (existingEnrollment != null)
                return BadRequest(new { message = "Student is already enrolled in this academic year." });

            // Feature 21: Class & Section Capacity Check
            var section = await _sectionRepo.GetByIdAsync(dto.section_id);
            if (section != null)
            {
                var currentEnrolled = await _repository.GetEnrollmentsByFilterAsync(dto.academic_year_id, dto.class_id, dto.section_id);
                var activeCount = System.Linq.Enumerable.Count(currentEnrolled, e => e.status == "Active");
                if (activeCount >= section.max_capacity)
                {
                    return BadRequest(new { message = $"Section '{section.name}' has reached its maximum capacity of {section.max_capacity} students." });
                }
            }

            var rollTaken = await _repository.IsRollNumberTakenAsync(dto.academic_year_id, dto.class_id, dto.section_id, dto.roll_number);
            if (rollTaken)
                return BadRequest(new { message = $"Roll number {dto.roll_number} is already taken in this section." });

            var enrollment = new StudentEnrollment
            {
                id = Guid.NewGuid(),
                tenant_id = dto.tenant_id,
                student_id = dto.student_id,
                academic_year_id = dto.academic_year_id,
                class_id = dto.class_id,
                section_id = dto.section_id,
                roll_number = dto.roll_number,
                status = "Active",
                created_at = DateTime.UtcNow
            };

            await _repository.AddAsync(enrollment);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Student enrolled successfully.", data = enrollment });
        }

        // ==========================================
        // 2. TRANSFER STUDENT (Change Class/Section in Same Year)
        // ==========================================
        [HttpPut("transfer")]
        public async Task<IActionResult> TransferStudent([FromBody] TransferStudentDto dto)
        {
            var enrollment = await _repository.GetByIdAsync(dto.enrollment_id);
            if (enrollment == null)
                return NotFound(new { message = "Enrollment record not found." });

            var rollTaken = await _repository.IsRollNumberTakenAsync(enrollment.academic_year_id, dto.new_class_id, dto.new_section_id, dto.new_roll_number, dto.enrollment_id);
            if (rollTaken)
                return BadRequest(new { message = "The new roll number is already assigned to someone else in the target section." });

            enrollment.class_id = dto.new_class_id;
            enrollment.section_id = dto.new_section_id;
            enrollment.roll_number = dto.new_roll_number;
            
            _repository.Update(enrollment);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Student transferred to new section successfully.", data = enrollment });
        }

        // ==========================================
        // 3. PROMOTE STUDENT (Move to Next Academic Year)
        // ==========================================
        [HttpPost("promote")]
        public async Task<IActionResult> PromoteStudent([FromBody] PromoteStudentDto dto)
        {
            var oldEnrollment = await _repository.GetByIdAsync(dto.previous_enrollment_id);
            if (oldEnrollment == null)
                return NotFound(new { message = "Previous enrollment record not found." });

            oldEnrollment.status = "Promoted";
            _repository.Update(oldEnrollment);

            var futureEnrollment = await _repository.GetActiveEnrollmentAsync(dto.student_id, dto.new_academic_year_id);
            if (futureEnrollment != null)
                return BadRequest(new { message = "Student is already enrolled in the target academic year." });

            var rollTaken = await _repository.IsRollNumberTakenAsync(dto.new_academic_year_id, dto.new_class_id, dto.new_section_id, dto.new_roll_number);
            if (rollTaken)
                return BadRequest(new { message = "The assigned roll number is already taken in the new class." });

            var newEnrollment = new StudentEnrollment
            {
                id = Guid.NewGuid(),
                tenant_id = oldEnrollment.tenant_id,
                student_id = dto.student_id,
                academic_year_id = dto.new_academic_year_id,
                class_id = dto.new_class_id,
                section_id = dto.new_section_id,
                roll_number = dto.new_roll_number,
                status = "Active",
                created_at = DateTime.UtcNow
            };

            await _repository.AddAsync(newEnrollment);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Student promoted successfully.", data = newEnrollment });
        }

        // ==========================================
        // 4. VIEW ENROLLMENT HISTORY
        // ==========================================
        [HttpGet("student/{studentId}/history")]
        public async Task<ActionResult<IEnumerable<StudentEnrollment>>> GetEnrollmentHistory(Guid studentId)
        {
            var history = await _repository.GetHistoryByStudentAsync(studentId);
            return Ok(history);
        }

        // ==========================================
        // 5. BULK PROMOTE STUDENTS
        // ==========================================
        [HttpPost("bulk-promote")]
        public async Task<IActionResult> BulkPromoteStudents([FromBody] SMS.Domain.Common.BulkPromoteStudentDto dto)
        {
            if (dto.student_ids == null || dto.student_ids.Count == 0)
                return BadRequest(new { message = "No students selected for promotion." });

            if (dto.new_academic_year_id == Guid.Empty || dto.new_class_id == Guid.Empty || dto.new_section_id == Guid.Empty)
                return BadRequest(new { message = "Please select valid Target Academic Year, Class, and Section." });

            var promotedCount = 0;
            var skippedCount = 0;

            try
            {
                foreach (var studentId in dto.student_ids)
                {
                    var currentEnrollments = await _repository.GetHistoryByStudentAsync(studentId);
                    var activeEnrollment = System.Linq.Enumerable.FirstOrDefault(currentEnrollments, e => e.status == "Active");

                    var tenantIdToUse = (dto.tenant_id != Guid.Empty) 
                        ? dto.tenant_id 
                        : (activeEnrollment?.tenant_id ?? Guid.Empty);

                    if (tenantIdToUse == Guid.Empty)
                    {
                        skippedCount++;
                        continue;
                    }

                    // Check if student is already active in target class & section in target year
                    var existingTargetEnrollment = System.Linq.Enumerable.FirstOrDefault(currentEnrollments, e => 
                        e.academic_year_id == dto.new_academic_year_id &&
                        e.class_id == dto.new_class_id &&
                        e.section_id == dto.new_section_id &&
                        e.status == "Active");

                    if (existingTargetEnrollment != null)
                    {
                        skippedCount++;
                        continue; // Skip if already active in target class/section
                    }

                    // 1. Mark previous active enrollments in OTHER classes/years as Promoted
                    foreach (var oldEnroll in currentEnrollments)
                    {
                        if (oldEnroll.status == "Active" && (oldEnroll.academic_year_id != dto.new_academic_year_id || oldEnroll.class_id != dto.new_class_id))
                        {
                            oldEnroll.status = "Promoted";
                        }
                    }

                    // 2. Check if an enrollment ALREADY exists for target academic year (to satisfy unique_student_year_enroll)
                    var targetYearEnrollment = System.Linq.Enumerable.FirstOrDefault(currentEnrollments, e => 
                        e.academic_year_id == dto.new_academic_year_id);

                    if (targetYearEnrollment != null)
                    {
                        // Update existing row for this academic year to avoid unique constraint violation
                        targetYearEnrollment.class_id = dto.new_class_id;
                        targetYearEnrollment.section_id = dto.new_section_id;
                        targetYearEnrollment.status = "Active";
                        _repository.Update(targetYearEnrollment);
                    }
                    else
                    {
                        // Create brand new enrollment row for target academic year
                        var newEnrollment = new StudentEnrollment
                        {
                            id = Guid.NewGuid(),
                            tenant_id = tenantIdToUse,
                            student_id = studentId,
                            academic_year_id = dto.new_academic_year_id,
                            class_id = dto.new_class_id,
                            section_id = dto.new_section_id,
                            roll_number = activeEnrollment?.roll_number ?? 0,
                            status = "Active",
                            created_at = DateTime.UtcNow
                        };
                        await _repository.AddAsync(newEnrollment);
                    }

                    promotedCount++;
                }

                await _repository.SaveChangesAsync();

                return Ok(new { message = $"Successfully promoted {promotedCount} student(s). Skipped {skippedCount}." });
            }
            catch (Microsoft.EntityFrameworkCore.DbUpdateException dbEx)
            {
                var innerMsg = dbEx.InnerException?.Message ?? dbEx.Message;
                return BadRequest(new { message = $"Database update error during promotion: {innerMsg}" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Promotion error: {ex.Message}" });
            }
        }
    }
}