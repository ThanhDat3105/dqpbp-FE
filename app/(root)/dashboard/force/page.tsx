"use client";

import { useEffect, useState, useRef } from "react";
import AppPagination from "@/components/ui/AppPagination";
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

import type { KpiPeriod } from "@/components/kpi/KpiPageLayout";
import DialogDetailKPI from "@/components/force/DialogDetailKPI";
import Link from "next/link";

// ─── Constants ────────────────────────────────────────────────────────────────

const LIMIT = 10;

export const ROLE_LABELS: Record<string, string> = {
  TO_TRUONG: "Tổ trưởng",
  DQTT: "Thành viên",
  DQCD: "Dân quân CĐ",
  CHI_HUY: "Chỉ huy",
};

export const STATUS_LABELS: Record<string, string> = {
  on_duty: "Đang trực",
  on_leave: "Nghỉ phép",
  training: "Huấn luyện",
  other: "Khác",
};

export const STATUS_COLORS: Record<string, string> = {
  on_duty: "#4caf50",
  training: "#9e9e9e",
  on_leave: "#ff9800",
  other: "#424242",
};

export const STATUS_DOT: Record<string, string> = {
  on_duty: "bg-green-500",
  on_leave: "bg-orange-500",
  training: "bg-gray-400",
  other: "bg-gray-700",
};

const BAR_COLOR = "#6B8E23";
const ALLOWED_ROLES = ["CHI_HUY", "TO_TRUONG", "ADMIN"];

// ─── KPI Department types ─────────────────────────────────────────────────────

interface KpiDeptGroup {
  department_id: number | null;
  department_code: string | null;
  department_name: string;
  total: number;
  exceeded: number;
  achieved: number;
  warning: number;
  failed: number;
  in_progress: number;
}

// ─── KPI Dept Card (Pie Chart) ────────────────────────────────────────────────

const PIE_SEGMENTS: {
  key: keyof KpiDeptGroup;
  label: string;
  color: string;
}[] = [
  { key: "exceeded", label: "Vượt", color: "#16a34a" },
  { key: "achieved", label: "Đạt", color: "#4ade80" },
  { key: "warning", label: "Cảnh báo", color: "#fbbf24" },
  { key: "failed", label: "Không đạt", color: "#f87171" },
  { key: "in_progress", label: "Đang thực hiện", color: "#93c5fd" },
];

