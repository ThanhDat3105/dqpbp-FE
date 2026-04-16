import { axiosInstance } from "@/lib/axios.config";

export type ShiftType = 'SANG' | 'CHIEU' | 'DEM';

export interface SlotData {
  start: string;
  end: string;
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
  schedule: Record<string, DaySchedule>;
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

export interface RegisterSchedule {
  user_id: number,
  week_start: string,
  schedules: {
    day_of_week: number,
    shift: string,
    start_time: string,
    end_time: string,
  }[]
}

const getWeeklySchedule = async (weekStart: string, user_id: string, unitFilter: string): Promise<WeeklyResponse> => {
  const res = await axiosInstance.get(`/api/schedule/weekly`, {
    params: { week_start: weekStart, user_id, unit_filter: unitFilter },
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

const registerSchedule = async (payload: RegisterSchedule) => {
  const res = await axiosInstance.post(`/api/schedule/register`, payload);
  return res.data;
};

export const scheduleAPI = {
  getWeeklySchedule,
  upsertTemplate,
  deleteTemplate,
  updateMobilizeCount,
  registerSchedule
};
