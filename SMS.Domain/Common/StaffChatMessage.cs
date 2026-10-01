using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SMS.Core.Entities
{
    [Table("staff_chat_messages")]
    public class StaffChatMessage
    {
        [Key]
        public Guid id { get; set; }
        public Guid tenant_id { get; set; }
        public Guid sender_id { get; set; }
        public string sender_name { get; set; } = string.Empty;
        public string sender_role { get; set; } = "Staff";
        public Guid? receiver_id { get; set; }
        public string channel { get; set; } = "General"; // General, Teachers Lounge, Admin Office, Direct
        public string message_text { get; set; } = string.Empty;
        public string? attachment_url { get; set; }
        public DateTime sent_at { get; set; } = DateTime.UtcNow;
    }
}
