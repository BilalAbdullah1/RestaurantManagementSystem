using Microsoft.AspNetCore.Mvc;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using SMS.Infrastructure.Services;
using System;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HolidaysController : ControllerBase
    {
        private readonly IHolidayRepository _repository;
        private readonly ITenantProvider _tenantProvider;

        public HolidaysController(IHolidayRepository repository, ITenantProvider tenantProvider)
        {
            _repository = repository;
            _tenantProvider = tenantProvider;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var holidays = await _repository.GetAllHolidaysAsync();
            return Ok(holidays);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var holiday = await _repository.GetHolidayByIdAsync(id);
            if (holiday == null) return NotFound();
            return Ok(holiday);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Holiday holiday)
        {
            holiday.tenant_id = _tenantProvider.GetTenantId();
            var created = await _repository.AddHolidayAsync(holiday);
            return CreatedAtAction(nameof(GetById), new { id = created.id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Holiday holiday)
        {
            if (id != holiday.id) return BadRequest();
            var existing = await _repository.GetHolidayByIdAsync(id);
            if (existing == null) return NotFound();

            existing.name = holiday.name;
            existing.start_date = holiday.start_date;
            existing.end_date = holiday.end_date;
            existing.is_active = holiday.is_active;

            await _repository.UpdateHolidayAsync(existing);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _repository.DeleteHolidayAsync(id);
            if (!result) return NotFound();
            return NoContent();
        }
    }
}
