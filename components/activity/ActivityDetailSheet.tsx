"use client";

import { useEffect } from "react";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { TaskInterface } from "@/services/api/activity";
import Information from "@/components/activity_detail/Information";
import TaskCard from "@/components/activity_detail/TaskCard";
import { handleGetDepartment, handleGetWorkType } from "@/utils/activity";
import { useActivity } from "@/context/ActivityContext";

export default function ActivityDetailSheet({
  activityId,
}: {
  activityId: string | number;
}) {
  const { fetchActivityDetail, activity, loadingDetail } = useActivity();

  useEffect(() => {
    if (activityId) fetchActivityDetail(activityId.toString());
  }, [activityId]);

  if (loadingDetail) {
    return <div className="p-6">Đang tải...</div>;
  }

  if (!activity) {
    return <div className="p-6 text-red-500">Không tìm thấy dữ liệu</div>;
  }

  if (String(activity.id) !== String(activityId)) {
    return <div className="p-6">Đang tải...</div>;
  }
  return (
    <div className="flex flex-col">
      <header className="bg-white flex flex-col gap-2 pt-2 pb-4">
        <h1 className="text-xl font-bold text-gray-900 leading-tight">
          {activity.name}
        </h1>
        <div className="flex gap-2 flex-wrap">
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-bold flex gap-1 items-center">
            <span>{handleGetWorkType(activity.work_type)}</span>
          </span>
          <span className="px-2 py-1 bg-orange-100 text-orange-700 flex items-center text-xs rounded-full font-bold gap-1">
            <PeopleOutlinedIcon fontSize="small" />
            <span>{handleGetDepartment(activity.department)}</span>
          </span>
          {activity.location && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 flex items-center text-xs rounded-full font-bold gap-1">
              <LocationOnOutlinedIcon fontSize="small" />
              <span>{activity.location}</span>
            </span>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-6 py-2">
        <Information activity={activity} />

        {activity?.tasks?.length > 0 && (
          <div className="w-full space-y-4">
            {activity.tasks?.map((task: TaskInterface) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
