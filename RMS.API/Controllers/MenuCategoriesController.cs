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
    public class MenuCategoriesController : ControllerBase
    {
        private readonly IApplicationDbContext _context;

        public MenuCategoriesController(IApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _context.MenuCategories
                .Where(c => c.is_active)
                .OrderBy(c => c.display_order)
                .ThenBy(c => c.name)
                .ToListAsync();

            return Ok(categories);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Category model)
        {
            if (string.IsNullOrWhiteSpace(model.name))
                return BadRequest(new { message = "Category name is required" });

            model.id = Guid.NewGuid();
            model.created_at = DateTime.UtcNow;
            _context.MenuCategories.Add(model);
            await _context.SaveChangesAsync();

            return Ok(model);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] Category model)
        {
            var category = await _context.MenuCategories.FindAsync(id);
            if (category == null) return NotFound(new { message = "Category not found" });

            category.name = model.name;
            category.description = model.description;
            category.icon_name = model.icon_name;
            category.display_order = model.display_order;
            category.is_active = model.is_active;

            await _context.SaveChangesAsync();
            return Ok(category);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var category = await _context.MenuCategories.FindAsync(id);
            if (category == null) return NotFound(new { message = "Category not found" });

            category.is_active = false;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Category deactivated" });
        }
    }
}
