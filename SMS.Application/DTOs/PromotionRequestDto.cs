using System;
using System.Collections.Generic;

namespace SMS.Application.DTOs
{
    public class PromotionRequestDto
    {
        public Guid TargetAcademicYearId { get; set; }
        public Guid TargetClassId { get; set; }
        public Guid TargetSectionId { get; set; }
        public List<Guid> StudentIds { get; set; } = new List<Guid>();
    }
}
