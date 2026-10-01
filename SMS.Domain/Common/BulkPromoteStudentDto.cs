using System;
using System.Collections.Generic;

namespace SMS.Domain.Common
{
    public class BulkPromoteStudentDto
    {
        public Guid tenant_id { get; set; }
        public Guid new_academic_year_id { get; set; }
        public Guid new_class_id { get; set; }
        public Guid new_section_id { get; set; }
        public List<Guid> student_ids { get; set; } = new List<Guid>();
    }
}
