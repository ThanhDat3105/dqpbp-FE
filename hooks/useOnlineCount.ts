"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { nanoid } from "nanoid";
import { useAuth } from "@/context/AuthContext";

const VISITOR_KEY = "dqpbp_visitor_id";

function getVisitorId() {
  if (typeof window === "undefined") return "";

  let id = window.localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = nanoid();
    window.localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

function getSocketUrl() {
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (api) {
    try {
      return new URL(api).origin;
    } catch {
      // fall through
    }
  }

  return process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
}

export function useOnlineCount() {
  const { user } = useAuth();
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const socket: Socket = io(getSocketUrl(), {
      auth: {
        userId: user?.id,
        visitorId: getVisitorId(),
      },
      transports: ["websocket", "polling"],
    });

    socket.on("online-count", (value: number) => {
      setCount(Number(value) || 0);
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id]);

  return count;
}
