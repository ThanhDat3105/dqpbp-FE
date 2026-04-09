"use client";

import { useCallback, useEffect, useState } from "react";
import ActivityCard from "@/components/ActivityCard";
import AddIcon from "@mui/icons-material/Add";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { formatMonth } from "@/utils/formatDate";
import Link from "next/link";
import { activityAPI, ActivityInterface } from "@/services/api/activity";
import MultiCheckbox from "@/components/MultiCheckbox";
import useDebounce from "@/hooks/useDebounce";
import Loading from "../../../components/Loaing";

export default function ActivityListPage() {
  const [activities, setActivities] = useState<ActivityInterface[]>([]);
  const [dataFiltered, setDataFiltered] = useState<ActivityInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selected, setSelected] = useState<string[]>([
    "pending",
    "in_progress",
  ]);

  const debouncedCurrentDate = useDebounce(currentDate, 300);

  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const handleGetActivities = useCallback(async () => {
    setLoading(true);
    try {
      const activities = await activityAPI.getActivities({
        month: debouncedCurrentDate.getMonth() + 1,
        year: debouncedCurrentDate.getFullYear(),
      });
      setDataFiltered(activities.results);
      setActivities(activities.results);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedCurrentDate]);

  useEffect(() => {
    handleGetActivities();
  }, [handleGetActivities]);

  useEffect(() => {
    const filtered = activities.filter((activity) => {
      const matchStatus = selected.includes(activity.status);

      return matchStatus;
    });

    setDataFiltered(filtered);
  }, [selected, activities]);

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* Content */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* LEFT */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Danh sách Kế hoạch
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý và theo dõi các kế hoạch hoạt động
            </p>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">
            {/* Notification */}
            <div className="relative cursor-pointer">
              <span className="material-symbols-outlined text-gray-600 text-2xl">
                🔔
              </span>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            </div>

            {/* Button create */}
            <Link
              href={"/create-activity"}
              className="flex items-center gap-2 px-4 py-2 bg-[#6B8E23] cursor-pointer text-white rounded-lg shadow hover:opacity-90 transition"
            >
              <span className="material-symbols-outlined text-sm">
                <AddIcon />
              </span>
              <span className="font-bold text-sm">Tạo kế hoạch</span>
            </Link>

            {/* Date navigation */}
            <div className="flex items-center gap-2 ml-2">
              <button
                className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={handlePrevMonth}
              >
                <span className="material-symbols-outlined text-gray-600">
                  <ArrowLeftIcon />
                </span>
              </button>

              <span className="text-sm font-medium text-gray-700">
                {formatMonth(currentDate)}
              </span>

              <button
                className="p-2 rounded-md hover:bg-gray-100 cursor-pointer"
                onClick={handleNextMonth}
              >
                <span className="material-symbols-outlined text-gray-600">
                  <ArrowRightIcon />
                </span>
              </button>

              <button
                onClick={() => setCurrentDate(new Date())}
                className="ml-2 px-3 py-2 bg-[#6B8E23] text-white text-sm rounded-md hover:opacity-90 font-bold cursor-pointer"
              >
                Tháng này
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6 flex-1 flex flex-col">
        {/* Filter */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-700">
              Lọc theo trạng thái:
            </span>

            <MultiCheckbox setSelected={setSelected} selected={selected} />
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loading />
          </div>
        ) : dataFiltered.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Không có kế hoạch nào trong tháng này.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {dataFiltered.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
