using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("table_reservations")]
    public class TableReservation : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; } = Guid.NewGuid();
        public Guid tenant_id { get; set; }
        public string customer_name { get; set; } = string.Empty;
        public string contact_number { get; set; } = string.Empty;
        public int guest_count { get; set; } = 2;
        public DateTime reservation_date { get; set; } = DateTime.UtcNow;
        public string time_slot { get; set; } = string.Empty; // e.g. "08:00 PM"
        public Guid? table_id { get; set; }
        public string? table_number { get; set; }
        public string status { get; set; } = "Confirmed"; // Confirmed, Seated, Cancelled
        public string? special_notes { get; set; }
        public DateTime created_at { get; set; } = DateTime.UtcNow;

        [ForeignKey("table_id")]
        public virtual DiningTable? Table { get; set; }
    }
}
