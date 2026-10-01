using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RMS.Infrastructure.DependencyInjection;
using RMS.Infrastructure.Persistence;
using System.Text;
using RMS.API.Services;

// Prevent Linux inotify limit crash in containerized environments (Render/Docker)
Environment.SetEnvironmentVariable("DOTNET_USE_POLLING_FILE_WATCHER", "true");

var builder = WebApplication.CreateBuilder(args);

// Render dynamic PORT support
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// Extract JWT parameters safely
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException("JWT Secret Key is missing from appsettings.json");
var jwtIssuer = builder.Configuration["Jwt:Issuer"];
var jwtAudience = builder.Configuration["Jwt:Audience"];

// Add JWT Bearer Authentication services
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ClockSkew = TimeSpan.FromMinutes(5)
    };
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"[JWT FAIL] Authentication failed: {context.Exception.Message}");
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            Console.WriteLine($"[JWT CHALLENGE] Error: {context.Error}, Description: {context.ErrorDescription}");
            return Task.CompletedTask;
        },
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/notificationHub"))
            {
                context.Token = accessToken;
            }
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddControllers(); 
builder.Services.AddOpenApi();
builder.Services.AddInfrastructure(builder.Configuration);

// Register Auto Database Backups Hosted Service
builder.Services.AddHostedService<DatabaseBackupService>();

// SignalR & Dispatcher
builder.Services.AddSignalR();
builder.Services.AddScoped<RMS.Application.Interfaces.INotificationDispatcher, RMS.API.Services.NotificationDispatcher>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.SetIsOriginAllowed(origin => true)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials(); 
        });
});

var app = builder.Build();

// Enable CORS as the very first middleware so headers are always attached
app.UseCors("AllowReactApp");

// Global Error Handler Middleware
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception ex)
    {
        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/json";
        var errorDetails = new
        {
            error = ex.Message,
            inner = ex.InnerException?.Message,
            type = ex.GetType().FullName
        };
        await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(errorDetails));
    }
});

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        
        // Auto-create all tables in the PostgreSQL database if they don't exist
        await context.Database.EnsureCreatedAsync();
        
        await DatabaseSeeder.SeedDefaultTenantAndAdminAsync(context);
        await DatabaseSeeder.SeedRolesAsync(context);
        await DatabaseSeeder.SeedChartOfAccountsAsync(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Database initial schema/permissions/roles/COA/VokeTenant seed Error");
    }
}
// ==================== SEEDER CODE END ====================

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// app.UseHttpsRedirection();

// Ensure static file directories exist
var wwwrootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
var uploadsPath = Path.Combine(wwwrootPath, "uploads");
var logosPath = Path.Combine(uploadsPath, "logos");
Directory.CreateDirectory(wwwrootPath);
Directory.CreateDirectory(uploadsPath);
Directory.CreateDirectory(logosPath);

app.UseStaticFiles();

// Middleware execution order mapping
app.UseAuthentication();
app.UseMiddleware<RMS.API.Middlewares.TenantResolverMiddleware>();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/api/health", async (ApplicationDbContext db) =>
{
    try
    {
        var count = await db.Tenants.CountAsync();
        return Results.Ok(new { status = "Healthy", tenantsCount = count });
    }
    catch (Exception ex)
    {
        return Results.Problem(detail: ex.Message + " | Inner: " + ex.InnerException?.Message, statusCode: 500);
    }
});
app.MapHub<RMS.API.Hubs.NotificationHub>("/notificationHub");

app.Run();