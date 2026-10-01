using Microsoft.EntityFrameworkCore;
using SMS.Application.Interfaces;
using SMS.Infrastructure.Persistence;
using System;
using System.Text;
using System.Threading.Tasks;

namespace SMS.Infrastructure.Services
{
    public class DataExportService : IDataExportService
    {
        private readonly ApplicationDbContext _context;

        public DataExportService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<byte[]> ExportMenuItemsToCsvAsync(Guid tenantId)
        {
            var items = await _context.MenuItems
                .AsNoTracking()
                .Where(m => m.tenant_id == tenantId)
                .ToListAsync();

            var csv = new StringBuilder();
            csv.AppendLine("DishName,SellingPrice,CostPrice,DietaryType,PrepTimeMinutes,Calories,IsAvailable");

            foreach (var m in items)
            {
                var row = $"{EscapeCsv(m.name)},{m.selling_price},{m.cost_price},{m.dietary_type},{m.preparation_time_minutes},{m.calories},{(m.is_available ? "InStock" : "OutOfStock")}";
                csv.AppendLine(row);
            }

            return Encoding.UTF8.GetBytes(csv.ToString());
        }

        public async Task<byte[]> ExportStaffToCsvAsync(Guid tenantId)
        {
            var staffQuery = await (from s in _context.Staff.AsNoTracking()
                                    join u in _context.Users.AsNoTracking() on s.user_id equals u.id
                                    where s.tenant_id == tenantId
                                    select new { s.cnic, u.first_name, u.last_name, s.designation, s.joining_date, s.basic_salary, u.phone_number, u.email, s.is_active })
                                    .ToListAsync();

            var csv = new StringBuilder();
            csv.AppendLine("CNIC,FirstName,LastName,Designation,DateOfJoining,BasicSalary,PhoneNumber,Email,Status");

            foreach (var s in staffQuery)
            {
                var row = $"{EscapeCsv(s.cnic)},{EscapeCsv(s.first_name)},{EscapeCsv(s.last_name)},{EscapeCsv(s.designation)},{s.joining_date:yyyy-MM-dd},{s.basic_salary},{EscapeCsv(s.phone_number)},{EscapeCsv(s.email)},{(s.is_active ? "Active" : "Inactive")}";
                csv.AppendLine(row);
            }

            return Encoding.UTF8.GetBytes(csv.ToString());
        }

        private string EscapeCsv(string? value)
        {
            if (string.IsNullOrEmpty(value)) return "";
            if (value.Contains(",") || value.Contains("\"") || value.Contains("\n"))
            {
                return $"\"{value.Replace("\"", "\"\"")}\"";
            }
            return value;
        }
    }
}
