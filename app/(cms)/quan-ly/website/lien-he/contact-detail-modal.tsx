"use client";

import { Phone, Mail, MessageSquare, Calendar, CheckCircle2, Clock, XCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { WebsiteContact } from "./types";

interface Props {
  contact: WebsiteContact | null;
  onClose: () => void;
  onStatusChange: (id: number, status: WebsiteContact["status"]) => void;
}

const STATUS_CONFIG = {
  pending:  { label: "Chờ xử lý", icon: Clock,        className: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  approved: { label: "Đã duyệt",  icon: CheckCircle2, className: "text-green-600  bg-green-50  border-green-200"  },
  rejected: { label: "Từ chối",   icon: XCircle,      className: "text-red-500    bg-red-50    border-red-200"    },
} as const;

export default function ContactDetailModal({ contact, onClose, onStatusChange }: Props) {
  return (
    <Sheet open={!!contact} onOpenChange={(open) => { if (!open) onClose(); }}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0 gap-0">
        {contact && <Inner contact={contact} onStatusChange={onStatusChange} />}
      </SheetContent>
    </Sheet>
  );
}

function Inner({
  contact,
  onStatusChange,
}: {
  contact: WebsiteContact;
  onStatusChange: (id: number, status: WebsiteContact["status"]) => void;
}) {
  const cfg = STATUS_CONFIG[contact.status] ?? STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;

  return (
    <>
      <SheetHeader className="px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-start justify-between gap-3 pr-8">
          <div>
            <SheetTitle className="text-base">
              Chi tiết liên hệ #{contact.id}
            </SheetTitle>
            <SheetDescription className="flex items-center gap-1 mt-1 text-xs">
              <Calendar className="w-3 h-3" />
              {new Date(contact.created_at).toLocaleString("vi-VN")}
            </SheetDescription>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border shrink-0 ${cfg.className}`}>
            <StatusIcon className="w-3 h-3" />
            {cfg.label}
          </span>
        </div>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* Người gửi */}
        <section className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Người gửi</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{contact.full_name}</p>
          <div className="flex flex-wrap gap-4">
            <a
              href={`tel:${contact.phone}`}
              className="flex items-center gap-1.5 text-sm text-blue-500 hover:underline"
            >
              <Phone className="w-3.5 h-3.5" />
              {contact.phone}
            </a>
            {contact.email && (
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-1.5 text-sm text-blue-500 hover:underline"
              >
                <Mail className="w-3.5 h-3.5" />
                {contact.email}
              </a>
            )}
          </div>
        </section>

        {/* Chủ đề */}
        {contact.subject && (
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Chủ đề</p>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{contact.subject}</p>
          </section>
        )}

        {/* Nội dung */}
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5 flex items-center gap-1">
            <MessageSquare className="w-3 h-3" /> Nội dung
          </p>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-3 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
            {contact.message}
          </div>
        </section>

        {/* Trạng thái */}
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Cập nhật trạng thái</p>
          <div className="flex gap-2 flex-wrap">
            {(["pending", "approved", "rejected"] as const).map((s) => {
              const c = STATUS_CONFIG[s];
              const CIcon = c.icon;
              const active = contact.status === s;
              return (
                <button
                  key={s}
                  onClick={() => onStatusChange(contact.id, s)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                    active
                      ? `${c.className} ring-2 ring-offset-1 ring-current`
                      : "border-gray-200 text-gray-500 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-500"
                  }`}
                >
                  <CIcon className="w-3 h-3" />
                  {c.label}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </>
  );
}
