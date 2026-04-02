"use client";

import CalendarPage from "@/components/calendar/CalendarPage";
import Cookies from "js-cookie";
import { Suspense } from "react";

// Decode role from stored JWT or user cookie.
// Adjust the cookie key / parsing logic to match your auth setup.
function getUserRole(): string {
  try {
    const raw = Cookies.get("authToken");
    if (!raw) return "STANDING_MILITIA";
    // JWT payload is the second segment, base64url-encoded
    const payload = JSON.parse(atob(raw.split(".")[1]));
    return (payload?.role as string) ?? "STANDING_MILITIA";
  } catch {
    return "STANDING_MILITIA";
  }
}

export default function LichPage() {
  const role = getUserRole();

  return (
    // Flush with the layout's padding by using negative margins if needed.
    // The layout already wraps children in <div className="p-4 md:p-6">
    <Suspense fallback={<div>Loading...</div>}>
      <CalendarPage role={role} />
    </Suspense>
  );
}
