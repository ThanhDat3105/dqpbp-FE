"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  PeopleAltOutlined,
  GroupsOutlined,
  WarningAmberRounded,
  ShieldOutlined,
  MoreVert,
} from "@mui/icons-material";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";
import { axiosInstance } from "@/lib/axios.config";

// ─── Constants ────────────────────────────────────────────────────────────────



const ROLE_LABELS: Record<string, string> = {
  TO_TRUONG: "Tổ trưởng",
  DQTT: "Thành viên",
  DQCD: "Dân quân CĐ",
  CHI_HUY: "Chỉ huy",
};

const STATUS_LABELS: Record<string, string> = {
  on_duty: "Đang trực",
  on_leave: "Nghỉ phép",
  training: "Huấn luyện",
  other: "Khác",
};

const STATUS_COLORS: Record<string, string> = {
  on_duty: "#4caf50",
  training: "#9e9e9e",
  on_leave: "#ff9800",
  other: "#424242",
};

const STATUS_DOT: Record<string, string> = {
  on_duty: "bg-green-500",
  on_leave: "bg-orange-500",
  training: "bg-gray-400",
  other: "bg-gray-700",
};

const BAR_COLOR = "#6B8E23";
const ALLOWED_ROLES = ["CHI_HUY", "TO_TRUONG", "ADMIN"];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Overview {
  total_users: number;
  total_departments: number;
  alerts: number;
  readiness_percent: number;
}

