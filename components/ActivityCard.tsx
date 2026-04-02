"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { format } from "date-fns";
import { ActivityInterface } from "@/services/api/activity";

interface ActivityCardProps {
  activity: ActivityInterface;
}

const ActivityCard = ({ activity }: ActivityCardProps) => {
  const [progress, setProgress] = useState(50);

  useEffect(() => {
    if (activity.tasks.length === 0) {
      setProgress(0);
      return;
    }
    const progress =
      (activity.tasks.filter((task) => task.completed).length * 100) /
      activity.tasks.length;

    setProgress(Math.round(progress));
  }, [activity]);

  return (
    <Link
      href={"/ActivityList/1"}
      className="bg-white p-3 sm:p-5 rounded-lg border border-gray-200 hover:shadow-lg transition-all cursor-pointer flex flex-col"
    >
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1 line-clamp-2">
            {activity.name}
          </h3>

          <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 flex items-center gap-1 flex-wrap">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              className="shrink-0"
            >
              <path
                fill="currentColor"
                d="M12 12h5v5h-5zm7-9h-1V1h-2v2H8V1H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2m0 2v2H5V5zM5 19V9h14v10z"
              />
            </svg>
            <span>
              {format(activity.start_date, "dd/MM/yyyy")} -{" "}
              {format(activity.end_date, "dd/MM/yyyy")}
            </span>
          </p>
        </div>

        {/* Status Badges */}
        <div className="flex sm:flex-col gap-1 sm:gap-1 flex-wrap sm:flex-nowrap">
          {activity.status === "pending" && (
            <span className="flex items-center gap-1 px-2 py-1 font-bold rounded-full text-xs bg-yellow-100 text-yellow-600 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-600 shrink-0"></span>
              <span>Chưa bắt đầu</span>
            </span>
          )}

          {activity.status === "in_progress" && (
            <span className="flex items-center gap-1 px-2 py-1 font-bold rounded-full text-xs bg-blue-100 text-blue-600 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
              <span>Đang thực hiện</span>
            </span>
          )}

          {activity.status === "completed" && (
            <span className="flex items-center gap-1 px-2 py-1 font-bold rounded-full text-xs bg-green-100 text-green-600 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 shrink-0"></span>
              <span>Hoàn thành</span>
            </span>
          )}

          {activity.status === "cancelled" && (
            <span className="flex items-center gap-1 px-2 py-1 font-bold rounded-full text-xs bg-red-100 text-red-600 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0"></span>
              <span>Đã hủy</span>
            </span>
          )}

          {format(new Date(), "yyyy-MM-dd") >
            format(activity.end_date, "yyyy-MM-dd") &&
            activity.status !== "completed" && (
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
            )}
        </div>
      </div>

      {/* Category Tags */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-bold flex gap-1 items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
          >
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M.573 4.1a.999.999 0 0 0 0 1.808l1.43.675v3.92c0 .742.241 1.57.944 2.08c.886.64 2.5 1.42 5.06 1.42s4.17-.785 5.06-1.42c.703-.508.944-1.33.944-2.08v-3.92l1-.473v4.39a.5.5 0 0 0 1 0V5a1 1 0 0 0-.572-.904l-5.72-2.7a4 4 0 0 0-3.42 0l-5.72 2.7zm2.43 6.4V7.05l3.29 1.56a4 4 0 0 0 3.42 0l3.29-1.56v3.45c0 .556-.18 1.01-.53 1.26c-.724.523-2.13 1.24-4.47 1.24s-3.75-.712-4.47-1.24c-.349-.252-.529-.709-.529-1.26zm3.72-8.2a2.99 2.99 0 0 1 2.56 0l5.72 2.7l-5.72 2.7a2.99 2.99 0 0 1-2.56 0L1.003 5z"
              clipRule="evenodd"
            />
          </svg>
          <span>{activity.work_type}</span>
        </span>

        <span className="px-2 py-1 bg-orange-100 text-orange-700 flex items-center text-sm rounded-full font-bold gap-1">
          <PeopleOutlinedIcon fontSize="small" />
          <span>{activity.department}</span>
        </span>

        <span className="px-2 py-1 bg-purple-100 text-purple-700 flex items-center text-sm rounded-full font-bold">
          <LocationOnOutlinedIcon fontSize="small" />
          <span>{activity.location}</span>
        </span>
      </div>

      {/* Progress */}
      <div className="mb-3 sm:mb-5">
        <div className="flex justify-between text-xs sm:text-sm mb-1">
          <span className="text-gray-600 font-bold">Tiến độ</span>

          <span className="font-bold text-olive">{progress}%</span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${progress === 100 ? "bg-green-500" : "bg-olive-500"} h-2 rounded-full`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Task Info */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-auto pt-3 border-t border-gray-100">
        <p className="flex items-center gap-1 text-xs sm:text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            className="shrink-0"
          >
            <path
              fill="currentColor"
              d="m10.925 15.125l-1.4-1.4q-.15-.15-.325-.225t-.362-.075t-.375.075t-.338.225q-.3.3-.3.713t.3.712l2.125 2.15q.15.15.325.213t.375.062t.375-.062t.325-.213l4.225-4.225q.3-.3.3-.725t-.3-.725t-.725-.3t-.725.3zM6 22q-.825 0-1.412-.587T4 20V4q0-.825.588-1.412T6 2h7.175q.4 0 .763.15t.637.425l4.85 4.85q.275.275.425.638t.15.762V20q0 .825-.587 1.413T18 22zm7-14V4H6v16h12V9h-4q-.425 0-.712-.288T13 8M6 4v5zv16z"
            />
          </svg>
          <span>{activity.tasks.length} nhiệm vụ</span>
        </p>

        <p className="flex items-center gap-1 text-xs sm:text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            className="shrink-0"
          >
            <path
              fill="currentColor"
              fillRule="evenodd"
              d="M2.5 1.25c-.103 0-.2.04-.27.108a.35.35 0 0 0-.105.248v10.788c0 .09.037.18.106.247a.38.38 0 0 0 .269.109h9c.103 0 .2-.04.27-.109a.35.35 0 0 0 .105-.247V4.968c0-.1-.04-.197-.112-.268L8.354 1.357a.38.38 0 0 0-.263-.107zM1.355.466C1.661.166 2.073 0 2.5 0h5.591c.426 0 .835.167 1.138.465l3.409 3.343c.311.305.487.724.487 1.16v7.426c0 .43-.174.84-.48 1.14S11.927 14 11.5 14h-9c-.427 0-.84-.166-1.145-.466s-.48-.71-.48-1.14V1.606c0-.43.174-.84.48-1.14m5.829 5.921c0-.345.28-.625.625-.625h2.25a.625.625 0 1 1 0 1.25h-2.25a.625.625 0 0 1-.625-.625m.625 3.022a.625.625 0 0 0 0 1.25h2.25a.625.625 0 1 0 0-1.25zM6.367 8.277a.75.75 0 0 1 .165 1.048l-1.396 1.917a.75.75 0 0 1-1.132.094l-.838-.822a.75.75 0 1 1 1.05-1.07l.218.213l.886-1.215a.75.75 0 0 1 1.047-.165m.165-2.661a.75.75 0 1 0-1.212-.883l-.886 1.215l-.217-.213a.75.75 0 1 0-1.05 1.07l.837.822a.75.75 0 0 0 1.132-.094z"
              clipRule="evenodd"
            />
          </svg>
          <span>{activity.document_number}</span>
        </p>
      </div>
    </Link>
  );
};

export default ActivityCard;
