import { axiosInstance } from "@/lib/axios.config";

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
