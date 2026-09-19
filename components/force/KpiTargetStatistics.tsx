"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { toast } from "sonner";
import {
  ExpandMore,
  FlagOutlined,
  CheckCircleOutline,
  ScheduleOutlined,
  ErrorOutlineOutlined,
} from "@mui/icons-material";

import {
  kpiTargetAPI,
  type KpiPeriodStat,
  type KpiProgressStatus,
  type KpiStatisticsLine,
  type KpiStatisticsResponse,
  type KpiStatisticsTeam,
} from "@/services/api/kpi-target";

// ─── Constants ────────────────────────────────────────────────────────────────

type ScopeMode = "year" | "quarter" | "month";

const SCOPE_TABS: { label: string; value: ScopeMode }[] = [
  { label: "Năm", value: "year" },
  { label: "Quý", value: "quarter" },
  { label: "Tháng", value: "month" },
];

const PROGRESS_META: Record<
  KpiProgressStatus,
  { label: string; badge: string; bar: string; text: string }
> = {
  achieved: {
    label: "Hoàn thành",
    badge: "bg-green-100 text-green-700",
    bar: "bg-green-500",
    text: "text-green-600",
  },
  on_track: {
    label: "Đúng tiến độ",
    badge: "bg-emerald-100 text-emerald-700",
    bar: "bg-emerald-500",
    text: "text-emerald-600",
  },
  at_risk: {
    label: "Có nguy cơ",
    badge: "bg-yellow-100 text-yellow-700",
    bar: "bg-yellow-400",
    text: "text-yellow-600",
  },
  behind: {
    label: "Chậm tiến độ",
    badge: "bg-red-100 text-red-700",
    bar: "bg-red-400",
    text: "text-red-500",
  },
  not_started: {
    label: "Chưa tới kỳ",
    badge: "bg-gray-100 text-gray-500",
    bar: "bg-gray-300",
    text: "text-gray-400",
  },
};

const SUMMARY_SKELETONS = ["target", "achieved", "rate", "late"];

const TEAM_SKELETONS = ["first", "second", "third"];

const RANK_STYLES = [
  "bg-yellow-100 text-yellow-700",
  "bg-gray-100 text-gray-600",
  "bg-orange-100 text-orange-700",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const buildYearOptions = () => {
  const current = new Date().getFullYear();

  return Array.from({ length: 5 }, (_, index) => current - 2 + index);
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("vi-VN").format(value);

const formatRate = (value: number) =>
  `${Number.isInteger(value) ? value : value.toFixed(1)}%`;

const buildScopeLabel = (mode: ScopeMode, year: number, periodNo: number) => {
  if (mode === "quarter") return `Quý ${periodNo}/${year}`;

  if (mode === "month") return `Tháng ${periodNo}/${year}`;

  return `Năm ${year}`;
};

// ─── Sub components ───────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={clsx("animate-pulse bg-gray-200 rounded-lg", className)} />
  );
}

function StatusBadge({ status }: { status: KpiProgressStatus }) {
  const meta = PROGRESS_META[status];

  return (
    <span
      className={clsx(
        "px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap",
        meta.badge,
      )}
    >
      {meta.label}
    </span>
  );
}

/**
 * Thanh tiến độ có vạch mốc "cần đạt tới hôm nay" (expected) để thấy ngay
 * tổ đang đi trước hay đi sau kế hoạch.
 */
