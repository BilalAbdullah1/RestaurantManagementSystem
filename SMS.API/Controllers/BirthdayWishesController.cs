using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SMS.Application.DTOs;
using SMS.Application.Interfaces;
using SMS.Application.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class BirthdayWishesController : ControllerBase
    {
        private readonly IApplicationDbContext _context;
        private readonly IWhatsAppService _whatsAppService;
        private readonly INotificationService _notificationService;

        public BirthdayWishesController(
            IApplicationDbContext context,
            IWhatsAppService whatsAppService,
            INotificationService notificationService)
        {
            _context = context;
            _whatsAppService = whatsAppService;
            _notificationService = notificationService;
        }

        // GET: api/birthdaywishes/today/tenant/{tenantId}
        [HttpGet("today/tenant/{tenantId}")]
        public async Task<IActionResult> GetTodayBirthdays(Guid tenantId)
        {
            var today = DateTime.UtcNow;

            // Fetch students whose DOB month and day match today
            var studentBirthdays = await (from s in _context.Students
                                          where s.tenant_id == tenantId && s.date_of_birth.Month == today.Month && s.date_of_birth.Day == today.Day
                                          select new
                                          {
                                              type = "Student",
                                              id = s.id,
                                              name = s.first_name + " " + s.last_name,
                                              dob = s.date_of_birth,
                                              phone = s.guardian_phone
                                          }).ToListAsync();

            // Fetch staff members whose joining/dob match
            var staffBirthdays = await (from st in _context.Staff
                                        where st.tenant_id == tenantId && st.joining_date.Month == today.Month && st.joining_date.Day == today.Day
                                        join u in _context.Users on st.user_id equals u.id
                                        select new
                                        {
                                            type = "Staff",
                                            id = st.id,
                                            name = u.first_name + " " + u.last_name,
                                            dob = st.joining_date,
                                            phone = u.phone_number
                                        }).ToListAsync();

            var celebrants = studentBirthdays.Concat(staffBirthdays).ToList();

            return Ok(celebrants);
        }

        // POST: api/birthdaywishes/trigger-wishes
        [HttpPost("trigger-wishes")]
        public async Task<IActionResult> TriggerWishes([FromBody] Guid tenantId)
        {
            var today = DateTime.UtcNow;

            var users = await _context.Users
                .Where(u => u.tenant_id == tenantId)
                .ToListAsync();

            int wishesSent = 0;

            foreach (var user in users)
            {
                // Send automated birthday greeting
                await _notificationService.SendNotificationAsync(new CreateNotificationDto
                {
                    TargetUserId = user.id,
                    Title = "🎂 Happy Birthday from School Family!",
                    Message = $"Wishing you a wonderful birthday filled with joy and success! Happy Birthday, {user.first_name}!",
                    Type = "Birthday"
                });

                if (!string.IsNullOrEmpty(user.phone_number))
                {
                    await _whatsAppService.SendMessageAsync(
                        user.phone_number,
                        $"🎉 Happy Birthday {user.first_name}! Wishing you a brilliant year ahead from the entire School Management Team!"
                    );
                }
                wishesSent++;
            }

            return Ok(new { message = $"Automated Birthday Wishes engine executed successfully! Dispatched {wishesSent} greeting cards.", wishes_sent = wishesSent });
        }
    }
}
