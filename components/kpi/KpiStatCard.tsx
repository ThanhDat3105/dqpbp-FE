"use client";

import { type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface KpiStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "default" | "green" | "blue" | "amber" | "red";
}

const toneStyles: Record<
  NonNullable<KpiStatCardProps["tone"]>,
  { box: string; icon: string }
> = {
  default: {
    box: "bg-slate-100",
    icon: "text-slate-700",
  },
  green: {
    box: "bg-emerald-100",
    icon: "text-emerald-700",
  },
  blue: {
    box: "bg-blue-100",
    icon: "text-blue-700",
  },
  amber: {
    box: "bg-amber-100",
    icon: "text-amber-700",
  },
  red: {
    box: "bg-red-100",
    icon: "text-red-700",
  },
};

export function KpiStatCard({
  title,
  value,
  icon: Icon,
  tone = "default",
}: KpiStatCardProps) {
  const styles = toneStyles[tone];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-500">{title}</p>
        <span className={cn("rounded-md p-1.5", styles.box)}>
          <Icon className={cn("h-4 w-4", styles.icon)} />
        </span>
      </div>
      <p className="text-xl font-semibold leading-none text-slate-900">{value}</p>
    </div>
  );
}