function ProgressBar({
  achieved,
  target,
  expected,
  status,
}: {
  achieved: number;
  target: number;
  expected: number;
  status: KpiProgressStatus;
}) {
  const percent = target > 0 ? Math.min((achieved / target) * 100, 100) : 0;

  const expectedPercent =
    target > 0 ? Math.min((expected / target) * 100, 100) : 0;

  return (
    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={clsx(
          "h-full rounded-full transition-all",
          PROGRESS_META[status].bar,
        )}
        style={{ width: `${percent}%` }}
      />
      {expectedPercent > 0 && (
        <span
          className="absolute top-0 h-full w-0.5 bg-gray-500/70"
          style={{ left: `${expectedPercent}%` }}
          title={`Cần đạt tới hôm nay: ${formatNumber(Math.round(expected))}`}
        />
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  subText,
  icon: Icon,
  iconBg,
  iconColor,
  valueColor,
}: {
  label: string;
  value: string;
  subText?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <span className={clsx("p-1.5 rounded-lg", iconBg)}>
          <Icon className={clsx("text-base!", iconColor)} />
        </span>
      </div>
      <div>
        <p
          className={clsx(
            "text-2xl font-bold tracking-tight",
            valueColor ?? "text-gray-900",
          )}
        >
          {value}
        </p>
        {subText && (
          <p className="text-[11px] text-gray-400 mt-0.5">{subText}</p>
        )}
      </div>
    </div>
  );
}

/** Dải chỉ tiêu theo quý/tháng của một dòng chỉ tiêu */
function PeriodStrip({
  title,
  periods,
  prefix,
  highlightNo,
}: {
  title: string;
  periods: KpiPeriodStat[];
  prefix: string;
  highlightNo: number | null;
}) {
  const visible = periods.filter(
    (period) => period.target > 0 || period.assigned > 0,
  );

  if (visible.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
        {title}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {visible.map((period) => {
          const reached = period.target > 0 && period.achieved >= period.target;

          return (
            <div
              key={period.periodNo}
              title={`${prefix}${period.periodNo}: đạt ${period.achieved}/${period.target}${
                period.lateCount > 0 ? ` · trễ ${period.lateCount}` : ""
              }`}
              className={clsx(
                "px-2 py-1 rounded-lg border text-[11px] font-medium whitespace-nowrap",
                highlightNo === period.periodNo
                  ? "border-[#6B8E23] bg-[#6B8E23]/10 text-[#4d661a]"
                  : reached
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-gray-200 bg-gray-50 text-gray-600",
              )}
            >
              <span className="text-gray-400">{prefix}</span>
              {period.periodNo}
              <span className="mx-1 text-gray-300">·</span>
              <span className="font-bold">{period.achieved}</span>
              <span className="text-gray-400">/{period.target}</span>
              {period.lateCount > 0 && (
                <span className="ml-1 text-red-500">↑{period.lateCount}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LineRow({
  line,
  scopeMode,
  scopePeriodNo,
}: {
  line: KpiStatisticsLine;
  scopeMode: ScopeMode;
  scopePeriodNo: number | null;
}) {
  return (
    <div className="border border-gray-100 rounded-xl p-3 flex flex-col gap-2.5 bg-gray-50/50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {line.name}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Chỉ tiêu năm: {formatNumber(line.yearTarget)}
            {line.lateCount > 0 && (
              <span className="text-red-500 font-medium">
                {" "}
                · {line.lateCount} hoạt động trễ hạn
              </span>
            )}
          </p>
        </div>
        <StatusBadge status={line.progressStatus} />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <ProgressBar
            achieved={line.achieved}
            target={line.target}
            expected={line.expected}
            status={line.progressStatus}
          />
        </div>
        <span className="text-xs font-bold text-gray-700 whitespace-nowrap">
          {formatNumber(line.achieved)}
          <span className="text-gray-400 font-medium">
            /{formatNumber(line.target)}
          </span>
        </span>
        <span
          className={clsx(
            "text-xs font-bold w-14 text-right shrink-0",
            PROGRESS_META[line.progressStatus].text,
          )}
        >
          {formatRate(line.completionRate)}
        </span>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-500">
        <span>
          Hoạt động:{" "}
          <b className="text-gray-700">{line.activityStats.total}</b>
        </span>
        <span>
          Hoàn thành:{" "}
          <b className="text-green-600">{line.activityStats.completed}</b>
        </span>
        <span>
          Đang làm:{" "}
          <b className="text-blue-600">{line.activityStats.inProgress}</b>
        </span>
        <span>
          Chưa làm:{" "}
          <b className="text-gray-700">{line.activityStats.pending}</b>
        </span>
        <span>
          Quá hạn: <b className="text-red-500">{line.activityStats.overdue}</b>
        </span>
        <span>
          Cần đạt tới nay:{" "}
          <b className="text-gray-700">
            {formatNumber(Math.round(line.expected))}
          </b>
        </span>
      </div>

      {scopeMode === "year" ? (
        <PeriodStrip
          title="Theo quý"
          periods={line.quarters}
          prefix="Q"
          highlightNo={null}
        />
      ) : scopeMode === "quarter" ? (
        <PeriodStrip
          title="Theo tháng"
          periods={line.months}
          prefix="T"
          highlightNo={null}
        />
      ) : (
        <PeriodStrip
          title="Theo tháng"
          periods={line.months}
          prefix="T"
          highlightNo={scopePeriodNo}
        />
      )}
    </div>
  );
}

function TeamCard({
  team,
  scopeMode,
  scopePeriodNo,
}: {
  team: KpiStatisticsTeam;
  scopeMode: ScopeMode;
  scopePeriodNo: number | null;
}) {
  const [expanded, setExpanded] = useState(false);

  const rankStyle = RANK_STYLES[team.rank - 1] ?? "bg-gray-50 text-gray-400";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-gray-50/70 transition-colors cursor-pointer"
      >
        <span
          className={clsx(
            "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0",
            rankStyle,
          )}
        >
          {team.rank}
        </span>

        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-800 truncate">
              {team.teamName}
            </span>
            <StatusBadge status={team.progressStatus} />
            <span className="text-[11px] text-gray-400">
              {team.lineCount} chỉ tiêu
            </span>
            {team.outOfTargetCount > 0 && (
              <span className="text-[11px] text-gray-400">
                · {team.outOfTargetCount} hoạt động ngoài chỉ tiêu
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <ProgressBar
                achieved={team.achieved}
                target={team.target}
                expected={team.expected}
                status={team.progressStatus}
              />
            </div>
            <span className="text-xs font-bold text-gray-700 whitespace-nowrap">
              {formatNumber(team.achieved)}
              <span className="text-gray-400 font-medium">
                /{formatNumber(team.target)}
              </span>
            </span>
            <span
              className={clsx(
                "text-sm font-bold w-14 text-right shrink-0",
                PROGRESS_META[team.progressStatus].text,
              )}
            >
              {formatRate(team.completionRate)}
            </span>
          </div>
        </div>

        <ExpandMore
          className={clsx(
            "text-gray-400 shrink-0 transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 border-t border-gray-100 flex flex-col gap-2.5">
          {team.lines.length === 0 ? (
            <p className="text-xs text-gray-400 py-4 text-center">
              Tổ này chưa có dòng chỉ tiêu nào
            </p>
          ) : (
            team.lines.map((line) => (
              <LineRow
                key={line.id}
                line={line}
                scopeMode={scopeMode}
                scopePeriodNo={scopePeriodNo}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function KpiTargetStatistics() {
  const yearOptions = useMemo(buildYearOptions, []);

  const now = useMemo(() => new Date(), []);

  const [scopeMode, setScopeMode] = useState<ScopeMode>("year");
  const [year, setYear] = useState(now.getFullYear());
  const [quarter, setQuarter] = useState(Math.floor(now.getMonth() / 3) + 1);
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [data, setData] = useState<KpiStatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const fetchStatistics = async () => {
      setLoading(true);

      try {
        const result = await kpiTargetAPI.getKpiTargetStatistics({
          year,
          ...(scopeMode === "quarter" ? { quarter } : {}),
          ...(scopeMode === "month" ? { month } : {}),
        });

        if (!ignore) setData(result);
      } catch (error) {
        if (!ignore) {
          toast.error("Không thể tải thống kê chỉ tiêu KPI của các tổ.");
          console.error(error);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchStatistics();

    return () => {
      ignore = true;
    };
  }, [scopeMode, year, quarter, month]);

  const summary = data?.summary;

  const scopePeriodNo =
    scopeMode === "quarter" ? quarter : scopeMode === "month" ? month : null;

  const selectClass =
    "h-8 px-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6B8E23]/30";

  return (
    <section id="kpi-target-statistics" className="flex flex-col gap-4">
      {/* ── Header + filter ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
            <span className="w-1 h-4 bg-[#6B8E23] rounded-full inline-block" />
            Chỉ tiêu KPI của các tổ
          </h2>
          <p className="text-xs text-gray-400 mt-1 ml-3">
            Tính trên hoạt động đã hoàn thành ·{" "}
            {buildScopeLabel(scopeMode, year, scopePeriodNo ?? 0)}
            {data?.scope.from && data?.scope.to && (
              <span className="text-gray-300">
                {" "}
                ({data.scope.from} → {data.scope.to})
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            {SCOPE_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setScopeMode(tab.value)}
                className={clsx(
                  "px-3 py-1 text-sm font-medium rounded-md transition-colors cursor-pointer",
                  scopeMode === tab.value
                    ? "bg-[#6B8E23] text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <select
            value={year}
            onChange={(event) => setYear(Number(event.target.value))}
            className={selectClass}
          >
            {yearOptions.map((option) => (
              <option key={option} value={option}>
                Năm {option}
              </option>
            ))}
          </select>

          {scopeMode === "quarter" && (
            <select
              value={quarter}
              onChange={(event) => setQuarter(Number(event.target.value))}
              className={selectClass}
            >
              {[1, 2, 3, 4].map((option) => (
                <option key={option} value={option}>
                  Quý {option}
                </option>
              ))}
            </select>
          )}

          {scopeMode === "month" && (
            <select
              value={month}
              onChange={(event) => setMonth(Number(event.target.value))}
              className={selectClass}
            >
              {Array.from({ length: 12 }, (_, index) => index + 1).map(
                (option) => (
                  <option key={option} value={option}>
                    Tháng {option}
                  </option>
                ),
              )}
            </select>
          )}
        </div>
      </div>

      {/* ── Summary cards ── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {SUMMARY_SKELETONS.map((key) => (
            <Skeleton key={key} className="h-24" />
          ))}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard
            label="Chỉ tiêu kỳ này"
            value={formatNumber(summary.target)}
            subText={`${summary.teamCount} tổ · ${summary.lineCount} dòng chỉ tiêu`}
            icon={FlagOutlined}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
          />
          <SummaryCard
            label="Đã đạt"
            value={formatNumber(summary.achieved)}
            subText={`Còn thiếu ${formatNumber(summary.remaining)}`}
            icon={CheckCircleOutline}
            iconBg="bg-green-50"
            iconColor="text-green-600"
            valueColor="text-green-600"
          />
          <SummaryCard
            label="Tỷ lệ hoàn thành"
            value={formatRate(summary.completionRate)}
            subText={`Cần đạt tới nay: ${formatNumber(
              Math.round(summary.expected),
            )}`}
            icon={ScheduleOutlined}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            valueColor={
              summary.achieved >= summary.expected
                ? "text-green-600"
                : "text-red-500"
            }
          />
          <SummaryCard
            label="Hoạt động trễ hạn"
            value={formatNumber(summary.lateCount)}
            subText={`${summary.activityStats.overdue} đang quá hạn · ${summary.outOfTargetCount} ngoài chỉ tiêu`}
            icon={ErrorOutlineOutlined}
            iconBg="bg-red-50"
            iconColor="text-red-500"
            valueColor={
              summary.lateCount > 0 ? "text-red-500" : "text-gray-900"
            }
          />
        </div>
      ) : null}

      {/* ── Team list ── */}
      {loading ? (
        <div className="flex flex-col gap-2.5">
          {TEAM_SKELETONS.map((key) => (
            <Skeleton key={key} className="h-20" />
          ))}
        </div>
      ) : !data || data.teams.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-12 text-center">
          <p className="text-sm text-gray-400">
            Chưa có bộ chỉ tiêu nào áp dụng cho{" "}
            {buildScopeLabel(scopeMode, year, scopePeriodNo ?? 0).toLowerCase()}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {data.teams.map((team) => (
            <TeamCard
              key={team.targetId}
              team={team}
              scopeMode={scopeMode}
              scopePeriodNo={scopePeriodNo}
            />
          ))}
        </div>
      )}
    </section>
  );
}
