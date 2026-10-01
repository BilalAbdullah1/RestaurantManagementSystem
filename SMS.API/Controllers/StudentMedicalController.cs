using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using System;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class StudentMedicalController : ControllerBase
    {
        private readonly IStudentMedicalRepository _repository;

        public StudentMedicalController(IStudentMedicalRepository repository)
        {
            _repository = repository;
        }

        // GET: api/studentmedical/student/{studentId}
        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetByStudent(Guid studentId)
        {
            var record = await _repository.GetByStudentIdAsync(studentId);
            if (record == null) return Ok(null); // Return null if no record yet (first time)
            return Ok(record);
        }

        // POST: api/studentmedical
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] StudentMedicalRecord record)
        {
            // Check if a record already exists for this student
            var existing = await _repository.GetByStudentIdAsync(record.student_id);
            if (existing != null)
            {
                // Update instead
                existing.allergies = record.allergies;
                existing.chronic_conditions = record.chronic_conditions;
                existing.vaccination_status = record.vaccination_status;
                existing.family_medical_history = record.family_medical_history;
                existing.emergency_contact_name = record.emergency_contact_name;
                existing.emergency_contact_phone = record.emergency_contact_phone;
                existing.emergency_contact_relation = record.emergency_contact_relation;
                existing.doctor_name = record.doctor_name;
                existing.doctor_phone = record.doctor_phone;
                existing.additional_notes = record.additional_notes;
                existing.last_updated = DateTime.UtcNow;
                _repository.Update(existing);
                await _repository.SaveChangesAsync();
                return Ok(new { message = "Medical record updated successfully.", data = existing });
            }

            record.id = Guid.NewGuid();
            record.last_updated = DateTime.UtcNow;
            await _repository.AddAsync(record);
            await _repository.SaveChangesAsync();
            return Ok(new { message = "Medical record saved successfully.", data = record });
        }

        // PUT: api/studentmedical/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] StudentMedicalRecord record)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = "Medical record not found." });

            existing.allergies = record.allergies;
            existing.chronic_conditions = record.chronic_conditions;
            existing.vaccination_status = record.vaccination_status;
            existing.family_medical_history = record.family_medical_history;
            existing.emergency_contact_name = record.emergency_contact_name;
            existing.emergency_contact_phone = record.emergency_contact_phone;
            existing.emergency_contact_relation = record.emergency_contact_relation;
            existing.doctor_name = record.doctor_name;
            existing.doctor_phone = record.doctor_phone;
            existing.additional_notes = record.additional_notes;
            existing.last_updated = DateTime.UtcNow;

            _repository.Update(existing);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Medical record updated.", data = existing });
        }
    }
}