interface DeptItem {
  department_id: number;
  department_code: string;
  department_name: string;
  total: number;
}
interface StatusItem {
  status: string;
  count: number;
  percent: number;
}
interface PersonnelItem {
  id: number;
  name: string;
  role: string;
  status: string;
  shift_start_at: string | null;
  department_id: number;
  department_code: string;
  department_name: string;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={clsx("animate-pulse bg-gray-200 rounded-lg", className)} />
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  id: string;
  label: string;
  value: string;
  badge: string;
  badgeColor: string;
  subText?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

function KpiCard({
  id,
  label,
  value,
  badge,
  badgeColor,
  subText,
  icon: Icon,
  iconBg,
  iconColor,
}: KpiCardProps) {
  return (
    <div
      id={id}
      className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <span className={clsx("p-2 rounded-lg", iconBg)}>
          <Icon className={clsx("text-xl", iconColor)} />
        </span>
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900 tracking-tight">
          {value}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <span
            className={clsx(
              "text-xs font-semibold px-2 py-0.5 rounded-full",
              badgeColor,
            )}
          >
            {badge}
          </span>
          {subText && <span className="text-xs text-gray-400">{subText}</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Custom Bar Label ─────────────────────────────────────────────────────────

const BarValueLabel = (props: any) => {
  const { x, y, width, value } = props;
  return (
    <text
      x={x + width / 2}
      y={y - 4}
      fill="#6b7280"
      textAnchor="middle"
      fontSize={11}
      fontWeight={600}
    >
      {value} người
    </text>
  );
};

// ─── Donut Center Text ────────────────────────────────────────────────────────

const DonutCenterLabel = ({
  cx,
  cy,
  total,
}: {
  cx: number;
  cy: number;
  total: number;
}) => (
  <>
    <text
      x={cx}
      y={cy - 8}
      textAnchor="middle"
      fill="#111827"
      fontSize={22}
      fontWeight={700}
    >
      {total}
    </text>
    <text
      x={cx}
      y={cy + 12}
      textAnchor="middle"
      fill="#9ca3af"
      fontSize={11}
      fontWeight={600}
    >
      TỔNG
    </text>
  </>
);

// ─── Action Dropdown ─────────────────────────────────────────────────────────

function ActionMenu({ person }: { person: PersonnelItem }) {
  const [open, setOpen] = useState(false);
  const options = ["Xem hồ sơ", "Đổi trạng thái", "Điều chuyển tổ"];

  return (
    <div className="relative">
      <button
        id={`action-menu-${person.id}`}
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-gray-500"
      >
        <MoreVert fontSize="small" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[160px]">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  console.log(`${opt}:`, person);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Shift Time Formatter ─────────────────────────────────────────────────────

function formatShift(iso: string | null): string {
  if (!iso) return "--";
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  return `${hh}:${mm} ${dd}/${mo}`;
}

// ─── Avatar Initials ──────────────────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const colors = [
    "bg-indigo-100 text-indigo-700",
    "bg-green-100 text-green-700",
    "bg-orange-100 text-orange-700",
    "bg-violet-100 text-violet-700",
    "bg-blue-100 text-blue-700",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <span
      className={clsx(
        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
        color,
      )}
    >
      {initials}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LucLuongDashboardPage() {
  const { user, isLoadingFetchUser } = useAuth();
  const router = useRouter();

  const [overview, setOverview] = useState<Overview | null>(null);
  const [byDept, setByDept] = useState<DeptItem[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<{
    total: number;
    breakdown: StatusItem[];
  } | null>(null);
  const [personnelList, setPersonnelList] = useState<PersonnelItem[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Role guard ──
  useEffect(() => {
    if (isLoadingFetchUser) return;
    if (user && !ALLOWED_ROLES.includes(user.role)) {
      router.replace("/");
    }
  }, [user, isLoadingFetchUser, router]);

  // ── Data fetch ──
  useEffect(() => {
    if (isLoadingFetchUser || !user) return;
    if (!ALLOWED_ROLES.includes(user.role)) return;

    const fetchAll = async () => {
      setLoading(true);
      try {
        const [ovRes, deptRes, statusRes, listRes] = await Promise.all([
          axiosInstance.get("/api/personnel/overview"),
          axiosInstance.get("/api/personnel/by-department"),
          axiosInstance.get("/api/personnel/status-breakdown"),
          axiosInstance.get("/api/personnel/list", {
            params: { status: "on_duty", limit: 10 },
          }),
        ]);

        setOverview(ovRes.data.metaData);
        setByDept(deptRes.data.metaData.data ?? []);
        setStatusBreakdown(statusRes.data.metaData);
        setPersonnelList(listRes.data.metaData.data ?? []);
      } catch (err) {
        toast.error("Không thể tải dữ liệu nhân sự. Vui lòng thử lại.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user, isLoadingFetchUser]);

  // ── Loading / auth guard ──
  if (isLoadingFetchUser) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-500 text-sm">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  if (user && !ALLOWED_ROLES.includes(user.role)) return null;

  const KPI_CARDS: KpiCardProps[] = overview
    ? [
        {
          id: "kpi-total-users",
          label: "Tổng số dân quân",
          value: String(overview.total_users),
          badge: `+${overview.total_users} người`,
          badgeColor: "bg-green-100 text-green-700",
          icon: PeopleAltOutlined,
          iconBg: "bg-indigo-50",
          iconColor: "text-indigo-600",
        },
        {
          id: "kpi-departments",
          label: "Tổng số Tổ",
          value: String(overview.total_departments),
          badge: `${overview.total_departments} tổ`,
          badgeColor: "bg-blue-100 text-blue-700",
          icon: GroupsOutlined,
          iconBg: "bg-blue-50",
          iconColor: "text-blue-600",
        },
        {
          id: "kpi-alerts",
          label: "Cảnh báo",
          value: String(overview.alerts),
          badge: "+1 Mới",
          badgeColor: "bg-red-100 text-red-700",
          subText: "Cần xử lý ngay",
          icon: WarningAmberRounded,
          iconBg: "bg-red-50",
          iconColor: "text-red-500",
        },
        {
          id: "kpi-readiness",
          label: "Sẵn sàng chiến đấu",
          value: `${overview.readiness_percent}%`,
          badge: "Tốt",
          badgeColor: "bg-green-100 text-green-700",
          subText: "Tỷ lệ toàn lực lượng",
          icon: ShieldOutlined,
          iconBg: "bg-green-50",
          iconColor: "text-green-600",
        },
      ]
    : [];

  return (
    <main className="flex-1 flex flex-col gap-6 overflow-auto">
      {/* ── Page Header ── */}
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Nhân sự</h1>
        <p className="text-sm text-gray-500 mt-1">
          Thống kê tổng quan tình trạng lực lượng dân quân
        </p>
      </header>

      {/* ── Section 1: KPI Cards ── */}
      <section id="kpi-cards" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))
          : KPI_CARDS.map((card) => <KpiCard key={card.id} {...card} />)}
      </section>

      {/* ── Section 2: Charts (60/40) ── */}
      <section id="charts-row" className="flex flex-col md:flex-row gap-6">
        {/* Left: Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 md:w-[60%] w-full">
          <h2 className="font-bold text-gray-800 text-sm">
            Phân bổ nhân sự theo Tổ
          </h2>
          <p className="text-xs text-gray-400 mt-0.5 mb-4">
            Tổng số thành viên trong mỗi tổ
          </p>

          {loading ? (
            <Skeleton className="h-52" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={byDept.map((d) => ({
                  name: d.department_name,
                  total: d.total,
                }))}
                margin={{ top: 20, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  formatter={(v) => [`${Number(v)} người`, "Số lượng"]}
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                />
                <Bar
                  dataKey="total"
                  radius={[6, 6, 0, 0]}
                  label={<BarValueLabel />}
                >
                  {byDept.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={idx % 2 === 0 ? BAR_COLOR : "#8fae47"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Right: Donut Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 md:w-[40%] w-full">
          <h2 className="font-bold text-gray-800 text-sm">
            Trạng thái lực lượng
          </h2>
          <p className="text-xs text-gray-400 mt-0.5 mb-2">
            Tỷ lệ sẵn sàng chiến đấu
          </p>

          {loading || !statusBreakdown ? (
            <Skeleton className="h-52" />
          ) : (
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                <PieChart width={180} height={180}>
                  <Pie
                    data={statusBreakdown.breakdown}
                    dataKey="count"
                    nameKey="status"
                    cx={85}
                    cy={85}
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {statusBreakdown.breakdown.map((entry) => (
                      <Cell
                        key={entry.status}
                        fill={STATUS_COLORS[entry.status] ?? "#999"}
                      />
                    ))}
                  </Pie>
                  <DonutCenterLabel
                    cx={85}
                    cy={85}
                    total={statusBreakdown.total}
                  />
                </PieChart>
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                {statusBreakdown.breakdown.map((item) => (
                  <div
                    key={item.status}
                    className="flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: STATUS_COLORS[item.status] ?? "#999",
                        }}
                      />
                      <span className="text-xs text-gray-600 truncate">
                        {STATUS_LABELS[item.status] ?? item.status}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-gray-700 shrink-0">
                      {item.percent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Section 3: Personnel Table ── */}
      <section
        id="personnel-table"
        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      >
        {/* Table Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-800 text-sm">
              Danh sách nhân sự trực ban
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Cập nhật theo thời gian thực
            </p>
          </div>
          <a
            href="#"
            className="text-xs font-semibold text-[#6B8E23] hover:text-[#556b2f] transition-colors whitespace-nowrap"
          >
            Xem tất cả →
          </a>
        </div>

        {loading ? (
          <div className="p-5 flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : personnelList.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            Không có nhân sự nào đang trực
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {[
                    "Họ và tên",
                    "Chức vụ",
                    "Đơn vị",
                    "Trạng thái",
                    "Thời gian vào ca",
                    "Thao tác",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {personnelList.map((person, idx) => (
                  <tr
                    key={person.id}
                    className={clsx(
                      "border-b border-gray-50 transition-colors hover:bg-gray-50/70",
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/40",
                    )}
                  >
                    {/* Name + Avatar */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={person.name} />
                        <span className="font-semibold text-gray-800 text-sm">
                          {person.name}
                        </span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs rounded-full font-semibold">
                        {ROLE_LABELS[person.role] ?? person.role}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="px-5 py-3.5">
                      <span className="text-gray-600 text-xs font-medium">
                        {person.department_name}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span
                        className={clsx(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
                          person.status === "on_duty" &&
                            "bg-green-100 text-green-700",
                          person.status === "on_leave" &&
                            "bg-orange-100 text-orange-700",
                          person.status === "training" &&
                            "bg-gray-100 text-gray-600",
                          person.status === "other" && "bg-gray-800 text-white",
                        )}
                      >
                        <span
                          className={clsx(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            STATUS_DOT[person.status],
                          )}
                        />
                        {STATUS_LABELS[person.status] ?? person.status}
                      </span>
                    </td>

                    {/* Shift start */}
                    <td className="px-5 py-3.5 text-sm text-gray-500 font-medium">
                      {formatShift(person.shift_start_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <ActionMenu person={person} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
