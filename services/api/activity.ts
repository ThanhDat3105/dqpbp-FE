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
    value: "1",
    label: "Tổ 1",
    teams: [
      {
        id: "u1",
        name: "Nguyễn Văn A",
      },
      {
        id: "u9",
        name: "Bùi Văn G",
      },
      {
        id: "u2",
        name: "Trần Thị B",
      },
      {
        id: "u3",
        name: "Lê Văn C",
      },
    ],
  },
  {
    value: "2",
    label: "Tổ 2",
    teams: [
      {
        id: "u2",
        name: "Trần Thị B",
      },
    ],
  },
  {
    value: "3",
    label: "Tổ 3",
    teams: [
      {
        id: "u3",
        name: "Lê Văn C",
      },
    ],
  },
  {
    value: "4",
    label: "Tổ 4",
    teams: [
      {
        id: "u4",
        name: "Phạm Thị D",
      },
    ],
  },
  {
    value: "5",
    label: "Tổ 5",
    teams: [
      {
        id: "u5",
        name: "Hoàng Văn E",
      },
    ],
  },
  {
    value: "6",
    label: "Tổ 6",
    teams: [
      {
        id: "u6",
        name: "Đỗ Thị F",
      },
    ],
  },
  {
    value: "9",
    label: "Tổ 9",
    teams: [
      {
        id: "u9",
        name: "Bùi Văn G",
      },
    ],
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
  work_group: string;
  work_type: string;
  department: string;
  start_date: Date;
  end_date: Date;
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
  dueDate: string;
  notes: string;
  reportFields: { name: string; value: string }[];
  accepted_at: Date | null;
  completed: boolean;
  created_at: Date;
  updated_at: Date;
}

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
    // console.error("Error fetching activity detail:", error);
    throw error;
  }
};

export const activityAPI = {
  getActivities,
  getActivityDetail,
};
