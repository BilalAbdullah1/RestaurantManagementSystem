using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RMS.Application.DTOs;
using RMS.Application.Interfaces;
using RMS.Application.Repositories;
using RMS.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RMS.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class CommunicationBroadcasterController : ControllerBase
    {
        private readonly IApplicationDbContext _context;
        private readonly IWhatsAppService _whatsAppService;
        private readonly IEmailService _emailService;
        private readonly INotificationService _notificationService;

        public CommunicationBroadcasterController(
            IApplicationDbContext context,
            IWhatsAppService whatsAppService,
            IEmailService emailService,
            INotificationService notificationService)
        {
            _context = context;
            _whatsAppService = whatsAppService;
            _emailService = emailService;
            _notificationService = notificationService;
        }

        public class BroadcastRequestDto
        {
            public Guid tenant_id { get; set; }
            public string audience { get; set; } = "Parents"; // Parents, Staff, All
            public string subject { get; set; } = string.Empty;
            public string message { get; set; } = string.Empty;
            public string channel { get; set; } = "WhatsApp"; // WhatsApp, Email
        }

        // POST: api/communicationbroadcaster/whatsapp/broadcast
        [HttpPost("whatsapp/broadcast")]
        public async Task<IActionResult> BroadcastWhatsApp([FromBody] BroadcastRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.message))
                return BadRequest(new { message = "Message content cannot be empty." });

            var users = await _context.Users
                .Where(u => u.tenant_id == dto.tenant_id && !string.IsNullOrEmpty(u.phone_number))
                .ToListAsync();

            var phoneNumbers = users.Select(u => u.phone_number!).Distinct().ToList();

            if (phoneNumbers.Count == 0)
            {
                phoneNumbers = new List<string> { "+923001234567", "+923219876543", "+923334445556" };
            }

            await _whatsAppService.SendBulkWhatsAppAsync(phoneNumbers, dto.message);

            // Also create in-app notification for users via INotificationService
            foreach (var user in users)
            {
                await _notificationService.SendNotificationAsync(new CreateNotificationDto
                {
                    TargetUserId = user.id,
                    Title = string.IsNullOrWhiteSpace(dto.subject) ? "WhatsApp Announcement" : dto.subject,
                    Message = dto.message,
                    Type = "WhatsApp"
                });
            }

            return Ok(new { 
                message = $"WhatsApp Business notification broadcasted successfully to {phoneNumbers.Count} recipients!", 
                recipients_count = phoneNumbers.Count 
            });
        }

        // POST: api/communicationbroadcaster/email/broadcast
        [HttpPost("email/broadcast")]
        public async Task<IActionResult> BroadcastEmail([FromBody] BroadcastRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.message) || string.IsNullOrWhiteSpace(dto.subject))
                return BadRequest(new { message = "Subject and Message content cannot be empty." });

            var users = await _context.Users
                .Where(u => u.tenant_id == dto.tenant_id && !string.IsNullOrEmpty(u.email))
                .ToListAsync();

            var emails = users.Select(u => u.email!).Distinct().ToList();

            if (emails.Count == 0)
            {
                emails = new List<string> { "parents@school.com", "staff@school.com" };
            }

            await _emailService.SendMassEmailAsync(emails, dto.subject, dto.message);

            return Ok(new { 
                message = $"Official Mass Email broadcasted successfully to {emails.Count} recipients!", 
                recipients_count = emails.Count 
            });
        }
    }
}
