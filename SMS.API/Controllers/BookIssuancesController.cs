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
    public class BookIssuancesController : ControllerBase
    {
        private readonly IBookIssuanceRepository _issuanceRepo;
        private readonly ILibraryBookRepository _bookRepo;

        public BookIssuancesController(IBookIssuanceRepository issuanceRepo, ILibraryBookRepository bookRepo)
        {
            _issuanceRepo = issuanceRepo;
            _bookRepo = bookRepo;
        }

        [HttpGet("tenant/{tenantId}")]
        public async Task<ActionResult<IEnumerable<BookIssuance>>> GetByTenant(Guid tenantId) =>
            Ok(await _issuanceRepo.GetByTenantAsync(tenantId));

        [HttpGet("{id}")]
        public async Task<ActionResult<BookIssuance>> GetById(Guid id)
        {
            var issuance = await _issuanceRepo.GetByIdAsync(id);
            if (issuance == null) return NotFound(new { message = "Book issuance record not found" });
            return Ok(issuance);
        }

        [HttpGet("student/{tenantId}/{studentId}")]
        public async Task<ActionResult<IEnumerable<BookIssuance>>> GetByStudent(Guid tenantId, Guid studentId) =>
            Ok(await _issuanceRepo.GetByStudentAsync(tenantId, studentId));

        [HttpGet("staff/{tenantId}/{staffId}")]
        public async Task<ActionResult<IEnumerable<BookIssuance>>> GetByStaff(Guid tenantId, Guid staffId) =>
            Ok(await _issuanceRepo.GetByStaffAsync(tenantId, staffId));

        [HttpGet("overdue/{tenantId}")]
        public async Task<ActionResult<IEnumerable<BookIssuance>>> GetOverdue(Guid tenantId) =>
            Ok(await _issuanceRepo.GetOverdueAsync(tenantId));

        [HttpGet("book/{tenantId}/{bookId}")]
        public async Task<ActionResult<IEnumerable<BookIssuance>>> GetByBook(Guid tenantId, Guid bookId) =>
            Ok(await _issuanceRepo.GetByBookAsync(tenantId, bookId));

        [HttpPost]
        public async Task<ActionResult<BookIssuance>> Create(BookIssuance issuance)
        {
            var book = await _bookRepo.GetByIdAsync(issuance.book_id);
            if (book == null) return NotFound(new { message = "Book not found" });

            if (book.available_copies <= 0)
                return BadRequest(new { message = "No copies available for this book." });

            // Decrease available copies
            book.available_copies -= 1;
            _bookRepo.Update(book);

            issuance.id = Guid.NewGuid();
            issuance.status = "Issued";
            issuance.created_at = DateTime.UtcNow;

            await _issuanceRepo.AddAsync(issuance);
            await _issuanceRepo.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = issuance.id }, issuance);
        }

        [HttpPut("{id}/return")]
        public async Task<IActionResult> ReturnBook(Guid id, [FromBody] BookIssuance returnData)
        {
            var issuance = await _issuanceRepo.GetByIdAsync(id);
            if (issuance == null) return NotFound(new { message = "Book issuance record not found" });

            if (issuance.status == "Returned")
                return BadRequest(new { message = "This book has already been returned." });

            // Increase available copies
            var book = await _bookRepo.GetByIdAsync(issuance.book_id);
            if (book != null)
            {
                book.available_copies += 1;
                _bookRepo.Update(book);
            }

            issuance.return_date = returnData.return_date ?? DateTime.UtcNow;
            issuance.status = "Returned";
            issuance.fine_amount = returnData.fine_amount;
            issuance.remarks = returnData.remarks;

            _issuanceRepo.Update(issuance);
            await _issuanceRepo.SaveChangesAsync();

            return Ok(new { message = "Book returned successfully", data = issuance });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var existing = await _issuanceRepo.GetByIdAsync(id);
            if (existing == null) return NotFound(new { message = "Book issuance record not found" });

            await _issuanceRepo.DeleteAsync(id);
            await _issuanceRepo.SaveChangesAsync();

            return Ok(new { message = "Book issuance record deleted successfully" });
        }
    }
}
