using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RMS.Application.Interfaces;
using RMS.Core.Entities;
using System;
using System.Threading.Tasks;

namespace RMS.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class DiningTablesController : ControllerBase
    {
        private readonly IApplicationDbContext _context;

        public DiningTablesController(IApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tables = await _context.DiningTables
                .OrderBy(t => t.floor_zone)
                .ThenBy(t => t.table_number)
                .ToListAsync();

            return Ok(tables);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var table = await _context.DiningTables.FindAsync(id);
            if (table == null) return NotFound(new { message = "Table not found" });
            return Ok(table);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] DiningTable model)
        {
            if (string.IsNullOrWhiteSpace(model.table_number))
                return BadRequest(new { message = "Table number is required" });

            model.id = Guid.NewGuid();
            model.created_at = DateTime.UtcNow;
            _context.DiningTables.Add(model);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = model.id }, model);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] DiningTable model)
        {
            var table = await _context.DiningTables.FindAsync(id);
            if (table == null) return NotFound(new { message = "Table not found" });

            table.table_number = model.table_number;
            table.floor_zone = model.floor_zone;
            table.seating_capacity = model.seating_capacity;
            table.status = model.status;
            table.qr_code_url = model.qr_code_url;

            await _context.SaveChangesAsync();
            return Ok(table);
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] string status)
        {
            var table = await _context.DiningTables.FindAsync(id);
            if (table == null) return NotFound(new { message = "Table not found" });

            table.status = status;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Table status updated", status = table.status });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var table = await _context.DiningTables.FindAsync(id);
            if (table == null) return NotFound(new { message = "Table not found" });

            _context.DiningTables.Remove(table);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Table deleted successfully" });
        }
    }
}
