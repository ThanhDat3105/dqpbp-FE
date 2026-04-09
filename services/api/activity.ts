import { axiosInstance } from "@/lib/axios.config";

export interface Department {
  value: string;
  label: string;
  teams: {
    id: string;
    name: string;
  }[];
}

export const departments: Department[] = [
  {
    value: "administration_office",
    label: "Tổ Văn thư – Văn phòng",
    teams: [
      { id: "u1", name: "Nguyễn Văn A" },
      { id: "u9", name: "Bùi Văn G" },
      { id: "u2", name: "Trần Thị B" },
      { id: "u3", name: "Lê Văn C" },
    ],
  },
  {
    value: "planning",
    label: "Tổ Tham mưu",
    teams: [{ id: "u2", name: "Trần Thị B" }],
  },
  {
    value: "political_affairs",
    label: "Tổ Chính trị",
    teams: [{ id: "u3", name: "Lê Văn C" }],
  },
  {
    value: "logistics",
    label: "Tổ Hậu cần",
    teams: [{ id: "u4", name: "Phạm Thị D" }],
  },
  {
    value: "mobilization_recruitment",
    label: "Tổ Động viên – Tuyển quân",
    teams: [{ id: "u5", name: "Hoàng Văn E" }],
  },
];

export interface ActivityInterface {
  id: string;
  name: string;
  work_type: string;
  work_group: string;
  department: string;
  start_date: Date;
  end_date: Date;
  location: string;
  document_number: string;
  status: "pending" | "in_progress" | "completed" | "cancelled" | string;
  attached_files: string[];
  created_by: string;
  created_at: Date;
  updated_at: Date;
  tasks: TaskInterface[];
}

export interface CreateActivityInterface {
  name: string;
  work_type: string;
  department: string;
  start_date: string;
  end_date: string;
  location: string;
  document_number: string;
  attached_files: string[];
  tasks: Omit<TaskInterface, "id" | "activity_id">[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TaskInterface {
  id: string;
  activity_id: string;
  title: string;
  team: string;
  assignees: string[];
  due_date: string;
  notes: string;
  report_fields: { name: string; value: string }[];
  accepted_at: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
  status: "pending" | "in_progress" | "completed" | "cancelled" | string;
}

export type TaskStatus = "pending" | "in_progress" | "completed";

const getActivities = async ({
  month,
  year,
}: {
  month: number;
  year: number;
}) => {
  try {
    const res = await axiosInstance.get("/api/activities", {
      params: { month, year },
    });
    return res.data.metaData;
  } catch (error) {
    throw error;
  }
};

const getActivityDetail = async (id: string): Promise<ActivityInterface> => {
  try {
    const res = await axiosInstance.get(`/api/activities/${id}`);

    return res.data.metaData;
  } catch (error) {
    throw error;
  }
};

const updateReportFields = async (
  activity_id: string,
  task_id: string,
  report_fields: { name: string; value: string }[],
) => {
  try {
    const res = await axiosInstance.patch(
      `/api/activities-task/${activity_id}/tasks/${task_id}`,
      { report_fields },
    );

    return res.data.metaData;
  } catch (error) {
    throw error;
  }
};

const updateTaskStatus = async (task_id: string, status: TaskStatus) => {
  try {
    const res = await axiosInstance.put(`/api/activities-task/${task_id}`, {
      status,
    });

    return res.data;
  } catch (error) {
    throw error;
  }
};

const createActivity = async (payload: CreateActivityInterface) => {
  try {
    const res = await axiosInstance.post(`/api/activities`, payload);

    console.log(res)

    return res.data;
  } catch (error) {
    throw error;
  }
};

export const activityAPI = {
  getActivities,
  getActivityDetail,
  updateReportFields,
  updateTaskStatus,
  createActivity,
};
