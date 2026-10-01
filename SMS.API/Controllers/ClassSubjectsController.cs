using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    //[Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ClassSubjectsController : ControllerBase
    {
        private readonly IClassSubjectRepository _repository;
        public ClassSubjectsController(IClassSubjectRepository repository) => _repository = repository;

        // 1. VIEW ASSIGNMENTS BY CLASS
        [HttpGet("class/{classId}")]
        public async Task<ActionResult<IEnumerable<ClassSubject>>> GetByClass(Guid classId) =>
            Ok(await _repository.GetByClassAsync(classId));

        // 2. ASSIGN SUBJECT TO CLASS
        [HttpPost]
        public async Task<ActionResult<ClassSubject>> AssignSubjectToClass(ClassSubject classSubject)
        {
            classSubject.id = Guid.NewGuid();
            await _repository.AddAsync(classSubject);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Subject successfully assigned to class", data = classSubject });
        }

        // 3. REMOVE SUBJECT FROM CLASS
        [HttpDelete("{id}")]
        public async Task<IActionResult> UnassignSubject(Guid id)
        {
            var mapping = await _repository.GetByIdAsync(id);
            if (mapping == null) return NotFound(new { message = "Assignment not found" });

            _repository.Remove(mapping);
            await _repository.SaveChangesAsync();
            return Ok(new { message = "Subject successfully unassigned from class" });
        }
    }
}