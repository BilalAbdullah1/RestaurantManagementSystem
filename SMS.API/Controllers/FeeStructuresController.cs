using Microsoft.AspNetCore.Mvc;
using SMS.Application.DTOs;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using System;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FeeStructuresController : ControllerBase
    {
        private readonly IFeeStructureRepository _repository;

        public FeeStructuresController(IFeeStructureRepository repository)
        {
            _repository = repository;
        }

        // GET: api/feestructures/tenant/{tenantId}/year/{academicYearId}
        [HttpGet("tenant/{tenantId}/year/{academicYearId}")]
        public async Task<IActionResult> GetByYear(Guid tenantId, Guid academicYearId)
        {
            if (tenantId == Guid.Empty || academicYearId == Guid.Empty) 
                return BadRequest(new { message = "Tenant ID and Academic Year ID are required." });

            var structures = await _repository.GetByAcademicYearAsync(tenantId, academicYearId);
            return Ok(structures);
        }

        // POST: api/feestructures
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateFeeStructureDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            if (dto.tenant_id == Guid.Empty || dto.academic_year_id == Guid.Empty || dto.class_id == Guid.Empty || dto.fee_type_id == Guid.Empty)
            {
                return BadRequest(new { message = "Please select target Academic Year, Class, and Fee Head." });
            }

            var categoryName = string.IsNullOrWhiteSpace(dto.category) ? "Normal" : dto.category;

            // Check if existing entry exists for this class + fee type + category
            var existing = await _repository.GetByAcademicYearAsync(dto.tenant_id, dto.academic_year_id);
            var matchingRecord = existing.FirstOrDefault(fs => fs.class_id == dto.class_id && fs.fee_type_id == dto.fee_type_id && (fs.category ?? "Normal") == categoryName);

            if (matchingRecord != null)
            {
                var recordToUpdate = await _repository.GetByIdAsync(matchingRecord.id);
                if (recordToUpdate != null)
                {
                    recordToUpdate.amount = dto.amount;
                    recordToUpdate.category = categoryName;
                    _repository.Update(recordToUpdate);
                    await _repository.SaveChangesAsync();
                    return Ok(new { message = "Fee Structure updated successfully.", data = recordToUpdate });
                }
            }

            var feeStructure = new FeeStructure
            {
                id = Guid.NewGuid(),
                tenant_id = dto.tenant_id,
                academic_year_id = dto.academic_year_id,
                class_id = dto.class_id,
                fee_type_id = dto.fee_type_id,
                category = categoryName,
                amount = dto.amount,
                created_at = DateTime.UtcNow
            };

            await _repository.AddAsync(feeStructure);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Fee Structure saved successfully.", data = feeStructure });
        }

        // PUT: api/feestructures/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFeeStructureDto dto)
        {
            var feeStructure = await _repository.GetByIdAsync(id);
            if (feeStructure == null) return NotFound(new { message = "Fee Structure not found." });

            feeStructure.amount = dto.amount;
            if (!string.IsNullOrEmpty(dto.category))
            {
                feeStructure.category = dto.category;
            }

            _repository.Update(feeStructure);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Fee amount updated successfully.", data = feeStructure });
        }

        // DELETE: api/feestructures/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var feeStructure = await _repository.GetByIdAsync(id);
            if (feeStructure == null) return NotFound(new { message = "Fee Structure not found." });

            _repository.Delete(feeStructure);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Fee Structure deleted successfully." });
        }
    }
}