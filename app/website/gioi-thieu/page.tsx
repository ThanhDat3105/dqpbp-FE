import { Target, Eye, Users, Shield, Star, Phone, Mail, MapPin } from 'lucide-react';

const values = [
  { icon: '⚔️', title: 'Trung thành', desc: 'Trung thành tuyệt đối với Đảng, Nhà nước và nhân dân' },
  { icon: '🤝', title: 'Đoàn kết', desc: 'Đoàn kết nội bộ, gắn bó mật thiết với nhân dân' },
  { icon: '📋', title: 'Kỷ cương', desc: 'Chấp hành nghiêm kỷ luật quân sự và pháp luật' },
  { icon: '🏆', title: 'Quyết thắng', desc: 'Quyết tâm hoàn thành mọi nhiệm vụ được giao' },
];

const orgStructure = [
  {
    title: 'Ban Chỉ Huy',
    desc: 'Chỉ huy trưởng, Phó Chỉ huy trưởng Quân sự',
    color: 'bg-[#546a2f]',
  },
  {
    title: 'Trung đội Dân quân cơ động',
    desc: '3 tiểu đội × 12 chiến sĩ',
    color: 'bg-[#6b8c3a]',
  },
  {
    title: 'Tiểu đội Dân quân tại chỗ',
    desc: 'Lực lượng bảo vệ khu phố',
    color: 'bg-[#6b8c3a]',
  },
  {
    title: 'Tổ Dự bị động viên',
    desc: 'Quản lý lực lượng dự bị',
    color: 'bg-[#6b8c3a]',
  },
];

const gallery = ['Huấn luyện', 'Diễn tập', 'Lễ ra quân', 'Giao lưu', 'Khen thưởng', 'Sinh hoạt'];

