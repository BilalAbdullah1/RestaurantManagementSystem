# 🎓 VOKE Solutions SMS — Master Presentation & Demo Guide
### 🚀 Har Ek Module, Screen, Feature aur Client Pitch ka Mukammal Encyclopedia (Roman Urdu)

---

> **System Name:** VOKE Solutions — School Management System (SMS)  
> **Architecture:** .NET 10 Clean Architecture Web API + React 19 Vite TypeScript + TailwindCSS  
> **Capacity:** Multi-Tenant Enterprise ERP (Single School se lekar Multi-Campus Chains tak)  
> **Covered Modules:** 18 Full-Fledged Modules  
> **Total Unique Screens:** 116 Screens (Koi Screen Skip Nahi!)  
> **User Portals:** 5 Dedicated Role-Based Portals (Admin, Teacher/Staff, Parent, Student, Public)  

---

## 📑 TABLE OF CONTENTS

1. [Executive Summary & 1-Minute Winning Pitch (Elevator Pitch)](#1-executive-summary--1-minute-winning-pitch)
2. [5 Dedicated User Portals Ka Taaruf](#2-5-dedicated-user-portals-ka-taaruf)
3. [Master Operational Flow (School Setup se Year-End tak)](#3-master-operational-flow)
4. [Mukammal 116 Screens ka Deep-Dive Walkthrough (Module-by-Module)](#4-mukammal-116-screens-ka-deep-dive-walkthrough)
   - [Phase 1: Authentication & Access Control (Screens 1 - 5)](#phase-1-authentication--access-control)
   - [Phase 2: Dashboards & Command Centers (Screens 6 - 9)](#phase-2-dashboards--command-centers)
   - [Phase 3: Digital Noticeboard (Screen 10)](#phase-3-digital-noticeboard)
   - [Phase 4: Reports & Business Intelligence Hub (Screens 11 - 24)](#phase-4-reports--business-intelligence-hub)
   - [Phase 5: Student Lifecycle & Admissions CRM (Screens 25 - 36)](#phase-5-student-lifecycle--admissions-crm)
   - [Phase 6: Core Academics & Timetable (Screens 37 - 49)](#phase-6-core-academics--timetable)
   - [Phase 7: LMS - Learning Management System (Screens 50 - 52)](#phase-7-lms---learning-management-system)
   - [Phase 8: Student & Parent Self-Service Portals (Screens 53 - 56)](#phase-8-student--parent-self-service-portals)
   - [Phase 9: HR, Staff & Payroll Engine (Screens 57 - 64)](#phase-9-hr-staff--payroll-engine)
   - [Phase 10: Finance, Fees & Double-Entry Accounting (Screens 65 - 73)](#phase-10-finance-fees--double-entry-accounting)
   - [Phase 11: Omnichannel Communication & Campus Engagement (Screens 74 - 81)](#phase-11-omnichannel-communication--campus-engagement)
   - [Phase 12: Comprehensive Examination & Online CBT (Screens 82 - 89)](#phase-12-comprehensive-examination--online-cbt)
   - [Phase 13: Hostel & Accommodation (Screens 90 - 91)](#phase-13-hostel--accommodation)
   - [Phase 14: Transport & Fleet Management (Screens 92 - 94)](#phase-14-transport--fleet-management)
   - [Phase 15: Inventory & Asset Management (Screens 95 - 97)](#phase-15-inventory--asset-management)
   - [Phase 16: Library Management (Screens 98 - 100)](#phase-16-library-management)
   - [Phase 17: Front Office & Campus Security (Screens 101 - 104)](#phase-17-front-office--campus-security)
   - [Phase 18: System Settings & Multi-Campus Administration (Screens 105 - 116)](#phase-18-system-settings--multi-campus-administration)
5. [Top 10 "Killer Features" Jo Client Ko Impress Karengi](#5-top-10-killer-features-jo-client-ko-impress-karengi)
6. [Demo Dene Ki Professional Strategy & Live Presentation Script](#6-demo-dene-ki-professional-strategy--live-presentation-script)

---

# 1. Executive Summary & 1-Minute Winning Pitch

Jab aap kisi School Owner, Director, Principal ya Investor ke samne khare hon, to aapko start me technical complexity me nahi ulajhna, balke yeh **1-Minute Elevator Pitch** deni hai:

> *"Assalam-o-Alaikum Sir/Madam! Aaj hum aapke samne pesh kar rahe hain **VOKE Solutions School Management System (SMS)** — jo sirf aik basic record-keeping software nahi hai, balke aapke pure school ecosystem ka **Complete Digital Operating System** hai.*  
>  
> *Aam software me sirf fees aur basic attendance hoti hai. Lekin VOKE SMS aapko provide karta hai:  
> 1. **Zero-Paperwork Automation:** Online Public Admission se lekar Biometric Attendance aur 3-Copy Bank Challan tak har cheez automated hai.  
> 2. **Financial Control & Transparency:** Complete Double-Entry Chart of Accounts, General Ledger, Profit & Loss aur Defaulters Aging report jo har rupay ka hisaab rakhti hai.  
> 3. **Smart Academics & CBT Exams:** Auto-conflict resolving Timetable, Lesson Planning aur Computer-Based Online Exams (CBT) jisme auto-grading hoti hai.  
> 4. **Stakeholder Connectivity:** Parents, Students, Teachers aur SuperAdmin ke liye 5 alag-alag specialized dashboards aur live communication channels (SMS, Email, WhatsApp alerts).  
> 5. **Multi-Campus Scalability:** Agar aapki 1 branch hai ya 50 branches, aap aik single master login se har campus ki live performance monitor kar sakte hain.*  
>  
> *Aaiye, me aapko screen-by-screen dikhata hoon ke yeh system aapke school ki administrative cost ko 40% kaise kam karta hai aur admissions ko 2x kaise barhata hai."*

---

# 2. 5 Dedicated User Portals Ka Taaruf

Is software ka sabse bara faida yeh hai ke har user ko uski zaroorat ke mutabiq dedicated interface milta hai:

| Portal Name | Kis Ke Liye Hai? | Mukhy Features & Role-Based Access |
|---|---|---|
| **1. Admin Dashboard (`/dashboard`)** | School Owner, Principal, Director | 360-Degree School Health KPIs, Daily Cash Collection, Live Student/Staff Attendance Graph, Quick Shortcuts, System Activity Log. |
| **2. Staff / Teacher Dashboard (`/staff-dashboard`)** | Teachers, Head of Departments, Coordinators | Personal Timetable, Daily Attendance Marking, Homework Assigning, Lesson Plans, Leave Applications & Balance, Salary Slips. |
| **3. Parent Dashboard (`/parent-dashboard`)** | Parents & Guardians | Bachon ki daily live attendance, Pending & Paid Fees (Challan download), Exam Results & Report Cards, Homework & Daily Diary, Leave apply karna. |
| **4. Student Dashboard (`/student-dashboard`)** | Students | Aaj ka timetable, Homework submission, Online CBT Exams attempt karna, Library issued books, House points rank, Report cards. |
| **5. Public Admission Portal (`/PublicAdmissionPortal/:tenantId`)** | Naye Parents (Baghair Login ke) | Direct school website/social media link se naye bache ke admission ki online enquiry/application form submit karna. |

---

# 3. Master Operational Flow

Jab client puche: *"Is software ko chalane ka standard tareeqa kya hai?"* To aap yeh step-by-step workflow batayein:

```
[1. Initial Setup]
Tenants (Campuses) ➔ Academic Years ➔ Classes & Sections ➔ Subjects Mapping ➔ Staff Registration ➔ Timetables

[2. Student Onboarding]
Public Portal / Walk-in CRM ➔ Review & Approve ➔ Student Enrollment ➔ Auto Parent Account Created

[3. Financial Setup]
Fee Types ➔ Class-wise Fee Structures ➔ Concessions / Scholarships ➔ Monthly Fee Challans Generated

[4. Daily Campus Routine]
Morning Biometric / Manual Attendance ➔ Teacher Substitutes Auto-Assigned ➔ Visitors Gate Pass ➔ Daily Diaries & Homework

[5. Examination Lifecycle]
Exam Setup ➔ Date Sheet ➔ Admit Cards Generation ➔ CBT Online Test / Offline Marks Entry ➔ Broadsheets & Report Cards

[6. Monthly & Year-End Closing]
Staff Payroll & Loan Deductions ➔ P&L & Balance Sheet Statements ➔ Student Promotions ➔ Alumni Transfer
```

---

# 4. Mukammal 116 Screens ka Deep-Dive Walkthrough

Aaiye ab har single phase aur uski har aik screen ko deeply samajhte hain:

---

## 🔐 PHASE 1: Authentication & Access Control

### Screen 1: Sign In (`/signin`)
- **Maqsad (Purpose):** Har user (Admin, Teacher, Staff, Student, Parent) ka secure login point.
- **Key Features:**
  - Campus / Workspace selector (`<SearchableSelect>`). Agar multi-campus setup ho to school select karein.
  - Email aur Password input with visibility eye toggle icon.
  - 2FA (Two-Factor Authentication) OTP support agar school security strict ho.
  - Role-based automatic redirect: Login hote hi system pehchan leta hai ke user Admin hai, Parent hai ya Teacher, aur foran uske dashboard par bhej deta hai.
  - Animated feature slider jo school branding dikhata hai.
- **Pitch Point:** *"Aapke staff ya parents ko alag alag apps ya websites ki zaroorat nahi. Aik hi login page se system role pehchan kar custom view khol deta hai."*

### Screen 2: Sign Up (`/signup`)
- **Maqsad:** Naye campus admin ya invited user account creation.
- **Key Features:** First Name, Last Name, Workspace Selection, Role selection, Email aur Password. Auto-seeding engine ke sath integrated hai jo nayi school ke liye default roles khud bana deta hai.
- **Pitch Point:** *"Jab aap naya campus kholte hain to technical team ki mohtaji nahi hoti, self-registration system instant tenant provision kar deta hai."*

### Screen 3: Forgot Password (`/ForgotPassword`)
- **Maqsad:** Agar koi user password bhool jaye to secure token generation.
- **Key Features:** Registered email dalte hi system 6-digit secure verification code generate karta hai.
- **Pitch Point:** *"Admin ka time waste nahi hota password resets me, users khud apna password securely recover kar sakte hain."*

### Screen 4: Reset Password (`/ResetPassword`)
- **Maqsad:** OTP verify karke naya password set karna.
- **Key Features:** Secure token verification, new password & confirm password validation with instant feedback.
- **Pitch Point:** *"Bank-grade password security standards follow kiye gaye hain taake koi account compromise na ho."*

### Screen 5: Public Admission Portal (`/PublicAdmissionPortal/:tenantId`)
- **Maqsad:** **Baghair kisi login ke** bahar ke parents ke liye online admission form.
- **Key Features:**
  - Har campus ka apna branded link hota hai (e.g. `/PublicAdmissionPortal/CAMPUS-01`).
  - Student personal details, B-Form/CNIC, Previous School details, Guardian contact, Desired Grade.
  - Direct backend CRM me enquiry create ho jati hai.
- **Pitch Point (Killer Pitch):** *"Aap is link ko apne Facebook page, WhatsApp groups aur marketing flyers par QR code ke sath laga sakte hain. Parent ghar bethe form bharega aur aapke pass admin panel me live notification aa jayegi!"*

---

## 📊 PHASE 2: Dashboards & Command Centers

### Screen 6: Executive Master Admin Dashboard (`/dashboard`)
- **Maqsad:** School Principal aur Director ke liye single-screen control room.
- **Key Features:**
  - **4 Top KPI Cards:** Total Enrolled Students, Active Staff, Month-to-Date (MTD) Revenue, Live Today's Attendance %.
  - **Revenue Analytics Chart:** Recharts Area chart jo monthly fee collections aur targets ka graph dikhata hai.
  - **Live Attendance Donut:** Kitne bache Present hain, kitne Late aur kitne Absent.
  - **Class-wise Fee Progress:** Kis class ki kitni fees collect ho gayi aur kitni outstanding hai.
  - **Instant PDF Export:** Pure dashboard ki executive snapshot PDF report aik click par download.
  - **Quick Shortcuts:** New Admission, Collect Fee, Mark Attendance, Post Announcement.
- **Pitch Point:** *"Director ko 10 registers dekhne ki zaroorat nahi. Subah aate hi sirf yeh dashboard dekh kar pure school ka snapshot 10 second me mil jata hai."*

### Screen 7: Parent Dashboard (`/parent-dashboard`)
- **Maqsad:** Parents ka personal view apne bache ki school life ka.
- **Key Features:**
  - Real-time bache ki attendance status (Aaj bacha school pohncha ya nahi).
  - Fees status (Outstanding balance, last paid slip).
  - Recent Exam Grades & Position in class.
  - Pending Homework aur Daily Diary entries.
  - School Notices aur Emergency Alerts.
- **Pitch Point:** *"Parent ka school par aetmaad (trust) barh jata hai kyunki unhe har cheez transparently live nazar aati hai."*

### Screen 8: Student Dashboard (`/student-dashboard`)
- **Maqsad:** Student ka daily academic launchpad.
- **Key Features:**
  - Aaj ka class timetable (kaunsa period kis teacher ke sath hai).
  - Due assignments aur unke deadlines.
  - Upcoming online tests (CBT).
  - Attendance calendar heatmap.
  - House points aur class achievements.
- **Pitch Point:** *"Students self-dependent bante hain aur unhe pata hota hai ke aaj kya parhaya jayega aur kya homework submit karna hai."*

### Screen 9: Staff / Teacher Dashboard (`/staff-dashboard`)
- **Maqsad:** Teachers ka personal task manager.
- **Key Features:**
  - Teacher ka aaj ka schedule (kaunse periods kis class me hain).
  - Quick action buttons: "Mark Class Attendance", "Assign Homework", "Post Diary".
  - Teacher ki apni attendance aur remaining casual/sick leaves balance.
  - Principal ki taraf se aaye notices.
- **Pitch Point:** *"Teachers ka paper work 80% khatam ho jata hai aur wo teaching par poori tawajjah de pate hain."*

---

## 📢 PHASE 3: Digital Noticeboard

### Screen 10: Notice Board & Announcements (`/Noticeboard`)
- **Maqsad:** School-wide notice aur circular distribution system.
- **Key Features:**
  - Audience targeting: Notice sirf **Teachers**, sirf **Parents**, sirf **Students**, sirf **Staff** ya **Everyone** ke liye post karein.
  - Priority badges: Normal, High, aur **Urgent (with pulsing red glow effect)**.
  - Start Date aur Expiry Date scheduler (expiry ke baad notice khud gray-out/hide ho jata hai).
  - Rich Text Editor format support.
  - Action menu via React Portal (Edit/Delete).
- **Pitch Point:** *"Kaghaz par circular print karke bacho ke bag me bhejne ka zamana khatam. Notice post karte hi specific group ke dashboard par instantly appear ho jata hai."*

---

## 📈 PHASE 4: Reports & Business Intelligence Hub

### Screen 11: Reports Overview Hub (`/ReportsCenter`)
- **Maqsad:** Tamam kism ki 14+ official reports ka central library grid.
- **Key Features:** Category-wise cards (Academic, Financial, Administrative, Student Reports). Search bar aur 1-click navigation.
- **Pitch Point:** *"Har department ki reporting standard formats me organized hai, inspect karne ke liye kisi file ke dhero me nahi jana parta."*

### Screen 12: Class Broadsheet Result (`/reports/broadsheet`)
- **Maqsad:** Pure class ke exam marks ka complete spreadsheet-style gazette/broadsheet.
- **Key Features:** Class, Section aur Exam select karein ➔ Grid me tamam students ke subject-wise marks, total, percentage, grade aur position show hoti hai. Excel aur PDF export support.
- **Pitch Point:** *"Annual Result tayyar karne me teachers ke hafte lagte the, yahan 2 second me full broadsheet generate ho jati hai."*

### Screen 13: 3-Copy Fee Voucher Slip (`/reports/fee-voucher`)
- **Maqsad:** Standard Bank Format ka 3-Copy Printable Fee Challan.
- **Key Features:**
  - **Bank Copy, School Copy, aur Student Copy** aik hi page par horizontal/vertical layout me.
  - Challan No, Due Date, Student Roll No, Class, Tuition Fee, Transport, Concessions, Late fee rule.
  - Bank Account details aur payment instructions.
- **Pitch Point (Big Winner):** *"Pakistani aur international schools ki sabse bari requirement 3-copy bank slip hoti hai jo kisi aam software me theek se nahi banti. VOKE SMS me ready-to-print perfection ke sath mojud hai."*

### Screen 14: School Leaving Certificate (`/reports/slc-certificate`)
- **Maqsad:** Official School Leaving Certificate (SLC) / Character Certificate.
- **Key Features:** Student select karte hi admission date, leaving date, conduct remarks, academic performance auto-populate ho jate hain. School letterhead format par ready to print.
- **Pitch Point:** *"Bacha school chhor raha ho to SLC clerk ko dasti nahi likhna parta, click par official certificate tayyar hota hai."*

### Screen 15: Staff Payroll Summary (`/reports/staff-payroll`)
- **Maqsad:** Monthly staff salary disbursement sheet.
- **Key Features:** Month aur Department filter. Basic Salary, Allowances, Loan Deductions, Unpaid Leaves Deduction, Net Payable Salary, Bank Account number.
- **Pitch Point:** *"Accounts department har mahine staff payroll summary audit kar sakta hai aur bank transfer letter ke sath attach kar sakta hai."*

### Screen 16: Bulk Student ID Cards (`/reports/student-id-cards`)
- **Maqsad:** Student Identity Cards bulk me print karna.
- **Key Features:** Class/Section select karein ➔ Har bache ka photo, name, roll no, father name, blood group, emergency contact aur barcode ke sath ID cards grid generate hoti hai.
- **Pitch Point:** *"ID cards banane ke liye graphic designer ko alag se hazaron rupay dene ki zaroorat nahi, system khud printable cards generate karta hai."*

### Screen 17: Student Attendance Heatmap (`/reports/attendance`)
- **Maqsad:** Visual calendar heatmap bacho ki hazri ka.
- **Key Features:** Green (Present), Red (Absent), Yellow (Late), Blue (Leave). Monthly percentage calculation aur chronic absentees ki identification.
- **Pitch Point:** *"Parents ke sath meeting me visually dikhaya ja sakta hai ke unka bacha kis mahine kin dino me absent raha."*

### Screen 18: Fee Defaulters Aging Report (`/reports/fee-defaulters`)
- **Maqsad:** Un students ki list jinki fees pending hai with aging brackets.
- **Key Features:** 30 Days, 60 Days, 90+ Days overdue filters. Father phone number, pending amount aur direct SMS follow-up action.
- **Pitch Point:** *"School ka cashflow improve hota hai kyunki defaulters ki recovery list har waqt ready hoti hai."*

### Screen 19: Profit & Loss Statement (`/reports/profit-loss`)
- **Maqsad:** School ka quarterly/annual financial Profit & Loss statement.
- **Key Features:** Total Inflows (Tuition fees, admission fees, transport) minus Total Outflows (Salaries, utilities, maintenance, supplies). Net Margin calculation.
- **Pitch Point:** *"School board of directors aur trustees ke samne financial health present karne ke liye exact corporate P&L report."*

### Screen 20: Daily Collection Report (`/reports/daily-collection`)
- **Maqsad:** Cashier aur counter collection ka rozana audit.
- **Key Features:** Aaj ki date me kitna cash aya, kitne bank cheques aur kitne online transfers. Cashier-wise closing total.
- **Pitch Point:** *"Rozana shaam ko counter par cash tally karne ke liye cashier yeh report print karke Principal ko submit karta hai."*

### Screen 21: Balance Sheet Statement (`/reports/balance-sheet`)
- **Maqsad:** Standard Accounting Balance Sheet.
- **Key Features:** Current Assets, Fixed Assets, Liabilities, Reserves aur Equity ki audit statement.
- **Pitch Point:** *"Chartered Accountants aur auditors ke liye compliant double-entry balance sheet."*

### Screen 22: Trial Balance Statement (`/reports/trial-balance`)
- **Maqsad:** General Ledger accounts ka debit aur credit balance verification.
- **Key Features:** Har chart of account head ka opening balance, debit movements, credit movements aur closing balance with balanced totals check.
- **Pitch Point:** *"Accounting me koi entry missing ya unbalance ho to trial balance foran pakar leta hai."*

### Screen 23: Report Cards & Transcripts (`/reports/report-cards`)
- **Maqsad:** Term End Student Progress Report Card / Marksheet.
- **Key Features:** Student photo, subject-wise obtain marks, total marks, letter grade, GPA, teacher comments, attendance record, class position aur principal signature block.
- **Pitch Point:** *"Parent Teacher Meeting (PTM) par colourful, professional report card bacho ko diya jata hai jo school ka standard barhata hai."*

### Screen 24: Student Certificates (Bonafide / TC) (`/reports/student-certificates`)
- **Maqsad:** Bonafide Student Certificate, Character Certificate aur Transfer Certificate.
- **Key Features:** Certificate type choose karein, student select karein, pre-formatted legal text auto-populate ho jata hai with verification QR code/serial number.
- **Pitch Point:** *"Embassy, board examination ya government verification ke liye foran certificate issue hota hai."*

---

## 👨‍🎓 PHASE 5: Student Lifecycle & Admissions CRM

### Screen 25: Student Directory (`/students`)
- **Maqsad:** Enrolled students ka central master database.
- **Key Features:**
  - TanStack datatable with search by Name, Roll No, Class.
  - Filter by Class, Section, Gender, Status (Active/Inactive).
  - Slide-over `<ProfileDrawer>`: Student profile, photo, guardian details, medical notes, fee dues.
  - Action Menu: Edit Profile, Medical Record, Generate TC, Inactivate.
  - CSV & PDF export.
- **Pitch Point:** *"Pure school ke bacho ka data aik click par access karein, instant filter karein aur profile drawer me detailed history dekhein."*

### Screen 26: Parent Directory (`/parents`)
- **Maqsad:** Registered parents aur guardians ki list.
- **Key Features:** Parent Name, CNIC, Phone, Email, Profession, Linked Students (kis parent ke kitne bache kis class me parhte hain).
- **Pitch Point:** *"Aik family ke multiple bacho ko single parent account ke sath link kiya ja sakta hai."*

### Screen 27: Admissions CRM (`/AdmissionEnquiries`)
- **Maqsad:** Admissions funnel aur sales pipeline.
- **Key Features:**
  - Status stages: Enquiry Received ➔ Application Submitted ➔ Entrance Test / Interview ➔ Offered ➔ Admitted ➔ Rejected.
  - Follow-up date reminders aur telephonic notes logging.
  - **1-Click Convert to Student:** Admission confirm hote hi button dabayein, enquiry foran permanent student ban jati hai baghair dobara typing kiye!
- **Pitch Point (High Conversion):** *"Admission enquiries register me likh kar gum nahi hoti. Staff har parent ko follow-up call karta hai, jis se admission rates 30% barh jate hain."*

### Screen 28: Public Admission Desk (`/PublicAdmissionPortalDesk`)
- **Maqsad:** Admin side par baith kar walk-in parent ka form online submit karna.
- **Key Features:** Receptionist ya admission officer walk-in parent ki details fill karta hai using same rich form controls.
- **Pitch Point:** *"Walk-in visitor ho ya website user, sabka data aik hi central funnel me record hota hai."*

### Screen 29: Student Enrollments (`/StudentEnrollments`)
- **Maqsad:** Admitted student ko Academic Year, Class, Section aur Roll Number assign karna.
- **Key Features:** Academic session mapping, Class & Section allocation, Auto/Manual Roll No assignment, bulk transfer between sections.
- **Pitch Point:** *"Section shuffling ya naye session ki enrollment ko streamline karta hai taake class capacity control me rahe."*

### Screen 30: Student Promotions (`/StudentPromotions`)
- **Maqsad:** Saal ke aakhir me pure batch ko agli class me promote karna.
- **Key Features:**
  - Source Class (e.g. Grade 5) ➔ Destination Class (e.g. Grade 6).
  - Pass / Fail / Detain flags.
  - Bulk promote button with automatic new roll number allotment.
- **Pitch Point:** *"Session khatam hone par clerk ko har bache ka naya form nahi bharna parta, 200 bache 5 second me promote ho jate hain."*

### Screen 31: Student Attendance (`/StudentAttendance`)
- **Maqsad:** Daily class teacher attendance register.
- **Key Features:**
  - Date aur Class-Section select karein.
  - "Mark All Present" quick shortcut.
  - Individual toggle: Present, Absent, Late, Half-day, Leave.
  - Attendance save hote hi absent bacho ke parents ko notification alert trigger hota hai.
- **Pitch Point:** *"Teacher 30 seconds me attendance mark kar leta hai aur register par pen se tick lagane ki zaroorat nahi rehti."*

### Screen 32: Proxy Attendance (`/ProxyAttendance`)
- **Maqsad:** Agar class teacher absent ho to substitute teacher attendance mark kare.
- **Key Features:** Original teacher ki class choose karke substitute teacher apni login se attendance mark karta hai, system me record rehta hai ke attendance kisne lagayi.
- **Pitch Point:** *"Teacher chhutti par ho tab bhi attendance miss nahi hoti aur audit trail maintain rehti hai."*

### Screen 33: Subject-wise Attendance (`/SubjectWiseAttendance`)
- **Maqsad:** College / Higher Secondary schools ke liye per-period attendance.
- **Key Features:** Class, Section, Subject aur Period No select karke attendance lagayein.
- **Pitch Point:** *"College aur O/A Levels jahan bache har period me alag lecture room me jate hain, wahan subject-wise attendance must hoti hai."*

### Screen 34: Student Behavior Logs (`/StudentBehaviorLogs`)
- **Maqsad:** Student discipline incidents aur positive achievements ka record.
- **Key Features:** Incident Type (Discipline warning, Uniform violation, Bullying, Academic Excellence, Sports Medal), Remarks, Severity Level, Parent Notification toggle.
- **Pitch Point:** *"Student ka complete conduct portfolio banta hai jo PTM par parent ko dikhaya ja sakta hai."*

### Screen 35: Alumni Directory (`/AlumniDirectory`)
- **Maqsad:** Graduated / Passed-out students ka record.
- **Key Features:** Graduation year, Current University/Job, Contact info, Alumni cards view.
- **Pitch Point:** *"School ke pass apne pass-out bacho ka network rehta hai jinko annual functions ya fundraising me invite kiya ja sake."*

### Screen 36: Student Leave Desk (`/StudentLeaveApplication`)
- **Maqsad:** Students aur parents ki leave applications ka desk.
- **Key Features:** Apply leave with date range, reason, attachment (medical certificate). Admin/Teacher ke pass "Approve" aur "Reject" buttons with remarks.
- **Pitch Point:** *"Leave application kaghaz par bhejne ki bajaye mobile se aati hai aur approve hote hi attendance me auto-reflect hoti hai."*

---

## 🎓 PHASE 6: Core Academics & Timetable

### Screen 37: Academic Years (`/AcademicYears`)
- **Maqsad:** School operational sessions define karna (e.g. 2025-2026, 2026-2027).
- **Key Features:** Title, Start Date, End Date, **"Set as Active"** toggle. Active session hero banner with days remaining progress bar.
- **Pitch Point:** *"Pichle saalon ka record mehfooz rehta hai aur naye saal me switch karna bilkul asaan hota hai."*

### Screen 38: Classes Setup (`/Classes`)
- **Maqsad:** Grades define karna (Grade 1 to 10, O-Levels, etc.).
- **Key Features:** Class Name, Numeric Order, Capacity, Short code. Datatable with Slide-Over Drawer.
- **Pitch Point:** *"School ka academic grading hierarchy standard structured format me configure hota hai."*

### Screen 39: Sections Setup (`/Sections`)
- **Maqsad:** Har class ke sections banana (Section A, B, Green, Rose).
- **Key Features:** Class Selection, Section Name, Max Capacity, **Assigned Class Teacher**.
- **Pitch Point:** *"Class teacher ko apni section ka in-charge banaya jata hai jisse accountability barhti hai."*

### Screen 40: Subjects Catalog (`/Subjects`)
- **Maqsad:** Tamam parhaye jane wale subjects ka catalog.
- **Key Features:** Subject Title, Subject Code (e.g. ENG-101), Subject Type (Core, Elective, Lab, Extra-curricular).
- **Pitch Point:** *"Compulsory aur elective subjects ko categorize kiya jata hai taake exam aur broadsheet accurate banein."*

### Screen 41: Class-Subject Assignment (`/ClassSubject`)
- **Maqsad:** Kis class me kaunsa subject kaunsa teacher parhayega.
- **Key Features:** Class select karein ➔ Subject map karein ➔ Subject Teacher assign karein ➔ Weekly lectures quota define karein.
- **Pitch Point:** *"Teacher workload allocation clear hota hai ke kis teacher ke pass hafte ke kitne periods hain."*

### Screen 42: Class Timetable Grid (`/Timetable`)
- **Maqsad:** Weekly class schedule banana (Monday to Saturday, Period 1 to 8).
- **Key Features:**
  - Visual week timetable grid.
  - Period time slots (Start time, End time, Break/Recess).
  - Drag-and-Drop periods arrangement.
  - **Double-Booking Conflict Detection:** Agar teacher already kisi aur class me busy ho to system foran red warning deta hai!
  - Print Timetable PDF.
- **Pitch Point (Super Impressive):** *"Manual timetable banane me hafte lagte the aur teachers ke periods clash ho jate the. VOKE SMS clash hone hi nahi deta!"*

### Screen 43: Teacher Timetable (`/TeacherTimetable`)
- **Maqsad:** Teacher ke hisaab se uska weekly schedule dekhna.
- **Key Features:** Teacher select karein ➔ Uske pure hafte ka timetable samne aa jata hai ke kab kis class me jana hai aur kab uska free period hai.
- **Pitch Point:** *"Har teacher ko uska personalized weekly schedule print karke diya ja sakta hai."*

### Screen 44: Substitute Management (`/SubstituteManagement`)
- **Maqsad:** Teacher ki chhutti par naya substitute teacher lagana.
- **Key Features:**
  - Absent teacher mark karein.
  - **Smart Recommendation Engine:** System un tamam teachers ki list dikhata hai jinka us period me **free period** hai!
  - 1-Click proxy assign and notify.
- **Pitch Point (Killer Pitch):** *"Subah subah principal ko pareshani nahi hoti ke absent teacher ki class me kaun jaye, system khud batata hai ke kaunsa teacher free hai!"*

### Screen 45: Lesson Planning (`/LessonPlanning`)
- **Maqsad:** Teachers ke weekly lesson plans aur syllabus tracking.
- **Key Features:** Class, Subject, Topic, Learning Objectives, Activities, Homework, Status (Draft, Approved, Completed).
- **Pitch Point:** *"Academic coordinator check kar sakta hai ke syllabus time par cover ho raha hai ya nahi."*

### Screen 46: Study Material Repository (`/StudyMaterialRepository`)
- **Maqsad:** Digital notes, past papers aur PDF books share karna.
- **Key Features:** Upload PDFs, documents, external video links categorized by Subject and Class. Students can download directly.
- **Pitch Point:** *"Bacho ko photocopies karane ki zaroorat nahi, notes direct portal par mil jate hain."*

### Screen 47: Live Online Classes (`/LiveClassesManager`)
- **Maqsad:** Zoom / Google Meet / MS Teams integration for remote learning.
- **Key Features:** Schedule class, meeting link, date, time slot, target class, direct "Join Class" button.
- **Pitch Point:** *"Emergency holidays ya rain days me school band nahi hota, online classes continue rehti hain."*

### Screen 48: Student Daily Diaries (`/StudentDiaryManager`)
- **Maqsad:** Daily school diary (Aaj class me kya parhaya aur kya yaad karna hai).
- **Key Features:** Rich text editor, class/date selector, parent visibility toggle.
- **Pitch Point:** *"Junior classes ke bache diary likhna bhool jate hain, parents apne phone par official diary check kar sakte hain."*

### Screen 49: House System & Points (`/HouseSystemDashboard`)
- **Maqsad:** School Houses (Jinnah House, Iqbal House, Red, Blue) aur unke points track karna.
- **Key Features:** House leaderboards, award points for sports, quiz, discipline, annual house trophy standing.
- **Pitch Point:** *"Bacho me positive competition aur extracurricular activities ka shauq paida karta hai."*

---

## 📚 PHASE 7: LMS - Learning Management System

### Screen 50: Homework Management (`/HomeworkManagement`)
- **Maqsad:** Teachers ka homework assign aur track karne ka hub.
- **Key Features:** Title, Subject, Class, Submission Due Date, Detailed instructions, file attachments (assignments PDF).
- **Pitch Point:** *"Homework assigning digitalized hai with clear submission deadlines."*

### Screen 51: Homework Submissions Review (`/HomeworkSubmissions`)
- **Maqsad:** Students ke submitted homework ko check karna aur marks dena.
- **Key Features:** List of submissions, student uploaded files preview, Grade/Marks entry, Teacher remarks/feedback input, Return to student.
- **Pitch Point:** *"Teachers online assignments check karke bacho ko personalized feedback de sakte hain."*

### Screen 52: Student Portal — Assignments (`/StudentHomeworkPortal`)
- **Maqsad:** Student ka assignment workspace.
- **Key Features:** Pending homeworks list, Overdue warnings, file upload submission box, teacher ke checked marks aur remarks dekhna.
- **Pitch Point:** *"Students ko pata rehta hai unka kaunsa assignment pending hai aur kis me kya grade mila."*

---

## 🎯 PHASE 8: Student & Parent Self-Service Portals

### Screen 53: Staff My Leaves (`/StaffLeaveApplication`)
- **Maqsad:** Staff members ka leave apply karna.
- **Key Features:** Casual, Sick, Annual leave types, remaining leave quotas, reason, status tracking.
- **Pitch Point:** *"Staff ko application kaghaz par likhne ki zaroorat nahi, portal se direct apply karte hain."*

### Screen 54: Apply Leave — Parent (`/ApplyLeave`)
- **Maqsad:** Parent ka bache ki chhutti ki darkhwast bhejna.
- **Key Features:** Multiple bacho me se bacha choose karein, date range, illness/emergency reason, instant principal notification.
- **Pitch Point:** *"Parent subah ghar bethe chhutti ki request bhej deta hai taake absence fine na lage."*

### Screen 55: Fee Payments & Receipts (`/FeePaymentHistory`)
- **Maqsad:** Parents ka fee challans aur payment history dekhna.
- **Key Features:** Unpaid challans list with amounts, paid fee receipts download button, online payment status.
- **Pitch Point:** *"Parents kisi bhi waqt pichli payments ki receipts print kar sakte hain."*

### Screen 56: Online Tests — Student CBT Portal (`/StudentCBT`)
- **Maqsad:** Students ke samne online test start karne ka portal.
- **Key Features:** Assigned exams list, test duration, total marks, "Start Exam" button, completed test score history.
- **Pitch Point:** *"Modern Computer-Based Tests (CBT) bacho ko competitive entry tests ke liye tayyar karte hain."*

---

## 👥 PHASE 9: HR, Staff & Payroll Engine

### Screen 57: Staff Directory (`/StaffDirectory`)
- **Maqsad:** Teachers, Admin staff aur Support staff ka master register.
- **Key Features:** Name, Designation, Department, CNIC, Phone, Qualification, Joining Date, Salary Structure, Slide-Over Profile Drawer.
- **Pitch Point:** *"Tamam teaching aur non-teaching staff ka record with documents aik jagah mehfooz."*

### Screen 58: Staff Attendance (`/StaffAttendance`)
- **Maqsad:** Daily staff attendance register with Biometric integration.
- **Key Features:** Present, Absent, Late, Leave toggles, Biometric machine auto-sync button, monthly attendance percentage.
- **Pitch Point:** *"Biometric thumb/face recognition devices ke sath live sync hota hai, manual attendance ki zaroorat nahi."*

### Screen 59: Payroll Engine (`/SalarySlipsManager`)
- **Maqsad:** Monthly salaries calculate aur slips generate karna.
- **Key Features:** Basic pay, allowances (House rent, Medical), unannounced leaves deduction, loan installment deduction, net pay calculation. Bulk generate button.
- **Pitch Point (Huge Relief):** *"Mahine ke aakhir me 50 teachers ki salary calculate karne me ghanton lagte the, payroll engine 1 click me exact slips generate kar deta hai."*

### Screen 60: Advance Loans Management (`/StaffLoans`)
- **Maqsad:** Staff ko diye gaye advance salary ya loans track karna.
- **Key Features:** Loan Amount, Monthly installment amount, Remaining balance, **Auto-deduction from monthly payroll**.
- **Pitch Point:** *"Accounts clerk ko yaad nahi rakhna parta k kis teacher ki kitni loan deduction karni hai, salary slip me auto-deduct ho jata hai."*

### Screen 61: Performance Appraisals (`/StaffAppraisals`)
- **Maqsad:** Annual teacher evaluation aur performance review.
- **Key Features:** Teaching skills, Punctuality, Class discipline, Student result quality scoring (1 to 5 stars), Principal recommendations.
- **Pitch Point:** *"Annual salary increments aur promotions data-driven evaluation par hoti hain, pasand-na-pasand par nahi."*

### Screen 62: Resignation & Clearance (`/StaffClearance`)
- **Maqsad:** Job chhorne wale staff ka No-Objection Certificate (NOC) aur clearance checklist.
- **Key Features:** Department-wise clearance: Library books returned, Lab equipment handed over, Accounts settled, Final dues calculation.
- **Pitch Point:** *"Clearance ke baghair koi staff school se nahi ja sakta, financial aur asset loss zero ho jata hai."*

### Screen 63: Leave Approvals Hub (`/LeaveApprovals`)
- **Maqsad:** Principal/HR head ka staff leaves approve/reject karne ka portal.
- **Key Features:** Applicant details, leave balance history, Approve/Reject buttons with remarks box.
- **Pitch Point:** *"Leaves ka transparent workflow rehta hai, koi confusion nahi hoti."*

### Screen 64: Payroll Slips Viewer (`/PayrollSlips`)
- **Maqsad:** Individual printable salary slip voucher.
- **Key Features:** School letterhead, earnings breakdown, deductions breakdown, net salary in words, signature stamps.
- **Pitch Point:** *"Staff ko formal, professional salary slip milti hai jo unke bank ya visa requirements me kaam aati hai."*

---

## 💰 PHASE 10: Finance, Fees & Double-Entry Accounting

### Screen 65: Fee Setup (`/FeeSetup`)
- **Maqsad:** School ke fee heads define karna.
- **Key Features:** Tuition Fee, Admission Fee, Computer Lab Fee, Library Fee, Annual Charges, Transport Fee, Late Fee fine rule. Chart of accounts linking.
- **Pitch Point:** *"School apni marzi ke jitne chahe fee categories create kar sakta hai."*

### Screen 66: Fee Structures (`/FeeStructures`)
- **Maqsad:** Har class ki fee amount decide karna.
- **Key Features:** Class aur Academic Year select karein ➔ Har fee type ke agay monthly/annual amount set karein ➔ Clone feature (pichli class ki structure copy karein).
- **Pitch Point:** *"Nursery se Matric tak har class ki alag alag fee structure easily configure ho jati hai."*

### Screen 67: Fee Concessions & Scholarships (`/FeeConcessions`)
- **Maqsad:** Discounts aur scholarships manage karna.
- **Key Features:** Kinship / Sibling discount, Teacher child discount, Need-based financial aid, Merit scholarship. Percentage ya fixed amount discount assign to specific students.
- **Pitch Point:** *"Discounts ka computerized record rehta hai taake koi fake concession na lag sake."*

### Screen 68: Fee Challans Manager (`/FeeChallans`)
- **Maqsad:** Monthly fee challan generation, collection aur reconciliation.
- **Key Features:**
  - **Bulk Generate Challans:** Pure school ya specific class ke challans 1-click me generate karein.
  - Payment entry: Cash, Cheque, Online Bank Transfer.
  - 3-Copy Bank Challan print action.
  - Status filters: Paid, Unpaid, Partially Paid, Overdue.
- **Pitch Point (Heart of the School):** *"School ki financial backbone! Challan generate karein, parents ko bhejein, bank ya counter par receive karein aur receipt issue karein."*

### Screen 69: School Expenses Tracker (`/SchoolExpensesTracker`)
- **Maqsad:** School ke roz marra ke ikhrajat (expenses) ka hisaab.
- **Key Features:** Expense categories (Electricity bill, Internet, Generator fuel, Stationery, Repair & Maintenance, Refreshment), Amount, Paid to, Receipt attachment upload.
- **Pitch Point:** *"Har chotay baray kharch ka bill attach hota hai, petty cash ka hisaab 100% transparent rehta hai."*

### Screen 70: Chart of Accounts (`/ChartOfAccounts`)
- **Maqsad:** Proper Corporate Double-Entry Accounting Tree.
- **Key Features:** Standard Level 4 Accounting Tree: Assets, Liabilities, Equity, Revenue, Expenses. Add parent and sub-accounts.
- **Pitch Point (For Finance Managers):** *"Yeh koi kacha register software nahi hai! Isme proper double-entry Chart of Accounts bana hua hai jaisa QuickBooks ya SAP me hota hai."*

### Screen 71: General Ledger & Journal Vouchers (`/GeneralLedger`)
- **Maqsad:** Double-entry journal voucher posting aur ledger inspection.
- **Key Features:** Create Manual JV with Debit & Credit balanced rule, Narration, View Ledger per account with running balance.
- **Pitch Point:** *"Financial transactions automatically ledger me post hoti hain aur manual adjustment vouchers bhi dale ja sakte hain."*

### Screen 72: Student RFID Wallets (`/StudentWallets`)
- **Maqsad:** Cashless School Canteen / Tuck shop prepaid card system.
- **Key Features:** Student RFID card balance, Top-Up wallet, POS debit transactions, purchase history.
- **Pitch Point (High-Tech Wow Factor):** *"Bacho ko pocket money cash me lane ki zaroorat nahi. Parent card me balance dalega aur bacha canteen par RFID card tap karke sandwich ya juice le sakta hai!"*

### Screen 73: Financial Audit Trail (`/FinancialAuditLogs`)
- **Maqsad:** Fraud prevention aur financial compliance.
- **Key Features:** Immutable (delete na hone wala) log: kis user ne kab fee collect ki, kab discount badla, kab expense delete karne ki koshish ki.
- **Pitch Point:** *"School owner ko chori ya embezzlement ka khauf nahi rehta, har rupay ke peeche user ka digital footprint hota hai."*

---

## 💬 PHASE 11: Omnichannel Communication & Campus Engagement

### Screen 74: Omnichannel Broadcaster (`/CommunicationBroadcaster`)
- **Maqsad:** Mass SMS, Email aur App Notifications bhejna.
- **Key Features:** Audience select karein (Class, Section, All Parents, Staff), Channel select karein (SMS gateway, Email, Push alert), Send Now ya Schedule for later.
- **Pitch Point:** *"School band hone ka alert ya emergency announcement 5,000 parents ko 10 second me SMS ke zariye pohnch jati hai."*

### Screen 75: Digital Notice Board Manager (`/DigitalNoticeBoard`)
- **Maqsad:** Reception / Lobby LED screens par notices display karna.
- **Key Features:** Active visual slider notices, urgent scrolling ticker, high-resolution graphic announcements.
- **Pitch Point:** *"School reception par lagi TV screen par automated notices aur achievements slide hoti rehti hain."*

### Screen 76: PTM Scheduler (`/PtmScheduler`)
- **Maqsad:** Parent-Teacher Meetings schedule aur organize karna.
- **Key Features:** PTM date, time windows, slot durations (e.g. 15 minutes per parent), participating classes.
- **Pitch Point:** *"PTM par lambi lines aur hungama khatam, har parent ko uska time slot pehle se assign hota hai."*

### Screen 77: Helpdesk & Support Tickets (`/HelpdeskTickets`)
- **Maqsad:** Parents aur staff ke masail (complaints/requests) ka ticketing system.
- **Key Features:** Ticket categories (Fee issue, Transport delay, Academic complaint), Priority, Assign to staff, Status (Open, In-Progress, Resolved), Internal notes.
- **Pitch Point:** *"Parents ki complaints register me dab nahi jati, resolution tracking ke sath solve hoti hain."*

### Screen 78: Birthday Wishes Engine (`/BirthdayWishes`)
- **Maqsad:** Automated birthday wishes for students and teachers.
- **Key Features:** Aaj kiske birthday hai unki list, auto-generated personalized greeting SMS/Email templates.
- **Pitch Point (PR & Goodwill):** *"Subah bache ya teacher ko school ki taraf se automated birthday message jata hai jo unka dil jeet leta hai."*

### Screen 79: Feedback & Suggestions Desk (`/FeedbackSuggestions`)
- **Maqsad:** Parents aur teachers se constructive feedback lena.
- **Key Features:** Anonymous ya named feedback submissions, rating stars, category filters, management action remarks.
- **Pitch Point:** *"School management ko pata chalta rehta hai ke parents kahan satisfy hain aur kahan behtari ki zaroorat hai."*

### Screen 80: School Event Calendar (`/EventCalendar`)
- **Maqsad:** Annual school calendar of events.
- **Key Features:** Monthly/Yearly interactive calendar with Sports Gala, Science Exhibition, Debates, Holidays aur Exam dates marked.
- **Pitch Point:** *"Parents aur teachers saal bhar ke events pehle se plan kar sakte hain."*

### Screen 81: Staff Internal Chat Platform (`/StaffChat`)
- **Maqsad:** School ka private secure WhatsApp alternative for staff.
- **Key Features:** One-on-one direct chat between teachers, Department groups, file sharing, online status.
- **Pitch Point:** *"Teachers ko personal WhatsApp groups banane ki zaroorat nahi, professional communication school ke platform par hoti hai."*

---

## 📝 PHASE 12: Comprehensive Examination & Online CBT

### Screen 82: Exam Setups (`/ExamSetups`)
- **Maqsad:** Exams configure karna (e.g. Midterm 2026, Final Term 2026, Monthly Unit Tests).
- **Key Features:** Exam Name, Academic Year, Term, Passing percentage, Description.
- **Pitch Point:** *"Session ke tamam exams structured rehte hain."*

### Screen 83: Grading Scales (`/GradingScales`)
- **Maqsad:** Grading criteria aur GPA define karna.
- **Key Features:** Standard Grade Bands: A+ (90-100%), A (80-89%), B, C, D, Fail. GPA points allotment (4.0, 3.5, etc.) aur remarks (Outstanding, Good, Needs Improvement).
- **Pitch Point:** *"International standard GPA ya traditional percentage dono grading systems fully supported hain."*

### Screen 84: Date Sheets (`/ExamSchedules`)
- **Maqsad:** Exam Date Sheet / Timetable banana.
- **Key Features:** Exam select karein ➔ Subject-wise exam date, day, start time, end time aur exam room number assign karein. Printable Date Sheet PDF.
- **Pitch Point:** *"Bacho aur parents ko clear, professional printable date sheet milti hai."*

### Screen 85: Admit Cards Generator (`/AdmitCardGenerator`)
- **Maqsad:** Exam Roll Number Slips / Admit Cards.
- **Key Features:** Student photo, roll number, class, center instructions, candidate slip, fee paid clearance check, bulk print in card format.
- **Pitch Point (Fee Recovery Feature):** *"Defaulter bacho ko admit card rok kar fees timely recover karne me madad milti hai."*

### Screen 86: Question Bank — CBT (`/QuestionBank`)
- **Maqsad:** Online test ke liye MCQs aur sawalat ka bank.
- **Key Features:** Subject, Class, Topic, Difficulty level (Easy, Medium, Hard), Multiple Choice Questions (options A, B, C, D with correct answer key).
- **Pitch Point:** *"Teachers apna sawalat ka bank bana lete hain jisse future tests mintu me generate ho jate hain."*

### Screen 87: Online CBT Exams Manager (`/OnlineExams`)
- **Maqsad:** Computer-Based Tests create aur publish karna.
- **Key Features:** Exam Title, Duration (e.g. 45 minutes), Total marks, Shuffle questions toggle, Negative marking option, Assign to specific class.
- **Pitch Point:** *"Computer lab me bache baith kar online test de sakte hain jaisa NUST, FAST ya IBA ke entry tests me hota hai."*

### Screen 88: Take Online Exam Portal (`/TakeOnlineExam`)
- **Maqsad:** Student ka actual exam dene wala interface.
- **Key Features:** Countdown live timer, Question navigation grid, "Mark for Review" button, Auto-save answers, Final Submit confirmation, **Instant Auto-Grading**.
- **Pitch Point (High Tech):** *"Bacha test submit karte hi apna score aur correct answers dekh sakta hai, teacher ko checking ka dard nahi uthana parta!"*

### Screen 89: Marks Entry Dashboard (`/MarksEntryDashboard`)
- **Maqsad:** Traditional pen-and-paper exams ke marks enter karna.
- **Key Features:**
  - Exam, Class, Section aur Subject select karein.
  - Sab bacho ki list samne aa jati hai.
  - Marks input fields with validation (total marks se barh kar marks nahi likhe ja sakte).
  - System khud auto-grade calculate karta hai.
- **Pitch Point:** *"Fast bulk entry interface jahan teacher arrow keys se fatatafat marks enter karta chala jata hai."*

---

## 🏨 PHASE 13: Hostel & Accommodation

### Screen 90: Hostel Setup (`/HostelSetup`)
- **Maqsad:** Boarding schools ke liye hostels aur kamray configure karna.
- **Key Features:** Hostel buildings (Boys Hostel, Girls Hostel), Warden name, Floors, Room numbers, Room types (Single, Shared, Dormitory), Bed capacity.
- **Pitch Point:** *"Boarding schools ke liye bed-by-bed capacity management."*

### Screen 91: Hostel Allocations (`/HostelAllocations`)
- **Maqsad:** Student ko hostel room aur bed allot karna.
- **Key Features:** Student select karein ➔ Available room & bed allot karein ➔ Check-in date ➔ Hostel fees auto-link with student monthly fee challan.
- **Pitch Point:** *"Hostel fees monthly challan me automatically shamil ho jati hai, alag se voucher nahi banana parta."*

---

## 🚌 PHASE 14: Transport & Fleet Management

### Screen 92: Transport Setup (`/TransportSetup`)
- **Maqsad:** School vans aur buses ka fleet register.
- **Key Features:** Vehicle Registration No, Vehicle Model, Seating Capacity, Driver Name, Driver License, Contact, GPS device tracker ID.
- **Pitch Point:** *"School ki tamam vans aur drivers ka verified record rehta hai."*

### Screen 93: Transport Routes & Stops (`/TransportRoutes`)
- **Maqsad:** Bus routes aur stops define karna.
- **Key Features:** Route Name (e.g. Route 1 - Gulberg to DHA), Vehicle assign, Stops list with pickup and drop timings, Stop-wise fare distance.
- **Pitch Point:** *"Har route ke stops aur pickup timing fixed rehte hain jisse bacho ko late nahi hota."*

### Screen 94: Student Transport Allocations (`/StudentTransport`)
- **Maqsad:** Student ko specific route aur stop par assign karna.
- **Key Features:** Student select karein ➔ Bus route & stop choose karein ➔ Seat allocation ➔ **Transport fee student ke monthly fee challan me auto-add ho jati hai!**
- **Pitch Point:** *"Transport incharge ko list nahi banani parti, driver ko route sheet print karke di ja sakti hai."*

---

## 📦 PHASE 15: Inventory & Asset Management

### Screen 95: Stock Catalog (`/StockCatalog`)
- **Maqsad:** School assets aur consumables ka catalog.
- **Key Features:** Item Name, Category (Furniture, Stationery, Science Lab, Sports, IT Hardware), Unit (Pieces, Boxes), **Reorder Alert Level**.
- **Pitch Point:** *"Stationery ya lab chemicals khatam hone se pehle system low-stock alert de deta hai."*

### Screen 96: Stock Ledger (`/StockLedger`)
- **Maqsad:** Stock In (Purchase) aur Stock Out (Issuance) transactions.
- **Key Features:** Purchase quantity, Supplier name, Issue to department/teacher, Purpose, Running stock balance calculation.
- **Pitch Point:** *"School ke assets (chairs, markers, footballs) ki chori aur wastage khatam ho jati hai."*

### Screen 97: Inventory Expense Logs (`/ExpenseLogs`)
- **Maqsad:** Inventory khareedne par aane wale kharchat.
- **Key Features:** Purchase invoice number, vendor details, total bill, payment method, linked to inventory catalog.
- **Pitch Point:** *"Procurement department har purchase ka audit bill store karta hai."*

---

## 📖 PHASE 16: Library Management

### Screen 98: Book Catalog (`/BookCatalog`)
- **Maqsad:** Library kitabon ka digital index.
- **Key Features:** Book Title, Author, ISBN Number, Category (Science, Islamic, Literature, Fiction), Total Copies, Available Copies, Shelf/Rack Number, Barcode generator.
- **Pitch Point:** *"Kitab dhoondne ke liye racks me bhatakna nahi parta, search bar me author ya naam likhte hi shelf location mil jati hai."*

### Screen 99: Book Issue & Return Engine (`/IssueBooks`)
- **Maqsad:** Kitab bache ya teacher ko issue karna aur wapas lena.
- **Key Features:** Barcode scan / Member search ➔ Book select ➔ Issue Date & Return Due Date ➔ Return confirmation ➔ **Overdue late return fine auto-calculation**.
- **Pitch Point:** *"Kitab wapas na aane par fine auto-calculate hota hai aur student clearance me show hota hai."*

### Screen 100: Library Fines (`/LibraryFines`)
- **Maqsad:** Library fines collection aur waiver.
- **Key Features:** Overdue fines list, Member name, Days overdue, Fine amount, Paid / Waive action, Receipt generation.
- **Pitch Point:** *"Kitabein gum hone ya late hone ka strict financial control rehta hai."*

---

## 🏢 PHASE 17: Front Office & Campus Security

### Screen 101: Visitors Log & Gate Pass (`/VisitorsLog`)
- **Maqsad:** Reception / Gatekeeper par anay wale har visitor ka record.
- **Key Features:** Visitor Name, CNIC / ID, Phone, Whome to Meet (Principal, Admin, Specific Student), Purpose of Visit, Check-In Time, Check-Out Time, **Print Visitor Gate Pass**.
- **Pitch Point (Campus Security):** *"School me bina verification ke koi dakhil nahi ho sakta. Gate pass par visitor ka time aur milne wale ka naam print hota hai."*

### Screen 102: Certificates Manager (`/CertificatesManager`)
- **Maqsad:** All-in-one certificate generation desk.
- **Key Features:** Bonafide, Character, Hope Certificate, Sports Merit Certificate generate and track history with serial verification numbers.
- **Pitch Point:** *"Clerk ko MS Word me formatting nahi karni parti, professional certificates 1 click me ban jate hain."*

### Screen 103: Notifications Inbox (`/NotificationsInbox`)
- **Maqsad:** System-generated alerts ka universal inbox.
- **Key Features:** System alerts, Low attendance warnings, Fee due reminders, Leave request approvals notifications.
- **Pitch Point:** *"Koi zaroori alert miss nahi hota, bell icon par notification badge rehta hai."*

### Screen 104: PTM Slot Booking Desk (`/PtmSlots`)
- **Maqsad:** PTM timing slots ka management.
- **Key Features:** Time slots availability, booked parents list, reschedule slot option.
- **Pitch Point:** *"Smooth parent flow maintain rehta hai meeting wale din."*

---

## ⚙️ PHASE 18: System Settings & Multi-Campus Administration

### Screen 105: Tenants / Campuses Management (`/Tenants`)
- **Maqsad:** Multi-Branch / Multi-Campus School Chains manage karna.
- **Key Features:**
  - Nayi branch / campus add karein (Name, Code, Address, Phone, Custom Logo, Currency).
  - Complete database isolation per campus.
  - SuperAdmin switch between campuses feature.
- **Pitch Point (Enterprise Scalability):** *"Agar aapke school ki 5 branches hain to aapko 5 alag software khareedne ki zaroorat nahi. Isi aik system me tamam campuses chalenge aur head office sab ko monitor karega."*

### Screen 106: User Management (`/UserManagement`)
- **Maqsad:** System users ke login accounts manage karna.
- **Key Features:** Add user, assign role (Admin, Teacher, Staff, Student, Parent), link user account to a specific staff/student record, Active/Deactivate account, Reset password.
- **Pitch Point:** *"Staff chhor kar jaye to uska account 1 second me deactivate kiya ja sakta hai."*

### Screen 107: Permissions Matrix — RBAC (`/PermissionsMatrix`)
- **Maqsad:** Fine-Grained Role-Based Access Control (RBAC).
- **Key Features:** Roles (Columns) vs Screen Permissions (Rows) interactive checkbox matrix. Kisi role ko kisi specific screen ka view, edit ya delete allow ya block karein.
- **Pitch Point:** *"Aap tay karte hain ke clerk ko kya nazar aye aur accountant ko kya. Data privacy 100% secured rehti hai."*

### Screen 108: Biometric Hardware IoT Manager (`/BiometricDevices`)
- **Maqsad:** Biometric Attendance Devices (ZKTeco, etc.) configure karna.
- **Key Features:** Device IP address, Port, Machine location (Main Gate, Staff Room), Device Status (Online/Offline), Live Sync Attendance logs button.
- **Pitch Point:** *"Hardware IoT integration ke sath modern automation jo attendance fraud ko zero kar deta hai."*

### Screen 109: Bulk CSV Data Migration (`/DataMigration`)
- **Maqsad:** Excel / CSV file se hazaron students aur staff ka data 1 minute me import karna.
- **Key Features:** Download CSV sample template ➔ Upload school excel sheet ➔ Field column mapping ➔ Validation preview ➔ Bulk Import with error report.
- **Pitch Point (Client Objection Killer):** *Client kahta hai: 'Mere pass 1,500 bacho ka data Excel me hai, software me kaun daalega?' Aap batayein: 'Sir, kisi ko typing nahi karni, aapki Excel sheet 2 minute me direct software me import ho jayegi!'*

### Screen 110: Database Backup Scheduler (`/DatabaseBackup`)
- **Maqsad:** Data safety aur disaster recovery.
- **Key Features:** Instant manual backup button, Automated daily/weekly backup schedule, Download `.bak` file, Restore from backup.
- **Pitch Point:** *"School ka 10 saal ka record mehfooz rehta hai. Server kharab bhi ho jaye to backup se sab wapas aa jata hai."*

### Screen 111: Executive Master Aggregator (`/ExecutiveMasterDashboard`)
- **Maqsad:** Group CEO / Director view across all campuses.
- **Key Features:** Sab branches ki combined total revenue, total students count, staff count aur comparative performance charts.
- **Pitch Point:** *"School group ke owner ko har branch ka comparison aik screen par milta hai ke kaunsi branch munafay me hai aur kaunsi loss me."*

### Screen 112: Parent & Student Mobile Portal Settings (`/ParentPortal`)
- **Maqsad:** Mobile portal features enable/disable karna.
- **Key Features:** Toggle options (Show results to parent, Show fee history, Allow online leave, Download APK app QR code).
- **Pitch Point:** *"School apni policy ke mutabiq decide kar sakta hai ke parents ko kitna data dikhana hai."*

### Screen 113: Custom Roles & Permissions (`/Roles`)
- **Maqsad:** Custom user roles banana (e.g. "Lab Assistant", "Transport Incharge", "Vice Principal").
- **Key Features:** Role Name, Role description, user count, permission bundle assign.
- **Pitch Point:** *"Aapke school ke organizational hierarchy ke mutabiq custom roles banaye ja sakte hain."*

### Screen 114: Holiday Calendar (`/HolidayCalendar`)
- **Maqsad:** Official chhutiyon ka calendar define karna.
- **Key Features:** Holiday Title (Eid-ul-Fitr, Kashmir Day, Winter Vacations), Start Date, End Date, Recurring annual holiday toggle. **Attendance module in dates par auto-lock ho jata hai.**
- **Pitch Point:** *"Chhutti wale din attendance marking band hoti hai aur bacho ka attendance percentage affect nahi hota."*

### Screen 115: System Audits Trail (`/SystemAudits`)
- **Maqsad:** Complete Cyber Security Audit Log.
- **Key Features:** User IP address, exact action (Login, Update, Delete, Export), timestamp, module name. Immutable logs.
- **Pitch Point:** *"Kisine koi record tabdeel kiya to pakra jayega, complete digital accountability."*

### Screen 116: Security Settings & 2FA (`/SecuritySettings`)
- **Maqsad:** System-wide security rules.
- **Key Features:** Password complexity rules, Session auto-timeout after inactivity, IP whitelist restriction, Brute-force login lockout after 5 wrong attempts.
- **Pitch Point:** *"Banks ki tarah high-security protocols jo school ke sensitive data ko hacking se bachate hain."*

---

# 5. Top 10 "Killer Features" Jo Client Ko Impress Karengi

Demo ke dauran in 10 features par sabse zyada zor dein:

1. **3-Copy Bank Challan (`/reports/fee-voucher`):** Ready-to-print standard Bank, School aur Student copy with late fee logic.
2. **Double-Booking Free Timetable (`/Timetable`):** Teacher clash detection warning algorithm.
3. **Smart Substitute Finder (`/SubstituteManagement`):** Absent teacher ki jagah free period wale teachers ki auto-recommendation.
4. **Instant CBT Online Exams (`/OnlineExams` & `/StudentCBT`):** Countdown timer, instant auto-checking and result generation.
5. **Double-Entry Corporate Accounting (`/ChartOfAccounts` & `/GeneralLedger`):** Complete P&L, Balance Sheet aur Trial Balance.
6. **RFID Smart Student Wallet (`/StudentWallets`):** Cashless school canteen tap-and-pay cards.
7. **Biometric IoT Attendance (`/BiometricDevices`):** Hardware devices ke sath direct sync.
8. **1-Click Admission Converter (`/AdmissionEnquiries`):** Walk-in enquiry ko instant student me convert karna baghair dobara form bhare.
9. **Automated Birthday Engine (`/BirthdayWishes`):** Students aur staff ko auto-wishes alerts.
10. **Bulk Excel / CSV Data Importer (`/DataMigration`):** Hazaron students ka data 1 minute me live import.

---

# 6. Demo Dene Ki Professional Strategy & Live Presentation Script

Jab aap physical meeting me projector ya laptop par demo de rahe hon to is 6-Step Script ko follow karein:

### Step 1: Login & Branding (2 Minutes)
- Screen kholen: `/signin`.
- Dikhayein: School ka naam aur logo select hota hai. Login hote hi Executive Dashboard `/dashboard` khulta hai.
- **Bolein:** *"Sir, yeh aapka central command center hai. Yahan aate hi aapko aaj ki fees, bacho ki live presence aur monthly collection ka graph aik nazar me nazar aa jata hai."*

### Step 2: Student Admission se Challan tak ka Flow (4 Minutes)
- Screen kholen: `/AdmissionEnquiries` ➔ `/students` ➔ `/FeeChallans`.
- Dikhayein: Naya bacha admit hua ➔ Class assign hui ➔ Uska 3-copy fee voucher generate ho gaya.
- Print Preview dikhayein: `/reports/fee-voucher`.
- **Bolein:** *"Dekhein Sir, kaghaz par form bharna, register me likhna aur haath se slip kaatne ka time bilkul zero ho gaya."*

### Step 3: Academics & Timetable Clash Protection (3 Minutes)
- Screen kholen: `/Timetable` aur `/SubstituteManagement`.
- Ek period drag karke clash dikhayein aur substitute recommendation dikhayein.
- **Bolein:** *"Principal ka sabse bara sir dard timetable hota hai. Hamara system teacher ka double-booking clash hone hi nahi deta aur absent teacher ka substitute khud dhoondta hai."*

### Step 4: Exams & Modern CBT (3 Minutes)
- Screen kholen: `/OnlineExams` ya `/reports/broadsheet`.
- Broadsheet result gazette aur report card dikhayein.
- **Bolein:** *"Aapka school conventional se modern ban jata hai. Pen-paper ke ilawa bache computer par online tests bhi de sakte hain jinki auto-checking hoti hai."*

### Step 5: Transparency & Finance (3 Minutes)
- Screen kholen: `/reports/fee-defaulters` aur `/reports/profit-loss`.
- Dikhayein ke 30-day aur 60-day defaulters ki list kaise nikal aati hai.
- **Bolein:** *"School ka profit aur loss, daily collection tally aur fee defaulters ki list har waqt aapke samne hai. Koi rupee gayab nahi ho sakta."*

### Step 6: Closing & Objections Handling (3 Minutes)
- Screen kholen: `/DataMigration`.
- Client ko bolein: *"Aapko naye software par aane ke liye koi pareshani nahi hogi, aapka purana Excel data hum 1 ghante me import kar denge. Aur aapke staff ko poori training provide ki jayegi."*
- Call to Action: *"Sir, batayein kis date se aapka campus setup shuru karein?"*

---

> **🏆 End of Demo Guide**  
> *VOKE Solutions SMS — Designed for Excellence, Built for Scale.*
