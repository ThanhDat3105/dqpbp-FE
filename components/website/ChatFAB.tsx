"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { chatAPI } from "@/services/api/chat";
import { ROOT_OPTIONS, FlowOption, matchOptionByInput } from "./chat-fab/chat-flow-data";
import { ChatMessageList, Message } from "./chat-fab/chat-message-list";
import { ChatQuickOptions } from "./chat-fab/chat-quick-options";

const now = () =>
  new Date().toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

const makeWelcome = (): Message => ({
  id: 0,
  role: "bot",
  text: "Xin chào! Tôi có thể giúp gì cho bạn về các thủ tục và thông tin quân sự địa phương?",
  time: now(),
});

const ERROR_MESSAGE =
  "Xin lỗi, hiện tại tôi không thể xử lý yêu cầu của bạn. Vui lòng thử lại sau.";

export default function ChatFAB() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([makeWelcome()]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [currentOptions, setCurrentOptions] =
    useState<FlowOption[]>(ROOT_OPTIONS);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const handleFlowOption = async (option: FlowOption) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", text: option.label, time: now() },
    ]);
    setCurrentOptions([]);
    setTyping(true);

    await new Promise((r) => setTimeout(r, 3000));

    setTyping(false);
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + 1, role: "bot", text: option.next.reply, time: now() },
    ]);
    setCurrentOptions(option.next.options ?? []);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || typing) return;

    const optionsSnapshot = currentOptions;

    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", text, time: now() },
    ]);
    setInput("");
    setTyping(true);
    setCurrentOptions([]);

    await new Promise((r) => setTimeout(r, 3000));

    const matched =
      matchOptionByInput(text, optionsSnapshot) ??
      matchOptionByInput(text, ROOT_OPTIONS);

    if (matched) {
      setTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "bot", text: matched.next.reply, time: now() },
      ]);
      setCurrentOptions(matched.next.options ?? []);
      return;
    }

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
      setCurrentOptions(optionsSnapshot);
    }
  };

  const handleReset = () => {
    setMessages([makeWelcome()]);
    setCurrentOptions(ROOT_OPTIONS);
    setInput("");
  };

  return (
    <div
      className={`fixed lg:bottom-6 lg:right-6 bottom-24 right-6 z-50 flex flex-col items-end ${open ? "gap-3" : ""}`}
    >
      {/* Chat panel */}
      <div
        className={cn(
          "bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden origin-bottom-right",
          open
            ? "opacity-100 scale-100 pointer-events-auto sm:w-80 w-72"
            : "opacity-0 scale-90 pointer-events-none h-0 w-0",
        )}
        style={{ maxHeight: 520 }}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-[#3d5020] to-[#546a2f] px-4 py-3 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-yellow-300/20 border border-yellow-300/40 flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-yellow-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-tight">
              Ban CHQS phường
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white/60 text-xs">Đang hoạt động</span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleReset}
              title="Bắt đầu lại"
              className="text-white/70 hover:text-white hover:bg-white/10 w-7 h-7"
            >
              <span className="text-sm leading-none">↺</span>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <ChatMessageList
          messages={messages}
          typing={typing}
          bottomRef={bottomRef}
        />

        <ChatQuickOptions
          options={currentOptions}
          onSelect={handleFlowOption}
        />

        {/* Input area */}
        <div className="p-3 bg-white flex gap-2 items-center border-t border-gray-100">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder="Nhập tin nhắn để tìm kiếm..."
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

      {/* FAB button */}
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
