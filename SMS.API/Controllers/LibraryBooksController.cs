using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class LibraryBooksController : ControllerBase
    {
        private readonly ILibraryBookRepository _repository;
        public LibraryBooksController(ILibraryBookRepository repository) => _repository = repository;

        [HttpGet("tenant/{tenantId}")]
        public async Task<ActionResult<IEnumerable<LibraryBook>>> GetByTenant(Guid tenantId) =>
            Ok(await _repository.GetByTenantAsync(tenantId));

        [HttpGet("{id}")]
        public async Task<ActionResult<LibraryBook>> GetById(Guid id)
        {
            var book = await _repository.GetByIdAsync(id);
            if (book == null) return NotFound(new { message = "Library book not found" });
            return Ok(book);
        }

        [HttpGet("search/{tenantId}")]
        public async Task<ActionResult<IEnumerable<LibraryBook>>> Search(Guid tenantId, [FromQuery] string keyword) =>
            Ok(await _repository.SearchAsync(tenantId, keyword));

        [HttpPost]
        public async Task<ActionResult<LibraryBook>> Create(LibraryBook book)
        {
            if (!string.IsNullOrEmpty(book.isbn) && await _repository.ExistsIsbnAsync(book.tenant_id, book.isbn))
                return BadRequest(new { message = $"A book with ISBN '{book.isbn}' already exists." });

            book.id = Guid.NewGuid();
            book.available_copies = book.total_copies;
            book.created_at = DateTime.UtcNow;

            await _repository.AddAsync(book);
            await _repository.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = book.id }, book);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, LibraryBook book)
        {
            if (id != book.id) return BadRequest(new { message = "Identity mismatch in update parameters" });

            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = "Library book not found" });

            if (!string.IsNullOrEmpty(book.isbn) && await _repository.ExistsIsbnAsync(book.tenant_id, book.isbn, excludeId: id))
                return BadRequest(new { message = $"A book with ISBN '{book.isbn}' already exists." });

            book.created_at = existing.created_at;
            _repository.Update(book);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Library book updated successfully", data = book });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existing = await _repository.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = "Library book not found" });

            await _repository.DeleteAsync(id);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "Library book deleted successfully" });
        }
    }
}
