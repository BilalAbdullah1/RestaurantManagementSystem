using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SMS.Application.DTOs;
using SMS.Application.Repositories;
using SMS.Infrastructure.Persistence;

namespace SMS.Api.Services
{
    public class FeeChallanGeneratorService : BackgroundService
    {
        private readonly ILogger<FeeChallanGeneratorService> _logger;
        private readonly IServiceScopeFactory _scopeFactory;

        public FeeChallanGeneratorService(ILogger<FeeChallanGeneratorService> logger, IServiceScopeFactory scopeFactory)
        {
            _logger = logger;
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Automated Fee Challan Generator Service started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var now = DateTime.UtcNow;
                    
                    // Check if today is the 1st of the month
                    if (now.Day == 1)
                    {
                        string currentBillingMonth = now.ToString("MMM-yyyy");
                        _logger.LogInformation($"1st of the month detected. Starting auto fee voucher generation for {currentBillingMonth}...");

                        using (var scope = _scopeFactory.CreateScope())
                        {
                            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                            var feeChallanRepo = scope.ServiceProvider.GetRequiredService<IFeeChallanRepository>();

                            var tenants = await dbContext.Tenants.Where(t => t.is_active).ToListAsync(stoppingToken);

                            foreach (var tenant in tenants)
                            {
                                var currentYear = await dbContext.AcademicYears
                                    .FirstOrDefaultAsync(y => y.tenant_id == tenant.id && y.is_current, stoppingToken);

                                if (currentYear != null)
                                {
                                    var dto = new GenerateBulkChallansDto
                                    {
                                        tenant_id = tenant.id,
                                        academic_year_id = currentYear.id,
                                        billing_month = currentBillingMonth,
                                        due_date = now.AddDays(10) // Due date 10th of the month
                                    };

                                    int generated = await feeChallanRepo.GenerateBulkChallansAsync(dto);
                                    _logger.LogInformation($"Auto-generated {generated} challans for tenant {tenant.school_name} ({tenant.id}).");
                                }
                            }
                        }
                    }

                    // Check every 12 hours
                    await Task.Delay(TimeSpan.FromHours(12), stoppingToken);
                }
                catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
                {
                    _logger.LogInformation("Automated Fee Challan Generator Service is stopping.");
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred during automated fee challan generation.");
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
    }
}
