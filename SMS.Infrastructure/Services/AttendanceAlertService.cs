using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SMS.Application.Interfaces;
using SMS.Application.Repositories;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SMS.Infrastructure.Services
{
    public class AttendanceAlertService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AttendanceAlertService> _logger;

        public AttendanceAlertService(IServiceProvider serviceProvider, ILogger<AttendanceAlertService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Attendance Alert Background Service started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var now = DateTime.Now;

                    // Fire at exactly 9:00 AM (give or take a minute)
                    if (now.Hour == 9 && now.Minute == 0)
                    {
                        try
                        {
                            await ProcessDailyAbsentees(stoppingToken);
                            await ProcessContinuousAbsentees(stoppingToken);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error processing attendance alerts.");
                        }

                        // Sleep for 61 seconds to avoid triggering twice in the same minute
                        await Task.Delay(TimeSpan.FromSeconds(61), stoppingToken);
                    }
                    else
                    {
                        // Check every minute
                        await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
                    }
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    _logger.LogInformation("Attendance Alert Background Service is stopping.");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in Attendance Alert Background Service loop.");
                    try
                    {
                        await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
                    }
                    catch (OperationCanceledException)
                    {
                        break;
                    }
                }
            }
        }

        private async Task ProcessDailyAbsentees(CancellationToken stoppingToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
            var whatsappService = scope.ServiceProvider.GetRequiredService<IWhatsAppService>();

            var today = DateTime.UtcNow.Date;
            
            // Get students marked as Absent today
            var absentees = await context.StudentAttendances
                .Where(a => a.date.Date == today && a.status == "Absent")
                .Join(context.Students, a => a.student_id, s => s.id, (a, s) => s)
                .ToListAsync(stoppingToken);

            foreach (var student in absentees)
            {
                if (!string.IsNullOrEmpty(student.guardian_phone))
                {
                    var msg = $"Dear Parent, your child {student.first_name} {student.last_name} is marked ABSENT today ({today:dd-MMM-yyyy}). Please contact the administration if this is an error.";
                    // Fire and forget or await
                    await whatsappService.SendMessageAsync(student.guardian_phone, msg);
                    _logger.LogInformation($"Sent absent alert for {student.first_name}");
                }
            }
        }

        private async Task ProcessContinuousAbsentees(CancellationToken stoppingToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<IApplicationDbContext>();
            
            var threeDaysAgo = DateTime.UtcNow.Date.AddDays(-3);
            var today = DateTime.UtcNow.Date;

            // Simple check: Find students who have 3 "Absent" records in the last 3 days
            var continuousAbsentees = await context.StudentAttendances
                .Where(a => a.status == "Absent" && a.date.Date >= threeDaysAgo && a.date.Date <= today)
                .GroupBy(a => a.student_id)
                .Where(g => g.Count() >= 3)
                .Select(g => g.Key)
                .ToListAsync(stoppingToken);

            var notificationService = scope.ServiceProvider.GetRequiredService<SMS.Application.Interfaces.INotificationService>();

            foreach (var studentId in continuousAbsentees)
            {
                var student = await context.Students.FindAsync(new object[] { studentId }, stoppingToken);
                if (student != null)
                {
                    // Assuming Principal is user_id or a role, here we broadcast a notice or notify admin
                    var notice = new SMS.Core.Entities.Notice
                    {
                        id = Guid.NewGuid(),
                        tenant_id = student.tenant_id,
                        title = "Continuous Absentee Alert",
                        content = $"Student {student.first_name} {student.last_name} ({student.admission_number}) has been absent for 3 consecutive days.",
                        published_at = DateTime.UtcNow,
                        is_active = true
                    };
                    context.Notices.Add(notice);
                }
            }

            await context.SaveChangesAsync(stoppingToken);
        }
    }
}
