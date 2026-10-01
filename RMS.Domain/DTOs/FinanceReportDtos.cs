using System;
using System.Collections.Generic;

namespace RMS.Domain.DTOs
{
    // ── Defaulter List DTOs ──────────────────────────────────────────────────
    public class DefaulterDto
    {
        public Guid StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string AdmissionNumber { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public string ParentPhone { get; set; } = string.Empty;
        public decimal PendingAmount { get; set; }
        public string AgingCategory { get; set; } = string.Empty; // "1-30 Days", "31-60 Days", "61-90 Days", "90+ Days"
        public int OverdueChallansCount { get; set; }
    }

    public class DefaulterReportDto
    {
        public decimal TotalPendingAmount { get; set; }
        public int TotalDefaulters { get; set; }
        public Dictionary<string, decimal> AgingSummary { get; set; } = new();
        public List<DefaulterDto> Defaulters { get; set; } = new();
    }

    // ── Profit & Loss DTOs ───────────────────────────────────────────────────
    public class ProfitAndLossDto
    {
        public decimal TotalRevenue { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal NetProfit { get; set; }   // set explicitly so JSON serializes correctly

        // Top-level category summaries (for bar charts)
        public List<FinanceCategorySummaryDto> RevenueBreakdown { get; set; } = new();
        public List<FinanceCategorySummaryDto> ExpenseBreakdown { get; set; } = new();

        // Detailed line items for the full P&L statement table
        public List<PnlLineItemDto> RevenueItems { get; set; } = new();
        public List<PnlLineItemDto> ExpenseItems { get; set; } = new();

        // Report metadata
        public string PeriodLabel { get; set; } = string.Empty;
        public int TotalPaymentsCount { get; set; }
        public int TotalExpenseCount { get; set; }
    }

    public class FinanceCategorySummaryDto
    {
        public string Category { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public decimal Percentage { get; set; }
        public int Count { get; set; }
    }

    /// <summary>Individual P&L line item — one row per transaction/payment</summary>
    public class PnlLineItemDto
    {
        public string Date { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Reference { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Source { get; set; } = string.Empty;   // "FeePayment" | "Expense" | "Salary" | "LateFine"
    }

    // ── Daily Collection DTOs ────────────────────────────────────────────────
    public class DailyCollectionDto
    {
        public DateTime Date { get; set; }
        public decimal TotalCollected { get; set; }
        public int TotalTransactions { get; set; }
        
        // Simulating modes for now since DB only has 'status' = Paid
        public decimal CashCollection { get; set; }
        public decimal BankCollection { get; set; }
        
        public List<DailyCollectionTransactionDto> Transactions { get; set; } = new();
    }

    public class DailyCollectionTransactionDto
    {
        public string ReceiptNumber { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string ClassName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string PaymentMode { get; set; } = string.Empty;
        public DateTime PaymentTime { get; set; }
    }

    // ── General Ledger DTOs ──────────────────────────────────────────────────
    public class GeneralLedgerTransactionDto
    {
        public string Id { get; set; } = string.Empty;
        public string VoucherNo { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public Guid? DebitAccountId { get; set; }
        public string DebitAccountName { get; set; } = string.Empty;
        public string DebitAccountType { get; set; } = string.Empty;
        public Guid? CreditAccountId { get; set; }
        public string CreditAccountName { get; set; } = string.Empty;
        public string CreditAccountType { get; set; } = string.Empty;
        public string Narrative { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Source { get; set; } = string.Empty;
        public DateTime PostedAt { get; set; }
    }
}

