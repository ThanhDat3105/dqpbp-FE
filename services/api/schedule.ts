import { axiosInstance } from "@/lib/axios.config";

export type ShiftType = 'SANG' | 'CHIEU' | 'DEM';

export interface SlotData {
  start: string;  // "07:00"
  end: string;    // "10:00"
}

export interface DaySchedule {
  SANG?: SlotData | null;
  CHIEU?: SlotData | null;
  DEM?: SlotData | null;
}

export interface MemberSchedule {
  user_id: number;
  name: string;
  mobilize_count: number;
  schedule: Record<string, DaySchedule>; // key: 1–7
}

export interface WeekInfo {
  start: string;
  end: string;
  week_number: number;
}

export interface WeeklyResponse {
  week: WeekInfo;
  members: MemberSchedule[];
  total: number;
  last_updated: string;
}

export interface UpsertTemplatePayload {
  user_id: number;
  day_of_week: number;
  shift: ShiftType;
  start_time: string;
  end_time: string;
  note?: string | null;
}

export interface UpdateMobilizePayload {
  user_id: number;
  week_start: string;
  mobilize_count: number;
}

const getWeeklySchedule = async (weekStart: string): Promise<WeeklyResponse> => {
  const res = await axiosInstance.get(`/api/schedule/weekly`, {
    params: { week_start: weekStart },
  });
  // Using assumption that res.data may wrap in a generic format or directly be the response
  // If the backend returns wrapped `metaData`, need to handle. 
  // Let's assume it returns exactly what is requested.
  return res.data.metaData || res.data;
};

const upsertTemplate = async (payload: UpsertTemplatePayload) => {
  const res = await axiosInstance.put(`/api/schedule/template`, payload);
  return res.data;
};

const deleteTemplate = async (
  user_id: number,
  day_of_week: number,
  shift: ShiftType
) => {
  const res = await axiosInstance.delete(`/api/schedule/template`, {
    data: { user_id, day_of_week, shift },
  });
  return res.data;
};

const updateMobilizeCount = async (payload: UpdateMobilizePayload) => {
  const res = await axiosInstance.put(`/api/schedule/mobilize`, payload);
  return res.data;
};

export const scheduleAPI = {
  getWeeklySchedule,
  upsertTemplate,
  deleteTemplate,
  updateMobilizeCount,
};
