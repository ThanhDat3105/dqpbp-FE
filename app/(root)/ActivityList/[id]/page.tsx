import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import { activityAPI, TaskInterface } from "@/service/API/activity.api";
import Information from "@/components/activity_detail/Information";
import TaskCard from "@/components/activity_detail/TaskCard";

async function fetchActivityDetail(id: string) {
  return await activityAPI.getActivityDetail(id);
}

export default async function ActivityDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  const activity = await fetchActivityDetail(id);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <main className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <div className="flex flex-col gap-2 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {activity.name}
            </h1>

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
          </div>

          <Link
            href="/ActivityList"
            className="px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition:all flex items-center gap-2 text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
          >
            <ArrowBackIcon fontSize="small" />

            <span className="font-bold">Quay lại</span>
          </Link>
        </header>

        {/* Content */}
        <div className="flex flex-col lg:flex-row p-4 sm:p-6 gap-6 sm:gap-10">
          <Information activity={activity} />

          {activity?.tasks?.length > 0 && (
            <div className="w-full lg:flex-1 space-y-4 sm:space-y-6">
              {activity.tasks.map((task: TaskInterface) => (
                <TaskCard key={task.id} task={task} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
