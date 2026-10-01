using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SMS.Application.DTOs
{
    public class StudentMarkSheetDto
    {
        public Guid student_id { get; set; }
        public string student_name { get; set; } = default!;
        public string admission_number { get; set; } = default!;
        
        public Guid? mark_id { get; set; }
        public decimal theory_marks { get; set; }
        public decimal practical_marks { get; set; }
        public decimal assignment_marks { get; set; }
        public decimal obtained_marks { get; set; }
        public bool is_absent { get; set; }
        public string remarks { get; set; } = default!;
    }

    public class StudentMarkEntryDto
    {
        [Required] public Guid student_id { get; set; }
        public decimal theory_marks { get; set; }
        public decimal practical_marks { get; set; }
        public decimal assignment_marks { get; set; }
        public decimal obtained_marks { get; set; }
        public bool is_absent { get; set; }
        public string remarks { get; set; } = default!;
    }

    public class BulkSaveMarksDto
    {
        [Required] public Guid tenant_id { get; set; }
        [Required] public Guid exam_setup_id { get; set; }
        [Required] public Guid class_id { get; set; }
        [Required] public Guid subject_id { get; set; }
        
        [Required]
        public List<StudentMarkEntryDto> marks { get; set; } = default!;
    }
}