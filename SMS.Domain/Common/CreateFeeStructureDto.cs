using System;

namespace SMS.Application.DTOs
{
    public class CreateFeeStructureDto
    {
        public Guid tenant_id { get; set; }
        public Guid academic_year_id { get; set; }
        public Guid class_id { get; set; }
        public Guid fee_type_id { get; set; }
        public string category { get; set; } = "Normal";
        public decimal amount { get; set; }
    }

    public class UpdateFeeStructureDto
    {
        public string category { get; set; } = "Normal";
        public decimal amount { get; set; }
    }

    // Frontend Grid/Table ke liye Joined DTO
    public class FeeStructureResponseDto
    {
        public Guid id { get; set; }
        public Guid class_id { get; set; }
        public string class_name { get; set; } = default!;
        
        public Guid fee_type_id { get; set; }
        public string fee_type_name { get; set; } = default!;
        public string frequency { get; set; } = default!; // Monthly, Annually etc.
        public string category { get; set; } = "Normal";
        
        public decimal amount { get; set; }
        public DateTime created_at { get; set; }
    }
}