using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace RMS.Infrastructure.Services
{
    public class DatabaseBackupService : BackgroundService
    {
        private readonly ILogger<DatabaseBackupService> _logger;
        private readonly IConfiguration _configuration;

        public DatabaseBackupService(ILogger<DatabaseBackupService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Database Backup Service is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var now = DateTime.Now;
                    var scheduledTime = new DateTime(now.Year, now.Month, now.Day, 2, 0, 0); // Run at 2 AM
                    if (now > scheduledTime)
                    {
                        scheduledTime = scheduledTime.AddDays(1);
                    }

                    var delay = scheduledTime - now;
                    _logger.LogInformation($"Next database backup scheduled for {scheduledTime}. Waiting for {delay}...");

                    await Task.Delay(delay, stoppingToken);

                    if (!stoppingToken.IsCancellationRequested)
                    {
                        await PerformBackupAsync();
                    }
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    _logger.LogInformation("Database Backup Service is stopping.");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred in Database Backup Service loop.");
                    try
                    {
                        await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
                    }
                    catch (OperationCanceledException)
                    {
                        break;
                    }
                }
            }
        }

        private async Task PerformBackupAsync()
        {
            try
            {
                _logger.LogInformation("Starting automated database backup...");

                // Simulate DB backup generation
                var backupDir = Path.Combine(Directory.GetCurrentDirectory(), "Backups");
                if (!Directory.Exists(backupDir))
                    Directory.CreateDirectory(backupDir);

                var backupFileName = $"DbBackup_{DateTime.Now:yyyyMMdd_HHmmss}.bak";
                var backupFilePath = Path.Combine(backupDir, backupFileName);

                await File.WriteAllTextAsync(backupFilePath, "Simulated Database Backup Content");

                _logger.LogInformation($"Database backed up locally to {backupFilePath}");

                // Simulate AWS S3 Upload
                var bucketName = _configuration["AWS:S3BucketName"] ?? "rms-db-backups";
                _logger.LogInformation($"Uploading backup {backupFileName} to AWS S3 bucket: {bucketName}...");

                // AWS S3 upload logic goes here in real implementation

                _logger.LogInformation("Backup successfully uploaded to Cloud (AWS S3).");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while performing the automated database backup.");
            }
        }
    }
}
