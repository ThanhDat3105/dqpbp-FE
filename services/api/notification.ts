import { axiosInstance } from "@/lib/axios.config";

export type NotificationType =
  | "daily_digest"
  | "deadline_warning"
  | "deadline_critical";

export interface NotificationTask {
  task_id: number;
  title: string;
  activity_id: number;
  activity_name: string;
  location: string;
  due_date: string;
  status: "pending" | "in_progress";
}

export interface NotificationMetadata {
  task_id?: number;
  activity_id?: number;
  activity_name?: string;
  due_date?: string;
  location?: string;
  assignee_id?: number;
  assignee_name?: string;
  tasks?: NotificationTask[];
}

export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  body?: string | null;
  metadata: NotificationMetadata;
  is_read: boolean;
  created_at: string;
}

export interface NotificationsResponse {
  data: NotificationItem[];
  unread_count: number;
  total: number;
}

export interface MarkReadResponse {
  message: string;
  data: {
    id: number;
    is_read: boolean;
    updated_at: string;
  };
}

const getNotifications = async (params?: {
  is_read?: boolean;
  limit?: number;
  offset?: number;
}): Promise<NotificationsResponse> => {
  const res = await axiosInstance.get("/api/notifications", { params });
  return res.data;
};

const markNotificationRead = async (
  notificationId: number,
): Promise<MarkReadResponse> => {
  const res = await axiosInstance.patch(
    `/api/notifications/${notificationId}/read`,
  );
  return res.data;
};

export const notificationService = {
  getNotifications,
  markNotificationRead,
};
