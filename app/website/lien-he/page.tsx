'use client';

import { useState } from 'react';
import { ChevronRight, MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react';

const contactInfo = [
  {
    icon: MapPin,
    label: 'Địa chỉ',
    value: 'Phường Bình Phú, TP. Hồ Chí Minh',
  },
  { icon: Phone, label: 'Điện thoại', value: '(028) 3750 xxxx' },
  { icon: Mail, label: 'Email', value: 'bchqs.binhphu@binhtanq.hochiminhcity.gov.vn' },
  { icon: Clock, label: 'Giờ làm việc', value: 'Thứ 2 – Thứ 6: 07:30–11:30, 13:30–17:00' },
];

const subjects = [
  'Thắc mắc về nghĩa vụ quân sự',
  'Thông tin về huấn luyện dân quân',
  'Yêu cầu văn bản, giấy tờ',
  'Phản ánh, kiến nghị',
  'Vấn đề khác',
];

export default function LienHePage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <>
      {/* Page banner */}
      <section
        className="relative py-12 text-white text-center"
        style={{ background: 'linear-gradient(135deg, #2d3a1a, #546a2f)' }}
      >
        <h1 className="text-3xl md:text-4xl font-black">Liên Hệ</h1>
        <nav className="flex items-center justify-center gap-2 text-sm text-white/60 mt-3">
          <a href="/website" className="hover:text-white transition-colors">Trang chủ</a>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#ffb300]">Liên Hệ</span>
        </nav>
      </section>

      {/* Content */}
      <section className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Contact info + map */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[#546a2f] mb-2">Thông Tin Liên Hệ</h2>
            <p className="text-gray-600 text-sm">
              Vui lòng liên hệ với chúng tôi qua các kênh sau hoặc điền vào mẫu liên hệ bên cạnh.
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

          {/* Map placeholder */}
          <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
            <div className="bg-[#546a2f] text-white px-4 py-3">
              <span className="font-semibold text-sm">Bản Đồ</span>
            </div>
            <div className="h-56 bg-[#546a2f]/5 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <svg
                  className="w-16 h-16 mx-auto text-[#546a2f]/20 mb-3"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
                </svg>
                <p className="text-sm font-medium text-gray-500">Phường Bình Phú</p>
                <p className="text-xs text-gray-400">TP.HCM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact form */}
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-[#546a2f] text-white px-6 py-4">
            <h2 className="font-bold text-lg">Gửi Tin Nhắn</h2>
            <p className="text-white/70 text-sm mt-0.5">Chúng tôi sẽ phản hồi trong vòng 1–2 ngày làm việc</p>
          </div>

          {sent ? (
            <div className="flex flex-col items-center justify-center p-10 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Gửi thành công!</h3>
              <p className="text-gray-500 text-sm mb-6">
                Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có thể.
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-sm text-[#546a2f] underline underline-offset-2"
              >
                Gửi tin nhắn khác
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
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
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="0901 234 567"
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#546a2f] focus:ring-1 focus:ring-[#546a2f]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="example@email.com"
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 outline-none focus:border-[#546a2f] focus:ring-1 focus:ring-[#546a2f]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
                  Chủ đề
                </label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white outline-none focus:border-[#546a2f]"
                >
                  <option value="">-- Chọn chủ đề --</option>
                  {subjects.map((s) => (
                    <option key={s} value={s}>{s}</option>
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
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
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
