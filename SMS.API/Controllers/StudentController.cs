using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using SMS.Infrastructure.Security;

namespace SMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class StudentsController : ControllerBase
    {
        private readonly IStudentRepository _repository;
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;

        public StudentsController(IStudentRepository repository, IUserRepository userRepository, IRoleRepository roleRepository)
        {
            _repository = repository;
            _userRepository = userRepository;
            _roleRepository = roleRepository;
        }

        [HttpGet("tenant/{tenantId}")]
        [HasPermission("students.view")]
        public async Task<ActionResult<IEnumerable<Student>>> GetByTenant(Guid tenantId) =>
            Ok(await _repository.GetByTenantAsync(tenantId));

        [HttpGet("tenant/{tenantId}/class/{classId}/section/{sectionId}")]
        [HasPermission("students.view")]
        public async Task<ActionResult<IEnumerable<Student>>> GetByClassAndSection(Guid tenantId, Guid classId, Guid sectionId) =>
            Ok(await _repository.GetByTenantAsync(tenantId));

        [HttpGet("{id}")]
        [HasPermission("students.view")]
        public async Task<ActionResult<Student>> GetById(Guid id)
        {
            var student = await _repository.GetByIdAsync(id);
            if (student == null) return NotFound(new { message = "Student not found" });
            return Ok(student);
        }

        [HttpPost]
        [HasPermission("students.create")]
        public async Task<ActionResult<Student>> Create(Student student)
        {
            if (string.IsNullOrWhiteSpace(student.admission_number))
            {
                student.admission_number = await _repository.GenerateNextGrNumberAsync(student.tenant_id);
            }
            else if (await _repository.ExistsAdmissionNumberAsync(student.tenant_id, student.admission_number))
            {
                return BadRequest(new { message = $"Admission number '{student.admission_number}' is already assigned." });
            }

            if (await _repository.ExistsBFormNumberAsync(student.tenant_id, student.b_form_number))
            {
                return BadRequest(new { message = $"B-Form / National ID '{student.b_form_number}' is already registered." });
            }

            student.id = Guid.NewGuid();
            student.created_at = DateTime.UtcNow;
            student.is_active = true;

            await _repository.AddAsync(student);
            await _repository.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = student.id }, student);
        }

        [HttpPut("{id}")]
        [HasPermission("students.edit")]
        public async Task<IActionResult> Update(Guid id, Student student)
        {
            if (id != student.id) return BadRequest(new { message = "Identity mismatch in update parameters" });

            var existingStudent = await _repository.GetByIdAsync(id);
            if (existingStudent == null) return NotFound(new { message = "Student profile not found" });

            if (await _repository.ExistsAdmissionNumberAsync(student.tenant_id, student.admission_number, excludeId: id))
            {
                return BadRequest(new { message = $"Admission number '{student.admission_number}' is already assigned to another student." });
            }

            if (await _repository.ExistsBFormNumberAsync(student.tenant_id, student.b_form_number, excludeId: id))
            {
                return BadRequest(new { message = $"B-Form / National ID '{student.b_form_number}' is already registered to another student." });
            }

            student.created_at = existingStudent.created_at;
            _repository.Update(student);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Student profile updated successfully", data = student });
        }

        [HttpDelete("{id}")]
        [HasPermission("students.delete")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existingStudent = await _repository.GetByIdAsync(id);
            if (existingStudent == null) return NotFound(new { message = "Student record not found" });

            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Student record deleted successfully from the system" });
        }

        [HttpPost("{id}/generate-account")]
        [HasPermission("students.create")]
        public async Task<IActionResult> GenerateAccount(Guid id)
        {
            var student = await _repository.GetByIdAsync(id);
            if (student == null) return NotFound(new { message = "Student not found" });

            if (student.user_id != null && student.user_id != Guid.Empty)
            {
                return BadRequest(new { message = "Student already has an active account." });
            }

            var roles = await _roleRepository.GetByTenantAsync(student.tenant_id);
            var studentRole = roles.FirstOrDefault(r => r.name == "Student");

            if (studentRole == null)
            {
                return BadRequest(new { message = "Student role not found in this tenant." });
            }

            var defaultPassword = "Student@" + DateTime.Now.Year.ToString();
            
            var newUser = new User
            {
                id = Guid.NewGuid(),
                tenant_id = student.tenant_id,
                role_id = studentRole.id,
                first_name = student.first_name,
                last_name = student.last_name,
                email = student.admission_number, // using admission number as username
                is_active = true,
                created_at = DateTime.UtcNow,
                profile_picture_url = student.profile_picture_url,
                password_hash = PasswordHasher.HashPassword(defaultPassword)
            };

            await _userRepository.AddAsync(newUser);
            await _userRepository.SaveChangesAsync();

            student.user_id = newUser.id;
            _repository.Update(student);
            await _repository.SaveChangesAsync();

            return Ok(new
            {
                message = "Account generated successfully.",
                username = newUser.email,
                password = defaultPassword
            });
        }

        [HttpGet("tenant/{tenantId}/generate-gr")]
        [HasPermission("students.view")]
        public async Task<IActionResult> GenerateGrNumber(Guid tenantId)
        {
            var grNumber = await _repository.GenerateNextGrNumberAsync(tenantId);
            return Ok(new { gr_number = grNumber });
        }
    }
}