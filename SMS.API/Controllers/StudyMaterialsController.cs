using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SMS.Core.Entities;
using SMS.Infrastructure.Persistence;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class StudyMaterialsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StudyMaterialsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/studymaterials/tenant/{tenantId}
        [HttpGet("tenant/{tenantId}")]
        public async Task<IActionResult> GetByTenant(Guid tenantId)
        {
            var list = await (from sm in _context.StudyMaterials.AsNoTracking()
                              where sm.tenant_id == tenantId
                              join c in _context.Classes on sm.class_id equals c.id into cGroup
                              from c in cGroup.DefaultIfEmpty()
                              join s in _context.Subjects on sm.subject_id equals s.id into sGroup
                              from s in sGroup.DefaultIfEmpty()
                              select new
                              {
                                  sm.id,
                                  sm.tenant_id,
                                  sm.class_id,
                                  sm.subject_id,
                                  sm.title,
                                  sm.description,
                                  sm.material_type,
                                  sm.file_url,
                                  sm.video_url,
                                  sm.uploaded_by,
                                  sm.created_at,
                                  class_name = c != null ? c.name : "",
                                  subject_name = s != null ? s.name : ""
                              }).ToListAsync();

            return Ok(list);
        }

        // POST: api/studymaterials
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] StudyMaterial material)
        {
            material.id = Guid.NewGuid();
            material.created_at = DateTime.UtcNow;

            await _context.StudyMaterials.AddAsync(material);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Study material uploaded successfully.", data = material });
        }

        // DELETE: api/studymaterials/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var item = await _context.StudyMaterials.FindAsync(id);
            if (item == null) return NotFound(new { message = "Material not found." });

            _context.StudyMaterials.Remove(item);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Study material removed." });
        }
    }
}
