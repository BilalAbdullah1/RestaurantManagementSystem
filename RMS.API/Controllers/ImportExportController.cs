using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RMS.Application.Interfaces;
using RMS.Infrastructure.Persistence;
using System;
using System.Threading.Tasks;

namespace RMS.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class ImportExportController : ControllerBase
    {
        private readonly IDataExportService _exportService;
        private readonly ApplicationDbContext _context;

        public ImportExportController(IDataExportService exportService, ApplicationDbContext context)
        {
            _exportService = exportService;
            _context = context;
        }

        [HttpGet("export/staff/{tenantId}")]
        public async Task<IActionResult> ExportStaff(Guid tenantId)
        {
            var fileBytes = await _exportService.ExportStaffToCsvAsync(tenantId);
            return File(fileBytes, "text/csv", $"Staff_Export_{DateTime.Now:yyyyMMdd_HHmmss}.csv");
        }
    }
}
