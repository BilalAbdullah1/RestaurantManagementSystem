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
    public class StudentSubjectsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public StudentSubjectsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/studentsubjects/student/{studentId}
        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetByStudent(Guid studentId)
        {
            var list = await (from ss in _context.StudentSubjects.AsNoTracking()
                              where ss.student_id == studentId
                              join s in _context.Subjects on ss.subject_id equals s.id into sGroup
                              from s in sGroup.DefaultIfEmpty()
                              select new
                              {
                                  ss.id,
                                  ss.tenant_id,
                                  ss.student_id,
                                  ss.class_id,
                                  ss.subject_id,
                                  ss.is_elective,
                                  subject_name = s != null ? s.name : "",
                                  subject_code = s != null ? s.code : ""
                              }).ToListAsync();
            return Ok(list);
        }

        // GET: api/studentsubjects/class/{classId}
        [HttpGet("class/{classId}")]
        public async Task<IActionResult> GetByClass(Guid classId)
        {
            var list = await _context.StudentSubjects.AsNoTracking()
                .Where(ss => ss.class_id == classId)
                .ToListAsync();
            return Ok(list);
        }

        public class BulkAssignStudentSubjectsDto
        {
            public Guid tenant_id { get; set; }
            public Guid student_id { get; set; }
            public Guid class_id { get; set; }
            public List<Guid> subject_ids { get; set; } = new List<Guid>();
        }

        // POST: api/studentsubjects/bulk-assign
        [HttpPost("bulk-assign")]
        public async Task<IActionResult> BulkAssign([FromBody] BulkAssignStudentSubjectsDto dto)
        {
            var existing = await _context.StudentSubjects
                .Where(ss => ss.student_id == dto.student_id && ss.class_id == dto.class_id)
                .ToListAsync();

            _context.StudentSubjects.RemoveRange(existing);

            var subjects = await _context.Subjects.AsNoTracking()
                .Where(s => dto.subject_ids.Contains(s.id))
                .ToListAsync();

            var newAllocations = dto.subject_ids.Select(subId => {
                var sub = subjects.FirstOrDefault(s => s.id == subId);
                return new StudentSubject
                {
                    id = Guid.NewGuid(),
                    tenant_id = dto.tenant_id,
                    student_id = dto.student_id,
                    class_id = dto.class_id,
                    subject_id = subId,
                    is_elective = sub?.is_elective ?? false,
                    created_at = DateTime.UtcNow
                };
            }).ToList();

            await _context.StudentSubjects.AddRangeAsync(newAllocations);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Subject allocations updated successfully.", count = newAllocations.Count });
        }
    }
}
