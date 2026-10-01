using SMS.Application.DTOs;
using System.Threading.Tasks;

namespace SMS.Application.Interfaces
{
    public interface INotificationDispatcher
    {
        Task DispatchToUserAsync(string userId, NotificationDto notification);
        Task DispatchToRoleAsync(string roleName, NotificationDto notification);
        Task DispatchToAllAsync(NotificationDto notification);
    }
}
