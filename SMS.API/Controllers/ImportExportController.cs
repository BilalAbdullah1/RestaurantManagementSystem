using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SMS.Application.Interfaces;
using SMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
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

        [HttpGet("export/students/{tenantId}")]
        public async Task<IActionResult> ExportStudents(Guid tenantId)
        {
            var fileBytes = await _exportService.ExportStudentsToCsvAsync(tenantId);
            return File(fileBytes, "text/csv", $"Students_Export_{DateTime.Now:yyyyMMdd_HHmmss}.csv");
        }

        [HttpGet("export/staff/{tenantId}")]
        public async Task<IActionResult> ExportStaff(Guid tenantId)
        {
            var fileBytes = await _exportService.ExportStaffToCsvAsync(tenantId);
            return File(fileBytes, "text/csv", $"Staff_Export_{DateTime.Now:yyyyMMdd_HHmmss}.csv");
        }

        [HttpPost("import/students/{tenantId}")]
        public async Task<IActionResult> ImportStudents(Guid tenantId, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "No file uploaded." });

            if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { message = "Only CSV files are supported for import." });

            try
            {
                using var stream = new StreamReader(file.OpenReadStream());
                var content = await stream.ReadToEndAsync();
                var lines = content.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.RemoveEmptyEntries);

                if (lines.Length <= 1)
                {
                    return BadRequest(new { message = "CSV file is empty or missing data rows." });
                }

                // Parse headers
                var headers = ParseCsvRow(lines[0]);
                var colMap = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
                for (int i = 0; i < headers.Count; i++)
                {
                    var key = headers[i].Trim().Replace(" ", "").Replace("-", "").Replace("_", "").ToLower();
                    if (!colMap.ContainsKey(key))
                        colMap[key] = i;
                }

                var existingStudents = await _context.Students
                    .Where(s => s.tenant_id == tenantId)
                    .ToListAsync();

                int importedCount = 0;
                int updatedCount = 0;

                for (int i = 1; i < lines.Length; i++)
                {
                    var row = ParseCsvRow(lines[i]);
                    if (row.Count == 0 || row.All(string.IsNullOrWhiteSpace)) continue;

                    string GetVal(params string[] keys)
                    {
                        foreach (var k in keys)
                        {
                            var cleanKey = k.Replace(" ", "").Replace("-", "").Replace("_", "").ToLower();
                            if (colMap.TryGetValue(cleanKey, out var index) && index < row.Count)
                            {
                                return row[index].Trim();
                            }
                        }
                        return string.Empty;
                    }

                    var admNo = GetVal("admissionnumber", "admissionno", "grnumber", "grno", "admno");
                    var firstName = GetVal("firstname", "first_name", "studentname", "name");
                    var lastName = GetVal("lastname", "last_name");
                    var gender = GetVal("gender");
                    var dobStr = GetVal("dateofbirth", "dob");
                    var bform = GetVal("bformnumber", "bform", "nationalid", "cnic");
                    var fatherName = GetVal("fathername", "father_name", "guardianname");
                    var fatherCnic = GetVal("fathercnic", "father_cnic");
                    var phone = GetVal("guardianphone", "phone", "phonenumber", "mobile");
                    var address = GetVal("address");
                    var statusStr = GetVal("status", "isactive");

                    if (string.IsNullOrEmpty(lastName) && firstName.Contains(" "))
                    {
                        var parts = firstName.Split(' ', 2);
                        firstName = parts[0];
                        lastName = parts[1];
                    }

                    if (string.IsNullOrEmpty(firstName))
                        continue;

                    DateTime dob = DateTime.UtcNow.AddYears(-10);
                    if (!string.IsNullOrEmpty(dobStr) && DateTime.TryParse(dobStr, out var parsedDob))
                    {
                        dob = parsedDob.ToUniversalTime();
                    }

                    bool isActive = true;
                    if (!string.IsNullOrEmpty(statusStr) && (statusStr.Equals("Inactive", StringComparison.OrdinalIgnoreCase) || statusStr.Equals("false", StringComparison.OrdinalIgnoreCase) || statusStr == "0"))
                    {
                        isActive = false;
                    }

                    var existing = existingStudents.FirstOrDefault(s =>
                        (!string.IsNullOrEmpty(admNo) && s.admission_number.Equals(admNo, StringComparison.OrdinalIgnoreCase)) ||
                        (!string.IsNullOrEmpty(bform) && s.b_form_number.Equals(bform, StringComparison.OrdinalIgnoreCase))
                    );

                    if (existing != null)
                    {
                        if (!string.IsNullOrEmpty(firstName)) existing.first_name = firstName;
                        if (!string.IsNullOrEmpty(lastName)) existing.last_name = lastName;
                        if (!string.IsNullOrEmpty(gender)) existing.gender = gender;
                        if (!string.IsNullOrEmpty(fatherName)) existing.father_name = fatherName;
                        if (!string.IsNullOrEmpty(fatherCnic)) existing.father_cnic = fatherCnic;
                        if (!string.IsNullOrEmpty(phone)) existing.guardian_phone = phone;
                        if (!string.IsNullOrEmpty(bform)) existing.b_form_number = bform;
                        if (!string.IsNullOrEmpty(address)) existing.address = address;
                        existing.is_active = isActive;
                        updatedCount++;
                    }
                    else
                    {
                        if (string.IsNullOrEmpty(admNo))
                        {
                            admNo = $"GR-{DateTime.UtcNow.Year}-" + (existingStudents.Count + importedCount + 1).ToString("D3");
                        }

                        var newStudent = new SMS.Core.Entities.Student
                        {
                            id = Guid.NewGuid(),
                            tenant_id = tenantId,
                            admission_number = admNo,
                            first_name = firstName,
                            last_name = lastName,
                            gender = string.IsNullOrEmpty(gender) ? "Male" : gender,
                            date_of_birth = dob,
                            admission_date = DateTime.UtcNow,
                            b_form_number = bform,
                            father_name = fatherName,
                            father_cnic = fatherCnic,
                            guardian_phone = phone,
                            address = address,
                            is_active = isActive,
                            created_at = DateTime.UtcNow
                        };

                        _context.Students.Add(newStudent);
                        importedCount++;
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new { message = $"CSV Import successful! Added {importedCount} new student(s) and updated {updatedCount} existing student(s)." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error processing CSV file.", details = ex.Message });
            }
        }

        private static List<string> ParseCsvRow(string line)
        {
            var result = new List<string>();
            if (string.IsNullOrEmpty(line)) return result;

            bool inQuotes = false;
            var currentField = new System.Text.StringBuilder();

            for (int i = 0; i < line.Length; i++)
            {
                char c = line[i];
                if (c == '"')
                {
                    if (inQuotes && i + 1 < line.Length && line[i + 1] == '"')
                    {
                        currentField.Append('"');
                        i++;
                    }
                    else
                    {
                        inQuotes = !inQuotes;
                    }
                }
                else if (c == ',' && !inQuotes)
                {
                    result.Add(currentField.ToString());
                    currentField.Clear();
                }
                else
                {
                    currentField.Append(c);
                }
            }
            result.Add(currentField.ToString());
            return result;
        }
    }
}
