"use client";

import { useOnlineCount } from "@/hooks/useOnlineCount";

export default function OnlineCount() {
  const count = useOnlineCount();

  if (count === null) return null;

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
      </span>
      {count} đang truy cập
    </span>
  );
}
