using Microsoft.EntityFrameworkCore;
using SMS.Application.DTOs;
using SMS.Application.Repositories;
using SMS.Core.Entities;
using SMS.Infrastructure.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SMS.Infrastructure.Repositories
{
    public class ExamScheduleRepository : IExamScheduleRepository
    {
        private readonly ApplicationDbContext _context;

        public ExamScheduleRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ExamScheduleResponseDto>> GetDateSheetAsync(Guid tenantId, Guid examSetupId, Guid classId)
        {
            return await _context.ExamSchedules
                .Where(es => es.tenant_id == tenantId && es.exam_setup_id == examSetupId && es.class_id == classId)
                .Join(_context.Classes, es => es.class_id, c => c.id, (es, c) => new { es, c })
                .Join(_context.Subjects, temp => temp.es.subject_id, sub => sub.id, (temp, sub) => new ExamScheduleResponseDto
                {
                    id = temp.es.id,
                    exam_setup_id = temp.es.exam_setup_id,
                    class_id = temp.es.class_id,
                    class_name = temp.c.name,
                    subject_id = temp.es.subject_id,
                    subject_name = sub.name,
                    exam_date = temp.es.exam_date,
                    start_time = temp.es.start_time,
                    end_time = temp.es.end_time,
                    total_marks = temp.es.total_marks,
                    passing_marks = temp.es.passing_marks,
                    room_number = temp.es.room_number,
                    invigilator_name = temp.es.invigilator_name
                })
                .OrderBy(x => x.exam_date)
                .ToListAsync();
        }

        public async Task<ExamSchedule> GetByIdAsync(Guid id)
        {
            return await _context.ExamSchedules.FindAsync(id)!;
        }

        public async Task AddAsync(ExamSchedule schedule)
        {
            await _context.ExamSchedules.AddAsync(schedule);
        }

        public void Update(ExamSchedule schedule)
        {
            _context.ExamSchedules.Update(schedule);
        }

        public void Delete(ExamSchedule schedule)
        {
            _context.ExamSchedules.Remove(schedule);
        }

        public async Task<bool> IsDuplicatePaperAsync(Guid examSetupId, Guid classId, Guid subjectId)
        {
            return await _context.ExamSchedules.AnyAsync(es => 
                es.exam_setup_id == examSetupId && 
                es.class_id == classId && 
                es.subject_id == subjectId
            );
        }

        public async Task<bool> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync() > 0;
        }
    }
}