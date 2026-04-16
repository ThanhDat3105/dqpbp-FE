"use client";

import CalendarPage from "@/components/calendar/CalendarPage";
import { Suspense } from "react";

export default function LichPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CalendarPage />
    </Suspense>
  );
}
