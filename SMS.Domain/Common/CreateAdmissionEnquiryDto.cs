using System;

namespace SMS.Application.DTOs
{
    public class CreateAdmissionEnquiryDto
    {
        public Guid tenant_id { get; set; }
        public string child_name { get; set; } = default!;
        public string father_name { get; set; } = default!;
        public string phone_number { get; set; } = default!;
        public Guid class_id { get; set; }
        public string remarks { get; set; } = default!;
    }

    public class UpdateEnquiryStatusDto
    {
        public string status { get; set; } = default!;
        public string remarks { get; set; } = default!;
    }
}