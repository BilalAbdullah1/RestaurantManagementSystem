using Microsoft.AspNetCore.SignalR;
using SMS.API.Hubs;
using SMS.Application.DTOs;
using SMS.Application.Interfaces;
using System.Threading.Tasks;

namespace SMS.API.Services
{
    public class NotificationDispatcher : INotificationDispatcher
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationDispatcher(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task DispatchToAllAsync(NotificationDto notification)
        {
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", notification);
        }

        public async Task DispatchToRoleAsync(string roleName, NotificationDto notification)
        {
            await _hubContext.Clients.Group($"Role_{roleName}").SendAsync("ReceiveNotification", notification);
        }

        public async Task DispatchToUserAsync(string userId, NotificationDto notification)
        {
            await _hubContext.Clients.Group($"User_{userId}").SendAsync("ReceiveNotification", notification);
        }
    }
}
