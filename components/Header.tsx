"use client";

import { Menu as MenuIcon } from "@mui/icons-material";
import clsx from "clsx";

interface HeaderProps {
  onMobileMenuOpen: () => void;
  mobileMenuOpen: boolean;
}

export default function Header({
  onMobileMenuOpen,
  mobileMenuOpen,
}: HeaderProps) {
  return (
    <header
      className={clsx(
        "h-16 border-b border-gray-200 bg-white sticky top-0 z-20",
        "flex items-center px-4 md:px-6 gap-4",
      )}
    >
      {/* Mobile hamburger menu */}
      <button
        onClick={onMobileMenuOpen}
        className={clsx(
          "md:hidden flex items-center justify-center p-2 rounded-lg",
          "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
          "transition-colors duration-200",
          mobileMenuOpen ? "bg-gray-100 text-gray-900" : "",
        )}
        title="Mở menu"
      >
        <MenuIcon />
      </button>

      {/* Logo on desktop */}
      <div className="hidden md:block">
        <h2 className="font-semibold text-gray-800">
          BAN CHQS PHƯỜNG BÌNH PHÚ
        </h2>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side actions (can add notifications, settings, etc.) */}
      <div className="flex items-center gap-4">
        {/* Placeholder for future elements like notifications, user menu, etc. */}
      </div>
    </header>
  );
}
