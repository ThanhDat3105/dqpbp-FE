import { OfficeColumn, ScheduleRow } from "@/components/schedule/schedule-data";
import { axiosInstance } from "@/lib/axios.config";

export interface CreateWeekResponse {
  success: boolean;
  weekStart: string;
  weekEnd: string;
  created: number;
  skipped: number;
}

export interface UpdateDayResponse {
  success: boolean;
  row: ScheduleRow;
}

/** GET /api/schedule?date=YYYY-MM-DD */
const getSchedule = async (date: string) => {
  const res = await axiosInstance.get(`/api/schedules?date=${date}`);
  return res.data;
};

/** POST /api/schedule/week  body: { target } */
const createWeek = async (target: string): Promise<CreateWeekResponse> => {
  const res = await axiosInstance.post(`/api/schedules/week`, { target });
  return res.data;
};

/** PATCH /api/schedule/day/:date  body: Partial<ScheduleRow> */
const updateDay = async (
  date: string,
  payload: Partial<ScheduleRow>
): Promise<UpdateDayResponse> => {
  const res = await axiosInstance.patch(`/api/schedules/day/${date}`, payload);
  return res.data;
};

/** PUT /api/schedules (legacy bulk upsert — kept for compatibility) */
const updateSchedule = async (
  officeColumns: OfficeColumn[],
  rows: ScheduleRow[]
) => {
  const res = await axiosInstance.put(`/api/schedules`, { officeColumns, rows });
  return res.data;
};

export const calendarDQTTAPI = {
  getSchedule,
  createWeek,
  updateDay,
  updateSchedule,
};