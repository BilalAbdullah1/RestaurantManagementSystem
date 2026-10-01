import api from '../../utils/axiosConfig';

export interface MyKid {
  student_id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  class_name: string;
  section_name: string;
  gender: string;
  photo_url: string | null;
}

export interface PendingFee {
  challan_id: string;
  challan_number: string;
  amount: number;
  due_date: string;
  status: string;
}

export interface RecentHomework {
  homework_id: string;
  subject_name: string;
  title: string;
  due_date: string;
  status: string;
}

export interface RecentExam {
  exam_title: string;
  subject_name: string;
  marks_obtained: number;
  total_marks: number;
  grade: string;
}

export interface DailyAttendance {
  date: string;
  status: string;
  remarks?: string;
}

export interface ParentDashboardSummary {
  student_id: string;
  student_name: string;
  attendance_percentage: number;
  total_pending_fees: number;
  pending_fees: PendingFee[];
  paid_fees: PendingFee[];
  recent_homework: RecentHomework[];
  recent_exams: RecentExam[];
}

export const ParentPortalService = {
  async getMyKids(): Promise<MyKid[]> {
    try {
      const response = await api.get('/ParentPortal/my-kids');
      return response.data;
    } catch (error) {
      console.error('Error fetching kids data', error);
      throw error;
    }
  },

  async getDashboardSummary(studentId: string): Promise<ParentDashboardSummary> {
    try {
      const response = await api.get(`/ParentPortal/dashboard/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard summary', error);
      throw error;
    }
  },

  async payChallan(challanId: string, payload?: any): Promise<boolean> {
    try {
      const response = await api.put(`/FeeChallans/${challanId}/pay`, payload);
      return response.status === 200;
    } catch (error) {
      console.error('Error paying challan', error);
      throw error;
    }
  },

  async getMonthlyAttendance(studentId: string, month: number, year: number): Promise<DailyAttendance[]> {
    try {
      const response = await api.get(`/StudentAttendances/monthly-summary?studentId=${studentId}&month=${month}&year=${year}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly attendance', error);
      return [];
    }
  }
};
