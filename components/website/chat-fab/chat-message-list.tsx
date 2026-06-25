import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Message {
  id: number;
  role: "bot" | "user";
  text: string;
  time: string;
}

interface Props {
  messages: Message[];
  typing: boolean;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatMessageList({ messages, typing, bottomRef }: Props) {
  return (
    <div
      className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50"
      style={{ minHeight: 220, maxHeight: 320 }}
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
            <span className="text-[10px] text-gray-400 px-1">{msg.time}</span>
          </div>
        </div>
      ))}

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
  );
}
