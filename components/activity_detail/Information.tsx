"use client";

import { ActivityInterface } from "@/service/API/activity.api";
import { format } from "date-fns";
import { useEffect, useState } from "react";

export default function Information({
  activity,
}: {
  activity: ActivityInterface;
}) {
  const [progress, setProgress] = useState<number>(50);

  useEffect(() => {
    const progress =
      (activity.tasks.filter((task) => task.completed).length * 100) /
      activity.tasks.length;

    setProgress(Math.round(progress));
  }, [activity]);

  return (
    <div className="flex-1 relative">
      <div className="bg-white rounded-lg border shadow border-gray-200 p-6 sticky top-20">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Thông tin chi tiết
        </h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Loại công việc</p>
            <p className="font-medium text-gray-900">{activity.work_type}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Nhóm công việc</p>
            <p className="font-medium text-gray-900">{activity.work_group}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Tổ phụ trách</p>
            <p className="font-medium text-gray-900">{activity.department}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Số công văn</p>
            <p className="font-medium text-gray-900">
              {activity.document_number}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Ngày bắt đầu</p>
            <p className="font-medium text-gray-900">
              {format(activity.start_date, "yyyy-MM-dd")}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Ngày kết thúc</p>
            <p className="font-medium text-gray-900">
              {format(activity.end_date, "yyyy-MM-dd")}
            </p>
          </div>

          <div className="col-span-2">
            <p className="text-sm text-gray-500 mb-1">Địa điểm</p>
            <p className="font-medium text-gray-900">{activity.location}</p>
          </div>

          <div className="border-t col-span-2 border-gray-200"></div>

          <div className="space-y-2 col-span-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-gray-600 font-bold">Tiến độ thực hiện</span>

              <span className="font-bold text-olive">{progress}%</span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`${progress === 100 ? "bg-green-500" : "bg-olive-500"} h-2 rounded-full`}
                style={{ width: `${progress}%` }}
              />
            </div>

            <p>
              {activity.tasks.filter((task) => task.completed).length} /{" "}
              {activity.tasks.length} Nhiệm vụ đã hoàn thành
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
