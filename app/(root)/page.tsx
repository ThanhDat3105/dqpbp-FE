import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import FolderIcon from "@mui/icons-material/Folder";
import GroupIcon from "@mui/icons-material/Group";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AssignmentIcon from "@mui/icons-material/Assignment";
export default function HomePage() {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* HERO */}
      <header className="bg-linear-to-br from-[#556B2F] via-[#6B8E23] to-[#8B4513] text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-6">
            <Image
              src="/img/logo-dqtv.png"
              alt="logo"
              className="size-24 object-contain"
              width={40}
              height={40}
              unoptimized
            />

            <div>
              <h1 className="text-4xl font-black">Hệ thống Quản lý Dân quân</h1>
              <p className="text-lg mt-2 text-white/90">
                Ban CHQS phường Bình Phú
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {["11 Trang", "5 Module", "100% Tiếng Việt", "Responsive"].map(
              (item, i) => (
                <div
                  key={i}
                  className="bg-white/10 backdrop-blur rounded-xl p-4 text-center"
                >
                  <p className="font-bold">{item}</p>
                </div>
              ),
            )}
          </div>
        </div>
      </header>

      {/* QUICK ACTION */}
      <div className="max-w-7xl mx-auto px-6 -mt-6">
        <div className="bg-white p-4 rounded-xl shadow flex gap-3 justify-center flex-wrap item-center">
          <Link href="/login" className="px-4 py-2 bg-gray-100 rounded-lg">
            Đăng nhập
          </Link>

          <Link href="/activities" className="px-4 py-2 bg-gray-100 rounded-lg">
            Danh sách kế hoạch
          </Link>

          <Link href="/lich" className="px-4 py-2 bg-gray-100 rounded-lg">
            Lịch nhiệm vụ
          </Link>
        </div>
      </div>

      {/* MODULE */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-6">Module Chính</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Nhân sự */}
          <Link
            href="/nhansu"
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <div className="flex items-center gap-3">
              <GroupIcon className="text-olive" />
              <span className="font-semibold text-gray-800">Nhân sự</span>
            </div>
          </Link>

          {/* Kho thiết bị */}
          <Link
            href="/inventory"
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <div className="flex items-center gap-3">
              <PrecisionManufacturingIcon className="text-olive" />
              <span className="font-semibold text-gray-800">Kho thiết bị</span>
            </div>
          </Link>

          {/* Tài liệu */}
          <Link
            href="/documents"
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <div className="flex items-center gap-3">
              <FolderIcon className="text-olive" />
              <span className="font-semibold text-gray-800">Tài liệu</span>
            </div>
          </Link>

          {/* Lịch */}
          <Link
            href="/lich"
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <div className="flex items-center gap-3">
              <ScheduleIcon className="text-olive" />
              <span className="font-semibold text-gray-800">Lịch trực</span>
            </div>
          </Link>
        </div>

        {/* Activity */}
        <h2 className="text-2xl font-bold mt-12 mb-6">Quản lý hoạt động</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Danh sách kế hoạch */}
          <Link
            href="/activities"
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <div className="flex items-center gap-3">
              <AssignmentIcon className="text-olive" />
              <span className="font-semibold text-gray-800">
                Danh sách kế hoạch
              </span>
            </div>
          </Link>

          {/* Lịch */}
          <Link
            href="/calendar"
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <div className="flex items-center gap-3">
              <CalendarMonthIcon className="text-olive" />
              <span className="font-semibold text-gray-800">Lịch</span>
            </div>
          </Link>

          {/* Tạo kế hoạch */}
          <Link
            href="/create-activity"
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <div className="flex items-center gap-3">
              <AddCircleIcon className="text-olive" />
              <span className="font-semibold text-gray-800">Tạo kế hoạch</span>
            </div>
          </Link>

          {/* Chi tiết */}
          <Link
            href="/activity/1"
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <div className="flex items-center gap-3">
              <VisibilityIcon className="text-olive" />
              <span className="font-semibold text-gray-800">Chi tiết</span>
            </div>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
