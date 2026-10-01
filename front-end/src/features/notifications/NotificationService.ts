import axiosInstance from "../../utils/axiosConfig";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export const getMyNotifications = async (): Promise<Notification[]> => {
  const response = await axiosInstance.get("/Notification/my-notifications");
  return response.data;
};

export const getUnreadCount = async (): Promise<number> => {
  const response = await axiosInstance.get("/Notification/unread-count");
  return response.data.count;
};

export const markAsRead = async (id: string): Promise<void> => {
  await axiosInstance.put(`/Notification/mark-read/${id}`);
};

export const markAllAsRead = async (): Promise<void> => {
  await axiosInstance.put("/Notification/mark-all-read");
};
