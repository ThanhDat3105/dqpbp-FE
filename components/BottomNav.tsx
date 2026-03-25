"use client";

import Link from "next/link";
import { menuConfig } from "@/lib/sidebar.config";

import { Home, Person, AccountBalanceWallet } from "@mui/icons-material";

import { Button } from "@mui/material";
import Image from "next/image";

export default function BottomNav() {
  const handleClick = (
    e: React.MouseEvent,
    user: any,
    setOpenLogin: (v: boolean) => void,
  ) => {
    if (!user) {
      e.preventDefault();
      setOpenLogin(true);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-100 flex items-center justify-around border-t shadow-md bg-white border-gray-200 px-4 py-2 lg:hidden">
      {/* Left item */}
      {menuConfig.slice(0, 2).map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.id}
            href={item.href || "#"}
            className="flex flex-col items-center justify-center text-xs text-gray-600 hover:text-blue-500 transition"
          >
            <Icon />
            <span className="mt-1">{item.id}</span>
          </Link>
        );
      })}

      {/* Floating Button */}
      <div className="relative -mt-10 flex h-16 w-16 items-center justify-center">
        <button className="size-14 rounded-full bg-[#6b8e23]">
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
      {menuConfig.slice(2, 4).map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.id}
            href={item.href || "#"}
            className="flex flex-col items-center justify-center text-xs text-gray-600 hover:text-blue-500 transition"
          >
            <Icon />
            <span className="mt-1">{item.id}</span>
          </Link>
        );
      })}
    </div>
  );
}
