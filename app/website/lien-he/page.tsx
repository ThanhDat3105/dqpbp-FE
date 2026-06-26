"use client";

import {
  CheckCircle,
  ChevronRight,
  Clock,
  MapPin,
  Phone,
  Send,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"
import { websiteContactApi, type ContactMode } from "@/services/api/website-contacts";

const contactInfo = [
  {
    icon: MapPin,
    label: "Địa chỉ",
    value:
      "675 Hậu Giang & 36Bis An Dương Vương, Phường Bình Phú, TP. Hồ Chí Minh",
  },
  { icon: Phone, label: "Điện thoại", value: "(028) 3866 7722" },
  {
    icon: Clock,
    label: "Giờ làm việc",
    value: "Thứ 2 – Thứ 6: 07:30–11:30, 13:30–17:00",
  },
];

const subjects = [
  "Thắc mắc về nghĩa vụ quân sự",
  "Cung cấp thông tin chính trị trên địa bàn phường",
  "Phản ánh, kiến nghị về phục vụ nhân dân",
  "Vấn đề khác",
];

function validateForm(form: {
  name: string;
  phone: string;
  subject: string;
  message: string;
}) {
  if(form.phone) {
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(form.phone)) {
      return "Vui lòng nhập số điện thoại hợp lệ";
    }
  }
  if (!form.subject) {
    return "Vui lòng chọn chủ đề";
  }
  if (form.message.trim().length < 10) {
    return "Vui lòng nhập nội dung tin nhắn (ít nhất 10 ký tự)";
  }
  return null;
}

export default function LienHePage() {
  const [sent, setSent] = useState(false);
  const [mode, setMode] = useState<ContactMode>("public");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm(form);
    if (error) {
      toast.error(error);
      return;
    }
    try {
      const { name, phone, subject, message } = form;
      const payload = {
        mode,
        full_name: name, 
        phone,
        subject,
        message,
      };
      console.log("Sending contact form with payload:", payload);
      const response = websiteContactApi.sendContact(payload);
      console.log("Response from sendContact:", response);
    } catch (error) {
      console.error("Error sending contact form:", error);
      alert("Có lỗi xảy ra khi gửi thông tin. Vui lòng thử lại.");
    }
    setSent(true);
  };

  return (
    <>
      {/* Page banner */}
      <section
        className="relative py-12 text-white text-center"
        style={{ background: "linear-gradient(135deg, #2d3a1a, #546a2f)" }}
      >
        <h1 className="text-3xl md:text-4xl font-black">Kiến Nghị Phản Ánh</h1>
        <nav className="flex items-center justify-center gap-2 text-sm text-white/60 mt-3">
          <a href="/website" className="hover:text-white transition-colors">
            Trang chủ
          </a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-yellow-300">Kiến Nghị Phản Ánh</span>
        </nav>
      </section>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Contact info + map */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[#546a2f] mb-2">
              Thông Tin Liên Hệ
            </h2>
            <p className="text-gray-600 text-sm">
              Vui lòng liên hệ với chúng tôi qua các kênh sau hoặc điền vào mẫu
              liên hệ bên cạnh.
            </p>
          </div>

          <div className="space-y-4">
            {contactInfo.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-start gap-4 bg-white border border-gray-100 rounded-xl p-4 shadow-sm"
              >
                <div className="w-10 h-10 bg-[#546a2f]/10 rounded-lg flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-[#546a2f]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {label}
                  </p>
                  <p className="text-sm text-gray-700 mt-0.5">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Map */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-[#546a2f] text-white px-4 py-3">
              <span className="font-semibold text-sm">Bản Đồ</span>
            </div>
            <iframe
              title="Bản đồ BCH Quân Sự Phường Bình Phú"
              src="https://maps.google.com/maps?q=10.7473733,106.6329953&z=17&output=embed"
              className="w-full h-56 border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>

        {/* Right: Contact form */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-[#546a2f] text-white px-6 py-4">
            <h2 className="font-bold text-lg">Gửi Tin Nhắn</h2>
            <p className="text-white/70 text-sm mt-0.5">
              Chúng tôi sẽ phản hồi trong vòng 1–2 ngày làm việc
            </p>
          </div>

          {sent ? (
            <div className="flex flex-col items-center justify-center p-10 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                Gửi thành công!
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.
              </p>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="text-sm text-[#546a2f] underline underline-offset-2"
              >
                Gửi tin nhắn khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Mode selector */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setMode("public")}
                  className={`text-sm font-semibold py-2 rounded-md transition-colors ${
                    mode === "public"
                      ? "bg-[#546a2f] text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Gửi Công Khai
                </button>
                <button
                  type="button"
                  onClick={() => setMode("anonymous")}
                  className={`text-sm font-semibold py-2 rounded-md transition-colors ${
                    mode === "anonymous"
                      ? "bg-[#546a2f] text-white shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Gửi Ẩn Danh
                </button>
              </div>

              {mode === "public" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Nguyễn Văn A"
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#546a2f] focus:ring-1 focus:ring-[#546a2f]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="0901 234 567"
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#546a2f] focus:ring-1 focus:ring-[#546a2f]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
                  Chủ đề <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white outline-none focus:border-[#546a2f]"
                >
                  <option value="">-- Chọn chủ đề --</option>
                  {subjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
                  Nội dung <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  placeholder="Nhập nội dung tin nhắn của bạn..."
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#546a2f] focus:ring-1 focus:ring-[#546a2f] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#546a2f] text-white font-semibold py-3 rounded-lg hover:bg-[#3d5020] transition-colors"
              >
                <Send className="w-4 h-4" /> Gửi Tin Nhắn
              </button>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
