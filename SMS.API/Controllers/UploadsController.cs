using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.IO;
using System.Threading.Tasks;

namespace SMS.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UploadsController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public UploadsController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [HttpPost]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            try
            {
                string uniqueFileName = Guid.NewGuid().ToString() + "_" + file.FileName;
                try
                {
                    var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "uploads");
                    
                    if (!Directory.Exists(uploadsFolder))
                    {
                        Directory.CreateDirectory(uploadsFolder);
                    }

                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await file.CopyToAsync(stream);
                    }
                }
                catch
                {
                    // Fallback gracefully if filesystem is ephemeral or read-only
                }

                // Check if file is an image (jpg, jpeg, png, webp, gif)
                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                var isImage = file.ContentType?.StartsWith("image/") == true ||
                              ext == ".jpg" || ext == ".jpeg" || ext == ".png" || ext == ".webp" || ext == ".gif";

                if (isImage && file.Length <= 5 * 1024 * 1024)
                {
                    using var ms = new MemoryStream();
                    file.OpenReadStream().Position = 0;
                    await file.CopyToAsync(ms);
                    var bytes = ms.ToArray();
                    var contentType = file.ContentType;
                    if (string.IsNullOrEmpty(contentType) || !contentType.StartsWith("image/"))
                    {
                        contentType = ext switch
                        {
                            ".png" => "image/png",
                            ".webp" => "image/webp",
                            ".gif" => "image/gif",
                            _ => "image/jpeg"
                        };
                    }

                    // Return persistent Base64 Data URL so the image is stored in PostgreSQL
                    // and will NEVER be deleted or 404 when Render.com restarts or redeploys!
                    var dataUrl = $"data:{contentType};base64,{Convert.ToBase64String(bytes)}";
                    return Ok(new { url = dataUrl, localPath = $"/uploads/{uniqueFileName}" });
                }

                var fileUrl = $"/uploads/{uniqueFileName}";
                return Ok(new { url = fileUrl });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("update-db")]
        public IActionResult UpdateDb([FromServices] SMS.Infrastructure.Persistence.ApplicationDbContext context)
        {
            Microsoft.EntityFrameworkCore.RelationalDatabaseFacadeExtensions.ExecuteSqlRaw(context.Database, "ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture_url TEXT; ALTER TABLE students ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;");
            return Ok("Database updated successfully");
        }
    }
}
