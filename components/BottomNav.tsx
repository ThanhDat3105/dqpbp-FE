"use client";

import Link from "next/link";
import {
  menuConfigMobile,
  menuConfigMobileUser,
  MenuItem,
} from "@/lib/sidebar.config";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function BottomNav() {
  const { user } = useAuth();
  const [menu, setMenu] = useState<MenuItem[]>([]);

  useEffect(() => {
    if ((user && user.role === "CHI_HUY") || user?.role === "TO_TRUONG") {
      setMenu(menuConfigMobile);
    } else {
      setMenu(menuConfigMobileUser);
    }
  }, [user]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-1000 grid grid-cols-5 items-center justify-around border-t shadow-md bg-white border-gray-200 md:px-4 py-2 lg:hidden">
      {/* Left item */}
      {menu.slice(0, 2).map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.id}
            href={item.href || "#"}
            className="flex flex-col items-center justify-center text-xs text-gray-600 hover:text-blue-500 transition"
          >
            <Icon />
            <span className="mt-1 text-center">{item.label}</span>
          </Link>
        );
      })}

      {/* Floating Button */}
      <div className="relative flex items-center justify-center">
        <button className="size-14 rounded-full">
          <Image
            src="/img/logo-dqtv.png"
            alt="Logo"
            width={56}
            height={56}
            className="rounded-full object-contain"
          />
        </button>
      </div>

      {/* Right item */}
      {menu.slice(2, 4).map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.id}
            href={item.href || "#"}
            className="flex flex-col items-center justify-center text-xs text-gray-600 hover:text-blue-500 transition"
          >
            <Icon />
            <span className="mt-1 text-center">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
