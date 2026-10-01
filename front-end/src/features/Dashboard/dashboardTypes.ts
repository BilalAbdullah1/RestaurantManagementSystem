// ─── Dashboard API Types ────────────────────────────────────────────────────

export interface GenderRatioDto {
  gender: string;
  count: number;
}

export interface MonthlyFeeDto {
  month: string;
  collected: number;
  target: number;
}

export interface ClassEnrollmentDto {
  className: string;
  studentCount: number;
}  

export interface ClassFeePendingDto {
  className: string;
  totalStudents: number;
  paidCount: number;
  pendingCount: number;
  paidPct: number;
}

export interface RecentActivityDto {
  type: "student" | "fee" | "attendance" | "exam" | "payroll" | string;
  message: string;
  timeAgo: string;
}

export interface UpcomingExamDto {
  examTitle: string;
  className: string;
  examDate: string;
  daysLeft: string;
}

export interface DashboardStatsDto {
  // KPI Cards
  totalStudents: number;
  totalActiveStaff: number;
  totalClasses: number;
  totalTransportRoutes: number;
  totalHostelRooms: number;
  examsThisMonth: number;

  // Today's Student Attendance
  studentsPresentToday: number;
  studentsLateToday: number;
  studentsAbsentToday: number;
  studentAttendancePctToday: number;

  // Staff Attendance
  staffPresentToday: number;
  staffAbsentToday: number;
  staffAttendancePctToday: number;

  // Fee Collection
  feeCollectedThisMonth: number;
  feePendingThisMonth: number;
  feeTargetThisMonth: number;
  feeCollectionPct: number;

  // Charts & Lists
  monthlyFeeTrend: MonthlyFeeDto[];
  studentsPerClass: ClassEnrollmentDto[];
  feePendingPerClass: ClassFeePendingDto[];
  recentActivities: RecentActivityDto[];
  upcomingExams: UpcomingExamDto[];
  studentGenderRatio: GenderRatioDto[];
}
