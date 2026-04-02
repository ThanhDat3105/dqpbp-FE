"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  AccountCircle,
  Logout,
  ChevronLeft,
  Close as CloseIcon,
} from "@mui/icons-material";
import clsx from "clsx";
import SidebarItem from "./SidebarItem";
import { menuConfig } from "@/lib/sidebar.config";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  onLogout: () => void;
  mobileOpen?: boolean;
  onMobileOpen?: (open: boolean) => void;
}

const COLLAPSE_KEY = "sidebar-collapsed";

export default function Sidebar({
  onLogout,
  mobileOpen = false,
  onMobileOpen,
}: SidebarProps) {
  const { logout, user } = useAuth();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Hydrate collapsed state from localStorage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(COLLAPSE_KEY);
    if (saved) {
      setCollapsed(JSON.parse(saved));
    }
  }, []);

  // Auto-expand menu when route matches
  useEffect(() => {
    const activeMenu = menuConfig.find((item) => {
      if (item.href === pathname) return true;
      if (item.children?.some((child) => child.href === pathname)) {
        return true;
      }
      return false;
    });

    if (
      activeMenu &&
      activeMenu.children &&
      !openMenus.includes(activeMenu.id)
    ) {
      setOpenMenus((prev) => [...prev, activeMenu.id]);
    }
  }, [pathname, openMenus]);

  const handleCollapse = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    localStorage.setItem(COLLAPSE_KEY, JSON.stringify(newCollapsed));
  };

  const toggleMenu = (id: string) => {
    setOpenMenus((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleMobileClose = () => {
    onMobileOpen?.(false);
  };

  const handleLogout = async () => {
    handleMobileClose();
    onLogout();

    try {
      const res = await logout();

      console.log(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filter menu items based on user role
  const visibleMenuItems = menuConfig.filter((item) => {
    if (!item.role) return true;
    return item.role === user?.role;
  });

  if (!mounted) return null;

  const sidebarContent = (
    <>
      {/* Header Section */}
      <div className="shrink-0 border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div
            className={clsx(
              "flex items-center gap-3 transition-all duration-300 overflow-hidden",
              collapsed ? "w-0" : "w-auto",
            )}
          >
            <div className="shrink-0">
              <Image
                src="/img/logo-dqtv.png"
                alt="Logo"
                width={40}
                height={40}
                className="rounded-full"
              />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm truncate">
                BAN CHQS PHƯỜNG BÌNH PHÚ
              </h1>
              <p className="text-xs text-gray-500 truncate">Hệ thống quản lý</p>
            </div>
          </div>

          {/* Desktop collapse button */}
          <button
            onClick={handleCollapse}
            className={clsx(
              "hidden md:flex items-center justify-center p-1.5 rounded-lg",
              "text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors",
              "shrink-0",
            )}
            title={collapsed ? "Mở rộng" : "Thu gọn"}
          >
            <ChevronLeft
              className={clsx(
                "transition-transform duration-300",
                collapsed && "rotate-180",
              )}
            />
          </button>

          {/* Mobile close button */}
          <button
            onClick={handleMobileClose}
            className="md:hidden flex items-center justify-center p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors shrink-0"
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      {/* User Section */}
      <div
        className={clsx(
          "shrink-0 p-4 transition-all duration-300",
          collapsed ? "px-3" : "",
        )}
      >
        <div
          className={clsx(
            "flex items-center gap-3 p-3 rounded-lg transition-all duration-300",
            collapsed ? "justify-center" : "",
            "bg-indigo-50 border border-indigo-200",
          )}
        >
          <div className="relative shrink-0">
            <AccountCircle className="text-gray-500" sx={{ fontSize: 40 }} />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">
                {user?.name || "Khách"}
              </p>
              <span
                className={clsx(
                  "inline-block text-xs px-2 py-0.5 rounded-full mt-1",
                  user?.role === "COMMANDER"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-blue-100 text-blue-700",
                )}
              >
                {user?.role === "COMMANDER" ? "Chỉ huy" : user?.team || "DQTT"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {visibleMenuItems.map((item) => (
          <SidebarItem
            key={item.id}
            item={item}
            collapsed={collapsed}
            isOpen={openMenus.includes(item.id)}
            onToggle={() => toggleMenu(item.id)}
          />
        ))}
      </nav>

      {/* Logout Button */}
      <div className={clsx("shrink-0 border-t border-gray-200 p-4")}>
        <button
          onClick={handleLogout}
          className={clsx(
            "w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg",
            "bg-red-500 hover:bg-red-600 active:bg-red-700",
            "text-white font-medium transition-colors duration-200",
            collapsed ? "p-2" : "",
          )}
          title={collapsed ? "Đăng xuất" : ""}
        >
          <Logout fontSize="small" />
          {!collapsed && (
            <span>{loading ? "Đang đăng xuất..." : "Đăng xuất"}</span>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={clsx(
          "hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 h-screen sticky top-0",
          "fixed left-0 top-16 bottom-0 overflow-hidden",
          collapsed ? "w-20" : "w-64",
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer - Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={handleMobileClose}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 z-40 md:hidden flex flex-col transition-transform duration-300 ease-in-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
