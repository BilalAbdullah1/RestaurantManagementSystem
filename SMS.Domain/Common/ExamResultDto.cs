using System;
using System.Collections.Generic;

namespace SMS.Application.DTOs
{
    public class GenerateResultRequestDto
    {
        public Guid tenant_id { get; set; }
        public Guid exam_setup_id { get; set; }
        public Guid class_id { get; set; }
    }

    public class StudentReportCardDto
    {
        public Guid student_id { get; set; }
        public string student_name { get; set; } = default!;
        public string admission_number { get; set; } = default!;
        public string class_name { get; set; } = default!;
        public string exam_title { get; set; } = default!;
        
        public decimal total_max_marks { get; set; }
        public decimal total_obtained_marks { get; set; }
        public decimal percentage { get; set; }
        public string grade { get; set; } = default!;
        public decimal gpa { get; set; }
        public string status { get; set; } = default!;
        
        public List<SubjectMarkBreakdownDto> subjects { get; set; } = new List<SubjectMarkBreakdownDto>();
    }

    public class SubjectMarkBreakdownDto
    {
        public string subject_name { get; set; } = default!;
        public decimal max_marks { get; set; }
        public decimal passing_marks { get; set; }
        public decimal theory_marks { get; set; }
        public decimal practical_marks { get; set; }
        public decimal assignment_marks { get; set; }
        public decimal obtained_marks { get; set; }
        public bool is_absent { get; set; }
        public string subject_grade { get; set; } = default!; // Optional: Grade per subject
    }
}