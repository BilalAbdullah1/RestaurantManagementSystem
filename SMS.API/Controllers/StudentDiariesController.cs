using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SMS.Core.Entities;
using SMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class StudentDiariesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StudentDiariesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/studentdiaries/tenant/{tenantId}
        [HttpGet("tenant/{tenantId}")]
        public async Task<IActionResult> GetByTenant(Guid tenantId)
        {
            var list = await (from sd in _context.StudentDiaries.AsNoTracking()
                              where sd.tenant_id == tenantId
                              join st in _context.Students on sd.student_id equals st.id into stGroup
                              from st in stGroup.DefaultIfEmpty()
                              join c in _context.Classes on sd.class_id equals c.id into cGroup
                              from c in cGroup.DefaultIfEmpty()
                              join sec in _context.Sections on sd.section_id equals sec.id into secGroup
                              from sec in secGroup.DefaultIfEmpty()
                              select new
                              {
                                  sd.id,
                                  sd.tenant_id,
                                  sd.student_id,
                                  sd.class_id,
                                  sd.section_id,
                                  sd.date,
                                  sd.remarks,
                                  sd.homework_summary,
                                  sd.conduct,
                                  sd.created_by,
                                  sd.created_at,
                                  student_name = st != null ? $"{st.first_name} {st.last_name}" : "",
                                  admission_number = st != null ? st.admission_number : "",
                                  class_name = c != null ? c.name : "",
                                  section_name = sec != null ? sec.name : ""
                              }).ToListAsync();

            return Ok(list);
        }

        // POST: api/studentdiaries
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] StudentDiary diary)
        {
            diary.id = Guid.NewGuid();
            diary.created_at = DateTime.UtcNow;

            await _context.StudentDiaries.AddAsync(diary);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Diary note saved successfully.", data = diary });
        }

        public class BulkDiaryEntryDto
        {
            public Guid tenant_id { get; set; }
            public Guid class_id { get; set; }
            public Guid section_id { get; set; }
            public DateTime date { get; set; }
            public string remarks { get; set; } = string.Empty;
            public string? homework_summary { get; set; }
            public string? created_by { get; set; }
            public List<Guid> student_ids { get; set; } = new List<Guid>();
        }

        // POST: api/studentdiaries/bulk
        [HttpPost("bulk")]
        public async Task<IActionResult> BulkCreate([FromBody] BulkDiaryEntryDto dto)
        {
            if (dto.student_ids == null || dto.student_ids.Count == 0)
                return BadRequest(new { message = "No students selected." });

            var diaries = dto.student_ids.Select(stId => new StudentDiary
            {
                id = Guid.NewGuid(),
                tenant_id = dto.tenant_id,
                student_id = stId,
                class_id = dto.class_id,
                section_id = dto.section_id,
                date = dto.date,
                remarks = dto.remarks,
                homework_summary = dto.homework_summary,
                created_by = dto.created_by,
                created_at = DateTime.UtcNow
            }).ToList();

            await _context.StudentDiaries.AddRangeAsync(diaries);
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Diary notes published for {diaries.Count} students." });
        }

        // DELETE: api/studentdiaries/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var item = await _context.StudentDiaries.FindAsync(id);
            if (item == null) return NotFound(new { message = "Diary entry not found." });

            _context.StudentDiaries.Remove(item);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Diary entry removed." });
        }
    }
}
