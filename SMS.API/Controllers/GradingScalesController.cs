using Microsoft.AspNetCore.Mvc;
using SMS.Application.DTOs;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GradingScalesController : ControllerBase
    {
        private readonly IGradingScaleRepository _repository;

        public GradingScalesController(IGradingScaleRepository repository)
        {
            _repository = repository;
        }

        // GET: api/gradingscales/tenant/{tenantId}
        [HttpGet("tenant/{tenantId}")]
        public async Task<IActionResult> GetAll(Guid tenantId)
        {
            if (tenantId == Guid.Empty) return BadRequest(new { message = "Tenant ID is required." });

            var gradingScales = await _repository.GetAllAsync(tenantId);
            return Ok(gradingScales);
        }

        // POST: api/gradingscales
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateGradingScaleDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (dto.min_percentage >= dto.max_percentage)
                return BadRequest(new { message = "Minimum percentage must be less than Maximum percentage." });

            // Check overlap with existing scales for this tenant
            var existingScales = await _repository.GetAllAsync(dto.tenant_id);
            bool hasOverlap = existingScales.Any(s => 
                (dto.min_percentage >= s.min_percentage && dto.min_percentage < s.max_percentage) ||
                (dto.max_percentage > s.min_percentage && dto.max_percentage <= s.max_percentage) ||
                (dto.min_percentage <= s.min_percentage && dto.max_percentage >= s.max_percentage)
            );

            if (hasOverlap)
            {
                return BadRequest(new { message = "Percentage range overlaps with an existing grading scale rule." });
            }

            var gradingScale = new GradingScale
            {
                id = Guid.NewGuid(),
                tenant_id = dto.tenant_id,
                grade_name = dto.grade_name.Trim().ToUpper(),
                min_percentage = dto.min_percentage,
                max_percentage = dto.max_percentage,
                gpa_point = dto.gpa_point,
                remarks = dto.remarks,
                is_passing_grade = dto.is_passing_grade ?? true,
                badge_color = dto.badge_color ?? "success",
                education_level = dto.education_level ?? "General",
                created_at = DateTime.UtcNow
            };

            await _repository.AddAsync(gradingScale);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Grading scale created successfully.", data = gradingScale });
        }

        // PUT: api/gradingscales/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateGradingScaleDto dto)
        {
            if (dto.min_percentage >= dto.max_percentage)
                return BadRequest(new { message = "Minimum percentage must be less than Maximum percentage." });

            var gradingScale = await _repository.GetByIdAsync(id);
            if (gradingScale == null) return NotFound(new { message = "Grading scale not found." });

            // Check overlap with existing scales (excluding self)
            var existingScales = await _repository.GetAllAsync(gradingScale.tenant_id);
            bool hasOverlap = existingScales.Where(s => s.id != id).Any(s => 
                (dto.min_percentage >= s.min_percentage && dto.min_percentage < s.max_percentage) ||
                (dto.max_percentage > s.min_percentage && dto.max_percentage <= s.max_percentage) ||
                (dto.min_percentage <= s.min_percentage && dto.max_percentage >= s.max_percentage)
            );

            if (hasOverlap)
            {
                return BadRequest(new { message = "Percentage range overlaps with another grading scale rule." });
            }

            gradingScale.grade_name = dto.grade_name.Trim().ToUpper();
            gradingScale.min_percentage = dto.min_percentage;
            gradingScale.max_percentage = dto.max_percentage;
            gradingScale.gpa_point = dto.gpa_point;
            gradingScale.remarks = dto.remarks;
            if (dto.is_passing_grade.HasValue) gradingScale.is_passing_grade = dto.is_passing_grade.Value;
            if (!string.IsNullOrEmpty(dto.badge_color)) gradingScale.badge_color = dto.badge_color;
            if (!string.IsNullOrEmpty(dto.education_level)) gradingScale.education_level = dto.education_level;

            _repository.Update(gradingScale);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Grading scale updated successfully.", data = gradingScale });
        }

        // DELETE: api/gradingscales/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var gradingScale = await _repository.GetByIdAsync(id);
            if (gradingScale == null) return NotFound(new { message = "Grading scale not found." });

            _repository.Delete(gradingScale);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Grading scale deleted successfully." });
        }

        // POST: api/gradingscales/tenant/{tenantId}/seed-preset
        [HttpPost("tenant/{tenantId}/seed-preset")]
        public async Task<IActionResult> SeedPreset(Guid tenantId, [FromQuery] string presetType = "GPA4")
        {
            if (tenantId == Guid.Empty) return BadRequest(new { message = "Tenant ID is required." });

            List<GradingScale> presets = new List<GradingScale>();

            if (presetType == "GPA4")
            {
                presets = new List<GradingScale>
                {
                    new GradingScale { id = Guid.NewGuid(), tenant_id = tenantId, grade_name = "A+", min_percentage = 90, max_percentage = 100, gpa_point = 4.00m, remarks = "Outstanding", is_passing_grade = true, badge_color = "success", education_level = "General", created_at = DateTime.UtcNow },
                    new GradingScale { id = Guid.NewGuid(), tenant_id = tenantId, grade_name = "A", min_percentage = 80, max_percentage = 89.99m, gpa_point = 3.70m, remarks = "Excellent", is_passing_grade = true, badge_color = "primary", education_level = "General", created_at = DateTime.UtcNow },
                    new GradingScale { id = Guid.NewGuid(), tenant_id = tenantId, grade_name = "B", min_percentage = 70, max_percentage = 79.99m, gpa_point = 3.00m, remarks = "Very Good", is_passing_grade = true, badge_color = "info", education_level = "General", created_at = DateTime.UtcNow },
                    new GradingScale { id = Guid.NewGuid(), tenant_id = tenantId, grade_name = "C", min_percentage = 60, max_percentage = 69.99m, gpa_point = 2.00m, remarks = "Good", is_passing_grade = true, badge_color = "warning", education_level = "General", created_at = DateTime.UtcNow },
                    new GradingScale { id = Guid.NewGuid(), tenant_id = tenantId, grade_name = "D", min_percentage = 50, max_percentage = 59.99m, gpa_point = 1.00m, remarks = "Satisfactory", is_passing_grade = true, badge_color = "warning", education_level = "General", created_at = DateTime.UtcNow },
                    new GradingScale { id = Guid.NewGuid(), tenant_id = tenantId, grade_name = "F", min_percentage = 0, max_percentage = 49.99m, gpa_point = 0.00m, remarks = "Fail / Re-sit Required", is_passing_grade = false, badge_color = "error", education_level = "General", created_at = DateTime.UtcNow }
                };
            }
            else if (presetType == "CAMBRIDGE")
            {
                presets = new List<GradingScale>
                {
                    new GradingScale { id = Guid.NewGuid(), tenant_id = tenantId, grade_name = "A*", min_percentage = 90, max_percentage = 100, gpa_point = 4.00m, remarks = "Distinction", is_passing_grade = true, badge_color = "purple", education_level = "High School", created_at = DateTime.UtcNow },
                    new GradingScale { id = Guid.NewGuid(), tenant_id = tenantId, grade_name = "A", min_percentage = 80, max_percentage = 89.99m, gpa_point = 3.80m, remarks = "Excellent", is_passing_grade = true, badge_color = "success", education_level = "High School", created_at = DateTime.UtcNow },
                    new GradingScale { id = Guid.NewGuid(), tenant_id = tenantId, grade_name = "B", min_percentage = 70, max_percentage = 79.99m, gpa_point = 3.20m, remarks = "Very Good", is_passing_grade = true, badge_color = "primary", education_level = "High School", created_at = DateTime.UtcNow },
                    new GradingScale { id = Guid.NewGuid(), tenant_id = tenantId, grade_name = "C", min_percentage = 60, max_percentage = 69.99m, gpa_point = 2.50m, remarks = "Credit Pass", is_passing_grade = true, badge_color = "info", education_level = "High School", created_at = DateTime.UtcNow },
                    new GradingScale { id = Guid.NewGuid(), tenant_id = tenantId, grade_name = "D", min_percentage = 50, max_percentage = 59.99m, gpa_point = 1.80m, remarks = "Pass", is_passing_grade = true, badge_color = "warning", education_level = "High School", created_at = DateTime.UtcNow },
                    new GradingScale { id = Guid.NewGuid(), tenant_id = tenantId, grade_name = "U", min_percentage = 0, max_percentage = 49.99m, gpa_point = 0.00m, remarks = "Ungraded / Fail", is_passing_grade = false, badge_color = "error", education_level = "High School", created_at = DateTime.UtcNow }
                };
            }

            foreach (var preset in presets)
            {
                await _repository.AddAsync(preset);
            }
            await _repository.SaveChangesAsync();

            return Ok(new { message = $"Preset template '{presetType}' seeded successfully!", data = presets });
        }
    }
}