function KpiDeptCard({ dept }: { dept: KpiDeptGroup }) {
  const achieved = (dept.exceeded || 0) + (dept.achieved || 0);
  const percent =
    dept.total > 0 ? Math.round((achieved / dept.total) * 100) : 0;
  const dotColor =
    percent >= 100
      ? "bg-green-500"
      : percent >= 50
        ? "bg-yellow-400"
        : "bg-gray-300";

  const pieData = PIE_SEGMENTS.map((s) => ({
    name: s.label,
    value: (dept[s.key] as number) ?? 0,
    color: s.color,
  })).filter((d) => d.value > 0);

  const isEmpty = pieData.length === 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-2 min-w-0">
      {/* Header */}
      <div className="flex items-start justify-between gap-1">
        <p className="text-sm font-semibold text-gray-800 leading-snug mt-1 line-clamp-2 flex-1 min-w-0">
          {dept.department_name}
        </p>
        <span
          className={clsx("w-2.5 h-2.5 rounded-full shrink-0 mt-1.5", dotColor)}
        />
      </div>

      {/* Pie chart */}
      <div className="flex justify-center">
        <PieChart width={110} height={110}>
          <Pie
            data={
              isEmpty
                ? [{ name: "Trống", value: 1, color: "#e5e7eb" }]
                : pieData
            }
            cx={55}
            cy={55}
            innerRadius={30}
            outerRadius={50}
            dataKey="value"
            strokeWidth={1}
            stroke="#fff"
          >
            {(isEmpty ? [{ color: "#e5e7eb" }] : pieData).map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, name) => [`${value}`, name]}
            contentStyle={{ borderRadius: 8, fontSize: 11, fontWeight: 700 }}
          />
        </PieChart>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-1">
        {PIE_SEGMENTS.map(({ key, label, color }) => {
          const val = (dept[key] as number) ?? 0;
          return (
            <div key={key} className="flex items-center gap-1.5 text-xs">
              <span
                className="w-2 h-2 rounded-sm shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="font-semibold text-gray-700 w-3 text-right shrink-0">
                {val}
              </span>
              <span className="text-gray-400 truncate">{label}</span>
            </div>
          );
        })}
      </div>

      {/* Completion % */}
      <div className="text-xs text-gray-500 font-medium border-t border-gray-100 pt-2">
        Hoàn thành:{" "}
        <span
          className={clsx(
            "font-bold",
            percent >= 80
              ? "text-green-600"
              : percent >= 50
                ? "text-yellow-600"
                : "text-red-500",
          )}
        >
          {percent}%
        </span>
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Overview {
  total_users: number;
  total_departments: number;
  total_dqtt: number;
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
export interface PersonnelItem {
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
          <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-40">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
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

export function formatShift(iso: string | null): string {
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

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [byDept, setByDept] = useState<DeptItem[]>([]);
  const [personnelList, setPersonnelList] = useState<PersonnelItem[]>([]);
  const [kpiDepts, setKpiDepts] = useState<KpiDeptGroup[]>([]);
  const [loading, setLoading] = useState(true);
    const mainRef = useRef<HTMLDivElement>(null);

  const [selectedPerson, setSelectedPerson] = useState<PersonnelItem | null>(
    null,
  );

  useEffect(() => {
    mainRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [page]);

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
        const [ovRes, deptRes, listRes, kpiDeptRes] = await Promise.all([
          axiosInstance.get("/api/personnel/overview"),
          axiosInstance.get("/api/personnel/by-department"),
          axiosInstance.get("/api/personnel/list", {
            params: { status: "on_duty", page, limit: LIMIT, role: "DQTT" },
          }),
          axiosInstance.get("/api/kpi/departments", {
            params: { period: "month" },
          }),
        ]);

        setOverview(ovRes.data.metaData);
        setByDept(deptRes.data.metaData.data ?? []);
        setPersonnelList(listRes.data.metaData.data ?? []);
        setTotal(listRes.data.metaData.pagination.total ?? 0);
        setKpiDepts(kpiDeptRes.data.metaData?.departments ?? []);
      } catch (err) {
        toast.error("Không thể tải dữ liệu nhân sự. Vui lòng thử lại.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [user, isLoadingFetchUser, page]);

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
          value: String(overview.total_dqtt),
          badge: `+${overview.total_dqtt} người`,
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
        // {
        //   id: "kpi-readiness",
        //   label: "Sẵn sàng chiến đấu",
        //   value: `${overview.readiness_percent}%`,
        //   badge: "Tốt",
        //   badgeColor: "bg-green-100 text-green-700",
        //   subText: "Tỷ lệ toàn lực lượng",
        //   icon: ShieldOutlined,
        //   iconBg: "bg-green-50",
        //   iconColor: "text-green-600",
        // },
      ]
    : [];

  return (
    <main className="flex-1 flex flex-col gap-6">
      {/* ── Page Header ── */}
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Nhân sự</h1>
        <p className="text-sm text-gray-500 mt-1">
          Thống kê tổng quan tình trạng lực lượng dân quân
        </p>
      </header>

      {/* ── Section 1: KPI Cards ── */}
      <section id="kpi-cards" className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))
          : KPI_CARDS.map((card) => <KpiCard key={card.id} {...card} />)}
      </section>

      {/* ── Section 2: Charts (60/40) ── */}
      <section id="charts-row" className="flex flex-col md:flex-row gap-6">
        {/* Left: Bar Chart */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 w-full">
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
      </section>

      {/* ── Section 3: KPI by Department ── */}
      <section id="kpi-departments">
        <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <span className="w-1 h-4 bg-blue-600 rounded-full inline-block" />
          Tỉ lệ hoàn thành nhiệm vụ của {kpiDepts.length} tổ
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-44" />
            ))}
          </div>
        ) : kpiDepts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-10 text-center text-sm text-gray-400">
            Chưa có dữ liệu KPI theo tổ trong tháng này
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {kpiDepts.map((dept, i) => (
              <KpiDeptCard key={dept.department_id ?? i} dept={dept} />
            ))}
          </div>
        )}
      </section>

      {/* ── Section 4: Personnel Table ── */}
      <section
        id="personnel-table"
        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        ref={mainRef} 
      >
        {/* Table Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-800 text-sm">
              Danh sách nhân sự
            </h2>
          </div>
          <Link
            href="/personnel/dqtt"
            className="text-xs font-semibold text-[#6B8E23] hover:text-[#556b2f] transition-colors whitespace-nowrap"
          >
            Xem tất cả →
          </Link>
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
                    onClick={() => setSelectedPerson(person)}
                    className={clsx(
                      "border-b border-gray-50 transition-colors hover:bg-gray-50/70 cursor-pointer",
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
        {!loading && personnelList.length > 0 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">Tổng {total} nhân sự</span>

            <AppPagination
              page={page}
              limit={LIMIT}
              total={total}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </section>

      {/* ── KPI Detail Dialog ── */}
      <DialogDetailKPI
        selectedPerson={selectedPerson}
        setSelectedPerson={setSelectedPerson}
      />
    </main>
  );
}
