using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SMS.Core.Interfaces;

namespace SMS.Core.Entities
{
    [Table("study_materials")]
    public class StudyMaterial : IMustHaveTenant
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid class_id { get; set; }
        public Guid subject_id { get; set; }
        public string title { get; set; } = string.Empty;
        public string? description { get; set; }
        public string material_type { get; set; } = "Notes"; // Notes, Past Paper, Video, Book
        public string? file_url { get; set; }
        public string? video_url { get; set; }
        public string? uploaded_by { get; set; }
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
