"use client";
import { useEffect } from "react";
import NProgress from "nprogress";
import { usePathname } from "next/navigation";

export default function ProgressBar() {
  const pathname = usePathname();

  useEffect(() => {
    NProgress.start();

    const timer = setTimeout(() => {
      NProgress.done();
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
