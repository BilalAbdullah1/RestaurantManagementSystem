import api from '../../utils/axiosConfig';
import { ParentDashboardSummary, DailyAttendance } from '../parent-portal/ParentPortalService';

export const StudentPortalService = {
  async getMyDashboardSummary(): Promise<ParentDashboardSummary> {
    try {
      const response = await api.get('/StudentPortal/my-dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching student dashboard summary', error);
      throw error;
    }
  },

  async getMyMonthlyAttendance(studentId: string, month: number, year: number): Promise<DailyAttendance[]> {
    try {
      const response = await api.get(`/StudentAttendances/monthly-summary?studentId=${studentId}&month=${month}&year=${year}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly attendance', error);
      return [];
    }
  },

  async payMyChallan(challanId: string, payload?: any): Promise<boolean> {
    try {
      const response = await api.put(`/FeeChallans/${challanId}/pay`, payload);
      return response.status === 200;
    } catch (error) {
      console.error('Error paying challan', error);
      throw error;
    }
  }
};
