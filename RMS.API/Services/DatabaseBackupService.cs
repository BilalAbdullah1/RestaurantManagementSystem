using System.Diagnostics;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;

namespace RMS.API.Services
{
    public class DatabaseBackupService : BackgroundService
    {
        private readonly ILogger<DatabaseBackupService> _logger;
        private readonly IConfiguration _configuration;
        private readonly string _backupFolder;
        private readonly string _connectionString;

        public DatabaseBackupService(ILogger<DatabaseBackupService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
            _backupFolder = Path.Combine(Directory.GetCurrentDirectory(), "Backups");
            _connectionString = _configuration.GetConnectionString("DefaultConnection") ?? "";
            
            if (!Directory.Exists(_backupFolder))
            {
                Directory.CreateDirectory(_backupFolder);
            }
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Database Backup Service is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var now = DateTime.Now;
                    // Schedule backup at 2:00 AM daily
                    var nextRunTime = new DateTime(now.Year, now.Month, now.Day, 2, 0, 0);
                    if (now > nextRunTime)
                    {
                        nextRunTime = nextRunTime.AddDays(1);
                    }

                    var delay = nextRunTime - now;
                    _logger.LogInformation($"Next database backup scheduled in {delay.TotalHours:F2} hours at {nextRunTime}.");

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

                string fileName = $"backup_{DateTime.Now:yyyyMMdd_HHmmss}.sql";
                string backupPath = Path.Combine(_backupFolder, fileName);

                // Note: Ensure pg_dump is available in system PATH or provide the absolute path
                var processStartInfo = new ProcessStartInfo
                {
                    FileName = "pg_dump",
                    Arguments = $"\"{_connectionString}\" -f \"{backupPath}\"",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using var process = Process.Start(processStartInfo);
                if (process != null)
                {
                    await process.WaitForExitAsync();

                    if (process.ExitCode == 0)
                    {
                        _logger.LogInformation($"Database backup completed successfully. Saved to {backupPath}");
                    }
                    else
                    {
                        string error = await process.StandardError.ReadToEndAsync();
                        _logger.LogError($"Database backup failed with exit code {process.ExitCode}. Error: {error}");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while performing database backup.");
            }
        }
    }
}
