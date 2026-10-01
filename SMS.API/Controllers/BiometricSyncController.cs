using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SMS.Application.Interfaces;
using SMS.Core.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    public class BiometricSyncPayloadDto
    {
        public string device_id { get; set; } = string.Empty;
        public string biometric_id { get; set; } = string.Empty;
        public string rfid_card_id { get; set; } = string.Empty;
        public DateTime scan_time { get; set; }
    }

    [ApiController]
    [Route("api/[controller]")]
    public class BiometricSyncController : ControllerBase
    {
        private readonly IApplicationDbContext _context;

        public BiometricSyncController(IApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("sync")]
        public async Task<IActionResult> Sync([FromBody] BiometricSyncPayloadDto payload)
        {
            if (string.IsNullOrEmpty(payload.biometric_id) && string.IsNullOrEmpty(payload.rfid_card_id))
                return BadRequest(new { message = "Biometric ID or RFID Card ID is required." });

            // Find if this belongs to restaurant staff
            var staff = await _context.Staff.FirstOrDefaultAsync(s => 
                (s.biometric_id == payload.biometric_id && !string.IsNullOrEmpty(payload.biometric_id)) || 
                (s.rfid_card_id == payload.rfid_card_id && !string.IsNullOrEmpty(payload.rfid_card_id)));

            if (staff != null)
            {
                // Mark staff attendance
                var attendance = await _context.StaffAttendances.FirstOrDefaultAsync(a => a.staff_id == staff.id && a.date.Date == payload.scan_time.Date);
                if (attendance == null)
                {
                    attendance = new StaffAttendance
                    {
                        id = Guid.NewGuid(),
                        tenant_id = staff.tenant_id,
                        staff_id = staff.id,
                        date = payload.scan_time.Date,
                        status = "Present",
                        check_in = payload.scan_time,
                    };
                    _context.StaffAttendances.Add(attendance);
                }
                else
                {
                    attendance.check_out = payload.scan_time;
                }
                
                await _context.SaveChangesAsync();
                return Ok(new { message = "Staff attendance synced successfully.", type = "Staff" });
            }

            return NotFound(new { message = "Unrecognized biometric ID or RFID card." });
        }
    }
}
