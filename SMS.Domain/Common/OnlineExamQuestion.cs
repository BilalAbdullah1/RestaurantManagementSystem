using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS.Core.Entities
{
    [Table("online_exam_questions")]
    public class OnlineExamQuestion
    {
        [Key]
        public Guid id { get; set; }
        public Guid online_exam_id { get; set; }
        public Guid question_bank_id { get; set; }
    }
}
