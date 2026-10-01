using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("visitors")]
    public class Visitor : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }

        [Required]
        [MaxLength(150)]
        public string visitor_name { get; set; } = string.Empty;

        [MaxLength(20)]
        public string? phone_number { get; set; }

        [MaxLength(200)]
        public string purpose { get; set; } = string.Empty;

        [MaxLength(150)]
        public string? host_name { get; set; }    // Teacher/Staff being visited

        [MaxLength(100)]
        public string? host_department { get; set; }

        [MaxLength(50)]
        public string? vehicle_number { get; set; }

        [MaxLength(20)]
        public string? id_card_type { get; set; }  // CNIC, Passport, Driving License

        [MaxLength(30)]
        public string? id_card_number { get; set; }

        // Status: Checked In, Checked Out, Expected
        [MaxLength(20)]
        public string status { get; set; } = "Checked In";

        public DateTime check_in_time { get; set; } = DateTime.UtcNow;
        public DateTime? check_out_time { get; set; }

        [MaxLength(500)]
        public string? remarks { get; set; }

        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
