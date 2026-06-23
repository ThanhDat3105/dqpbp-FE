import {
  Target,
  Eye,
  Users,
  Shield,
  Star,
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";
import Image from "next/image";

const values = [
  {
    icon: "⚔️",
    title: "Trung thành",
    desc: "Trung thành tuyệt đối với Đảng, Nhà nước và nhân dân",
  },
  {
    icon: "🤝",
    title: "Đoàn kết",
    desc: "Đoàn kết nội bộ, gắn bó mật thiết với nhân dân",
  },
  {
    icon: "📋",
    title: "Kỷ cương",
    desc: "Chấp hành nghiêm kỷ luật quân sự và pháp luật",
  },
  {
    icon: "🏆",
    title: "Quyết thắng",
    desc: "Quyết tâm hoàn thành mọi nhiệm vụ được giao",
  },
];

const orgStructure = {
  commander: "Chỉ huy trưởng",
  deputy: "Phó Chỉ huy trưởng",
  staff: [
    "Trợ lý Chính trị",
    "Trợ lý Tác huấn",
    "Trợ lý Tác huấn",
    "Nhân viên Văn thư",
    "Nhân viên Tài Chính",
  ],
};

const gallery = [
  "https://pub-961ac25df80d4464a675ea2d2ab13fca.r2.dev/657384672_122233447880299127_3630868676577276621_n.jpg",
  "https://pub-961ac25df80d4464a675ea2d2ab13fca.r2.dev/659061717_122233585604299127_4180254085442966083_n.jpg",
  "https://pub-961ac25df80d4464a675ea2d2ab13fca.r2.dev/659068328_122233585634299127_5177616002567179234_n.jpg",
  "https://pub-961ac25df80d4464a675ea2d2ab13fca.r2.dev/726432718_1637201698407807_216307910014399435_n.jpg",
  "https://pub-961ac25df80d4464a675ea2d2ab13fca.r2.dev/730153370_1067321755855663_6041617414379282812_n.jpg",
  "https://pub-961ac25df80d4464a675ea2d2ab13fca.r2.dev/image.638954679614745823.png",
];

export default function GioiThieuPage() {
  return (
    <>
      {/* Hero Banner */}
      <section
        className="relative py-20 text-white flex items-center"
        style={{
          background:
            "linear-gradient(135deg, #2d3a1a 0%, #546a2f 60%, #3d5020 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(253,224,71,0.3) 20px, rgba(253,224,71,0.3) 21px)",
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-300/20 border border-yellow-300/40 rounded-full px-4 py-1.5 text-sm text-yellow-300 mb-4">
            <Star className="w-3.5 h-3.5" /> BCH Quân Sự Phường Bình Phú
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4">
            Giới Thiệu Đơn Vị
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-yellow-300">
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
              <span className="w-1 h-7 bg-yellow-300 rounded-full" />
              Giới Thiệu Chung
            </h2>
            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed space-y-3">
              <p>
                Ban Chỉ Huy Quân Sự Phường Bình Phú là cơ quan quân sự địa
                phương cấp phường, trực thuộc UBND Phường Bình Phú, TP. Hồ Chí
                Minh. Đơn vị có chức năng tham mưu cho cấp ủy, chính quyền địa
                phương về công tác quốc phòng — quân sự và quản lý nhà nước về
                quốc phòng trên địa bàn phường.
              </p>
              <p>
                Đơn vị thực hiện nhiệm vụ xây dựng lực lượng dân quân tự vệ, tổ
                chức huấn luyện quân sự, thực hiện công tác tuyển quân, quản lý
                quân nhân dự bị và thực hiện các nhiệm vụ bảo vệ an ninh, trật
                tự địa bàn.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="bg-[#546a2f]/5 border border-[#546a2f]/20 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-[#546a2f]" />
                  <h3 className="font-bold text-[#546a2f]">Sứ Mệnh</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Bảo vệ vững chắc Tổ quốc, giữ gìn an ninh trật tự địa bàn, xây
                  dựng nền quốc phòng toàn dân vững mạnh tại địa phương.
                </p>
              </div>
              <div className="bg-yellow-300/5 border border-yellow-300/30 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-5 h-5 text-yellow-300" />
                  <h3 className="font-bold text-gray-700">Tầm Nhìn</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Xây dựng đơn vị dân quân tự vệ vững mạnh toàn diện, là lực
                  lượng nòng cốt trong công tác bảo vệ an ninh địa phương.
                </p>
              </div>
            </div>
          </div>

          {/* Lịch sử */}
          <div>
            <h2 className="text-2xl font-bold text-[#546a2f] mb-4 flex items-center gap-2">
              <span className="w-1 h-7 bg-yellow-300 rounded-full" />
              Lịch Sử & Truyền Thống
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
              <div className="sm:col-span-2 bg-[#546a2f]/10 rounded-xl h-48 flex items-center justify-center text-[#546a2f]/30 relative">
                <Image
                  src="https://pub-961ac25df80d4464a675ea2d2ab13fca.r2.dev/banner-image%20(1)%20(1)%20(1).png"
                  alt="Lịch sử BCH Quân Sự Phường Bình Phú"
                  fill
                />
              </div>
              <div className="sm:col-span-3 space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  Được thành lập từ những năm đầu sau giải phóng miền Nam, Ban
                  CHQS Phường Bình Phú đã trải qua nhiều giai đoạn phát triển,
                  không ngừng củng cố và trưởng thành.
                </p>
                <p>
                  Qua các thời kỳ, đơn vị đã hoàn thành xuất sắc nhiệm vụ được
                  giao, nhiều lần được Quận ủy, UBND Phường Bình Phú và các cấp
                  trên khen thưởng vì có thành tích xuất sắc trong công tác quân
                  sự địa phương.
                </p>
              </div>
            </div>
          </div>

          {/* Cơ cấu tổ chức */}
          <div>
            <h2 className="text-2xl font-bold text-[#546a2f] mb-6 flex items-center gap-2">
              <span className="w-1 h-7 bg-yellow-300 rounded-full" />
              Cơ Cấu Tổ Chức
            </h2>
            <div className="flex flex-col items-center gap-0">
              {/* Cấp 1: Chỉ huy trưởng */}
              <div className="w-full max-w-xs">
                <div className="bg-[#546a2f] text-white rounded-xl px-6 py-4 text-center shadow-md">
                  <div className="font-bold text-base">{orgStructure.commander}</div>
                </div>
              </div>

              {/* Connector */}
              <div className="flex justify-center">
                <div className="w-0.5 h-6 bg-[#546a2f]/40" />
              </div>

              {/* Cấp 2: Phó Chỉ huy trưởng */}
              <div className="w-full max-w-xs">
                <div className="bg-[#546a2f] text-white rounded-xl px-6 py-4 text-center shadow-md">
                  <div className="font-bold text-base">{orgStructure.deputy}</div>
                </div>
              </div>

              {/* Connector dọc từ deputy xuống thanh ngang */}
              <div className="flex justify-center">
                <div className="w-0.5 h-6 bg-[#546a2f]/40" />
              </div>

              {/* Cấp 3: Layout ngang với đường kết nối */}
              <div className="w-full">
                {/* Thanh ngang trên cùng */}
                <div className="relative flex justify-center">
                  <div className="absolute top-0 left-[10%] right-[10%] h-0.5 bg-[#546a2f]/40" />
                </div>

                {/* Các node staff */}
                <div className="grid grid-cols-5 gap-2 pt-0">
                  {orgStructure.staff.map((s, i) => (
                    <div key={i} className="flex flex-col items-center">
                      {/* Đường dọc từ thanh ngang xuống node */}
                      <div className="w-0.5 h-6 bg-[#546a2f]/40" />
                      <div className="bg-white border-2 border-[#546a2f]/30 rounded-xl px-2 py-3 text-center shadow-sm hover:border-[#546a2f] hover:shadow-md transition-all w-full">
                        <div className="text-xs font-medium text-gray-700 leading-snug">{s}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar (1/3) */}
        <aside className="space-y-6">
          {/* Contact info */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-[#546a2f] text-white px-4 py-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-yellow-300" />
              <span className="font-semibold text-sm">Thông Tin Liên Hệ</span>
            </div>
            <ul className="space-y-3 divide-y divide-gray-100 text-sm px-4 py-3">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-[#546a2f] shrink-0 mt-0.5" />
                <div>
                  <p>675 Hậu Giang, Phường Bình Phú</p>
                  <p>36Bis An Dương Vương, Phường Bình Phú</p>
                  <p className="text-gray-600">TP. Hồ Chí Minh</p>
                </div>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-[#546a2f] shrink-0" />
                <div>
                  <p>Thứ 2 – Thứ 6: 07:30 – 11:30, 13:30 – 17:00</p>
                  <p>Thứ 7: 07:30 – 11:30</p>
                </div>
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
                  className="aspect-square bg-[#546a2f]/10 rounded-lg flex items-center justify-center text-[#546a2f]/40 hover:bg-[#546a2f]/20 cursor-pointer transition-colors relative border"
                  title={label}
                >
                  <Image
                    src={label}
                    alt="Gallery Image"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Core values */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-[#546a2f] text-white px-4 py-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-yellow-300" />
              <span className="font-semibold text-sm">Giá Trị Cốt Lõi</span>
            </div>
            <ul className="divide-y divide-gray-100">
              {values.map((v) => (
                <li key={v.title} className="px-4 py-3 flex items-start gap-3">
                  <span className="text-xl">{v.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {v.title}
                    </p>
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
