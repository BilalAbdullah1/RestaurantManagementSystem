using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SMS.Application.DTOs;
using SMS.Application.Interfaces;
using System;
using System.Security.Claims;
using System.Threading.Tasks;

namespace SMS.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        private Guid GetUserId()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(userIdStr, out var userId))
                return userId;
            return Guid.Empty;
        }

        private string GetRole()
        {
            return User.FindFirst("role_name")?.Value ?? string.Empty;
        }

        [HttpGet("my-notifications")]
        public async Task<IActionResult> GetMyNotifications()
        {
            var userId = GetUserId();
            var role = GetRole();
            if (userId == Guid.Empty) return Unauthorized();

            var notifications = await _notificationService.GetMyNotificationsAsync(userId, role);
            return Ok(notifications);
        }

        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = GetUserId();
            var role = GetRole();
            if (userId == Guid.Empty) return Unauthorized();

            var count = await _notificationService.GetUnreadCountAsync(userId, role);
            return Ok(new { Count = count });
        }

        [HttpPut("mark-read/{id}")]
        public async Task<IActionResult> MarkAsRead(Guid id)
        {
            await _notificationService.MarkAsReadAsync(id);
            return NoContent();
        }

        [HttpPut("mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = GetUserId();
            var role = GetRole();
            if (userId == Guid.Empty) return Unauthorized();

            await _notificationService.MarkAllAsReadAsync(userId, role);
            return NoContent();
        }

        // For testing/admin only. Real world this is called internally by other services.
        [HttpPost("send-test")]
        public async Task<IActionResult> SendTestNotification([FromBody] CreateNotificationDto dto)
        {
            await _notificationService.SendNotificationAsync(dto);
            return Ok(new { message = "Notification sent successfully." });
        }
    }
}
