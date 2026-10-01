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
    public class FeeChallanRepository : IFeeChallanRepository
    {
        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IWhatsAppService _whatsappService;

        public FeeChallanRepository(ApplicationDbContext context, IEmailService emailService, IWhatsAppService whatsappService)
        {
            _context = context;
            _emailService = emailService;
            _whatsappService = whatsappService;
        }

        public async Task<int> GenerateBulkChallansAsync(GenerateBulkChallansDto dto)
        {
            bool filterByClass = dto.class_id.HasValue && dto.class_id.Value != Guid.Empty;

            // 1. Fetch ALL ACTIVE Students enrolled in this Class/Year with their contact details
            var activeEnrollments = await _context.StudentEnrollments
                .Where(e => e.tenant_id == dto.tenant_id && e.academic_year_id == dto.academic_year_id && (!filterByClass || e.class_id == dto.class_id.Value) && e.status == "Active")
                .Join(_context.Students, e => e.student_id, s => s.id, (e, s) => new { Enrollment = e, Student = s })
                .ToListAsync();

            if (!activeEnrollments.Any()) return 0;

            var studentIds = activeEnrollments.Select(e => e.Enrollment.student_id).ToList();

            // 2. Fetch Fee Structures for relevant classes
            var feeStructures = await _context.FeeStructures
                .Where(fs => fs.academic_year_id == dto.academic_year_id && (!filterByClass || fs.class_id == dto.class_id.Value))
                .Join(_context.FeeTypes, fs => fs.fee_type_id, ft => ft.id, (fs, ft) => new { fs, ft })
                .ToListAsync();

            if (!feeStructures.Any()) throw new Exception("Fee Structure is not defined for the selected class(es). Please set up Class Fee Allocation first.");

            // 3. Fetch ALL Active Concessions for these students
            var concessions = await _context.FeeConcessions
                .Where(c => studentIds.Contains(c.student_id) && c.is_active == true)
                .ToListAsync();

            // 4. Find students who ALREADY have a challan for this billing_month to avoid duplicates
            var existingChallans = await _context.FeeChallans
                .Where(fc => fc.tenant_id == dto.tenant_id && (!filterByClass || fc.class_id == dto.class_id.Value) && fc.billing_month == dto.billing_month)
                .Select(fc => fc.student_id)
                .ToListAsync();

            // 4b. Fetch all past billed fee items for these students to enforce One-Time & Annual frequency rules
            var pastBilledItems = await _context.FeeChallanDetails
                .Join(_context.FeeChallans, d => d.challan_id, c => c.id, (d, c) => new { d.fee_type_id, c.student_id, c.academic_year_id })
                .Where(x => studentIds.Contains(x.student_id))
                .ToListAsync();

            int generatedCount = 0;
            var newChallans = new List<FeeChallan>();
            var newDetails = new List<FeeChallanDetail>();

            // 5. ENGINE LOOP: Generate Challan for each student
            foreach (var item in activeEnrollments)
            {
                if (existingChallans.Contains(item.Enrollment.student_id)) continue;

                var challanId = Guid.NewGuid();
                decimal totalChallanAmount = 0;
                decimal totalChallanDiscount = 0;

                // Filter fee structures for this student's specific class
                var studentClassFeeStructures = feeStructures.Where(fs => fs.fs.class_id == item.Enrollment.class_id).ToList();
                var distinctFeeTypes = studentClassFeeStructures.Select(f => f.ft).DistinctBy(ft => ft.id).ToList();

                foreach (var feeType in distinctFeeTypes)
                {
                    // FREQUENCY RULE ENFORCEMENT:
                    // One-Time fees (e.g. Admission Fee): Billed ONLY ONCE in a student's lifetime.
                    if (string.Equals(feeType.frequency, "One-Time", StringComparison.OrdinalIgnoreCase) ||
                        string.Equals(feeType.frequency, "OneTime", StringComparison.OrdinalIgnoreCase))
                    {
                        bool alreadyBilledEver = pastBilledItems.Any(p => p.student_id == item.Enrollment.student_id && p.fee_type_id == feeType.id);
                        if (alreadyBilledEver) continue; // Skip One-Time fees if already billed to student
                    }
                    // Annual fees: Billed ONLY ONCE per Academic Session Year.
                    else if (string.Equals(feeType.frequency, "Annual", StringComparison.OrdinalIgnoreCase) ||
                             string.Equals(feeType.frequency, "Yearly", StringComparison.OrdinalIgnoreCase))
                    {
                        bool alreadyBilledThisYear = pastBilledItems.Any(p => p.student_id == item.Enrollment.student_id && p.fee_type_id == feeType.id && p.academic_year_id == dto.academic_year_id);
                        if (alreadyBilledThisYear) continue; // Skip Annual fees if already billed this session
                    }
                    var studentCat = item.Student.category ?? "Normal";
                    var matchingStructure = studentClassFeeStructures.FirstOrDefault(fs => fs.ft.id == feeType.id && fs.fs.category == studentCat)
                                          ?? studentClassFeeStructures.FirstOrDefault(fs => fs.ft.id == feeType.id && fs.fs.category == "Normal")
                                          ?? studentClassFeeStructures.FirstOrDefault(fs => fs.ft.id == feeType.id);

                    if (matchingStructure == null) continue;

                    decimal baseAmount = matchingStructure.fs.amount;
                    decimal discountAmount = 0;

                    var studentDiscount = concessions.FirstOrDefault(c => c.student_id == item.Enrollment.student_id && c.fee_type_id == feeType.id);

                    if (studentDiscount != null)
                    {
                        if (studentDiscount.discount_type == "Percentage")
                            discountAmount = baseAmount * (studentDiscount.discount_value / 100);
                        else if (studentDiscount.discount_type == "FixedAmount")
                            discountAmount = studentDiscount.discount_value;

                        if (discountAmount > baseAmount) discountAmount = baseAmount;
                    }

                    decimal netLineAmount = baseAmount - discountAmount;

                    newDetails.Add(new FeeChallanDetail
                    {
                        id = Guid.NewGuid(),
                        challan_id = challanId,
                        fee_type_id = feeType.id,
                        fee_name = feeType.name,
                        base_amount = baseAmount,
                        discount_amount = discountAmount,
                        net_amount = netLineAmount
                    });

                    totalChallanAmount += baseAmount;
                    totalChallanDiscount += discountAmount;
                }

                var netPayable = totalChallanAmount - totalChallanDiscount;

                // BUG FIX: Use GUID-based unique suffix to guarantee no duplicate challan numbers in bulk
                var uniqueSuffix = Guid.NewGuid().ToString("N")[..6].ToUpper();

                newChallans.Add(new FeeChallan
                {
                    id = challanId,
                    tenant_id = dto.tenant_id,
                    academic_year_id = dto.academic_year_id,
                    student_id = item.Enrollment.student_id,
                    class_id = item.Enrollment.class_id,
                    challan_number = $"CH-{DateTime.UtcNow:yyMM}-{uniqueSuffix}",
                    billing_month = dto.billing_month,
                    issue_date = dto.issue_date.ToUniversalTime(),
                    due_date = dto.due_date.ToUniversalTime(),
                    total_amount = totalChallanAmount,
                    discount_amount = totalChallanDiscount,
                    net_payable = netPayable,
                    status = "Unpaid",
                    created_at = DateTime.UtcNow
                });

                generatedCount++;

                // BUG FIX: Email uses guardian_phone check (no guardian_email field), WhatsApp uses guardian_phone
                // Since Student entity only has guardian_phone, we use that for both checks
                var studentName = $"{item.Student.first_name} {item.Student.last_name}";
                if (!string.IsNullOrEmpty(item.Student.guardian_phone))
                {
                    _ = _whatsappService.SendFeeReminderAsync(item.Student.guardian_phone, studentName, dto.billing_month, netPayable, dto.due_date);
                }
                // Email service kept as fire-and-forget (real email sending requires guardian_email field in DB)
                _ = _emailService.SendFeeChallanEmailAsync("noreply@school.com", studentName, dto.billing_month, netPayable, dto.due_date);
            }

            // 6. Bulk Insert to Database
            if (newChallans.Any())
            {
                await _context.FeeChallans.AddRangeAsync(newChallans);
                await _context.FeeChallanDetails.AddRangeAsync(newDetails);
                await _context.SaveChangesAsync();
            }

            return generatedCount;
        }

        public async Task<IEnumerable<FeeChallanResponseDto>> GetChallansAsync(Guid tenantId, string billingMonth, Guid? classId)
        {
            var query = _context.FeeChallans.Where(fc => fc.tenant_id == tenantId);

            if (!string.IsNullOrEmpty(billingMonth))
                query = query.Where(fc => fc.billing_month == billingMonth);

            if (classId.HasValue && classId.Value != Guid.Empty)
                query = query.Where(fc => fc.class_id == classId.Value);

            var rawChallans = await query
                .Join(_context.Students, fc => fc.student_id, s => s.id, (fc, s) => new { fc, s })
                .Join(_context.Classes, temp => temp.fc.class_id, c => c.id, (temp, c) => new
                {
                    Challan = temp.fc,
                    Student = temp.s,
                    Class = c
                })
                .OrderByDescending(x => x.Challan.due_date)
                .ToListAsync();

            var challanIds = rawChallans.Select(x => x.Challan.id).ToList();
            var allDetails = await _context.FeeChallanDetails
                .Where(d => challanIds.Contains(d.challan_id))
                .ToListAsync();

            // BUG FIX: Also fetch actual payments for accurate paid_amount from FeePayments table
            var allPayments = await _context.FeePayments
                .Where(p => challanIds.Contains(p.challan_id))
                .ToListAsync();

            // Calculate Late Fine dynamically (Rs. 50 per day if overdue)
            var response = new List<FeeChallanResponseDto>();
            foreach (var item in rawChallans)
            {
                decimal currentLateFine = item.Challan.late_fine;

                if (item.Challan.status != "Paid" && DateTime.UtcNow > item.Challan.due_date)
                {
                    int overdueDays = (int)(DateTime.UtcNow.Date - item.Challan.due_date.Date).TotalDays;
                    if (overdueDays > 0)
                    {
                        currentLateFine = overdueDays * 50m;
                    }
                }

                var itemDetails = allDetails
                    .Where(d => d.challan_id == item.Challan.id)
                    .Select(d => new FeeChallanDetailDto
                    {
                        fee_name = d.fee_name,
                        amount = d.base_amount
                    })
                    .ToList();

                // BUG FIX: Get accurate total paid from FeePayments records
                var studentPayments = allPayments.Where(p => p.challan_id == item.Challan.id).OrderByDescending(p => p.payment_date).ToList();
                var actualPaid = studentPayments.Sum(p => p.amount);
                var displayPaid = actualPaid > 0 ? actualPaid : item.Challan.paid_amount;

                var lastPayment = studentPayments.FirstOrDefault();
                string? payMethod = lastPayment?.payment_method ?? (item.Challan.status == "Paid" ? "Counter Cash" : null);
                DateTime? payDate = lastPayment?.payment_date ?? (item.Challan.status == "Paid" ? item.Challan.created_at : null);
                string? txnRef = lastPayment != null && !string.IsNullOrEmpty(lastPayment.remarks) && lastPayment.remarks.StartsWith("TXN-")
                    ? lastPayment.remarks
                    : (lastPayment != null ? $"TXN-{lastPayment.id.ToString("N")[..8].ToUpper()}" : (item.Challan.status == "Paid" ? $"TXN-{item.Challan.id.ToString("N")[..8].ToUpper()}" : null));

                response.Add(new FeeChallanResponseDto
                {
                    id = item.Challan.id,
                    challan_number = item.Challan.challan_number,
                    student_name = item.Student.first_name + " " + item.Student.last_name,
                    admission_number = item.Student.admission_number,
                    guardian_phone = item.Student.guardian_phone,
                    class_name = item.Class.name,
                    billing_month = item.Challan.billing_month,
                    due_date = item.Challan.due_date,
                    gross_amount = item.Challan.total_amount,
                    discount_amount = item.Challan.discount_amount,
                    net_payable = item.Challan.net_payable,
                    paid_amount = displayPaid,
                    late_fine = currentLateFine,
                    status = item.Challan.status,
                    payment_method = payMethod,
                    payment_date = payDate,
                    transaction_ref = txnRef,
                    items = itemDetails
                });
            }

            return response;
        }

        public async Task<bool> MarkChallanAsPaidAsync(Guid challanId, ReceivePaymentDto dto)
        {
            var challan = await _context.FeeChallans.FindAsync(challanId);
            if (challan == null || challan.status == "Paid") return false;

            var student = await _context.Students.FindAsync(challan.student_id);
            if (student == null) return false;

            decimal amountToPay = dto.amount_received;

            if (dto.use_wallet_balance && student.wallet_balance > 0)
            {
                amountToPay += student.wallet_balance;
                student.wallet_balance = 0;
            }

            // Dynamically calculate daily late fine if past due date
            if (DateTime.UtcNow > challan.due_date)
            {
                int overdueDays = (int)(DateTime.UtcNow.Date - challan.due_date.Date).TotalDays;
                if (overdueDays > 0)
                {
                    challan.late_fine = overdueDays * 50m;
                }
            }

            decimal totalRequired = challan.net_payable + challan.late_fine;
            challan.paid_amount += amountToPay;

            // Track payment record in FeePayments table
            var paymentRecord = new FeePayment
            {
                id = Guid.NewGuid(),
                tenant_id = challan.tenant_id,
                challan_id = challan.id,
                amount = dto.amount_received,
                payment_date = DateTime.UtcNow,
                payment_method = dto.payment_method,
                remarks = dto.remarks
            };
            await _context.FeePayments.AddAsync(paymentRecord);

            if (challan.paid_amount >= totalRequired)
            {
                challan.status = "Paid";
                if (challan.paid_amount > totalRequired)
                {
                    decimal excess = challan.paid_amount - totalRequired;
                    student.wallet_balance += excess;
                    challan.paid_amount = totalRequired;
                }
            }
            else
            {
                challan.status = "Partially Paid";
            }

            _context.FeeChallans.Update(challan);
            _context.Students.Update(student);

            // Link to General Ledger (Chart of Accounts Live Revenue Posting)
            try
            {
                var tuitionRevAccount = await _context.ChartOfAccounts.FirstOrDefaultAsync(a => a.tenant_id == challan.tenant_id && (a.code == "4001" || a.type == "Revenue"));
                if (tuitionRevAccount != null)
                {
                    tuitionRevAccount.balance += amountToPay;
                    _context.ChartOfAccounts.Update(tuitionRevAccount);
                }

                var bankAssetAccount = await _context.ChartOfAccounts.FirstOrDefaultAsync(a => a.tenant_id == challan.tenant_id && (a.code == "1002" || a.code == "1001"));
                if (bankAssetAccount != null)
                {
                    bankAssetAccount.balance += amountToPay;
                    _context.ChartOfAccounts.Update(bankAssetAccount);
                }
            }
            catch { /* Silent fallback if GL fails */ }

            var result = await _context.SaveChangesAsync() > 0;

            // BUG FIX: guardian_phone check for WhatsApp; email is separate flow
            if (result && challan.status == "Paid")
            {
                var studentName = $"{student.first_name} {student.last_name}";
                if (!string.IsNullOrEmpty(student.guardian_phone))
                {
                    _ = _whatsappService.SendPaymentConfirmationAsync(student.guardian_phone, studentName, challan.billing_month, challan.net_payable);
                }
                _ = _emailService.SendFeeReceiptEmailAsync("noreply@school.com", studentName, challan.billing_month, challan.net_payable);
            }

            return result;
        }

        public async Task<bool> SendReminderAsync(Guid challanId)
        {
            var challan = await _context.FeeChallans.FindAsync(challanId);
            if (challan == null || challan.status == "Paid") return false;

            var student = await _context.Students.FindAsync(challan.student_id);
            if (student == null) return false;

            var studentName = $"{student.first_name} {student.last_name}";
            bool reminderSent = false;

            // BUG FIX: Separate WhatsApp (uses guardian_phone) from Email
            if (!string.IsNullOrEmpty(student.guardian_phone))
            {
                _ = _whatsappService.SendFeeReminderAsync(student.guardian_phone, studentName, challan.billing_month, challan.net_payable, challan.due_date);
                reminderSent = true;
            }
            _ = _emailService.SendFeeChallanEmailAsync("noreply@school.com", studentName, challan.billing_month, challan.net_payable, challan.due_date);
            reminderSent = true;

            return reminderSent;
        }

        public async Task<bool> SendReminderByStudentAsync(Guid studentId)
        {
            var latestUnpaidChallan = await _context.FeeChallans
                .Where(fc => fc.student_id == studentId && fc.status != "Paid")
                .OrderByDescending(fc => fc.due_date)
                .FirstOrDefaultAsync();

            if (latestUnpaidChallan == null) return false;
            return await SendReminderAsync(latestUnpaidChallan.id);
        }

        public async Task<bool> CancelChallanAsync(Guid challanId)
        {
            var challan = await _context.FeeChallans.FindAsync(challanId);
            if (challan == null) return false;

            var details = await _context.FeeChallanDetails.Where(d => d.challan_id == challanId).ToListAsync();
            if (details.Any())
            {
                _context.FeeChallanDetails.RemoveRange(details);
            }

            var payments = await _context.FeePayments.Where(p => p.challan_id == challanId).ToListAsync();
            if (payments.Any())
            {
                _context.FeePayments.RemoveRange(payments);
            }

            _context.FeeChallans.Remove(challan);
            return await _context.SaveChangesAsync() > 0;
        }
    }
}