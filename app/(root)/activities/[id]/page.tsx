"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { useParams } from "next/navigation";

import { activityAPI, TaskInterface } from "@/services/api/activity";
import Information from "@/components/activity_detail/Information";
import TaskCard from "@/components/activity_detail/TaskCard";
import { handleGetDepartment, handleGetWorkType } from "@/utils/activity";
import { useActivity } from "@/context/ActivityContext";

export default function ActivityDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { fetchActivityDetail, activity, loadingDetail } = useActivity();

  useEffect(() => {
    if (id) fetchActivityDetail(id);
  }, [id]);

  if (loadingDetail) {
    return <div className="p-6">Loading...</div>;
  }

  if (!activity.name) {
    return <div className="p-6 text-red-500">Không tìm thấy dữ liệu</div>;
  }

  return (
    <div className="flex bg-gray-50">
      <main className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 sm:py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-2 flex-1 order-2 sm:order-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {activity.name}
            </h1>

            <div className="flex gap-2 mb-1 sm:mb-3 flex-wrap">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-bold flex gap-1 items-center shrink-0">
                <span>{handleGetWorkType(activity.work_type)}</span>
              </span>

              <span className="px-2 py-1 bg-orange-100 text-orange-700 flex items-center text-sm rounded-full font-bold gap-1 shrink-0">
                <PeopleOutlinedIcon fontSize="small" />
                <span>{handleGetDepartment(activity.department)}</span>
              </span>

              <span className="px-2 py-1 bg-purple-100 text-purple-700 flex items-center text-sm rounded-full font-bold shrink-0">
                <LocationOnOutlinedIcon fontSize="small" />
                <span>{activity.location}</span>
              </span>
            </div>
          </div>

          <Link
            href="/activities"
            className="order-1 sm:order-2 w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center sm:justify-start gap-2 text-sm sm:text-base"
          >
            <ArrowBackIcon fontSize="small" />
            <span className="font-bold">Quay lại</span>
          </Link>
        </header>

        <div className="flex flex-col lg:flex-row p-4 sm:p-6 gap-6 sm:gap-10">
          <Information activity={activity} />

          {activity?.tasks?.length > 0 && (
            <div className="w-full lg:flex-1 space-y-4 sm:space-y-6">
              {activity.tasks.map((task: TaskInterface) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
