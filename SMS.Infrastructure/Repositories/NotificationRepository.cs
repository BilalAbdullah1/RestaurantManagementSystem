using Microsoft.EntityFrameworkCore;
using SMS.Application.Interfaces;
using SMS.Domain.Common;
using SMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Infrastructure.Repositories
{
    public class NotificationRepository : INotificationRepository
    {
        private readonly ApplicationDbContext _context;

        public NotificationRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Notification> CreateNotificationAsync(Notification notification)
        {
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();
            return notification;
        }

        public async Task<Notification?> GetNotificationByIdAsync(Guid id)
        {
            return await _context.Notifications.FindAsync(id);
        }

        public async Task<IEnumerable<Notification>> GetNotificationsForUserAsync(Guid userId, string roleName)
        {
            // Fetch notifications intended for this specific user OR this user's role
            return await _context.Notifications
                .Where(n => !n.IsDeleted && (n.TargetUserId == userId || n.TargetRole == roleName || (n.TargetUserId == null && n.TargetRole == null)))
                .OrderByDescending(n => n.CreatedAt)
                .Take(50)
                .ToListAsync();
        }

        public async Task<int> GetUnreadCountAsync(Guid userId, string roleName)
        {
            return await _context.Notifications
                .Where(n => !n.IsDeleted && !n.IsRead && (n.TargetUserId == userId || n.TargetRole == roleName || (n.TargetUserId == null && n.TargetRole == null)))
                .CountAsync();
        }

        public async Task MarkAsReadAsync(Guid id)
        {
            var notification = await _context.Notifications.FindAsync(id);
            if (notification != null && !notification.IsRead)
            {
                notification.IsRead = true;
                notification.UpdatedAt = DateTime.UtcNow;
                _context.Notifications.Update(notification);
                await _context.SaveChangesAsync();
            }
        }

        public async Task MarkAllAsReadAsync(Guid userId, string roleName)
        {
            var unreadNotifications = await _context.Notifications
                .Where(n => !n.IsDeleted && !n.IsRead && (n.TargetUserId == userId || n.TargetRole == roleName || (n.TargetUserId == null && n.TargetRole == null)))
                .ToListAsync();

            if (unreadNotifications.Any())
            {
                foreach (var n in unreadNotifications)
                {
                    n.IsRead = true;
                    n.UpdatedAt = DateTime.UtcNow;
                }
                _context.Notifications.UpdateRange(unreadNotifications);
                await _context.SaveChangesAsync();
            }
        }
    }
}
