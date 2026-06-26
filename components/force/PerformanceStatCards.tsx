"use client";

import clsx from "clsx";
import {
  AssignmentOutlined,
  CheckCircleOutline,
  WarningAmberRounded,
  AccessTimeOutlined,
  HourglassBottomOutlined,
} from "@mui/icons-material";
import type { ActivitySummary } from "@/services/api/kpi-types";

function Skeleton() {
  return <div className="animate-pulse bg-gray-200 rounded-xl h-32" />;
}

interface CardProps {
  label: string;
  value: string;
  subText: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  valueColor?: string;
}

function StatCard({
  label,
  value,
  subText,
  icon: Icon,
  iconBg,
  iconColor,
  valueColor = "text-gray-900",
}: CardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <span className={clsx("p-2 rounded-lg", iconBg)}>
          <Icon className={clsx("text-xl", iconColor)} />
        </span>
      </div>
      <div>
        <p className={clsx("text-3xl font-bold tracking-tight", valueColor)}>
          {value}
        </p>
        <p className="text-xs text-gray-400 mt-1">{subText}</p>
      </div>
    </div>
  );
}

interface PerformanceStatCardsProps {
  summary: ActivitySummary | null;
  loading: boolean;
  period: string;
}

export function PerformanceStatCards({
  summary,
  loading,
  period,
}: PerformanceStatCardsProps) {
  const periodLabel =
    period === "week"
      ? "tuần"
      : period === "month"
        ? "tháng"
        : period === "quarter"
          ? "quý"
          : "năm";

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} />
        ))}
      </div>
    );
  }

  const cards: CardProps[] = [
    {
      label: `Tổng nhiệm vụ (${periodLabel})`,
      value: String(summary?.total ?? 0),
      subText: "Tổng số nhiệm vụ được tạo",
      icon: AssignmentOutlined,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-500",
    },
    {
      label: "Tỉ lệ hoàn thành",
      value: `${summary?.completion_rate ?? 0}%`,
      subText: `${summary?.completed ?? 0} / ${summary?.total ?? 0} nhiệm vụ`,
      icon: CheckCircleOutline,
      iconBg: "bg-green-50",
      iconColor: "text-green-500",
      valueColor:
        (summary?.completion_rate ?? 0) >= 80
          ? "text-green-600"
          : (summary?.completion_rate ?? 0) >= 50
            ? "text-yellow-600"
            : "text-red-500",
    },
    {
      label: "Quá hạn",
      value: String(summary?.overdue ?? 0),
      subText: "Cần xử lý",
      icon: WarningAmberRounded,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      valueColor:
        (summary?.overdue ?? 0) > 0 ? "text-red-600" : "text-gray-900",
    },
    {
      label: "Sắp hết hạn",
      value: String(summary?.warning ?? 0),
      subText: "≤ 3 ngày tới",
      icon: HourglassBottomOutlined,
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-500",
      valueColor:
        (summary?.warning ?? 0) > 0 ? "text-yellow-600" : "text-gray-900",
    },
    {
      label: "Đúng hạn",
      value: `${summary?.on_time_rate ?? 0}%`,
      subText: "Trong số đã hoàn thành",
      icon: AccessTimeOutlined,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      valueColor:
        (summary?.on_time_rate ?? 0) >= 80
          ? "text-blue-600"
          : (summary?.on_time_rate ?? 0) >= 50
            ? "text-yellow-600"
            : "text-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
