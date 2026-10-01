using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("library_books")]
    public class LibraryBook : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public string title { get; set; } = string.Empty;
        public string author { get; set; } = string.Empty;
        public string? isbn { get; set; }
        public string? publisher { get; set; }
        public int? publication_year { get; set; }
        public string category { get; set; } = string.Empty; // Science, Math, Literature, etc.
        public string? shelf_location { get; set; }
        public int total_copies { get; set; }
        public int available_copies { get; set; }
        public decimal? price { get; set; }
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
