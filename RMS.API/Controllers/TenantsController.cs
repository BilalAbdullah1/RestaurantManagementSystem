using Microsoft.AspNetCore.Mvc;
using RMS.Application.Repositories;
using RMS.Core.Entities;
using System;
using System.IO;
using System.Threading.Tasks;

namespace RMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TenantsController : ControllerBase
    {
        private readonly ITenantRepository _repository;
        private readonly RMS.Infrastructure.Persistence.ApplicationDbContext _context;
        private const string LogoUploadPath = "wwwroot/uploads/logos";

        public TenantsController(ITenantRepository repository, RMS.Infrastructure.Persistence.ApplicationDbContext context)
        {
            _repository = repository;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Tenant>>> GetTenants() =>
            Ok(await _repository.GetAllAsync());

        [HttpGet("current-branding")]
        public async Task<IActionResult> GetCurrentBranding([FromServices] RMS.Infrastructure.Services.ITenantProvider tenantProvider)
        {
            var tenantId = tenantProvider.GetTenantId();
            if (tenantId == Guid.Empty)
            {
                return Ok(new { is_custom = false });
            }

            var tenant = await _repository.GetByIdAsync(tenantId);
            if (tenant == null)
            {
                return Ok(new { is_custom = false });
            }

            return Ok(new
            {
                is_custom = true,
                school_name = tenant.school_name,
                logo_url = tenant.logo_url,
                primary_color = tenant.primary_color,
                login_background_url = tenant.login_background_url
            });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Tenant>> GetTenant(Guid id)
        {
            var tenant = await _repository.GetByIdAsync(id);
            return tenant is null 
                ? NotFound(new { message = "School/Tenant not found" }) 
                : Ok(tenant);
        }

        [HttpPost]
        public async Task<ActionResult<Tenant>> CreateTenant([FromForm] Tenant tenant, IFormFile? logo)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            tenant.id = Guid.NewGuid();
            tenant.created_at = DateTimeOffset.UtcNow;
            tenant.is_active = true;

            await HandleLogoUpload(tenant, logo);

            await _repository.AddAsync(tenant);
            await _repository.SaveChangesAsync();

            // Automatically seed default roles and Chart of Accounts for this new School / Tenant
            try
            {
                await DatabaseSeeder.SeedTenantDefaultsAsync(_context, tenant.id);
            }
            catch
            {
                // Fallback gracefully if already seeded
            }

            return CreatedAtAction(nameof(GetTenant), new { id = tenant.id }, tenant);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTenant(Guid id, [FromForm] Tenant tenant, IFormFile? logo)
        {
            if (id != tenant.id)
                return BadRequest(new { message = "ID mismatch" });

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existing = await _repository.GetByIdAsync(id);
            if (existing == null)
                return NotFound(new { message = "School/Tenant not found" });

            tenant.created_at = existing.created_at;

            if (logo != null && logo.Length > 0)
            {
                await HandleLogoUpload(tenant, logo);
            }
            else
            {
                tenant.logo_url = existing.logo_url;
            }

            _repository.Update(tenant);
            await _repository.SaveChangesAsync();

            return Ok(new { message = "School settings updated successfully!" });
        }

        // ✅ Deactivate / Activate Toggle (Simple)
        [HttpPatch("{id}/toggle-status")]
        public async Task<IActionResult> ToggleStatus(Guid id)
        {
            var tenant = await _repository.GetByIdAsync(id);
            if (tenant == null)
                return NotFound(new { message = "School/Tenant not found" });

            tenant.is_active = !tenant.is_active;   // Toggle karega

            _repository.Update(tenant);
            await _repository.SaveChangesAsync();

            var status = tenant.is_active ? "Activated" : "Deactivated";

            return Ok(new { message = $"School {status} successfully!" });
        }

        [HttpPost("{id}/upload-logo")]
        public async Task<IActionResult> UploadLogo(Guid id, IFormFile logo)
        {
            if (logo == null || logo.Length == 0)
                return BadRequest(new { message = "No image file provided." });

            var tenant = await _repository.GetByIdAsync(id);
            if (tenant == null)
                return NotFound(new { message = "School/Tenant not found." });

            try
            {
                await HandleLogoUpload(tenant, logo);
                _repository.Update(tenant);
                await _repository.SaveChangesAsync();

                return Ok(new { logo_url = tenant.logo_url, message = "Logo updated successfully!" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error during logo upload.", error = ex.Message });
            }
        }

        private async Task HandleLogoUpload(Tenant tenant, IFormFile? logo)
        {
            if (logo == null || logo.Length == 0) return;

            if (!IsValidImage(logo))
                throw new InvalidOperationException("Only image files (jpg, jpeg, png, webp) are allowed.");

            const long maxSize = 5 * 1024 * 1024;
            if (logo.Length > maxSize)
                throw new InvalidOperationException("Logo file size must not exceed 5MB.");

            try
            {
                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), LogoUploadPath);
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                }

                var uniqueFileName = $"{tenant.id}_{Guid.NewGuid()}{Path.GetExtension(logo.FileName).ToLowerInvariant()}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                await using var stream = new FileStream(filePath, FileMode.Create);
                await logo.CopyToAsync(stream);
            }
            catch
            {
                // Ignore local file write failures on read-only/ephemeral container environments
            }

            // Convert to Base64 data URL so the logo is permanently saved inside PostgreSQL
            // and will NEVER be deleted by Render.com ephemeral container restarts!
            using var ms = new MemoryStream();
            logo.OpenReadStream().Position = 0;
            await logo.CopyToAsync(ms);
            var bytes = ms.ToArray();
            var ext = Path.GetExtension(logo.FileName).ToLowerInvariant();
            var contentType = ext switch
            {
                ".png" => "image/png",
                ".webp" => "image/webp",
                _ => "image/jpeg"
            };
            tenant.logo_url = $"data:{contentType};base64,{Convert.ToBase64String(bytes)}";
        }

        private static bool IsValidImage(IFormFile file)
        {
            var allowed = new[] { ".jpg", ".jpeg", ".png", ".webp" };
            var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
            return allowed.Contains(ext);
        }
    }
}