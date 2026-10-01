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
    public class AlumniProfilesController : ControllerBase
    {
        private readonly IAlumniProfileRepository _repository;

        public AlumniProfilesController(IAlumniProfileRepository repository)
        {
            _repository = repository;
        }

        // GET: api/alumniprofiles/tenant/{tenantId}
        [HttpGet("tenant/{tenantId}")]
        public async Task<IActionResult> GetAllAlumni(Guid tenantId)
        {
            if (tenantId == Guid.Empty) return BadRequest(new { message = "Tenant ID is required." });

            var alumni = await _repository.GetAllAlumniAsync(tenantId);
            return Ok(alumni);
        }

        // POST: api/alumniprofiles
        [HttpPost]
        public async Task<IActionResult> CreateAlumni([FromBody] CreateAlumniProfileDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Check if student is already in alumni list
            var existingProfile = await _repository.GetByStudentIdAsync(dto.student_id);
            if (existingProfile != null)
                return BadRequest(new { message = "This student is already registered as an Alumni." });

            var profile = new AlumniProfile
            {
                id = Guid.NewGuid(),
                tenant_id = dto.tenant_id,
                student_id = dto.student_id,
                graduation_year = dto.graduation_year,
                current_occupation = dto.current_occupation,
                current_organization = dto.current_organization,
                higher_education_details = dto.higher_education_details
            };

            await _repository.AddAsync(profile);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Alumni profile created successfully.", data = profile });
        }

        // PUT: api/alumniprofiles/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateAlumni(Guid id, [FromBody] UpdateAlumniProfileDto dto)
        {
            var profile = await _repository.GetByIdAsync(id);
            if (profile == null) return NotFound(new { message = "Alumni profile not found." });

            profile.graduation_year = dto.graduation_year;
            profile.current_occupation = dto.current_occupation;
            profile.current_organization = dto.current_organization;
            profile.higher_education_details = dto.higher_education_details;

            _repository.Update(profile);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Alumni profile updated successfully.", data = profile });
        }

        // DELETE: api/alumniprofiles/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAlumni(Guid id)
        {
            var profile = await _repository.GetByIdAsync(id);
            if (profile == null) return NotFound(new { message = "Alumni profile not found." });

            _repository.Delete(profile);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Alumni profile deleted successfully." });
        }
    }
}