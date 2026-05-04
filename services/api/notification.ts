import { axiosInstance } from "@/lib/axios.config";

export interface DigestTask {
  task_id: number;
  title: string;
  activity_id: number;
  activity_name: string;
  location: string;
  due_date: string;
  status: "pending" | "in_progress";
  is_read: boolean;
}

export interface DigestResponse {
  digest_date: string;
  unread_count: number;
  tasks: DigestTask[];
}

const unwrapDigest = (data: any): DigestResponse => data?.metaData ?? data;

const getTodayDigest = async (): Promise<DigestResponse> => {
  const res = await axiosInstance.get("/api/notifications/digest");
  return unwrapDigest(res.data);
};

const markTaskAsRead = async (taskId: number): Promise<DigestResponse> => {
  const res = await axiosInstance.patch(
    `/api/notifications/digest/task/${taskId}/read`,
  );
  return unwrapDigest(res.data);
};

const markAllAsRead = async (): Promise<DigestResponse> => {
  const res = await axiosInstance.patch("/api/notifications/digest/read");
  return unwrapDigest(res.data);
};

export const notificationService = {
  getTodayDigest,
  markTaskAsRead,
  markAllAsRead,
};
