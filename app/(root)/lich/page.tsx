"use client";
import { nanoid } from "nanoid";
import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { EventInput } from "@fullcalendar/core";

const Page = () => {
  const [events, setEvents] = useState<EventInput[]>([]);
  console.log(events);
  const handleSelect = (info: any) => {
    const title = prompt("Nhập nhiệm vụ");

    if (title) {
      const newEvent = {
        id: nanoid(),
        title,
        start: info.start,
        end: info.end,
        allDay: true,
      };

      setEvents((prev) => [...prev, newEvent]);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Lịch trực</h1>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        selectable={true}
        select={handleSelect}
        editable={true}
        events={events}
      />
    </div>
  );
};

export default Page;
