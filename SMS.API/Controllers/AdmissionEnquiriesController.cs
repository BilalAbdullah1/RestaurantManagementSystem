using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SMS.Application.DTOs;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using SMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdmissionEnquiriesController : ControllerBase
    {
        private readonly IAdmissionEnquiryRepository _repository;
        private readonly IStudentRepository _studentRepo;
        private readonly ApplicationDbContext _context;

        public AdmissionEnquiriesController(
            IAdmissionEnquiryRepository repository, 
            IStudentRepository studentRepo,
            ApplicationDbContext context)
        {
            _repository = repository;
            _studentRepo = studentRepo;
            _context = context;
        }

        // GET: api/admissionenquiries/tenant/{tenantId}
        [HttpGet("tenant/{tenantId}")]
        public async Task<IActionResult> GetAllEnquiries(Guid tenantId)
        {
            if (tenantId == Guid.Empty) return BadRequest(new { message = "Tenant ID is missing." });

            var enquiries = await _repository.GetAllEnquiriesAsync(tenantId);
            return Ok(enquiries);
        }

        // POST: api/admissionenquiries
        [HttpPost]
        public async Task<IActionResult> CreateEnquiry([FromBody] CreateAdmissionEnquiryDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var enquiry = new AdmissionEnquiry
            {
                id = Guid.NewGuid(),
                tenant_id = dto.tenant_id,
                child_name = dto.child_name,
                father_name = dto.father_name,
                phone_number = dto.phone_number,
                class_id = dto.class_id,
                remarks = dto.remarks,
                status = "Enquiry",
                created_at = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc)
            };

            await _repository.AddAsync(enquiry);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Admission Enquiry recorded successfully.", data = enquiry });
        }

        // PUT: api/admissionenquiries/{id}/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateEnquiryStatusDto dto)
        {
            var enquiry = await _repository.GetByIdAsync(id);
            if (enquiry == null) return NotFound(new { message = "Enquiry record not found." });

            enquiry.status = dto.status;
            
            // Optionally update remarks if provided
            if (!string.IsNullOrEmpty(dto.remarks))
            {
                enquiry.remarks = dto.remarks;
            }

            _repository.Update(enquiry);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Enquiry status updated successfully.", data = enquiry });
        }

        // DELETE: api/admissionenquiries/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEnquiry(Guid id)
        {
            var enquiry = await _repository.GetByIdAsync(id);
            if (enquiry == null) return NotFound(new { message = "Enquiry record not found." });

            _repository.Delete(enquiry);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Admission Enquiry deleted successfully." });
        }

        // POST: api/admissionenquiries/{id}/convert
        [HttpPost("{id}/convert")]
        public async Task<IActionResult> ConvertToStudent(Guid id)
        {
            try
            {
                var enquiry = await _repository.GetByIdAsync(id);
                if (enquiry == null) return NotFound(new { message = "Enquiry record not found." });

                if (enquiry.status == "Registered") return BadRequest(new { message = "Enquiry is already converted to a student." });

                // Generate sequential order-wise GR number (GR-YYYY-XXX)
                var newAdmissionNumber = await _studentRepo.GenerateNextGrNumberAsync(enquiry.tenant_id);

                // Split child_name into first_name and last_name
                string firstName = enquiry.child_name ?? "Student";
                string lastName = "";
                if (!string.IsNullOrWhiteSpace(enquiry.child_name))
                {
                    var nameParts = enquiry.child_name.Trim().Split(new[] { ' ' }, 2, StringSplitOptions.RemoveEmptyEntries);
                    firstName = nameParts[0];
                    if (nameParts.Length > 1)
                    {
                        lastName = nameParts[1];
                    }
                }

                var existingStudent = await _context.Students
                    .FirstOrDefaultAsync(s => s.tenant_id == enquiry.tenant_id 
                                           && s.first_name.ToLower() == firstName.ToLower()
                                           && s.last_name.ToLower() == lastName.ToLower()
                                           && s.guardian_phone == (enquiry.phone_number ?? ""));

                if (existingStudent != null)
                {
                    enquiry.status = "Registered";
                    _repository.Update(enquiry);
                    await _context.SaveChangesAsync();
                    return Ok(new { message = "Lead status updated to Registered (Existing student profile linked).", studentId = existingStudent.id });
                }

                DateTime dob = DateTime.SpecifyKind(DateTime.UtcNow.AddYears(-10), DateTimeKind.Utc);
                string gender = "Male";
                string fatherCnic = "";
                string address = "";
                string bFormFromRemarks = "";

                if (!string.IsNullOrWhiteSpace(enquiry.remarks))
                {
                    var parts = enquiry.remarks.Split('|');
                    foreach (var part in parts)
                    {
                        var kv = part.Split(':');
                        if (kv.Length >= 2)
                        {
                            var key = kv[0].Trim();
                            var val = string.Join(":", kv.Skip(1)).Trim();

                            if (key.Contains("DOB", StringComparison.OrdinalIgnoreCase) && DateTime.TryParse(val, out var parsedDob))
                            {
                                if (parsedDob.Year > 1900)
                                    dob = DateTime.SpecifyKind(parsedDob, DateTimeKind.Utc);
                            }
                            else if (key.Contains("Gender", StringComparison.OrdinalIgnoreCase) && val != "N/A" && !string.IsNullOrWhiteSpace(val))
                            {
                                gender = char.ToUpper(val[0]) + (val.Length > 1 ? val.Substring(1).ToLower() : "");
                            }
                            else if (key.Contains("CNIC", StringComparison.OrdinalIgnoreCase) && val != "N/A")
                            {
                                fatherCnic = val;
                            }
                            else if (key.Contains("Address", StringComparison.OrdinalIgnoreCase) && val != "N/A")
                            {
                                address = val;
                            }
                            else if ((key.Contains("BForm", StringComparison.OrdinalIgnoreCase) || key.Contains("B-Form", StringComparison.OrdinalIgnoreCase)) && val != "N/A")
                            {
                                bFormFromRemarks = val;
                            }
                        }
                    }
                }

                string bFormNumber = bFormFromRemarks?.Trim() ?? "";
                
                if (!string.IsNullOrWhiteSpace(bFormFromRemarks) && !bFormFromRemarks.Equals("N/A", StringComparison.OrdinalIgnoreCase))
                {
                    if (await _studentRepo.ExistsBFormNumberAsync(enquiry.tenant_id, bFormFromRemarks))
                    {
                        return BadRequest(new { message = $"A student with B-Form / National ID '{bFormFromRemarks}' is already registered in the system." });
                    }
                    bFormNumber = bFormFromRemarks;
                }
                else
                {
                    bFormNumber = $"BF-{newAdmissionNumber}";
                }

                // Fallback loop to guarantee absolute uniqueness
                int attempts = 0;
                while (await _studentRepo.ExistsBFormNumberAsync(enquiry.tenant_id, bFormNumber) && attempts < 10)
                {
                    attempts++;
                    bFormNumber = $"BF-{newAdmissionNumber}-{Guid.NewGuid().ToString().Substring(0, 4)}";
                }

                var student = new Student
                {
                    id = Guid.NewGuid(),
                    tenant_id = enquiry.tenant_id,
                    first_name = firstName,
                    last_name = lastName,
                    father_name = enquiry.father_name ?? "",
                    guardian_phone = enquiry.phone_number ?? "",
                    father_cnic = fatherCnic,
                    b_form_number = bFormNumber,
                    gender = gender,
                    date_of_birth = dob,
                    address = address,
                    admission_date = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc),
                    admission_number = newAdmissionNumber,
                    created_at = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc),
                    is_active = true
                };

                await _studentRepo.AddAsync(student);
                
                await _context.SaveChangesAsync();

                if (enquiry.class_id != Guid.Empty)
                {
                    var activeYear = await _context.AcademicYears
                        .Where(y => y.tenant_id == enquiry.tenant_id && y.is_current)
                        .OrderByDescending(y => y.start_date)
                        .FirstOrDefaultAsync() 
                        ?? await _context.AcademicYears
                        .Where(y => y.tenant_id == enquiry.tenant_id)
                        .OrderByDescending(y => y.start_date)
                        .FirstOrDefaultAsync();

                    if (activeYear == null)
                    {
                        activeYear = new AcademicYear
                        {
                            id = Guid.NewGuid(),
                            tenant_id = enquiry.tenant_id,
                            title = $"{DateTime.UtcNow.Year}-{DateTime.UtcNow.Year + 1}",
                            start_date = DateTime.SpecifyKind(new DateTime(DateTime.UtcNow.Year, 1, 1), DateTimeKind.Utc),
                            end_date = DateTime.SpecifyKind(new DateTime(DateTime.UtcNow.Year, 12, 31), DateTimeKind.Utc),
                            is_current = true,
                            created_at = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc)
                        };
                        await _context.AcademicYears.AddAsync(activeYear);
                    }

                    var section = await _context.Sections
                        .Where(s => s.class_id == enquiry.class_id)
                        .FirstOrDefaultAsync();

                    if (section == null)
                    {
                        section = new Section
                        {
                            id = Guid.NewGuid(),
                            tenant_id = enquiry.tenant_id,
                            class_id = enquiry.class_id,
                            name = "Section A",
                            max_capacity = 40,
                            created_at = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc)
                        };
                        await _context.Sections.AddAsync(section);
                    }

                    var maxRoll = await _context.StudentEnrollments
                        .Where(e => e.academic_year_id == activeYear.id && e.class_id == enquiry.class_id && e.section_id == section.id)
                        .Select(e => (int?)e.roll_number)
                        .MaxAsync() ?? 0;

                    var enrollment = new StudentEnrollment
                    {
                        id = Guid.NewGuid(),
                        tenant_id = enquiry.tenant_id,
                        student_id = student.id,
                        academic_year_id = activeYear.id,
                        class_id = enquiry.class_id,
                        section_id = section.id,
                        roll_number = maxRoll + 1,
                        status = "Active",
                        created_at = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc)
                    };

                    await _context.StudentEnrollments.AddAsync(enrollment);
                }

                enquiry.status = "Registered";
                _repository.Update(enquiry);

                await _context.SaveChangesAsync();

                return Ok(new { message = "Lead successfully converted to Student and enrolled in class.", studentId = student.id });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to convert lead to student.", detail = ex.Message + (ex.InnerException != null ? " | " + ex.InnerException.Message : "") });
            }
        }

        [Microsoft.AspNetCore.Authorization.AllowAnonymous]
        [HttpPost("public-apply")]
        public async Task<IActionResult> PublicApply([FromBody] CreateAdmissionEnquiryDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (dto.tenant_id == Guid.Empty) return BadRequest(new { message = "Invalid school identifier." });

            var enquiry = new AdmissionEnquiry
            {
                id = Guid.NewGuid(),
                tenant_id = dto.tenant_id,
                child_name = dto.child_name,
                father_name = dto.father_name,
                phone_number = dto.phone_number,
                class_id = dto.class_id,
                remarks = $"[Online Application] {dto.remarks}",
                status = "Enquiry",
                created_at = DateTime.SpecifyKind(DateTime.UtcNow, DateTimeKind.Utc)
            };

            await _repository.AddAsync(enquiry);
            await _repository.SaveChangesAsync();

            return Ok(new { 
                message = "Your admission application has been submitted successfully! Our team will contact you within 24-48 hours.",
                reference_id = enquiry.id
            });
        }
    }
}