"use client";

import clsx from "clsx";

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-green-100 text-green-700",
  "bg-orange-100 text-orange-700",
  "bg-blue-100 text-blue-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
  "bg-amber-100 text-amber-700",
  "bg-teal-100 text-teal-700",
];

export function MemberAvatar({ name, index }: { name: string; index: number }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span
      className={clsx(
        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
        AVATAR_COLORS[index % AVATAR_COLORS.length],
      )}
    >
      {initials}
    </span>
  );
}

export function MemberProgressBar({ pct }: { pct: number }) {
  const track =
    pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-400" : "bg-red-400";
  const text =
    pct >= 80 ? "text-green-600" : pct >= 50 ? "text-yellow-600" : "text-red-500";
  return (
    <div className="flex items-center gap-2 min-w-25">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={clsx("h-full rounded-full transition-all", track)}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className={clsx("text-xs font-bold w-8 text-right", text)}>{pct}%</span>
    </div>
  );
}

export function MemberStatusBadge({ pct }: { pct: number }) {
  if (pct >= 80)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
        Đạt
      </span>
    );
  if (pct >= 50)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
        Cảnh báo
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
      Không đạt
    </span>
  );
}

export function MemberTableSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-5 py-3 border-b border-gray-50"
        >
          <div className="animate-pulse bg-gray-200 rounded-full w-8 h-8 shrink-0" />
          <div className="animate-pulse bg-gray-200 rounded h-4 flex-1" />
          <div className="animate-pulse bg-gray-200 rounded h-4 w-10" />
          <div className="animate-pulse bg-gray-200 rounded h-4 w-10" />
          <div className="animate-pulse bg-gray-200 rounded h-4 w-10" />
          <div className="animate-pulse bg-gray-200 rounded h-4 w-24" />
          <div className="animate-pulse bg-gray-200 rounded-full h-5 w-16" />
        </div>
      ))}
    </div>
  );
}
