using System;
using System.ComponentModel.DataAnnotations;

namespace SMS.Application.DTOs
{
    public class CreateExamScheduleDto
    {
        public Guid tenant_id { get; set; }
        public Guid exam_setup_id { get; set; }
        public Guid class_id { get; set; }
        public Guid subject_id { get; set; }
        public DateTime exam_date { get; set; }
        public string start_time { get; set; } = default!;
        public string end_time { get; set; } = default!;
        public decimal total_marks { get; set; }
        public decimal passing_marks { get; set; }

        // Pro Features
        public string? room_number { get; set; }
        public string? invigilator_name { get; set; }
    }

    public class UpdateExamScheduleDto
    {
        public DateTime exam_date { get; set; }
        public string start_time { get; set; } = default!;
        public string end_time { get; set; } = default!;
        public decimal total_marks { get; set; }
        public decimal passing_marks { get; set; }

        // Pro Features
        public string? room_number { get; set; }
        public string? invigilator_name { get; set; }
    }

    // Date Sheet Frontend List Joined DTO
    public class ExamScheduleResponseDto
    {
        public Guid id { get; set; }
        public Guid exam_setup_id { get; set; }
        public Guid class_id { get; set; }
        public string class_name { get; set; } = default!;
        
        public Guid subject_id { get; set; }
        public string subject_name { get; set; } = default!;
        
        public DateTime exam_date { get; set; }
        public string start_time { get; set; } = default!;
        public string end_time { get; set; } = default!;
        public decimal total_marks { get; set; }
        public decimal passing_marks { get; set; }

        // Pro Features
        public string? room_number { get; set; }
        public string? invigilator_name { get; set; }
    }
}