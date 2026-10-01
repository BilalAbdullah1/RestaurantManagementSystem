# 🏫 VOKE Solutions SMS — Phase 7: Auxiliary Campus Services

> **System:** VOKE Solutions School Management System (SMS)  
> **Phase Target:** Phase 7 — Transport Fleet & Route Logistics, Hostel Buildings & Bed Allocations, Library Catalog & Circulation, School Inventory & Asset Movement  
> **Documentation Style:** Point-to-Point Step-by-Step Guide with Clean Data Tables  
> **Language:** English  
> **Data Integrity:** 100% Relational Human-Readable Dataset — **Zero Raw GUIDs (Fully Linked to Phase 1, Phase 2, Phase 3, Phase 5 & Phase 6)**

---

## 📑 Phase 7 Navigation Overview

* [Screen 7.1: Transport Vehicles & Drivers Setup (`/TransportSetup`)](#-screen-71-transport-vehicles--drivers-setup)
* [Screen 7.2: Transport Routes, Stops & Fee Allocation (`/TransportRoutes`)](#-screen-72-transport-routes-stops--fee-allocation)
* [Screen 7.3: Student Transport Allocation & Bus Tracking (`/StudentTransport`)](#-screen-73-student-transport-allocation--bus-tracking)
* [Screen 7.4: Hostel Buildings & Rooms Setup (`/HostelSetup`)](#-screen-74-hostel-buildings--rooms-setup)
* [Screen 7.5: Hostel Student Bed Allocations (`/HostelAllocations`)](#-screen-75-hostel-student-bed-allocations)
* [Screen 7.6: Library Books Catalog & ISBN Manager (`/BookCatalog`)](#-screen-76-library-books-catalog--isbn-manager)
* [Screen 7.7: Library Book Issue, Returns & Barcode Scanner (`/IssueBooks`)](#-screen-77-library-book-issue-returns--barcode-scanner)
* [Screen 7.8: Library Overdue Fines & Lost Book Penalty (`/LibraryFines`)](#-screen-78-library-overdue-fines--lost-book-penalty)
* [Screen 7.9: Inventory Stock Catalog & Categories (`/StockCatalog`)](#-screen-79-inventory-stock-catalog--categories)
* [Screen 7.10: Inventory Stock Ledger & Movement Logs (`/StockLedger`)](#-screen-710-inventory-stock-ledger--movement-logs)
* [Screen 7.11: Departmental Inventory Expense & Issuance Logs (`/ExpenseLogs`)](#-screen-711-departmental-inventory-expense--issuance-logs)

---

## 🚌 Screen 7.1: Transport Vehicles & Drivers Setup

### 📌 1. Screen Identity & Overview
* **Screen Name:** School Transport Fleet & Driver Management
* **Navigation Route:** `/TransportSetup`
* **Source File Location:** `src/features/transport/TransportSetup.tsx`
* **Authorized Access:** Transport Fleet In-Charge (`Subhan Ali - STF-1007`), Campus Principal

### 🎯 2. Operational Value & Business Purpose
* **Fleet Asset Tracking:** Registers school-owned buses, vans, and contracted coasters with registration plates, seating capacity, and model details.
* **Driver & Safety Compliance:** Stores driver contact numbers, official heavy transport driving licenses (HTV), and emergency safety equipment verifications.
* **Maintenance & Seating Capacity:** Prevents passenger overloading by enforcing vehicle seating caps.

### 📝 3. Form Fields & Input Information
* **Vehicle Registration Number:** Official vehicle license plate (e.g., `ISB-LEC-4412`, `ISB-RIT-8821`).
* **Vehicle Type:** *Large Bus (50 Seater)*, *Coaster (30 Seater)*, *HiAce Van (15 Seater)*.
* **Vehicle Model & Make:** (e.g., `Toyota Coaster 2024`, `Hino Eco Bus 2023`).
* **Seating Capacity:** Passenger capacity integer (e.g., `30 Seats`).
* **Driver Full Name:** Appointed school driver (e.g., `Muhammad Ashraf`).
* **Driver Mobile Phone:** Emergency contact phone.
* **Driver License Number:** Verified HTV / LTV license reference.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Review Fleet Status:** Inspect top `<StatCards>`: Total Vehicles, Active Buses on Road, Total Passenger Capacity, and Maintained Fleet.
2. **Add New Vehicle:**
   * Click **"+ Add Transport Vehicle"** button.
   * Enter Registration Plate, Vehicle Type, Seating Capacity, Model, Driver Name, and Driver Phone.
   * Click **"Save Vehicle Profile"**.
3. **Vehicle Actions (`...`):**
   * **Edit Driver Assignment:** Reassign replacement driver during staff leaves.
   * **Set Maintenance Status:** Temporarily flag bus as *Under Servicing*.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Vehicle Code | Registration Plate | Vehicle Type & Model | Seating Capacity | Assigned Driver Name | Driver Mobile Phone | Driver License # | Status |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- | :---: |
| **BUS-01** | `ISB-LEC-4412` | Coaster (Toyota 2024) | 30 Seats | Muhammad Ashraf | 0300-4455661 | HTV-ISB-88124 | `On Route (Active)` |
| **BUS-02** | `ISB-RIT-8821` | Large Bus (Hino 2023) | 50 Seats | Ghulam Rasool | 0321-7788992 | HTV-RWP-44102 | `On Route (Active)` |
| **BUS-03** | `ISB-KAP-9901` | Coaster (Toyota 2022) | 30 Seats | Tariq Mehmood | 0333-1122338 | HTV-ISB-99014 | `On Route (Active)` |
| **VAN-01** | `ISB-MNP-3321` | HiAce Van (Toyota 2023)| 15 Seats | Allah Ditta | 0345-9988771 | LTV-ISB-33190 | `On Route (Active)` |
| **BUS-04** | `ISB-ZAP-1102` | Large Bus (Isuzu 2021)| 50 Seats | Abdul Ghafoor | 0312-6655443 | HTV-KHI-55412 | `Under Servicing` |

---

## 🗺️ Screen 7.2: Transport Routes, Stops & Fee Allocation

### 📌 1. Screen Identity & Overview
* **Screen Name:** Bus Routes, Pickup Stops & Distance Fare Matrix
* **Navigation Route:** `/TransportRoutes`
* **Source File Location:** `src/features/transport/TransportRoutes.tsx`
* **Authorized Access:** Transport Fleet In-Charge, Senior Accountant

### 🎯 2. Operational Value & Business Purpose
* **Route Mapping:** Designs morning pickup and afternoon drop-off routes with sequential stop names (e.g., *Route 01: Sector F-6 Super Market ➔ Sector G-7 ➔ Campus H-8*).
* **Distance-Based Fare Tariff:** Configures monthly transport charges per route (e.g., Rs. 3,500/mo for short city route, Rs. 4,500/mo for inter-city Rawalpindi route).
* **Direct Fee Integration:** When a student is assigned to a bus route, the monthly transport fare is automatically added to their monthly fee challan (Screen 6.6).

### 📝 3. Form Fields & Input Information
* **Route Code & Name:** (e.g., `ROUTE-01-ISB`, *Islamabad Sector F & G Express*).
* **Assigned Vehicle:** Select from fleet registered in Screen 7.1 (e.g., `BUS-01`).
* **Pickup Stops:** List of physical stop locations (e.g., *F-6 Super Market, F-7 Jinnah Super, G-7 Markaz*).
* **Morning Pickup Time:** (e.g., `07:15 AM`).
* **Monthly Transport Fee (PKR):** Prescribed monthly rate (e.g., `Rs. 3,500.00`).

### ⚙️ 4. Step-by-Step Operator Guide
1. **Create New Bus Route:** Click **"+ Create New Route"**.
2. **Assign Bus & Stops:** Choose `BUS-01 (Toyota Coaster)`, input route title and comma-separated stop landmarks.
3. **Set Monthly Fare:** Enter monthly transport charge (`Rs. 3,500.00`).
4. **Save & Activate:** Click **"Save Route"**.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Route Code | Route Name | Assigned Vehicle | Primary Pickup Stops | Start Time | Total Stops | Monthly Fare (PKR) |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **ROUTE-01** | Islamabad Sector F & G Express | `BUS-01` (Coaster) | F-6 Super Market ➔ F-7 Markaz ➔ G-7 ➔ Campus | 07:15 AM | 4 Stops | **Rs. 3,500 / Mo** |
| **ROUTE-02** | Rawalpindi Cantt to Campus | `BUS-02` (Large Bus) | Saddar Cantt ➔ Commercial Market ➔ Faizabad ➔ Campus | 06:45 AM | 5 Stops | **Rs. 4,500 / Mo** |
| **ROUTE-03** | Islamabad Sector I & H Local | `BUS-03` (Coaster) | I-8 Markaz ➔ I-9 Industrial ➔ H-9 ➔ Campus | 07:25 AM | 3 Stops | **Rs. 3,000 / Mo** |
| **ROUTE-04** | Bahria Town & DHA Shuttle | `VAN-01` (HiAce Van) | Bahria Phase 4 ➔ Phase 7 ➔ DHA Phase 2 ➔ Campus | 06:30 AM | 4 Stops | **Rs. 6,000 / Mo** |

---

## 🚏 Screen 7.3: Student Transport Allocation & Bus Tracking

### 📌 1. Screen Identity & Overview
* **Screen Name:** Student Bus Seat Allocation & Pickup Manifest
* **Navigation Route:** `/StudentTransport`
* **Source File Location:** `src/features/transport/StudentTransport.tsx`
* **Authorized Access:** Transport Fleet In-Charge, Admissions Officer, Cashier

### 🎯 2. Operational Value & Business Purpose
* **Seat Allotment:** Allocates enrolled students to specific bus routes and assigned pickup stop points.
* **Driver Manifest Sheets:** Generates printable daily student pickup rosters for bus drivers with student emergency contact numbers.
* **Real-Time Seat Cap Safeguard:** Alerts operator if a bus reaches 100% capacity to prevent overcrowding.

### 📝 3. Form Fields & Input Information
* **Student Identifier:** Select student (e.g., `Muhammad Ali Khan - AD-2026-0101`).
* **Selected Route:** Select active route (e.g., `ROUTE-01`).
* **Specific Pickup Stop:** Chosen morning landmark (e.g., *F-6 Super Market Stop*).
* **Allocation Date:** Date bus service begins.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Assign Student to Bus:** Click **"+ Allocate Bus Seat"**.
2. **Select Student & Route:** Pick `Muhammad Ali Khan (10-A)` and `ROUTE-01`.
3. **Verify Capacity:** Check bus load meter (e.g., `24 / 30 Seats Occupied`).
4. **Confirm Allocation:** Click **"Confirm Bus Seat"** ➔ Transport fee is added to monthly fee invoice.
5. **Print Driver Roster:** Click **"Download Driver Manifest (PDF)"**.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Admission # | Student Full Name | Class | Assigned Route | Pickup Stop Landmark | Pickup Time | Monthly Bus Fee | Seat Status |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **AD-2026-0101** | Muhammad Ali Khan | Grade 10-A | **ROUTE-01** (ISB F/G) | F-6 Super Market Stop | 07:15 AM | Rs. 3,500 / Mo | `Allocated` |
| **AD-2026-0102** | Hamza Tariq | Grade 10-A | **ROUTE-01** (ISB F/G) | F-6 Super Market Stop | 07:15 AM | Rs. 3,500 / Mo | `Allocated` |
| **AD-2026-0104** | Bilal Hassan | Grade 10-A | **ROUTE-02** (RWP Cantt)| Saddar Metro Station | 06:45 AM | Rs. 4,500 / Mo | `Allocated` |
| **AD-2026-0106** | Zainab Fatima | Grade 9-A | **ROUTE-01** (ISB F/G) | F-7 Jinnah Super Stop | 07:22 AM | Rs. 3,500 / Mo | `Allocated` |
| **AD-2026-0107** | Ahmed Raza | Grade 1-A | **ROUTE-03** (ISB I/H) | I-8 Markaz PSO Station | 07:28 AM | Rs. 3,000 / Mo | `Allocated` |

---

## 🏢 Screen 7.4: Hostel Buildings & Rooms Setup

### 📌 1. Screen Identity & Overview
* **Screen Name:** Hostel Residential Buildings & Room Setup
* **Navigation Route:** `/HostelSetup`
* **Source File Location:** `src/features/hostel/HostelSetup.tsx`
* **Authorized Access:** Hostel Warden (`Asad Ullah Khan - STF-1009`), Campus Principal

### 🎯 2. Operational Value & Business Purpose
* **Boarding Infrastructure:** Configures residential hostel blocks (e.g., *Jinnah Boys Hostel Block A*, *Iqbal Senior Dormitory*).
* **Room Typologies & Capacities:** Defines room types (*Single Deluxe*, *Double Occupancy*, *Triple Bed*, *Dormitory 6-Bed*) with monthly room rent tariffs.
* **Maintenance & Availability:** Tracks room readiness, air conditioning facilities, and vacant bed capacity.

### 📝 3. Form Fields & Input Information
* **Room Number:** Physical room code (e.g., `Room 101-A`, `Room 204-B`).
* **Hostel Block Name:** (e.g., *Jinnah Boys Boarding Wing*).
* **Room Type:** *Single (1 Bed)*, *Double (2 Beds)*, *Triple (3 Beds)*, *Dormitory (6 Beds)*.
* **Bed Capacity:** Total student beds in that room (e.g., `3 Beds`).
* **Monthly Hostel Rent (PKR):** (e.g., `Rs. 15,000.00 / Month`).
* **Amenities Description:** (e.g., *Attached Washroom, Study Table, Split AC, Wi-Fi*).

### ⚙️ 4. Step-by-Step Operator Guide
1. **View Hostel Occupancy:** Check top cards for Total Rooms, Total Beds, Occupied Beds, and Available Vacancies.
2. **Add New Hostel Room:**
   * Click **"+ Add Hostel Room"**.
   * Enter Room # (`Room 101`), Room Type (*Triple Bed*), Capacity (`3`), and Monthly Fee (`Rs. 15,000`).
   * Click **"Save Room Profile"**.
3. **Manage Rooms (`...`):** Edit monthly room rent or toggle room availability.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Room Code | Hostel Building Block | Room Type | Total Beds | Occupied Beds | Vacant Beds | Monthly Rent (PKR) | Room Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **RM-101** | Jinnah Boys Boarding (1st Floor) | Triple Bed Room | 3 Beds | 2 Beds | 1 Bed | **Rs. 15,000 / Mo** | `Available (1 Vacancy)` |
| **RM-102** | Jinnah Boys Boarding (1st Floor) | Triple Bed Room | 3 Beds | 3 Beds | 0 Beds | **Rs. 15,000 / Mo** | `Fully Occupied` |
| **RM-103** | Jinnah Boys Boarding (1st Floor) | Double Deluxe | 2 Beds | 2 Beds | 0 Beds | **Rs. 20,000 / Mo** | `Fully Occupied` |
| **RM-201** | Iqbal Senior Wing (2nd Floor) | Single Executive | 1 Bed | 1 Bed | 0 Beds | **Rs. 30,000 / Mo** | `Fully Occupied` |
| **RM-202** | Iqbal Senior Wing (2nd Floor) | Double Standard | 2 Beds | 1 Bed | 1 Bed | **Rs. 18,000 / Mo** | `Available (1 Vacancy)` |
| **RM-301** | Junior Dormitory (3rd Floor) | Dormitory Hall | 6 Beds | 4 Beds | 2 Beds | **Rs. 10,000 / Mo** | `Available (2 Vacancies)`|

---

## 🛏️ Screen 7.5: Hostel Student Bed Allocations

### 📌 1. Screen Identity & Overview
* **Screen Name:** Student Hostel Bed Allocation & Resident Register
* **Navigation Route:** `/HostelAllocations`
* **Source File Location:** `src/features/hostel/HostelAllocations.tsx`
* **Authorized Access:** Hostel Warden, Senior Accountant, Campus Principal

### 🎯 2. Operational Value & Business Purpose
* **Resident Check-In:** Allocates enrolled outstation students to specific hostel rooms and assigned bed numbers.
* **Mess & Boarding Fee Integration:** Automatically attaches monthly room rent and mess charges to the student's monthly fee challan.
* **Emergency Medical & Guardian Directory:** Stores emergency night contact details for hostel wardens.

### 📝 3. Form Fields & Input Information
* **Student Identifier:** Select boarder student (e.g., `Usman Ghani Jr. - AD-2026-0105`).
* **Target Room & Bed:** Select available room (e.g., `Room 101 - Bed B`).
* **Check-In Date:** Official boarding start date.
* **Emergency Guardian Phone:** Night contact phone for hostel warden.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Allocate Hostel Bed:** Click **"+ Allocate Bed"**.
2. **Select Boarder Student:** Choose student (`Usman Ghani Jr. - 10-A`) and Room (`Room 101 - Triple Bed`).
3. **Confirm Allocation:** Click **"Confirm Check-In"** ➔ Adds Rs. 15,000 hostel charge to monthly fee.
4. **Student Check-Out:** In `<ActionMenu>`, click **"Check-Out Student"** (verifies zero damage/mess dues).

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Admission # | Boarder Student Name | Enrolled Class | Assigned Room | Bed Number | Check-In Date | Monthly Boarding Fee | Resident Status |
| :--- | :--- | :--- | :--- | :---: | :--- | :---: | :---: |
| **AD-2026-0105** | Usman Ghani Jr. | Grade 10-A | Room 101 (Jinnah Wing) | Bed A | 2026-08-01 | Rs. 15,000 / Mo | `Resident Active` |
| **AD-2026-0108** | Omer Farooq | Grade 10-B | Room 101 (Jinnah Wing) | Bed B | 2026-08-01 | Rs. 15,000 / Mo | `Resident Active` |
| **AD-2026-0112** | Shahzad Karim | Grade 8-A | Room 102 (Jinnah Wing) | Bed A | 2026-08-01 | Rs. 15,000 / Mo | `Resident Active` |
| **AD-2026-0119** | Danish Ali | Grade 9-B | Room 202 (Iqbal Wing) | Bed A | 2026-08-05 | Rs. 18,000 / Mo | `Resident Active` |

---

## 📚 Screen 7.6: Library Books Catalog & ISBN Manager

### 📌 1. Screen Identity & Overview
* **Screen Name:** Library Master Book Catalog & Accession Registry
* **Navigation Route:** `/BookCatalog`
* **Source File Location:** `src/features/library/BookCatalog.tsx`
* **Authorized Access:** Chief Librarian (`Muhammad Rashid - STF-1006`), Principal

### 🎯 2. Operational Value & Business Purpose
* **Digital Accession Registry:** Maintains master inventory of all library books, scientific journals, encyclopedia volumes, and literature novels.
* **Barcode & ISBN Cataloging:** Stores ISBN numbers, rack shelf coordinates (e.g., `SCI-RACK-02`), author, and total vs available copy counts.
* **Instant Search & Availability:** Enables students and teachers to search book titles and check real-time shelf availability.

### 📝 3. Form Fields & Input Information
* **Book Title & Author:** Full title (e.g., *Fundamentals of Physics*) and author (*Halliday & Resnick*).
* **ISBN Number:** 13-digit International Standard Book Number (e.g., `978-0470547892`).
* **Category / Genre:** *Science*, *Mathematics*, *Literature & Fiction*, *History*, *Islamic Studies*, *Computer Science*.
* **Physical Shelf Location:** Exact rack coordinate (e.g., `Rack B-04 / Shelf 2`).
* **Total Purchased Copies:** Total copies owned by the school library.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Search Book Catalog:** Search by book title, author, or scan ISBN barcode.
2. **Add New Book Title:**
   * Click **"+ Add New Book"**.
   * Enter Title, Author, ISBN, Category (*Science*), Shelf Location (`SCI-RACK-02`), and Total Copies (`15`).
   * Click **"Save Book Record"**.
3. **Print Barcode Labels:** Click **"Print Barcode Stickers"** to paste on physical book covers.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Book Code | Book Title | Author Name | ISBN Number | Category | Shelf Location | Total Copies | Available Copies |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |
| **BK-901** | Fundamentals of Physics (10th Ed) | Halliday & Resnick | 978-0470547892 | Science / Physics | `SCI-RACK-02` | 15 Copies | **13 Available** |
| **BK-902** | Advanced Pure Mathematics | SMP Cambridge | 978-0521397888 | Mathematics | `MTH-RACK-01` | 20 Copies | **18 Available** |
| **BK-903** | Organic & Inorganic Chemistry | Dr. F.A. Cotton | 978-0471517368 | Science / Chemistry | `SCI-RACK-04` | 12 Copies | **11 Available** |
| **BK-904** | To Kill a Mockingbird | Harper Lee | 978-0060935467 | English Literature | `LIT-RACK-03` | 25 Copies | **22 Available** |
| **BK-905** | Introduction to Computer Algorithms| Thomas H. Cormen | 978-0262033848 | Computer Science | `CS-RACK-01` | 10 Copies | **9 Available** |
| **BK-906** | Complete Cambridge O-Level Urdu | Nigel Kelly | 978-1444111958 | Language | `URD-RACK-02` | 30 Copies | **27 Available** |

---

## 🔄 Screen 7.7: Library Book Issue, Returns & Barcode Scanner

### 📌 1. Screen Identity & Overview
* **Screen Name:** Library Circulation Desk & Barcode Scanner
* **Navigation Route:** `/IssueBooks`
* **Source File Location:** `src/features/library/IssueBooks.tsx`
* **Authorized Access:** Chief Librarian (`Muhammad Rashid - STF-1006`)

### 🎯 2. Operational Value & Business Purpose
* **Rapid Circulation Desk:** Issues books to students or teachers in 3 seconds by scanning the student ID barcode followed by the book ISBN barcode.
* **Loan Period Enforcement:** Sets standard 14-day borrowing duration with automated due-date return alerts.
* **Return & Condition Audit:** Records book returns, assesses physical condition (Good vs Damaged), and marks copies as back on the shelf.

### 📝 3. Form Fields & Circulation Elements
* **Borrower Badge Barcode:** Scan student ID (e.g., `AD-2026-0101 - Muhammad Ali Khan`) or staff code.
* **Book Barcode:** Scan book ISBN (e.g., `BK-901`).
* **Issue Date & Due Date:** Default 14 days (e.g., Issued: `2026-08-22`, Due: `2026-09-05`).
* **Circulation Status:** `Issued (Active)`, `Returned on Time`, `Overdue`, `Lost`.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Issue Book to Student:**
   * Scan Student Badge ➔ Scan Book Barcode.
   * System verifies student has not exceeded maximum limit (max 3 books).
   * Click **"Confirm Issue"** ➔ Decrements available copies on shelf.
2. **Process Book Return:**
   * Scan returning book barcode.
   * System checks if return is on time.
   * If overdue, system auto-calculates fine (Rs. 10/day) and routes to Screen 7.8.
   * Click **"Mark as Returned"** ➔ Restores copy count.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Circulation ID | Borrower Name | Role / Class | Book Title Issued | Issue Date | Due Date | Return Date | Circulation Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **CIRC-2026-01** | Muhammad Ali Khan (`AD-2026-0101`)| Student (10-A) | Fundamentals of Physics (`BK-901`)| 2026-08-22 | 2026-09-05 | — | `Active on Loan` |
| **CIRC-2026-02** | Ayesha Bibi (`AD-2026-0103`) | Student (10-A) | To Kill a Mockingbird (`BK-904`) | 2026-08-10 | 2026-08-24 | 2026-08-28 | `Returned (4 Days Late)` |
| **CIRC-2026-03** | Fatima Zahra (`STF-1005`) | Faculty (Math) | Advanced Pure Math (`BK-902`) | 2026-08-15 | 2026-09-15 | — | `Active on Loan` |
| **CIRC-2026-04** | Bilal Hassan (`AD-2026-0104`) | Student (10-A) | Computer Algorithms (`BK-905`)| 2026-08-24 | 2026-09-07 | — | `Active on Loan` |

---

## 💸 Screen 7.8: Library Overdue Fines & Lost Book Penalty

### 📌 1. Screen Identity & Overview
* **Screen Name:** Library Overdue Fines & Lost Book Penalties
* **Navigation Route:** `/LibraryFines`
* **Source File Location:** `src/features/library/LibraryFines.tsx`
* **Authorized Access:** Chief Librarian, Senior Accountant

### 🎯 2. Operational Value & Business Purpose
* **Overdue Penalty Ingestion:** Auto-charges overdue penalty (Rs. 10 per day late) when books are returned past due dates.
* **Lost Book Replacement Recovery:** Charges full market replacement cost of books lost or damaged by borrowers.
* **Cashier & Digital Wallet Clearance:** Fines can be paid in cash at the library counter or deducted directly from the student's Digital Wallet (Screen 6.8).

### 📝 3. Form Fields & Fine Elements
* **Borrower Identifier:** Student or staff name.
* **Overdue Days:** Number of days past return deadline (e.g., 4 days late = Rs. 40).
* **Fine Type:** `Overdue Days Fine`, `Damaged Book Penalty`, `Lost Book Full Replacement`.
* **Fine Status:** `Unpaid / Pending`, `Paid via Cash Desk`, `Paid via Student Wallet`, `Waived by Principal`.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Review Outstanding Fines:** Inspect total unpaid library fines roster.
2. **Collect Fine Payment:**
   * Click **"Receive Fine"** on any unpaid fine row.
   * Select Payment Mode (*Cash Counter* or *Student Digital Wallet*).
   * Click **"Confirm Payment"** ➔ Prints library clear slip.
3. **Principal Waiver:** Principal can waive fines for students with valid medical excuses.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Fine Code | Student Name | Class | Book Title Involved | Overdue Days | Fine Amount (PKR) | Payment Mode | Fine Status |
| :--- | :--- | :--- | :--- | :---: | :---: | :--- | :---: |
| **FINE-2026-01** | Ayesha Bibi (`AD-2026-0103`) | Grade 10-A | To Kill a Mockingbird (`BK-904`) | 4 Days Late | **Rs. 40.00** | Paid via Student Wallet | `Paid & Cleared` |
| **FINE-2026-02** | Usman Ghani Jr. (`AD-2026-0105`)| Grade 10-A | Fundamentals of Physics (`BK-901`)| 10 Days Late | **Rs. 100.00** | Unpaid | `Pending Collection`|
| **FINE-2026-03** | Hamza Tariq (`AD-2026-0102`) | Grade 10-A | Cambridge O-Level Urdu (`BK-906`)| Damaged Cover | **Rs. 250.00** | Paid Cash Counter | `Paid & Cleared` |

---

## 📦 Screen 7.9: Inventory Stock Catalog & Categories

### 📌 1. Screen Identity & Overview
* **Screen Name:** School Inventory Master Catalog & Stock Categories
* **Navigation Route:** `/StockCatalog`
* **Source File Location:** `src/features/inventory/StockCatalog.tsx`
* **Authorized Access:** Storekeeper, Procurement Manager, Senior Accountant

### 🎯 2. Operational Value & Business Purpose
* **Institutional Asset Directory:** Centralized catalog of all tangible school assets and consumables (Student Dual Desks, Teachers Tables, Science Lab Glassware, Photocopier Paper, IT Workstations).
* **Automated Low-Stock Alerts:** Automatically flags items when available stock falls below safety reorder levels (e.g., paper reams < 15 boxes).
* **Supplier & Valuation Tracking:** Stores unit purchase costs, supplier contacts, and physical storeroom warehouse locations.

### 📝 3. Form Fields & Input Information
* **Item Name & Code:** Descriptive title (e.g., `Dual Student Study Desk`, `A4 Photocopier Paper Ream`).
* **Category:** *Furniture*, *Stationery & Office*, *Electronics & IT*, *Science Lab Glassware*, *Sports Gear*.
* **Unit of Measure:** *Pcs*, *Boxes*, *Reams*, *Sets*, *Liters*.
* **Current Quantity in Stock:** Available count (e.g., `450 Pcs`).
* **Minimum Reorder Level:** Safety threshold triggering low-stock alert (e.g., `20 Pcs`).
* **Unit Purchase Price:** Cost in PKR (e.g., `Rs. 4,500.00`).
* **Storeroom Location:** (e.g., *Main Warehouse B-01*, *Science Store*).

### ⚙️ 4. Step-by-Step Operator Guide
1. **Review Stock Portfolio:** Check cards for Total Assets Value, Total SKUs, and Low-Stock Warnings.
2. **Register New Inventory Item:**
   * Click **"+ Add Inventory Item"**.
   * Enter Item Name, Category (*Furniture*), Quantity (`450`), Unit Price (`Rs. 4,500`), and Reorder Level (`20`).
   * Click **"Save Item"**.
3. **Monitor Low-Stock Warnings:** Red warning badges appear automatically on items breaching reorder limits.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Item Code | Item Name & Description | Category | Current Stock | Reorder Level | Unit Price | Total Valuation | Stock Status |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **ITM-101** | Dual Student Study Desks (Wooden) | Furniture | 450 Pcs | 20 Pcs | Rs. 4,500 | Rs. 2,025,000 | `In Stock (Healthy)` |
| **ITM-201** | A4 Photocopier Paper Reams (80gsm) | Stationery | 120 Boxes | 15 Boxes | Rs. 1,200 | Rs. 144,000 | `In Stock (Healthy)` |
| **ITM-301** | Core i5 IT Computer Workstations | Electronics | 50 Units | 5 Units | Rs. 45,000 | Rs. 2,250,000 | `In Stock (Healthy)` |
| **ITM-401** | Science Lab Borosilicate Beakers (500ml)| Lab Glassware | 12 Pcs | 15 Pcs | Rs. 650 | Rs. 7,800 | `Low Stock Alert` |
| **ITM-501** | Professional Footballs (Size 5) | Sports Equipment | 25 Pcs | 8 Pcs | Rs. 2,500 | Rs. 62,500 | `In Stock (Healthy)` |
| **ITM-601** | Classroom Whiteboard Markers (Box of 12)| Stationery | 8 Boxes | 10 Boxes | Rs. 850 | Rs. 6,800 | `Low Stock Alert` |

---

## 📈 Screen 7.10: Inventory Stock Ledger & Movement Logs

### 📌 1. Screen Identity & Overview
* **Screen Name:** Stock Movement Ledger & Inward/Outward Audit
* **Navigation Route:** `/StockLedger`
* **Source File Location:** `src/features/inventory/StockLedger.tsx`
* **Authorized Access:** Storekeeper, Procurement Manager, Internal Auditor

### 🎯 2. Operational Value & Business Purpose
* **Stock Inflow & Outflow Tracking:** Immutable audit trail recording every goods receipt note (GRN) from suppliers and every issuance to school classrooms.
* **Theft & Shrinkage Prevention:** Verifies physical storeroom audits against automated running balances.
* **Purchase Order Linking:** Links new stock additions to approved vendor purchase invoices.

### 📝 3. Ledger Attributes & Information Elements
* **Transaction Type:** `STOCK_IN (Purchase / Inward)`, `STOCK_OUT (Department Issuance)`, `DAMAGE_WRITE_OFF`.
* **Quantity Shift:** Amount added (+) or deducted (-).
* **Target Department:** Recipient department (*Secondary Science Wing*, *Examination Cell*).
* **Authorized By:** Staff member who signed the stock requisition voucher.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Record Stock Inward (GRN):** Click **"+ Receive New Stock"** ➔ Select Item, Vendor, Quantity (+50), and Purchase Price ➔ Increases stock count.
2. **Record Stock Outward (Issue):** Click **"+ Issue Stock"** ➔ Select Item, Recipient Department, Quantity (-10), and Purpose.
3. **Inspect Item Ledger:** View chronological transaction history showing opening, movement, and closing balance.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Voucher # | Date | Item Name | Movement Type | Quantity | Unit Price | Total Cost | Recipient / Purpose | Authorized Officer |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :--- | :--- |
| **GRN-2026-081** | 2026-08-15 | Photocopier Paper (`ITM-201`)| `STOCK_IN (Purchase)` | +50 Boxes | Rs. 1,200 | Rs. 60,000 | Main Store Restock | Kamran Akmal (`STF-1003`) |
| **STK-OUT-082** | 2026-08-20 | Photocopier Paper (`ITM-201`)| `STOCK_OUT (Issue)` | -10 Boxes | Rs. 1,200 | Rs. 12,000 | Midterm Exam Printing | Muhammad Rashid (`STF-1006`)|
| **STK-OUT-083** | 2026-08-22 | Dual Desks (`ITM-101`) | `STOCK_OUT (Issue)` | -20 Pcs | Rs. 4,500 | Rs. 90,000 | New Section Grade 10-B | Fatima Zahra (`STF-1005`) |
| **GRN-2026-084** | 2026-08-24 | Whiteboard Markers (`ITM-601`)| `STOCK_IN (Purchase)` | +20 Boxes | Rs. 850 | Rs. 17,000 | Al-Madina Stationers | Kamran Akmal (`STF-1003`) |

---

## 📑 Screen 7.11: Departmental Inventory Expense & Issuance Logs

### 📌 1. Screen Identity & Overview
* **Screen Name:** Departmental Inventory Expense & Consumable Issuance
* **Navigation Route:** `/ExpenseLogs`
* **Source File Location:** `src/features/inventory/ExpenseLogs.tsx`
* **Authorized Access:** Storekeeper, Campus Principal, Senior Accountant

### 🎯 2. Operational Value & Business Purpose
* **Department Cost Allocation:** Allocates consumable costs (markers, paper, lab acids, sports gear) to specific academic departments (*Science Dept*, *Mathematics Dept*, *Administration*).
* **Budget Consumption Monitoring:** Compares departmental consumable burn rates against allocated term operating budgets.
* **Paperless Requisitions:** Teachers submit digital store requisition chits approved by their HOD.

### 📝 3. Form Fields & Input Information
* **Requesting Department:** Academic or administrative wing (e.g., *Science Department*, *Examination Cell*).
* **Requesting Faculty:** Teacher requesting items (e.g., `Fatima Zahra - STF-1005`).
* **Items & Quantities Issued:** List of consumed inventory SKUs.
* **Total Monetary Value:** Auto-computed cost of issued items.

### ⚙️ 4. Step-by-Step Operator Guide
1. **Review Departmental Expense:** Filter by department (*Science*, *Sports*, *Admin*) to view consumable spending.
2. **Issue Consumable Chit:** Select Teacher ➔ Select items (3 Marker Boxes, 2 Dusters) ➔ Click **"Approve & Dispatch"**.
3. **Export Departmental Cost Report:** Click **"Download Departmental Consumption (PDF)"**.

### 📊 5. Master Relational Dataset (Zero GUIDs)

| Requisition # | Requesting Department | Faculty Member | Items Dispatched | Total Value (PKR) | Dispatch Date | Purpose / Event |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| **REQ-2026-01** | Science Department | Fatima Zahra (`STF-1005`) | 4 Marker Boxes, 5 Reams Paper | **Rs. 9,400** | 2026-08-20 | Grade 10-A Science Teaching |
| **REQ-2026-02** | Examination Cell | Prof. Tariq Mehmood | 15 Reams Paper, 2 Toner Cartridges | **Rs. 32,000** | 2026-08-22 | Midterm Date Sheet & Papers |
| **REQ-2026-03** | Physical Education / Sports | Subhan Ali (`STF-1007`) | 6 Footballs, 10 Cones | **Rs. 18,500** | 2026-08-24 | Inter-House Sports Gala |
| **REQ-2026-04** | Chemistry Laboratory | Asad Ullah Khan (`STF-1009`)| 10 Borosilicate Beakers | **Rs. 6,500** | 2026-08-26 | Grade 10 Titration Lab Test |

---

## 🎯 Phase 7 Milestone Completed

Phase 7 completes all auxiliary campus support services:
* **Transport fleet, routes, stops, and student seat allocations** (`ROUTE-01`, `BUS-01`) are live with automatic monthly fee additions.
* **Hostel buildings, rooms, and boarder student check-ins** are active.
* **Library book cataloging, barcode circulation, and overdue fine management** are operational.
* **School inventory catalog, stock ledgers, and departmental consumable expense tracking** are active.

👉 **Next Phase:** We proceed directly to **Phase 8: Daily Academic Delivery, LMS & Attendance** (`Phase_08_Daily_Academic_Delivery_LMS_and_Attendance.md`) covering Daily Student Attendance Registers, Student Homework Diary, Lesson Plans, Study Materials, LMS Submissions, and Live Virtual Classes!
