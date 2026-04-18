"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import clsx from "clsx";
import type { MenuItem } from "@/lib/sidebar.config";
import { useState } from "react";
import { toast } from "sonner";

interface SidebarItemProps {
  item: MenuItem;
  collapsed?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  depth?: number;
}

export default function SidebarItem({
  item,
  collapsed = false,
  isOpen = false,
  onToggle,
  depth = 0,
}: SidebarItemProps) {
  const pathname = usePathname();
  const Icon = item.icon;
  const [showTooltip, setShowTooltip] = useState(false);

  // 🔥 Check active
  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const itemIsActive =
    isActive(item.href) ||
    (item.children?.some((child) => isActive(child.href)) ?? false);

  // 🔥 Check có phải activities không
  const isActivities =
    item.id === "activities" ||
    item.href?.includes("/activities") ||
    item.href?.includes("/calendar") ||
    item.children?.some(
      (child) =>
        child.href?.includes("/activities") ||
        child.href?.includes("/calendar"),
    );

  // 🔥 Handle click (main item)
  const handleClick = (e: React.MouseEvent) => {
    // Nếu có children → chỉ toggle
    if (item.children && item.children.length > 0) {
      onToggle?.();
      return;
    }
  };

  // ─── ITEM KHÔNG CÓ CHILD ─────────────────────────
  if (!item.children || item.children.length === 0) {
    return (
      <div className="relative group">
        <Link
          href={item.href || "#"}
          onClick={handleClick}
          className={clsx(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
            "hover:bg-gray-100 active:bg-gray-200",
            itemIsActive
              ? "bg-indigo-50 text-indigo-600 font-medium"
              : "text-gray-700 hover:text-gray-900",
          )}
        >
          <Icon
            className={clsx(
              "shrink-0",
              itemIsActive ? "text-indigo-600" : "text-gray-500",
            )}
            fontSize="small"
          />
          {!collapsed && (
            <span className="text-sm font-medium truncate">{item.label}</span>
          )}
        </Link>

        {collapsed && (
          <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover:block">
            <div className="bg-gray-900 text-white text-xs py-1.5 px-2 rounded shadow-lg whitespace-nowrap">
              {item.label}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── ITEM CÓ CHILD ─────────────────────────
  return (
    <div className="relative group">
      <button
        onClick={onToggle}
        className={clsx(
          "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200",
          "hover:bg-gray-100 active:bg-gray-200",
          itemIsActive
            ? "bg-indigo-50 text-indigo-600 font-medium"
            : "text-gray-700 hover:text-gray-900",
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon
            className={clsx(
              "shrink-0",
              itemIsActive ? "text-indigo-600" : "text-gray-500",
            )}
            fontSize="small"
          />
          {!collapsed && (
            <span className="text-sm font-medium truncate">{item.label}</span>
          )}
        </div>

        {!collapsed && (
          <div className="shrink-0">
            {isOpen ? (
              <ExpandLess fontSize="small" />
            ) : (
              <ExpandMore fontSize="small" />
            )}
          </div>
        )}
      </button>

      {collapsed && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 hidden group-hover:block">
          <div className="bg-gray-900 text-white text-xs py-1.5 px-2 rounded shadow-lg whitespace-nowrap">
            {item.label}
          </div>
        </div>
      )}

      {/* CHILDREN */}
      {!collapsed && isOpen && item.children && (
        <div className="ml-2 border-l-2 border-gray-200 pl-3 space-y-1 mt-1">
          {item.children.map((child) => (
            <Link
              key={child.id}
              href={child.href || "#"}
              className={clsx(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                "hover:bg-gray-100 active:bg-gray-200",
                isActive(child.href)
                  ? "bg-indigo-50 text-indigo-600 font-medium"
                  : "text-gray-600 hover:text-gray-900",
              )}
            >
              <span
                className={clsx(
                  "w-1.5 h-1.5 rounded-full",
                  isActive(child.href) ? "bg-indigo-600" : "bg-gray-400",
                )}
              />
              <span className="truncate">{child.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
