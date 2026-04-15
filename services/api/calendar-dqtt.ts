import { OfficeColumn, ScheduleRow } from "@/components/schedule/schedule-data";
import { axiosInstance } from "@/lib/axios.config";

const getSchedule = async (
  weekStart: string
) => {
  const res = await axiosInstance.get(`/api/schedules?weekStart=${weekStart}`);

  return res.data
};

const updateSchedule = async (
  officeColumns: OfficeColumn[],
  rows: ScheduleRow[],
) => {
  const res = await axiosInstance.put(`/api/schedules`, {
    officeColumns,
    rows
  });

  return res.data
};

export const calendarDQTTAPI = {
  getSchedule,
  updateSchedule
};