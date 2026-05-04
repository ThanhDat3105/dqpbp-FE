import { axiosInstance } from "@/lib/axios.config";

export interface TaskHistoryItem {
  id: number;
  title: string;
  status: string;
  due_date: string | null;
  completed_at: string | null;
  activity: {
    id: number;
    name: string;
    work_type: string;
  };
}

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeTask = (item: any): TaskHistoryItem => {
  return {
    id: toNumber(item?.id),
    title: String(item?.title ?? ""),
    status: String(item?.status ?? "pending"),
    due_date: item?.due_date ?? null,
    completed_at: item?.completed_at ?? null,
    activity: {
      id: toNumber(item?.activity?.id),
      name: String(item?.activity?.name ?? ""),
      work_type: String(item?.activity?.work_type ?? ""),
    },
  };
};

export async function fetchUserTasks(
  userId: number,
): Promise<TaskHistoryItem[]> {
  const res = await axiosInstance.get(
    `/api/activities-task?assignee=${userId}&limit=10&sort=due_date_desc`,
  );

  return res.data.data.map(normalizeTask);
}
