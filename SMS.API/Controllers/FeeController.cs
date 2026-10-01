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
    public class FeeTypesController : ControllerBase
    {
        private readonly IFeeTypeRepository _repository;

        public FeeTypesController(IFeeTypeRepository repository)
        {
            _repository = repository;
        }

        // GET: api/feetypes/tenant/{tenantId}
        [HttpGet("tenant/{tenantId}")]
        public async Task<IActionResult> GetAll(Guid tenantId)
        {
            if (tenantId == Guid.Empty) return BadRequest(new { message = "Tenant ID is required." });

            var feeTypes = await _repository.GetAllAsync(tenantId);
            return Ok(feeTypes);
        }

        // POST: api/feetypes
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateFeeTypeDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var feeType = new FeeType
            {
                id = Guid.NewGuid(),
                tenant_id = dto.tenant_id,
                name = dto.name,
                description = dto.description,
                frequency = dto.frequency,
                is_active = true,
                created_at = DateTime.UtcNow
            };

            await _repository.AddAsync(feeType);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Fee Type created successfully.", data = feeType });
        }

        // PUT: api/feetypes/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFeeTypeDto dto)
        {
            var feeType = await _repository.GetByIdAsync(id);
            if (feeType == null) return NotFound(new { message = "Fee Type not found." });

            feeType.name = dto.name;
            feeType.description = dto.description;
            feeType.frequency = dto.frequency;
            feeType.is_active = dto.is_active;

            _repository.Update(feeType);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Fee Type updated successfully.", data = feeType });
        }

        // DELETE: api/feetypes/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var feeType = await _repository.GetByIdAsync(id);
            if (feeType == null) return NotFound(new { message = "Fee Type not found." });

            _repository.Delete(feeType);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Fee Type deleted successfully." });
        }
    }
}