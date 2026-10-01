# 🏫 VOKE Solutions SMS — Phase 6: Finance, Complete Fee Lifecycle & Payroll

> **System:** VOKE Solutions School Management System (SMS)  
> **Phase Target:** Phase 6 — Chart of Accounts, General Ledger, Fee Structures, Concessions, Challan Generation & POS Collection, Student Digital Wallets, Operational Expenses & Monthly Staff Payroll  
> **Documentation Style:** Point-to-Point Step-by-Step Guide with Clean Data Tables  
> **Language:** English  
> **Data Integrity:** 100% Relational Human-Readable Dataset — **Zero Raw GUIDs (Fully Linked to Phase 1, Phase 2, Phase 3 & Phase 5)**

---

## 📑 Phase 6 Navigation Overview

* [Screen 6.1: Chart of Accounts & Head Hierarchy (`/ChartOfAccounts`)](#-screen-61-chart-of-accounts--head-hierarchy)
* [Screen 6.2: General Ledger & Double-Entry Journal (`/GeneralLedger`)](#-screen-62-general-ledger--double-entry-journal)
* [Screen 6.3: Fee Heads Master Setup (`/FeeSetup`)](#-screen-63-fee-heads-master-setup)
* [Screen 6.4: Class Fee Structures Builder (`/FeeStructures`)](#-screen-64-class-fee-structures-builder)
* [Screen 6.5: Fee Concession & Sibling Discount Manager (`/FeeConcessions`)](#-screen-65-fee-concession--sibling-discount-manager)
* [Screen 6.6: Fee Challan Generation & POS Fee Collection (`/FeeChallans`)](#-screen-66-fee-challan-generation--pos-fee-collection)
* [Screen 6.7: Fee Defaulters Tracker & Recovery (`/FeeDefaulters`)](#-screen-67-fee-defaulters-tracker--recovery)
* [Screen 6.8: Student Digital Wallets & Canteen Top-ups (`/StudentWallets`)](#-screen-68-student-digital-wallets--canteen-top-ups)
* [Screen 6.9: School Operational Expenses Tracker (`/SchoolExpensesTracker`)](#-screen-69-school-operational-expenses-tracker)
* [Screen 6.10: Staff Salary Slips & Monthly Payroll Generation (`/SalarySlipsManager`)](#-screen-610-staff-salary-slips--monthly-payroll-generation)
* [Screen 6.11: Financial Audit Logs & Transactions Trail (`/FinancialAuditLogs`)](#-screen-611-financial-audit-logs--transactions-trail)

---

## 🏛️ Screen 6.1: Chart of Accounts & Head Hierarchy

### 📌 1. Screen Identity & Overview
* **Screen Name:** Chart of Accounts (COA) Tree & Financial Architecture
* **Navigation Route:** `/ChartOfAccounts`
* **Source File Location:** `src/features/finance/ChartOfAccountsManager.tsx`
* **Authorized Access:** Super Administrator, Chief Financial Officer (CFO), Senior Accountant

### 🎯 2. Operational Value & Business Purpose
* **Standard Double-Entry Accounting:** Establishes the 5 foundational account types (*Assets*, *Liabilities*, *Equity*, *Revenue*, *Expenses*).
* **Multi-Tier Head Hierarchy:** Supports 4-level parent-child tree structures (e.g., `Current Assets` ➔ `Cash & Bank Balances` ➔ `Meezan Bank Operations Account`).
* **Automated Voucher Mapping:** All student fee collections, vendor payments, and staff salary disbursements post journal vouchers directly into these accounts.

### 📝 3. Form Fields & Input Information
* **Account Code:** Standard numeric code (e.g., `1001-Cash`, `4001-Tuition Revenue`, `5001-Staff Salaries`).
* **Account Title:** Full display title (e.g., *Meezan Bank Fee Collection Account*).
* **Account Type:** Asset, Liability, Equity, Revenue, Expense.
* **Parent Head:** Select parent classification from tree dropdown.
* **Opening Balance:** Initial balance for balance sheet reconciliation.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Explore COA Hierarchy:** Toggle between Interactive Tree Explorer and Tabular Grid View.
2. **Add an Account Head:**
   * Click **"+ Add Account Head"**.
   * In `<ProfileDrawer>`, pick Account Type (*Asset*, *Expense*, etc.), enter Account Code (`1002`) and Title (*Allied Bank Petty Cash*).
   * Click **"Save Account Head"**.
3. **Inspect Account Ledger:** Click **"View Ledger"** on any head to inspect all debits, credits, and running balance.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Account Code | Account Head Title | Category Type | Parent Classification | Level | Current Net Balance | Status |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **1001** | Main Cash in Vault (Petty Cash) | Asset | Current Assets | Level 2 | Rs. 450,000 (Dr) | `Active` |
| **1002** | Meezan Bank - Fee Collection A/C | Asset | Bank Balances | Level 2 | Rs. 14,850,000 (Dr) | `Active` |
| **1003** | HBL - Operational & Payroll A/C | Asset | Bank Balances | Level 2 | Rs. 5,200,000 (Dr) | `Active` |
| **2001** | Staff Security Deposits Payable | Liability | Current Liabilities | Level 2 | Rs. 1,200,000 (Cr) | `Active` |
| **3001** | School Owner's Equity Capital | Equity | Retained Earnings | Level 1 | Rs. 25,000,000 (Cr) | `Active` |
| **4001** | Student Tuition Fee Revenue | Revenue | Operating Income | Level 2 | Rs. 42,700,000 (Cr) | `Active` |
| **4002** | Admission & Registration Fees | Revenue | Non-Operating Income | Level 2 | Rs. 3,500,000 (Cr) | `Active` |
| **5001** | Teaching & Support Staff Salaries | Expense | Operational Expenses | Level 2 | Rs. 28,500,000 (Dr) | `Active` |
| **5002** | Campus Electricity, Water & Gas | Expense | Utilities Expenses | Level 2 | Rs. 2,150,000 (Dr) | `Active` |

---

## 📖 Screen 6.2: General Ledger & Double-Entry Journal

### 📌 1. Screen Identity & Overview
* **Screen Name:** General Ledger & Journal Voucher Audit Registry
* **Navigation Route:** `/GeneralLedger`
* **Source File Location:** `src/features/finance/GeneralLedger.tsx`
* **Authorized Access:** Senior Accountant, Internal Auditor, Campus Principal

### 🎯 2. Operational Value & Business Purpose
* **Complete Financial Trail:** Displays chronological double-entry debit and credit journal vouchers generated across the entire school system.
* **Debit-Credit Parity Guarantee:** Enforces mathematical equality between total debits and total credits, eliminating manual bookkeeping discrepancies.
* **Drill-Down to Source Documents:** Allows accountants to click on any journal entry to inspect the original student fee receipt, payroll slip, or vendor utility bill.

### 📝 3. Ledger Attributes & Information Elements
* **Voucher Number:** Unique transaction reference (e.g., `JV-2026-0810`, `CRV-2026-0421`).
* **Posting Date:** Date financial event took effect.
* **Account Head & Code:** Target COA account.
* **Narrative / Description:** Detailed transaction purpose (e.g., *August Fee Collection - Muhammad Ali Khan - Challan # CH-2026-AUG-0101*).
* **Debit / Credit Amounts:** Transaction currency values in PKR.
* **Running Account Balance:** Real-time calculated head balance.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Filter Date Range:** Select Month/Year range to inspect ledger entries.
2. **Filter by Account Head:** Choose `Meezan Bank Fee Collection A/C (1002)` to verify bank statement deposits.
3. **Add Manual Journal Entry:**
   * Click **"+ Post Manual Journal Voucher"**.
   * Enter Debit account, Credit account, Amount, and narrative justification.
   * Click **"Post Voucher"**.
4. **Export Ledger:** Click **"Download General Ledger (PDF)"** for annual statutory audits.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Voucher # | Date | Account Head Affected | Transaction Narrative | Debit (PKR) | Credit (PKR) | Running Balance |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **CRV-2026-0801** | 2026-08-10 | Main Cash in Vault (`1001`) | Fee Received - Ali Khan (`AD-2026-0101`) | Rs. 6,000 | - | Rs. 456,000 (Dr) |
| **CRV-2026-0801** | 2026-08-10 | Tuition Fee Revenue (`4001`) | Fee Received - Ali Khan (`AD-2026-0101`) | - | Rs. 6,000 | Rs. 42,706,000 (Cr)|
| **CPV-2026-0805** | 2026-08-25 | Staff Salaries Expense (`5001`)| Salary - Fatima Zahra (`STF-1005`)| Rs. 74,000 | - | Rs. 28,574,000 (Dr)|
| **CPV-2026-0805** | 2026-08-25 | HBL Payroll Account (`1003`) | Salary - Fatima Zahra (`STF-1005`)| - | Rs. 74,000 | Rs. 5,126,000 (Dr) |
| **JV-2026-0812** | 2026-08-26 | Utilities Expense (`5002`) | IESCO Electricity Bill August 2026 | Rs. 185,000 | - | Rs. 2,335,000 (Dr) |
| **JV-2026-0812** | 2026-08-26 | Meezan Bank A/C (`1002`) | IESCO Electricity Bill August 2026 | - | Rs. 185,000 | Rs. 14,665,000 (Dr)|

---

## 🏷️ Screen 6.3: Fee Heads Master Setup

### 📌 1. Screen Identity & Overview
* **Screen Name:** Fee Heads Master Setup & Billing Frequencies
* **Navigation Route:** `/FeeSetup`
* **Source File Location:** `src/features/finance/FeeSetup.tsx`
* **Authorized Access:** Senior Accountant, Campus Principal

### 🎯 2. Operational Value & Business Purpose
* **Standardized Fee Categories:** Establishes all fee billing items charged to students (e.g., Monthly Tuition Fee, Admission Fee, Science Lab Charges, Exam Fee, Transport Fee).
* **Billing Frequency Control:** Controls whether a fee head is billed `Monthly`, `Quarterly`, `Per Term (Bi-Annual)`, or `One-Time on Admission`.
* **Chart of Accounts Binding:** Binds each fee item directly to a revenue COA account to ensure automated bookkeeping.

### 📝 3. Form Fields & Input Information
* **Fee Head Code:** Alphanumeric identifier (e.g., `FEE-TUIT`, `FEE-ADMIS`, `FEE-LAB`).
* **Fee Head Title:** Display name printed on vouchers (e.g., *Monthly Tuition Fee*).
* **Billing Frequency:** Selection (*Monthly*, *Quarterly*, *Per Term*, *Annual*, *One-Time*).
* **Is Refundable:** Flag for security deposits (Yes/No).
* **Linked Revenue Account:** Mapping to COA Head (e.g., `4001 - Tuition Revenue`).

### ⚙️ 4. Step-by-Step Operator Guide
1. **Review Active Fee Heads:** Inspect list of configured fee heads with frequencies and status badges.
2. **Add New Fee Head:**
   * Click **"+ Add Fee Head"**.
   * Enter Code (`FEE-LAB`), Title (*Science & Computer Lab Charges*), Frequency (*Monthly*), and link to Revenue COA.
   * Click **"Save Fee Head"**.
3. **Edit / Retire Fee Heads (`...`):** Update billing rules or deactivate obsolete fee heads.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Fee Head Code | Fee Head Title | Billing Frequency | Linked Revenue Account | Is Refundable? | Tax Applicable? | Status |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **FEE-TUIT** | Monthly Tuition Fee | Monthly | `4001 - Tuition Revenue` | `No` | `No` | `Active` |
| **FEE-ADMIS** | Admission & Registration Fee | One-Time (On Admission) | `4002 - Admission Revenue` | `No` | `No` | `Active` |
| **FEE-SECDP** | Security Caution Deposit | One-Time (On Admission) | `2001 - Security Deposit Liability`| `Yes` | `No` | `Active` |
| **FEE-LAB** | Science & Computer Lab Charges | Monthly | `4001 - Tuition Revenue` | `No` | `No` | `Active` |
| **FEE-EXAM** | Term Examination & Broadsheet Fee| Per Term (Bi-Annual) | `4001 - Tuition Revenue` | `No` | `No` | `Active` |
| **FEE-TRNSP** | School Bus Transport Charges | Monthly | `4001 - Tuition Revenue` | `No` | `No` | `Active` |
| **FEE-LATE** | Overdue Challan Late Payment Fine| Dynamic Per Day | `4002 - Other Income` | `No` | `No` | `Active` |

---

## 🏗️ Screen 6.4: Class Fee Structures Builder

### 📌 1. Screen Identity & Overview
* **Screen Name:** Class Fee Structures & Grade Package Builder
* **Navigation Route:** `/FeeStructures`
* **Source File Location:** `src/features/finance/FeeStructures.tsx`
* **Authorized Access:** Senior Accountant, Campus Principal, School Board

### 🎯 2. Operational Value & Business Purpose
* **Grade-Wise Tariff Matrix:** Binds fee heads from Screen 6.3 with specific monthly rupee amounts for each grade (e.g., Grade 10-Science tuition = Rs. 6,000/mo, Montessori tuition = Rs. 4,500/mo).
* **Automated Batch Invoicing:** When the accountant runs the monthly challan generation engine, it pulls amounts directly from this structure.
* **Cambridge vs Matric Segregation:** Allows different fee tariffs for O-Level vs Matriculation streams.

### 📝 3. Form Fields & Input Information
* **Target Class:** Select grade level from `<SearchableSelect>` (e.g., `Grade 10 - Science`).
* **Fee Head:** Select fee item (e.g., `Monthly Tuition Fee`).
* **Billing Frequency:** Auto-pulled from fee head.
* **Standard Amount (PKR):** Prescribed fee amount (e.g., `Rs. 6,000.00`).

### ⚙️ 4. Step-by-Step Operator Guide
1. **Filter by Grade:** Select `Grade 10 - Science` to inspect its complete fee breakdown.
2. **Assign Fee Item to Class:**
   * Click **"+ Add Fee Structure Item"**.
   * Pick Class (`Grade 10 - Science`), Fee Head (`Monthly Tuition Fee`), and enter Amount (`Rs. 6,000`).
   * Click **"Save Structure"**.
3. **Review Total Class Tariff:** Verify total monthly billable sum per student in that grade.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Structure Code | Applicable Grade Level | Fee Head Applied | Frequency | Standard Amount (PKR) | Created Date | Status |
| :--- | :--- | :--- | :--- | :---: | :--- | :---: |
| **STRUC-10-TUIT** | Grade 10 - Science | Monthly Tuition Fee | Monthly | **Rs. 6,000.00** | 2026-08-01 | `Active` |
| **STRUC-10-LAB** | Grade 10 - Science | Science & Computer Lab | Monthly | **Rs. 1,000.00** | 2026-08-01 | `Active` |
| **STRUC-10-EXAM** | Grade 10 - Science | Midterm Examination Fee | Per Term | **Rs. 1,500.00** | 2026-08-01 | `Active` |
| **STRUC-09-TUIT** | Grade 9 - Science | Monthly Tuition Fee | Monthly | **Rs. 5,500.00** | 2026-08-01 | `Active` |
| **STRUC-08-TUIT** | Grade 8 | Monthly Tuition Fee | Monthly | **Rs. 5,000.00** | 2026-08-01 | `Active` |
| **STRUC-01-TUIT** | Grade 1 | Monthly Tuition Fee | Monthly | **Rs. 4,500.00** | 2026-08-01 | `Active` |
| **STRUC-O1-TUIT** | O-Level (Year 1) | Cambridge Tuition Fee | Monthly | **Rs. 12,000.00** | 2026-08-01 | `Active` |
| **STRUC-KG-TUIT** | Kindergarten (KG) | Montessori Monthly Fee | Monthly | **Rs. 4,000.00** | 2026-08-01 | `Active` |

---

## 🎁 Screen 6.5: Fee Concession & Sibling Discount Manager

### 📌 1. Screen Identity & Overview
* **Screen Name:** Student Fee Concessions, Scholarships & Sibling Discounts
* **Navigation Route:** `/FeeConcessions`
* **Source File Location:** `src/features/finance/FeeConcessionsManager.tsx`
* **Authorized Access:** Campus Principal, Finance Director, Senior Accountant

### 🎯 2. Operational Value & Business Purpose
* **Policy-Driven Discounts:** Grants special fee concessions (e.g., 100% Merit Scholarship, 50% Teacher Child Concession, 25% Sibling Discount, Need-Based Aid).
* **Automated Voucher Subtraction:** When monthly fee challans are generated, the system automatically subtracts concession amounts before calculating net payable.
* **Audit Control:** Requires administrative approval with recorded justification remarks to prevent unauthorized fee waivers.

### 📝 3. Form Fields & Input Information
* **Target Student:** Select student from directory (e.g., `Hamza Tariq - AD-2026-0102`).
* **Concession Category:** *Sibling Discount (2nd Child)*, *Academic Merit Scholarship*, *Teacher / Staff Ward*, *Orphan / Need-Based*.
* **Discount Type:** `Percentage` (e.g., `25%`) or `Fixed Amount` (e.g., `Rs. 2,000/mo`).
* **Applicable Fee Head:** (e.g., `Monthly Tuition Fee`).
* **Approval Notes & Justification:** Official reason and board approval reference.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Search Concessions:** Filter by student name, concession type, or class.
2. **Grant New Concession:**
   * Click **"+ Grant Fee Concession"**.
   * Select student (`Hamza Tariq - Grade 10-A`).
   * Choose Discount Type (*Percentage: 25%*) and category (*Sibling Concession*).
   * Enter justification (e.g., *Second child of Tariq Mehmood Khan - PRN-2026-001*).
   * Click **"Save & Approve Concession"**.
3. **Deactivate Concession:** Revoke discount if student fails to maintain required academic GPA.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Concession # | Student Name | Enrolled Class | Concession Category | Discount Applied | Original Tuition | Net Discounted Tuition |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **CONC-2026-01** | Hamza Tariq (`AD-2026-0102`) | Grade 10-A | Sibling Concession (2nd Child) | `25% Discount` | Rs. 6,000 | **Rs. 4,500 / Mo** |
| **CONC-2026-02** | Ayesha Bibi (`AD-2026-0103`) | Grade 10-A | Academic 100% Merit Scholarship| `100% Full Waiver`| Rs. 6,000 | **Rs. 0 / Mo** |
| **CONC-2026-03** | Zainab Fatima (`AD-2026-0106`)| Grade 9-A | Sibling Concession (2nd Child) | `25% Discount` | Rs. 5,500 | **Rs. 4,125 / Mo** |
| **CONC-2026-04** | Ahmed Raza (`AD-2026-0107`) | Grade 1-A | Staff Child Concession (50%) | `50% Discount` | Rs. 4,500 | **Rs. 2,250 / Mo** |
| **CONC-2026-05** | Muhammad Ali Khan (`AD-2026-0101`)| Grade 10-A | Regular (No Concession / 1st Child)| `0% (Standard)`| Rs. 6,000 | **Rs. 6,000 / Mo** |

---

## 💳 Screen 6.6: Fee Challan Generation & POS Fee Collection

### 📌 1. Screen Identity & Overview
* **Screen Name:** Monthly Fee Challan Generator & Cashier Point-of-Sale (POS)
* **Navigation Route:** `/FeeChallans`
* **Source File Location:** `src/features/finance/FeeChallans.tsx`
* **Authorized Access:** Cashier, Fee Accountant, Campus Principal

### 🎯 2. Operational Value & Business Purpose
* **Mass Batch Generation:** Generates 1,500+ student fee vouchers for the entire campus for any billing month in under 10 seconds with barcode IDs.
* **Instant Cashier POS Collection:** Cashier scans barcode or enters Admission Number, verifies amount, receives cash/card, and prints a 3-copy stamped receipt (School Copy, Bank Copy, Student Copy).
* **Multi-Channel Payments:** Supports Cash Desk, 1Link 1Bill Online Banking, Credit Card, and Direct Bank Transfers.

### 📝 3. Form Fields & Screen Controls
* **Billing Month & Year:** (e.g., `August 2026`).
* **Due Date & Validity Date:** (e.g., Due: `10th August 2026`, Valid Till: `20th August 2026`).
* **Payment Modes:** `Cash Counter`, `Bank Deposit Slip (Meezan)`, `Online 1Link / Kuickpay`, `Student Digital Wallet`.
* **Challan Statuses:** `Unpaid` (Amber), `Paid` (Emerald Green), `Overdue` (Red), `Partially Paid` (Blue).

### ⚙️ 4. Step-by-Step Operator Guide
1. **Generate Monthly Vouchers:** Click **"Generate Monthly Challans"** ➔ Select Month (`August 2026`) and Due Date (`2026-08-10`) ➔ Click **"Run Billing Engine"**.
2. **Collect Payment at POS Counter:**
   * Scan barcode on voucher or type student Roll # (`101`).
   * System opens `<ReceivePaymentModal>` showing Gross Amount, Concessions, and Late Fines.
   * Select Payment Method (*Cash Counter*) and click **"Confirm & Receive Payment"**.
   * System posts journal voucher to general ledger and sends instant SMS receipt to parent's phone.
3. **Print Printable Voucher:** Click **"Print 3-Copy Challan (PDF)"** for physical bank distribution.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Challan Number | Student Name | Class | Billing Month | Due Date | Gross Bill | Concession | Late Fine | Net Payable | Paid Status |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **CH-2026-AUG-0101** | Muhammad Ali Khan | Grade 10-A | August 2026 | 2026-08-10 | Rs. 6,000 | Rs. 0 | Rs. 0 | **Rs. 6,000** | `Paid (Cash Desk)` |
| **CH-2026-AUG-0102** | Hamza Tariq | Grade 10-A | August 2026 | 2026-08-10 | Rs. 6,000 | -Rs. 1,500 | Rs. 0 | **Rs. 4,500** | `Paid (Online 1Link)`|
| **CH-2026-AUG-0103** | Ayesha Bibi | Grade 10-A | August 2026 | 2026-08-10 | Rs. 6,000 | -Rs. 6,000 | Rs. 0 | **Rs. 0** | `Paid (Merit 100%)` |
| **CH-2026-AUG-0104** | Bilal Hassan | Grade 10-A | August 2026 | 2026-08-10 | Rs. 6,000 | Rs. 0 | Rs. 0 | **Rs. 6,000** | `Paid (Bank Deposit)` |
| **CH-2026-AUG-0105** | Usman Ghani Jr. | Grade 10-A | August 2026 | 2026-08-10 | Rs. 12,000 | Rs. 0 | Rs. 500 | **Rs. 12,500** | `Overdue / Unpaid` |
| **CH-2026-AUG-0106** | Zainab Fatima | Grade 9-A | August 2026 | 2026-08-10 | Rs. 5,500 | -Rs. 1,375 | Rs. 0 | **Rs. 4,125** | `Paid (Cash Desk)` |
| **CH-2026-AUG-0107** | Ahmed Raza | Grade 1-A | August 2026 | 2026-08-10 | Rs. 4,500 | -Rs. 2,250 | Rs. 0 | **Rs. 2,250** | `Paid (Cash Desk)` |

---

## ⚠️ Screen 6.7: Fee Defaulters Tracker & Recovery

### 📌 1. Screen Identity & Overview
* **Screen Name:** Fee Defaulters Tracker & Automated Recovery Engine
* **Navigation Route:** `/FeeDefaulters`
* **Source File Location:** `src/features/finance/FeeDefaultersManager.tsx`
* **Authorized Access:** Senior Accountant, Campus Principal, Recovery Officer

### 🎯 2. Operational Value & Business Purpose
* **Overdue Debt Recovery:** Filters all students who have failed to pay their fee vouchers past the due date.
* **Aging Analysis:** Categorizes unpaid dues by aging buckets (30 Days Overdue, 60 Days Overdue, 90+ Days Critical).
* **Automated WhatsApp & SMS Dunning Notices:** Dispatches batch reminder messages to parents with outstanding invoice links.

### 📝 3. Key Metrics & Controls
* **Total Outstanding Dues:** Cumulative unpaid arrears across the branch (e.g., `Rs. 485,000`).
* **Total Defaulter Students:** Count of students with unpaid vouchers (e.g., `38 Students`).
* **WhatsApp Reminder Action:** 1-click dispatch of formatted reminder messages.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Review Aging Buckets:** Check cards for 30-Day, 60-Day, and 90-Day overdue students.
2. **Send Automated Dunning Notices:**
   * Select multi-select checkboxes for all defaulters.
   * Click **"Send WhatsApp Reminders"** or **"Send SMS Reminders"**.
3. **Exam Admit Card Freeze:** Toggle **"Hold Exam Roll No Slip"** for critical 90+ day defaulters until accounts are cleared.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Admission # | Student Name | Class | Guardian Name | WhatsApp Phone | Unpaid Months | Arrear Balance | Overdue Status |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **AD-2026-0105** | Usman Ghani Jr. | Grade 10-A | Usman Ghani | 0345-2233112 | 2 Months (Jul + Aug) | Rs. 12,500 | `60 Days Overdue` |
| **AD-2026-0112** | Shahzad Karim | Grade 8-A | Karim Bux | 0300-8877665 | 3 Months (Jun, Jul, Aug)| Rs. 15,000 | `90+ Days (Critical)`|
| **AD-2026-0119** | Danish Ali | Grade 9-B | Ali Asghar | 0321-9900112 | 1 Month (Aug 2026) | Rs. 5,500 | `30 Days Overdue` |
| **AD-2026-0125** | Mariam Bibi | Grade 1-A | Zahid Khan | 0333-1144556 | 2 Months (Jul + Aug) | Rs. 9,000 | `60 Days Overdue` |

---

## 🪙 Screen 6.8: Student Digital Wallets & Canteen Top-ups

### 📌 1. Screen Identity & Overview
* **Screen Name:** Student Digital Wallet & Cashless Campus Ledger
* **Navigation Route:** `/StudentWallets`
* **Source File Location:** `src/features/finance/StudentWalletManager.tsx`
* **Authorized Access:** Cashier, Canteen Manager, Bookshop In-Charge, Accountant

### 🎯 2. Operational Value & Business Purpose
* **Cashless School Campus:** Students carry RFID student ID cards loaded with digital prepaid funds.
* **Canteen & Bookshop POS:** Students tap their badge at the school canteen or stationary shop to purchase lunch, books, and uniforms without handling cash.
* **Parent Spending Controls:** Parents set daily spending limits (e.g., max Rs. 300/day) and review purchase history from the Parent Portal.

### 📝 3. Form Fields & Input Information
* **Student Identifier:** Scan barcode on student ID badge (e.g., `AD-2026-0101`).
* **Top-Up Amount:** Rupee deposit into wallet (e.g., `Rs. 3,000.00`).
* **Daily Spending Cap:** Maximum allowable daily debit limit (e.g., `Rs. 300.00`).
* **Transaction Type:** `Deposit (Credit)`, `Canteen Purchase (Debit)`, `Bookshop Debit`, `Fee Payment Transfer`.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Scan Student Badge:** Cashier scans RFID ID card to pull current balance.
2. **Top-Up Funds:** Click **"Top-Up Wallet"** ➔ Enter Amount (`Rs. 2,000`) ➔ Receive cash ➔ Click **"Confirm Deposit"**.
3. **Canteen POS Debit:** Canteen cashier selects items (Sandwich + Juice = Rs. 180) ➔ Student taps card ➔ Balance updates instantly.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Wallet # | Student Name | Class | Current Balance | Daily Spend Limit | Total Deposited This Month | Last Transaction |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **WAL-101** | Muhammad Ali Khan | Grade 10-A | **Rs. 2,450.00** | Rs. 300 / Day | Rs. 5,000.00 | Lunch Purchase: -Rs. 150 |
| **WAL-102** | Hamza Tariq | Grade 10-A | **Rs. 1,820.00** | Rs. 300 / Day | Rs. 3,000.00 | Stationery Purchase: -Rs. 80 |
| **WAL-103** | Ayesha Bibi | Grade 10-A | **Rs. 3,100.00** | Rs. 400 / Day | Rs. 4,000.00 | Library Fine: -Rs. 50 |
| **WAL-104** | Bilal Hassan | Grade 10-A | **Rs. 850.00** | Rs. 250 / Day | Rs. 2,000.00 | Lunch Purchase: -Rs. 120 |
| **WAL-107** | Ahmed Raza | Grade 1-A | **Rs. 1,200.00** | Rs. 200 / Day | Rs. 2,000.00 | Milk & Cookie: -Rs. 100 |

---

## 📉 Screen 6.9: School Operational Expenses Tracker

### 📌 1. Screen Identity & Overview
* **Screen Name:** School Operational Expenses Tracker & Petty Cash Vault
* **Navigation Route:** `/SchoolExpensesTracker`
* **Source File Location:** `src/features/finance/SchoolExpensesTracker.tsx`
* **Authorized Access:** Senior Accountant, Campus Principal, Finance Officer

### 🎯 2. Operational Value & Business Purpose
* **Campus Outflow Tracking:** Records all operational payments (IESCO Electricity bills, Sui Gas, Building Rent, Science Lab Chemicals, Sports Equipment, Bus Fuel).
* **Payment Method Routing:** Deducts expense amounts directly from *Petty Cash Vault*, *Meezan Bank Operations Account*, or *Corporate Card*.
* **Bill Receipt Uploads:** Attaches scanned utility bills, vendor invoices, and fuel receipts using `<ImageUpload>`.

### 📝 3. Form Fields & Input Information
* **Expense Category:** Dropdown (*Utilities*, *Repairs & Maintenance*, *Transport Fuel*, *Stationery*, *Marketing*, *Lab Consumables*).
* **Expense Title:** Description (e.g., *IESCO Campus Electricity Bill August 2026*).
* **Expense Amount (PKR):** (e.g., `Rs. 185,000.00`).
* **Payment Mode:** *Bank Transfer*, *Petty Cash Vault*, *Cheque*.
* **Vendor Name & Invoice #:** Billing company name and receipt number.
* **Receipt Image Upload:** Scanned bill attachment.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Review Expense Analytics:** Check monthly expenditure totals vs annual operating budget.
2. **Log New Expense:**
   * Click **"+ Log New Expense"**.
   * Pick Category (*Utilities*), Title (*IESCO Bill*), Amount (`Rs. 185,000`), and Payment Mode (*Bank Transfer*).
   * Upload scanned copy of paid electricity bill.
   * Click **"Save & Post Expense"**.
3. **Automated Journal Posting:** System debits `Utilities Expense (5002)` and credits `Bank Account (1002)` in the General Ledger.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Expense Code | Expense Description | Category | Amount (PKR) | Payment Mode | Vendor / Payee | Date Incurred | Paid By |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **EXP-2026-081** | IESCO Campus Electricity Bill | Utilities | **Rs. 185,000** | Bank Transfer | IESCO Islamabad | 2026-08-26 | Kamran Akmal (`STF-1003`) |
| **EXP-2026-082** | Physics & Chem Lab Chemicals | Lab Supplies | **Rs. 45,000** | Cheque # 88412 | Scientific Supplies Ltd | 2026-08-24 | Kamran Akmal (`STF-1003`) |
| **EXP-2026-083** | School Bus Diesel Refill (4 Buses) | Transport Fuel | **Rs. 95,000** | Corporate Card | PSO Fuel Station H-8 | 2026-08-22 | Subhan Ali (`STF-1007`) |
| **EXP-2026-084** | Exam Answer Sheets & Printing | Printing & Stationery | **Rs. 32,000** | Petty Cash Vault| Al-Madina Printers | 2026-08-20 | Kamran Akmal (`STF-1003`) |
| **EXP-2026-085** | Campus Air Conditioner Servicing | Maintenance | **Rs. 28,000** | Petty Cash Vault| CoolTech Services | 2026-08-18 | Kamran Akmal (`STF-1003`) |

---

## 📑 Screen 6.10: Staff Salary Slips & Monthly Payroll Generation

### 📌 1. Screen Identity & Overview
* **Screen Name:** Monthly Staff Payroll Engine & Salary Slip Distribution
* **Navigation Route:** `/SalarySlipsManager` (or `/PayrollSlips`)
* **Source File Location:** `src/features/finance/SalarySlipsManager.tsx`
* **Authorized Access:** Senior Accountant, Campus Principal, HR Director

### 🎯 2. Operational Value & Business Purpose
* **Automated Monthly Payroll Engine:** Computes monthly net salaries for all 100+ employees in one click by aggregating:  
  `Net Salary = Basic Salary + Allowances - (Loan Deductions + Unpaid Leave Days + Income Tax)`.
* **Biometric & Loan Integration:** Auto-pulls deductible absent days from Screen 3.2 and monthly loan installments from Screen 3.5.
* **Direct Bank Transfer Export:** Generates standardized 1Link / Bank Corporate Excel salary upload sheets for instant bulk disbursement.

### 📝 3. Form Fields & Payroll Components
* **Basic Monthly Salary:** Prescribed base pay from employee profile (e.g., `Rs. 75,000`).
* **Allowances:** House Rent Allowance, Medical Allowance, Conveyance Allowance.
* **Deductions:** Loan Installment Recovery, Biometric Late Penalty/LWP, Income Tax.
* **Net Payable Salary:** Final net amount deposited into employee's bank account.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Run Monthly Payroll Engine:**
   * Select Month (`August 2026`) and click **"Run Payroll Calculation"**.
   * System calculates gross pay, allowances, loans, and biometric deductions for all staff.
2. **Review & Audit Payroll Sheet:** Review net payouts per teacher.
3. **Disburse & Lock Payroll:** Click **"Approve & Disburse Payroll"** ➔ Posts salary voucher in ledger ➔ Sends pay slips to teacher dashboards.
4. **Print Salary Slips:** Click **"Download All Salary Slips (PDF)"**.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Salary Slip # | Employee Name | Designation | Basic Pay | Allowances | Loan Deduction | Attendance Deduction | Net Payable Salary | Payment Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **SLP-2026-0801** | Prof. Tariq Mehmood (`STF-1001`)| Campus Principal | Rs. 150,000 | +Rs. 20,000 | -Rs. 0 | -Rs. 0 | **Rs. 170,000** | `Disbursed & Paid` |
| **SLP-2026-0802** | Dr. Shahida Parveen (`STF-1004`)| Girls Wing Principal| Rs. 140,000 | +Rs. 15,000 | -Rs. 0 | -Rs. 0 | **Rs. 155,000** | `Disbursed & Paid` |
| **SLP-2026-0803** | Fatima Zahra (`STF-1005`) | Senior Math Teacher | Rs. 75,000 | +Rs. 5,000 | -Rs. 6,000 | -Rs. 0 | **Rs. 74,000** | `Disbursed & Paid` |
| **SLP-2026-0804** | Hina Qasim (`STF-1010`) | Senior Physics Teacher| Rs. 70,000 | +Rs. 5,000 | -Rs. 5,000 | -Rs. 3,500 (LWP) | **Rs. 66,500** | `Disbursed & Paid` |
| **SLP-2026-0805** | Kamran Akmal (`STF-1003`) | Senior Finance Officer| Rs. 85,000 | +Rs. 10,000 | -Rs. 0 | -Rs. 0 | **Rs. 95,000** | `Disbursed & Paid` |
| **SLP-2026-0806** | Muhammad Rashid (`STF-1006`)| Chief Librarian | Rs. 60,000 | +Rs. 5,000 | -Rs. 5,000 | -Rs. 0 | **Rs. 60,000** | `Disbursed & Paid` |
| **SLP-2026-0807** | Subhan Ali (`STF-1007`) | Transport Fleet Head | Rs. 55,000 | +Rs. 5,000 | -Rs. 0 (Repaid) | -Rs. 0 | **Rs. 60,000** | `Disbursed & Paid` |
| **SLP-2026-0808** | Zainab Bibi (`STF-1011`) | Junior Teacher | Rs. 45,000 | +Rs. 3,000 | -Rs. 2,500 | -Rs. 3,750 (LWP) | **Rs. 41,750** | `Disbursed & Paid` |

---

## 🔍 Screen 6.11: Financial Audit Logs & Transactions Trail

### 📌 1. Screen Identity & Overview
* **Screen Name:** Financial Audit Trail & Fiscal Modification Forensics
* **Navigation Route:** `/FinancialAuditLogs`
* **Source File Location:** `src/features/finance/FinancialAuditLogsManager.tsx`
* **Authorized Access:** Super Administrator, External Statutory Auditor, CFO

### 🎯 2. Operational Value & Business Purpose
* **Anti-Fraud Fiscal Forensics:** Immutable record of every financial transaction (Fee Waiver, Manual Discount, Cheque Bounce, Salary Override).
* **Dual Authorization Verification:** Records both the operator who requested a modification and the senior director who authorized it.
* **Printable External Audit Reports:** Generates certified compliance dossiers for annual tax and board auditing.

### 📝 3. Logged Fiscal Attributes
* **Transaction Reference:** Voucher # or Challan #.
* **Fiscal Action:** `FEE_COLLECTION`, `CONCESSION_GRANTED`, `MANUAL_OVERRIDE`, `SALARY_DISBURSEMENT`.
* **Amount Involved:** Exact currency sum.
* **Authorizing Officer:** Principal or Finance Director.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Search Fiscal Logs:** Filter by date, amount range, or staff member.
2. **Review High-Risk Events:** Filter by *Manual Fee Overrides* or *Reversed Vouchers*.
3. **Export Certified Audit Trail:** Click **"Download Audit Certificate (PDF)"**.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Fiscal Audit ID | Financial Action | Target Reference | Currency Amount | Operator Name | Approving Authority | Timestamp |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **FAUD-2026-01** | Monthly Batch Fee Generated | `CH-2026-AUG-BATCH` | Rs. 7,100,000 | Kamran Akmal (`STF-1003`)| Prof. Tariq Mehmood | 2026-08-01 09:00 AM |
| **FAUD-2026-02** | Cash Fee Received at POS | `CH-2026-AUG-0101` | Rs. 6,000 | Kamran Akmal (`STF-1003`)| Automated Gateway | 2026-08-10 11:15 AM |
| **FAUD-2026-03** | Sibling Discount Approved | `CONC-2026-01` | Rs. 1,500 / Mo | Kamran Akmal (`STF-1003`)| Prof. Tariq Mehmood | 2026-08-02 02:30 PM |
| **FAUD-2026-04** | Monthly Staff Payroll Disbursed| `PAYROLL-AUG-2026` | Rs. 2,850,000 | Kamran Akmal (`STF-1003`)| Prof. Tariq Mehmood | 2026-08-25 04:00 PM |
| **FAUD-2026-05** | IESCO Electricity Bill Paid | `EXP-2026-081` | Rs. 185,000 | Kamran Akmal (`STF-1003`)| Prof. Tariq Mehmood | 2026-08-26 10:45 AM |

---

## 🎯 Phase 6 Milestone Completed

Phase 6 completes the entire institutional financial lifecycle:
* **Double-entry Chart of Accounts & General Ledger** are live.
* **Fee structures, sibling concessions, batch challans, POS collection, and defaulter tracking** are operational.
* **Student cashless digital wallets, operational expenses, and staff monthly payroll engines** are running with automated audit logs.

👉 **Next Phase:** We proceed directly to **Phase 7: Auxiliary Campus Services** (`Phase_07_Auxiliary_Campus_Services.md`) covering Transport Fleet & Routes, Hostel Rooms & Bed Allocations, Library Catalog & Barcode Circulation, and School Stock & Inventory Ledgers!
