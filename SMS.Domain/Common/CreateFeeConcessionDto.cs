using System;

namespace SMS.Application.DTOs
{
    public class CreateFeeConcessionDto
    {
        public Guid tenant_id { get; set; }
        public Guid student_id { get; set; }
        public Guid fee_type_id { get; set; }
        public string name { get; set; } = default!;
        public string discount_type { get; set; } = default!;
        public decimal discount_value { get; set; }
    }

    public class UpdateFeeConcessionDto
    {
        public string name { get; set; } = default!;
        public string discount_type { get; set; } = default!;
        public decimal discount_value { get; set; }
        public bool is_active { get; set; }
    }

    // Frontend Table/Grid ke liye Joined DTO
    public class FeeConcessionResponseDto
    {
        public Guid id { get; set; }
        
        public Guid student_id { get; set; }
        public string student_name { get; set; } = default!;
        public string admission_number { get; set; } = default!;
        
        public Guid fee_type_id { get; set; }
        public string fee_type_name { get; set; } = default!;
        
        public string name { get; set; } = default!;
        public string discount_type { get; set; } = default!;
        public decimal discount_value { get; set; }
        public bool is_active { get; set; }
        public DateTime created_at { get; set; }
    }
}