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
    public class FeeConcessionsController : ControllerBase
    {
        private readonly IFeeConcessionRepository _repository;

        public FeeConcessionsController(IFeeConcessionRepository repository)
        {
            _repository = repository;
        }

        // GET: api/feeconcessions/tenant/{tenantId}
        [HttpGet("tenant/{tenantId}")]
        public async Task<IActionResult> GetAll(Guid tenantId)
        {
            if (tenantId == Guid.Empty) 
                return BadRequest(new { message = "Tenant ID is required." });

            var concessions = await _repository.GetAllAsync(tenantId);
            return Ok(concessions);
        }

        // POST: api/feeconcessions
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateFeeConcessionDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            // Duplicate check: Ek bache ko ek hi fee par multiple discounts assign na hon
            bool isDuplicate = await _repository.IsDuplicateAsync(dto.student_id, dto.fee_type_id);
            if (isDuplicate)
            {
                return BadRequest(new { message = "This student already has an active discount for the selected Fee Type." });
            }

            var concession = new FeeConcession
            {
                id = Guid.NewGuid(),
                tenant_id = dto.tenant_id,
                student_id = dto.student_id,
                fee_type_id = dto.fee_type_id,
                name = dto.name,
                discount_type = dto.discount_type,
                discount_value = dto.discount_value,
                is_active = true,
                created_at = DateTime.UtcNow
            };

            await _repository.AddAsync(concession);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Fee Concession assigned successfully.", data = concession });
        }

        // PUT: api/feeconcessions/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFeeConcessionDto dto)
        {
            var concession = await _repository.GetByIdAsync(id);
            if (concession == null) return NotFound(new { message = "Concession record not found." });

            concession.name = dto.name;
            concession.discount_type = dto.discount_type;
            concession.discount_value = dto.discount_value;
            concession.is_active = dto.is_active;

            _repository.Update(concession);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Fee Concession updated successfully.", data = concession });
        }

        // DELETE: api/feeconcessions/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var concession = await _repository.GetByIdAsync(id);
            if (concession == null) return NotFound(new { message = "Concession record not found." });

            _repository.Delete(concession);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Fee Concession deleted successfully." });
        }
    }
}