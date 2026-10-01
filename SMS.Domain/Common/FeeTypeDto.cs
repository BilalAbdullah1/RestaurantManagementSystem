using System;
using System.ComponentModel.DataAnnotations;

namespace SMS.Application.DTOs
{
    public class CreateFeeTypeDto
    {
        [Required]
        public Guid tenant_id { get; set; }
        [Required]
        public string name { get; set; } = default!;
        public string description { get; set; } = default!;
        [Required]
        public string frequency { get; set; } = default!;
    }

    public class UpdateFeeTypeDto
    {
        [Required]
        public string name { get; set; } = default!;
        public string description { get; set; } = default!;
        [Required]
        public string frequency { get; set; } = default!;
        public bool is_active { get; set; }
    }
}