export default function GioiThieuPage() {
  return (
    <>
      {/* Hero Banner */}
      <section
        className="relative py-20 text-white flex items-center"
        style={{ background: 'linear-gradient(135deg, #2d3a1a 0%, #546a2f 60%, #3d5020 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,179,0,0.3) 20px, rgba(255,179,0,0.3) 21px)',
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-[#ffb300]/20 border border-[#ffb300]/40 rounded-full px-4 py-1.5 text-sm text-[#ffb300] mb-4">
            <Star className="w-3.5 h-3.5" /> BCH Quân Sự Phường Bình Phú
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4">Giới Thiệu Đơn Vị</h1>
          <p className="text-2xl md:text-3xl font-bold text-[#ffb300]">
            "Đoàn Kết — Kỷ Cương — Quyết Thắng"
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left main (2/3) */}
        <div className="lg:col-span-2 space-y-10">
          {/* Giới thiệu chung */}
          <div>
            <h2 className="text-2xl font-bold text-[#546a2f] mb-4 flex items-center gap-2">
              <span className="w-1 h-7 bg-[#ffb300] rounded-full" />
              Giới Thiệu Chung
            </h2>
            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed space-y-3">
              <p>
                Ban Chỉ Huy Quân Sự Phường Bình Phú là cơ quan quân sự địa phương cấp phường, trực
                thuộc UBND Phường Bình Phú, TP. Hồ Chí Minh. Đơn vị có chức năng
                tham mưu cho cấp ủy, chính quyền địa phương về công tác quốc phòng — quân sự và
                quản lý nhà nước về quốc phòng trên địa bàn phường.
              </p>
              <p>
                Đơn vị thực hiện nhiệm vụ xây dựng lực lượng dân quân tự vệ, tổ chức huấn luyện
                quân sự, thực hiện công tác tuyển quân, quản lý quân nhân dự bị và thực hiện các
                nhiệm vụ bảo vệ an ninh, trật tự địa bàn.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="bg-[#546a2f]/5 border border-[#546a2f]/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-[#546a2f]" />
                  <h3 className="font-bold text-[#546a2f]">Sứ Mệnh</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Bảo vệ vững chắc Tổ quốc, giữ gìn an ninh trật tự địa bàn, xây dựng nền quốc
                  phòng toàn dân vững mạnh tại địa phương.
                </p>
              </div>
              <div className="bg-[#ffb300]/5 border border-[#ffb300]/30 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-5 h-5 text-[#ffb300]" />
                  <h3 className="font-bold text-gray-700">Tầm Nhìn</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Xây dựng đơn vị dân quân tự vệ vững mạnh toàn diện, là lực lượng nòng cốt trong
                  công tác bảo vệ an ninh địa phương đến năm 2030.
                </p>
              </div>
            </div>
          </div>

          {/* Lịch sử */}
          <div>
            <h2 className="text-2xl font-bold text-[#546a2f] mb-4 flex items-center gap-2">
              <span className="w-1 h-7 bg-[#ffb300] rounded-full" />
              Lịch Sử & Truyền Thống
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
              <div className="sm:col-span-2 bg-[#546a2f]/10 rounded-xl h-48 flex items-center justify-center text-[#546a2f]/30">
                <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                </svg>
              </div>
              <div className="sm:col-span-3 space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  Được thành lập từ những năm đầu sau giải phóng miền Nam, Ban CHQS Phường Bình Phú
                  đã trải qua nhiều giai đoạn phát triển, không ngừng củng cố và trưởng thành.
                </p>
                <p>
                  Qua các thời kỳ, đơn vị đã hoàn thành xuất sắc nhiệm vụ được giao, nhiều lần được
                  Quận ủy, UBND Phường Bình Phú và các cấp trên khen thưởng vì có thành tích xuất sắc
                  trong công tác quân sự địa phương.
                </p>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {[
                    ['Đơn vị vững mạnh toàn diện', '5 năm liên tiếp'],
                    ['Giải Nhì hội thi quân sự', 'Cấp Quận 2024'],
                  ].map(([title, sub]) => (
                    <div key={title} className="bg-white border border-[#546a2f]/20 rounded-lg p-3">
                      <p className="font-semibold text-[#546a2f] text-xs">{title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cơ cấu tổ chức */}
          <div>
            <h2 className="text-2xl font-bold text-[#546a2f] mb-4 flex items-center gap-2">
              <span className="w-1 h-7 bg-[#ffb300] rounded-full" />
              Cơ Cấu Tổ Chức
            </h2>
            <div className="flex flex-col items-center gap-4">
              {orgStructure.map((org, idx) => (
                <div key={org.title} className="w-full max-w-lg">
                  <div
                    className={`${org.color} text-white rounded-xl px-6 py-4 text-center shadow-sm`}
                  >
                    <div className="font-bold">{org.title}</div>
                    <div className="text-white/70 text-sm mt-0.5">{org.desc}</div>
                  </div>
                  {idx < orgStructure.length - 1 && (
                    <div className="flex justify-center my-2">
                      <div className="w-0.5 h-6 bg-[#546a2f]/30" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar (1/3) */}
        <aside className="space-y-6">
          {/* Contact info */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-[#546a2f] text-white px-4 py-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#ffb300]" />
              <span className="font-semibold text-sm">Thông Tin Liên Hệ</span>
            </div>
            <ul className="divide-y divide-gray-100 text-sm">
              <li className="flex items-start gap-3 px-4 py-3">
                <MapPin className="w-4 h-4 text-[#546a2f] mt-0.5 shrink-0" />
                <span className="text-gray-600">Phường Bình Phú, TP.HCM</span>
              </li>
            </ul>
          </div>

          {/* Photo gallery */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-[#546a2f] text-white px-4 py-3">
              <span className="font-semibold text-sm">Thư Viện Ảnh</span>
            </div>
            <div className="p-3 grid grid-cols-3 gap-2">
              {gallery.map((label) => (
                <div
                  key={label}
                  className="aspect-square bg-[#546a2f]/10 rounded-lg flex items-center justify-center text-[#546a2f]/40 hover:bg-[#546a2f]/20 cursor-pointer transition-colors"
                  title={label}
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* Core values */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-[#546a2f] text-white px-4 py-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#ffb300]" />
              <span className="font-semibold text-sm">Giá Trị Cốt Lõi</span>
            </div>
            <ul className="divide-y divide-gray-100">
              {values.map((v) => (
                <li key={v.title} className="px-4 py-3 flex items-start gap-3">
                  <span className="text-xl">{v.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{v.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{v.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </>
  );
}
