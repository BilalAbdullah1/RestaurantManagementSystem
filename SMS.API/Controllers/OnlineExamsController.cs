using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SMS.Application.Interfaces;
using SMS.Core.Entities;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace SMS.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OnlineExamsController : ControllerBase
    {
        private readonly IApplicationDbContext _context;

        public OnlineExamsController(IApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("tenant/{tenantId}")]
        public async Task<IActionResult> GetExams(Guid tenantId)
        {
            var exams = await _context.OnlineExams
                .Where(e => e.tenant_id == tenantId)
                .OrderByDescending(e => e.created_at)
                .ToListAsync();
            return Ok(exams);
        }

        [HttpGet("{id}/questions")]
        public async Task<IActionResult> GetExamQuestions(Guid id)
        {
            var questionIds = await _context.OnlineExamQuestions
                .Where(oq => oq.online_exam_id == id)
                .Select(oq => oq.question_bank_id)
                .ToListAsync();

            var questions = await _context.QuestionBanks
                .Where(q => questionIds.Contains(q.id))
                .ToListAsync();

            return Ok(questions);
        }

        [HttpPost]
        public async Task<IActionResult> CreateExam([FromBody] OnlineExamDto dto)
        {
            var exam = new OnlineExam
            {
                id = Guid.NewGuid(),
                tenant_id = dto.tenant_id,
                class_id = dto.class_id,
                section_id = dto.section_id,
                subject_id = dto.subject_id,
                exam_setup_id = dto.exam_setup_id,
                title = dto.title,
                exam_date = dto.exam_date.ToUniversalTime(),
                duration_minutes = dto.duration_minutes,
                total_marks = dto.total_marks,
                passing_marks = dto.passing_marks,
                shuffle_questions = dto.shuffle_questions ?? true,
                shuffle_options = dto.shuffle_options ?? true,
                is_published = dto.is_published ?? false,
                created_at = DateTime.UtcNow
            };

            _context.OnlineExams.Add(exam);

            if (dto.question_ids != null && dto.question_ids.Any())
            {
                foreach (var qId in dto.question_ids)
                {
                    _context.OnlineExamQuestions.Add(new OnlineExamQuestion
                    {
                        id = Guid.NewGuid(),
                        online_exam_id = exam.id,
                        question_bank_id = qId
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = "Online Exam created successfully", exam });
        }

        [HttpPatch("{id}/toggle-publish")]
        public async Task<IActionResult> TogglePublish(Guid id)
        {
            var exam = await _context.OnlineExams.FindAsync(id);
            if (exam == null) return NotFound(new { message = "Online exam not found." });

            exam.is_published = !exam.is_published;
            await _context.SaveChangesAsync();

            return Ok(new { message = $"Exam status updated to {(exam.is_published ? "Published" : "Draft")}.", is_published = exam.is_published });
        }

        [HttpPost("submit-attempt")]
        public async Task<IActionResult> SubmitExamAttempt([FromBody] SubmitExamAttemptDto dto)
        {
            var exam = await _context.OnlineExams.FindAsync(dto.online_exam_id);
            if (exam == null) return NotFound(new { message = "Online Exam not found." });

            var questionIds = await _context.OnlineExamQuestions
                .Where(oq => oq.online_exam_id == dto.online_exam_id)
                .Select(oq => oq.question_bank_id)
                .ToListAsync();

            var questions = await _context.QuestionBanks
                .Where(q => questionIds.Contains(q.id))
                .ToListAsync();

            int obtainedMarks = 0;
            int correctAnswers = 0;

            foreach (var ans in dto.answers)
            {
                var q = questions.FirstOrDefault(x => x.id == ans.question_id);
                if (q != null && string.Equals(q.correct_option, ans.selected_option, StringComparison.OrdinalIgnoreCase))
                {
                    obtainedMarks += q.marks;
                    correctAnswers++;
                }
            }

            // Auto-save into ExamMarks
            var existingMark = await _context.ExamMarks
                .FirstOrDefaultAsync(m => m.tenant_id == dto.tenant_id 
                                       && m.exam_setup_id == exam.exam_setup_id 
                                       && m.class_id == exam.class_id 
                                       && m.subject_id == exam.subject_id 
                                       && m.student_id == dto.student_id);

            if (existingMark != null)
            {
                existingMark.obtained_marks = obtainedMarks;
                existingMark.theory_marks = obtainedMarks;
                existingMark.is_absent = false;
                existingMark.remarks = $"Auto-graded CBT score: {obtainedMarks}/{exam.total_marks}";
                _context.ExamMarks.Update(existingMark);
            }
            else
            {
                _context.ExamMarks.Add(new ExamMark
                {
                    id = Guid.NewGuid(),
                    tenant_id = dto.tenant_id,
                    exam_setup_id = exam.exam_setup_id,
                    class_id = exam.class_id,
                    subject_id = exam.subject_id,
                    student_id = dto.student_id,
                    theory_marks = obtainedMarks,
                    practical_marks = 0,
                    assignment_marks = 0,
                    obtained_marks = obtainedMarks,
                    is_absent = false,
                    remarks = $"Auto-graded CBT score: {obtainedMarks}/{exam.total_marks}",
                    created_at = DateTime.UtcNow
                });
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Exam submitted and graded successfully!",
                total_marks = exam.total_marks,
                obtained_marks = obtainedMarks,
                correct_count = correctAnswers,
                total_questions = questions.Count,
                percentage = exam.total_marks > 0 ? Math.Round((decimal)obtainedMarks / exam.total_marks * 100, 1) : 0
            });
        }
        
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var exam = await _context.OnlineExams.FindAsync(id);
            if (exam == null) return NotFound();

            var mappings = _context.OnlineExamQuestions.Where(oq => oq.online_exam_id == id);
            _context.OnlineExamQuestions.RemoveRange(mappings);
            _context.OnlineExams.Remove(exam);
            
            await _context.SaveChangesAsync();
            return Ok(new { message = "Online Exam deleted successfully" });
        }
    }

    public class OnlineExamDto
    {
        public Guid tenant_id { get; set; }
        public Guid class_id { get; set; }
        public Guid? section_id { get; set; }
        public Guid subject_id { get; set; }
        public Guid exam_setup_id { get; set; }
        public string title { get; set; } = default!;
        public DateTime exam_date { get; set; }
        public int duration_minutes { get; set; }
        public int total_marks { get; set; }
        public int passing_marks { get; set; }
        public bool? shuffle_questions { get; set; }
        public bool? shuffle_options { get; set; }
        public bool? is_published { get; set; }
        public List<Guid> question_ids { get; set; } = new List<Guid>();
    }

    public class SubmitExamAttemptDto
    {
        public Guid tenant_id { get; set; }
        public Guid online_exam_id { get; set; }
        public Guid student_id { get; set; }
        public List<StudentAnswerDto> answers { get; set; } = new List<StudentAnswerDto>();
    }

    public class StudentAnswerDto
    {
        public Guid question_id { get; set; }
        public string selected_option { get; set; } = default!;
    }
}
