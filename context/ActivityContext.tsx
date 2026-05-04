"use client";

import { activityAPI, ActivityInterface } from "@/services/api/activity";
import { createContext, useContext, useState, ReactNode, useMemo } from "react";
import { toast } from "sonner";

// ------------------- TYPES -------------------
interface ActivityContextType {
  openUpdateTask: boolean;
  setOpenUpdateTask: (value: boolean) => void;
  fetchActivityDetail: (id: string) => Promise<void>;
  activity: ActivityInterface;
  loadingDetail: boolean;
}

// ------------------- CONTEXT -------------------
const ActivityContext = createContext<ActivityContextType>({
  openUpdateTask: false,
  setOpenUpdateTask: () => {},
  fetchActivityDetail: () => Promise.resolve(),
  activity: {
    id: "",
    name: "",
    work_type: "",
    department: "",
    start_date: new Date(),
    end_date: new Date(),
    location: "",
    document_number: "",
    status: "",
    attached_files: [],
    created_by: "",
    created_at: new Date(),
    updated_at: new Date(),
    tasks: [],
    completed_at: new Date(),
  },
  loadingDetail: false,
});

interface ActivityProviderProps {
  children: ReactNode;
}

// ------------------- PROVIDER -------------------
export function ActivityProvider({ children }: ActivityProviderProps) {
  const [openUpdateTask, setOpenUpdateTask] = useState(false);
  const [activity, setActivity] = useState<ActivityInterface>({
    id: "",
    name: "",
    work_type: "",
    department: "",
    start_date: new Date(),
    end_date: new Date(),
    location: "",
    document_number: "",
    status: "",
    attached_files: [],
    created_by: "",
    created_at: new Date(),
    updated_at: new Date(),
    tasks: [],
    completed_at: new Date(),
  });
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchActivityDetail = async (id: string) => {
    try {
      setLoadingDetail(true);
      const res = await activityAPI.getActivityDetail(id);
      setActivity(res);
    } catch (error: any) {
      toast.error(error.message || "Lỗi khi tải chi tiết hoạt động");
      console.error("Fetch activity error:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ------------------- MEMOIZED CONTEXT VALUE -------------------
  const value = useMemo(
    () => ({
      openUpdateTask,
      activity,
      loadingDetail,
      fetchActivityDetail,
      setOpenUpdateTask,
    }),
    [
      openUpdateTask,
      activity,
      loadingDetail,
      fetchActivityDetail,
      setOpenUpdateTask,
    ],
  );

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
}

// ------------------- HOOKS -------------------
export const useActivity = () => useContext(ActivityContext);

export const useRequireAuth = () => {
  const activity = useActivity();

  return { ...activity };
};
