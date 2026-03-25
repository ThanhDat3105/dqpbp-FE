"use client";

import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { ActivityInterface, TaskInterface } from "@/service/API/activity.api";

export default function TaskCard({
  task,
  activity,
}: {
  task: TaskInterface;
  activity: ActivityInterface;
}) {
  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow p-4 h-fit">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="font-semibold text-gray-800 text-lg">{task.title}</h2>

          {/* Info */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
            <span className="flex items-center gap-1">
              <PeopleOutlinedIcon fontSize="small" />
              {activity.department}
            </span>

            {task?.assignees?.length > 0 && (
              <span className="flex items-center gap-1">
                <PeopleOutlinedIcon fontSize="small" />
                <span>{task.assignees.length} người thực hiện</span>
              </span>
            )}

            <span className="flex items-center gap-1">
              <CalendarTodayIcon fontSize="small" />
              16/02/2026
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-5 text-sm">
          <div className="flex justify-end">
            <span className="flex items-center gap-1 px-2 py-1 font-bold rounded-full text-xs bg-red-100 text-red-600 whitespace-nowrap">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                className="shrink-0"
              >
                <path
                  fill="currentColor"
                  d="M2.725 21q-.275 0-.5-.137t-.35-.363t-.137-.488t.137-.512l9.25-16q.15-.25.388-.375T12 3t.488.125t.387.375l9.25 16q.15.25.138.513t-.138.487t-.35.363t-.5.137zm1.725-2h15.1L12 6zm8.263-1.287Q13 17.425 13 17t-.288-.712T12 16t-.712.288T11 17t.288.713T12 18t.713-.288m0-3Q13 14.425 13 14v-3q0-.425-.288-.712T12 10t-.712.288T11 11v3q0 .425.288.713T12 15t.713-.288M12 12.5"
                />
              </svg>
              <span>Quá hạn</span>
            </span>
          </div>

          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-600 shrink-0"></span>
            <span className="text-yellow-500 font-medium">
              Chờ nhận nhiệm vụ
            </span>
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-gray-200"></div>

      {/* Form */}
      <div>
        <label className="text-sm text-gray-600 font-medium block mb-2">
          Báo cáo:
        </label>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 whitespace-nowrap">
            Diện tích vệ sinh (m²)
          </span>

          <input
            type="text"
            placeholder="Nhập diện tích vệ sinh (m2)"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
