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
    public class MenuItemsController : ControllerBase
    {
        private readonly IApplicationDbContext _context;

        public MenuItemsController(IApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] Guid? categoryId)
        {
            var query = _context.MenuItems
                .Include(m => m.Category)
                .AsQueryable();

            if (categoryId.HasValue && categoryId != Guid.Empty)
            {
                query = query.Where(m => m.category_id == categoryId.Value);
            }

            var items = await query
                .OrderBy(m => m.name)
                .ToListAsync();

            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var item = await _context.MenuItems
                .Include(m => m.Category)
                .FirstOrDefaultAsync(m => m.id == id);

            if (item == null) return NotFound(new { message = "Menu item not found" });
            return Ok(item);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] MenuItem model)
        {
            if (string.IsNullOrWhiteSpace(model.name))
                return BadRequest(new { message = "Dish name is required" });

            model.id = Guid.NewGuid();
            model.created_at = DateTime.UtcNow;
            _context.MenuItems.Add(model);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = model.id }, model);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] MenuItem model)
        {
            var item = await _context.MenuItems.FindAsync(id);
            if (item == null) return NotFound(new { message = "Menu item not found" });

            item.name = model.name;
            item.description = model.description;
            item.category_id = model.category_id;
            item.selling_price = model.selling_price;
            item.cost_price = model.cost_price;
            item.dietary_type = model.dietary_type;
            item.preparation_time_minutes = model.preparation_time_minutes;
            item.calories = model.calories;
            item.image_url = model.image_url;
            item.is_available = model.is_available;

            await _context.SaveChangesAsync();
            return Ok(item);
        }

        [HttpPatch("{id}/availability")]
        public async Task<IActionResult> ToggleAvailability(Guid id)
        {
            var item = await _context.MenuItems.FindAsync(id);
            if (item == null) return NotFound(new { message = "Menu item not found" });

            item.is_available = !item.is_available;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Availability updated", is_available = item.is_available });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var item = await _context.MenuItems.FindAsync(id);
            if (item == null) return NotFound(new { message = "Menu item not found" });

            _context.MenuItems.Remove(item);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Menu item removed" });
        }
    }
}
