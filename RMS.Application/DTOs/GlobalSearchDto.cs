using System;

namespace RMS.Application.DTOs
{
    public class GlobalSearchResultDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Subtitle { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // e.g. "Student", "Staff", "Invoice", "Book"
        public string Url { get; set; } = string.Empty; // Frontend route to navigate to
    }
}
