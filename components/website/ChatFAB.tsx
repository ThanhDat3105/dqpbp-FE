"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { axiosInstance } from "@/lib/axios.config";
import { chatAPI } from "@/services/api/chat";

interface Message {
  id: number;
  role: "bot" | "user";
  text: string;
  time: string;
}

const now = () =>
  new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

const WELCOME: Message = {
  id: 0,
  role: "bot",
  text: "Xin chào! Tôi có thể giúp gì cho bạn về các thủ tục và thông tin quân sự địa phương?",
  time: now(),
};

const ERROR_MESSAGE =
  "Xin lỗi, hiện tại tôi không thể xử lý yêu cầu của bạn. Vui lòng thử lại sau.";

export default function ChatFAB() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || typing) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      text,
      time: now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      const res = await chatAPI.sendMessage(text);
      const reply: string = res.reply ?? ERROR_MESSAGE;
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "bot", text: reply, time: now() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "bot", text: ERROR_MESSAGE, time: now() },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div className={`fixed lg:bottom-6 lg:right-6 bottom-24 right-6 z-50 flex flex-col items-end ${open ? "gap-3" : ""}`}>
      {/* Chat panel */}
      <div
        className={cn(
          "bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden origin-bottom-right",
          open
            ? "opacity-100 scale-100 pointer-events-auto sm:w-80 w-72"
            : "opacity-0 scale-90 pointer-events-none h-0 w-0",
        )}
        style={{ maxHeight: 480 }}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-[#3d5020] to-[#546a2f] px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#ffb300]/20 border border-[#ffb300]/40 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-[#ffb300]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-tight">
              Hỗ Trợ Trực Tuyến
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/60 text-xs">Đang hoạt động</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setOpen(false)}
            className="text-white/70 hover:text-white hover:bg-white/10 shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50"
          style={{ minHeight: 220, maxHeight: 300 }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex gap-2",
                msg.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              {msg.role === "bot" && (
                <div className="w-6 h-6 rounded-full bg-[#546a2f]/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-[#546a2f]" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[78%] flex flex-col gap-1",
                  msg.role === "user" && "items-end",
                )}
              >
                <div
                  className={cn(
                    "px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap",
                    msg.role === "bot"
                      ? "bg-white text-gray-700 rounded-tl-sm shadow-sm border border-gray-100"
                      : "bg-[#546a2f] text-white rounded-tr-sm",
                  )}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-gray-400 px-1">
                  {msg.time}
                </span>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {typing && (
            <div className="flex gap-2 items-start">
              <div className="w-6 h-6 rounded-full bg-[#546a2f]/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-[#546a2f]" />
              </div>
              <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick replies */}
        <div className="px-3 pt-2 flex gap-1.5 flex-wrap bg-white border-t border-gray-100">
          {["Nghĩa vụ quân sự", "Lịch huấn luyện", "Liên hệ"].map((q) => (
            <button
              key={q}
              onClick={() => {
                setInput(q);
                inputRef.current?.focus();
              }}
              className="text-xs border border-[#546a2f]/30 text-[#546a2f] px-2.5 py-1 rounded-full hover:bg-[#546a2f]/5 transition-colors mb-1.5"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className="p-3 bg-white flex gap-2 items-center">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Nhập tin nhắn..."
            className="flex-1 text-sm rounded-full border-gray-200 bg-gray-50 focus-visible:ring-[#546a2f]/30 h-9"
          />
          <Button
            size="icon"
            onClick={sendMessage}
            disabled={!input.trim() || typing}
            className="shrink-0 w-9 h-9 rounded-full bg-[#546a2f] hover:bg-[#3d5020] disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Chat hỗ trợ"
        className="relative w-14 h-14 bg-[#546a2f] text-white rounded-full shadow-xl flex items-center justify-center hover:bg-[#3d5020] transition-colors"
      >
        <div
          className={cn(
            "transition-transform duration-200",
            open ? "rotate-90" : "rotate-0",
          )}
        >
          {open ? (
            <X className="w-6 h-6" />
          ) : (
            <MessageCircle className="w-6 h-6" />
          )}
        </div>
      </button>
    </div>
  );
}
