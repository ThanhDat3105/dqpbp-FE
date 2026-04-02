"use client";

import CalendarPage from "@/components/calendar/CalendarPage";
import Cookies from "js-cookie";
import { Suspense } from "react";

export default function LichPage() {
  return (
    // Flush with the layout's padding by using negative margins if needed.
    // The layout already wraps children in <div className="p-4 md:p-6">
    <Suspense fallback={<div>Loading...</div>}>
      <CalendarPage />
    </Suspense>
  );
}
