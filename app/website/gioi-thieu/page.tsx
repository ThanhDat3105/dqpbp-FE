"use client";

import { useState } from "react";
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
  BadgeCheck,
  ClipboardCheck,
} from "lucide-react";
import Image from "next/image";
import ImgPopup from "./ImagePopUp";
import OrgMemberPopUp from "./OrgMemberPopUp";

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
  pol: "Chính trị viên",
  deputyPol: "Phó Chính trị viên",
  deputy: "Phó Chỉ huy trưởng",
  staff: [
    "Trợ lý Chính trị",
    "Trợ lý Tác huấn",
    "Trợ lý Tác huấn",
    "Nhân viên Văn thư",
    "Nhân viên Tài Chính",
  ],
};

const orgMembers = [
  {
    key: "pol",
    role: "Chính trị viên",
    name: "Phạm Hồng Minh",
    birthYear: "1975",
    avatar: "/avatar.png",
  },
  {
    key: "commander",
    role: "Chỉ huy trưởng",
    name: "Lê Đỗ Uyên Bình",
    birthYear: "1975",
    avatar: "/avatar.png",
  },
  {
    key: "deputyPol",
    role: "Chính trị viên phó",
    name: "-",
    birthYear: "1980",
    avatar: "/avatar.png",
  },
  {
    key: "deputy",
    role: "Phó Chỉ huy trưởng",
    name: "Trần Nguyên Thiên Vũ",
    birthYear: "1982",
    avatar: "/avatar.png",
  },
  {
    key: "staff-1",
    role: "Nhân viên Tài Chính",
    name: "Trịnh Lê Hoàng Thiện",
    birthYear: "1985",
    avatar: "/avatar.png",
  },
  {
    key: "staff-2",
    role: "Trợ lý tác huấn",
    name: "Phạm Tuấn Anh",
    birthYear: "1982",
    avatar: "/avatar.png",
  },
  {
    key: "staff-3",
    role: "Trợ lý tác huấn",
    name: "Tô Đại Quân",
    birthYear: "1982",
    avatar: "/avatar.png",
  },
  {
    key: "staff-4",
    role: "Nhân viên Văn thư",
    name: "Nguyễn Đình Quyết",
    birthYear: "1982",
    avatar: "/avatar.png",
  },
  {
    key: "staff-4",
    role: "Nhân viên Tài Chính",
    name: "Trịnh Lê Hoàng Thiện",
    birthYear: "1982",
    avatar: "/avatar.png",
  },
  ...orgStructure.staff.map((role, index) => ({
    key: `staff-${index}`,
    role: "Trợ lý chính trị",
    name: "Nguyễn Minh Mẫn",
    birthYear: "1982",
    avatar: "/avatar.png",
  })),
];

const gallery = [
  "https://pub-961ac25df80d4464a675ea2d2ab13fca.r2.dev/657384672_122233447880299127_3630868676577276621_n.jpg",
  "https://pub-961ac25df80d4464a675ea2d2ab13fca.r2.dev/659061717_122233585604299127_4180254085442966083_n.jpg",
  "https://pub-961ac25df80d4464a675ea2d2ab13fca.r2.dev/659068328_122233585634299127_5177616002567179234_n.jpg",
  "https://pub-961ac25df80d4464a675ea2d2ab13fca.r2.dev/726432718_1637201698407807_216307910014399435_n.jpg",
  "https://pub-961ac25df80d4464a675ea2d2ab13fca.r2.dev/730153370_1067321755855663_6041617414379282812_n.jpg",
  "https://pub-961ac25df80d4464a675ea2d2ab13fca.r2.dev/image.638954679614745823.png",
];

export default function GioiThieuPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);

  const OrgNode = ({
    member,
    variant = "green",
  }: {
    member: any;
    variant?: "green" | "white";
  }) => (
    <button
      type="button"
      onClick={() => setSelectedMember(member)}
      className={
        variant === "green"
          ? "w-full min-h-[60px] bg-[#546a2f] text-white rounded-xl px-6 py-4 text-center shadow-md hover:scale-[1.02] transition"
          : "w-full min-h-[60px] bg-white border-2 border-[#546a2f]/30 rounded-xl px-2 py-3 text-center shadow-sm hover:border-[#546a2f] hover:shadow-md transition-all flex items-center justify-center"
      }
    >
      <div
        className={
          variant === "green"
            ? "font-bold text-base"
            : "text-xs font-medium text-gray-700 leading-snug"
        }
      >
        {member.role}
      </div>
    </button>
  );

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
          {/* <p className="text-2xl md:text-3xl font-bold text-yellow-300">
            "Đoàn Kết — Kỷ Cương — Quyết Thắng"
          </p> */}
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
                Ban Chỉ huy Quân sự Phường Bình Phú là cơ quan quân sự địa
                phương cấp phường, đặt dưới sự lãnh đạo, chỉ đạo trực tiếp của
                Đảng ủy, Ủy ban nhân dân Phường Bình Phú và sự chỉ đạo nghiệp vụ
                của cơ quan quân sự cấp trên.
              </p>
              <p>
                Đơn vị có chức năng tham mưu cho cấp ủy, chính quyền địa phương
                về công tác quốc phòng, quân sự; trực tiếp quản lý nhà nước về
                quốc phòng trên địa bàn phường, đảm bảo an ninh, trật tự và sẵn
                sàng chiến đấu khi có yêu cầu.
              </p>
              <p>Các nhiệm vụ trọng tâm của đơn vị bao gồm:</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="bg-[#546a2f]/5 border border-[#546a2f]/20 rounded-xl p-5">
                {/* <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-[#546a2f]" />
                  <h3 className="font-bold text-[#546a2f]">Sứ Mệnh</h3>
                </div> */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  Xây dựng, quản lý và huấn luyện lực lượng dân quân tự vệ trên
                  địa bàn phường
                </p>
              </div>
              <div className="bg-[#546a2f]/5 border border-[#546a2f]/20 rounded-xl p-5">
                {/* <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-5 h-5 text-yellow-300" />
                  <h3 className="font-bold text-gray-700">Tầm Nhìn</h3>
                </div> */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  Tổ chức công tác tuyển chọn, gọi công dân nhập ngũ hằng năm
                </p>
              </div>
              <div className="bg-[#546a2f]/5 border border-[#546a2f]/20 rounded-xl p-5">
                {/* <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-5 h-5 text-yellow-300" />
                  <h3 className="font-bold text-gray-700">Tầm Nhìn</h3>
                </div> */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  Quản lý lực lượng quân nhân dự bị theo quy định
                </p>
              </div>
              <div className="bg-[#546a2f]/5 border border-[#546a2f]/20 rounded-xl p-5">
                {/* <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-5 h-5 text-yellow-300" />
                  <h3 className="font-bold text-gray-700">Tầm Nhìn</h3>
                </div> */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  Phối hợp thực hiện nhiệm vụ bảo vệ an ninh, trật tự an toàn xã
                  hội trên địa bàn
                </p>
              </div>

              <div className="bg-yellow-300/5 border border-yellow-300/30 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <BadgeCheck className="w-5 h-5 text-[#546a2f]" />
                  <h3 className="font-bold text-[#546a2f]">Vai Trò</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Ban Chỉ huy Quân sự Phường Bình Phú là lực lượng nòng cốt
                  trong xây dựng nền quốc phòng toàn dân tại địa phương, giữ vai
                  trò trung tâm trong công tác quân sự, quốc phòng trên địa bàn
                  phường, đồng thời là cầu nối giữa lực lượng vũ trang nhân dân
                  với cấp ủy, chính quyền và nhân dân địa phương.
                </p>
              </div>

              <div className="bg-yellow-300/5 border border-yellow-300/30 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ClipboardCheck className="w-5 h-5 text-yellow-300" />
                  <h3 className="font-bold text-gray-700">Trách Nhiệm</h3>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Đơn vị có trách nhiệm bảo vệ vững chắc an ninh chính trị, trật
                  tự an toàn xã hội trên địa bàn phường; xây dựng lực lượng dân
                  quân tự vệ vững mạnh toàn diện cả về số lượng và chất lượng;
                  duy trì khả năng sẵn sàng chiến đấu, sẵn sàng huy động khi có
                  yêu cầu của cấp trên hoặc tình huống đột xuất tại địa bàn;
                  thực hiện đầy đủ, kịp thời các nhiệm vụ quốc phòng – quân sự
                  được cấp ủy, chính quyền địa phương giao.
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
              <div className="sm:col-span-2 bg-[#546a2f]/10 rounded-xl h-66 flex items-center justify-center text-[#546a2f]/30 relative">
                <Image
                  src="https://pub-961ac25df80d4464a675ea2d2ab13fca.r2.dev/banner-image%20(1)%20(1)%20(1).png"
                  alt="Lịch sử BCH Quân Sự Phường Bình Phú"
                  fill
                />
              </div>
              <div className="sm:col-span-3 space-y-3 text-sm text-gray-600 leading-relaxed">
                <p>
                  Ban Chỉ huy Quân sự Phường Bình Phú được thành lập theo Nghị
                  quyết số 1685/NQ-UBTVQH15 của Ủy ban Thường vụ Quốc hội, trên
                  cơ sở sáp nhập Phường 10, Phường 11 (Quận 6) và một phần
                  Phường 16 (Quận 8), chính thức đi vào hoạt động từ ngày
                  01/7/2025.
                </p>
                <p>
                  Tuy mới được thành lập với địa giới hành chính hiện tại, đơn
                  vị kế thừa truyền thống xây dựng và bảo vệ địa bàn của lực
                  lượng dân quân tự vệ các phường tiền thân, đã nhiều năm gắn
                  bó, đồng hành cùng nhân dân trong công tác quốc phòng – an
                  ninh tại địa phương.
                </p>
                <p>
                  Từ khi thành lập đến nay, đơn vị tập trung ổn định tổ chức,
                  kiện toàn lực lượng và từng bước hiện đại hóa công tác quản
                  lý, hướng đến mục tiêu xây dựng một đơn vị dân quân tự vệ vững
                  mạnh toàn diện, đáp ứng yêu cầu nhiệm vụ trong giai đoạn mới.
                </p>
              </div>
            </div>
          </div>

          {/* Cơ cấu tổ chức */}
          <div>
            <h2 className="text-2xl font-bold text-[#546a2f] mb-6 flex items-center gap-2">
              <span className="w-1 h-7 bg-yellow-300 rounded-full" />
              Cơ Cấu Tổ Chức Hiện Nay
            </h2>

            <div className="w-full">
              {/* Cấp 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-5  w-full">
                <div className="sm:col-start-1">
                  {/* <div className="h-full bg-[#546a2f] text-white rounded-xl px-6 py-4 text-center shadow-md">
                    <div className="font-bold text-base">
                      {orgStructure.pol}
                    </div>
                  </div> */}
                  <OrgNode member={orgMembers.find((m) => m.key === "pol")} />
                </div>

                <div className="hidden sm:flex items-center">
                  <div className="w-full h-0.5 bg-[#546a2f]/40" />
                </div>

                <div className="sm:col-start-3">
                  {/* <div className="h-full bg-[#546a2f] text-white rounded-xl px-6 py-4 text-center shadow-md">
                    <div className="font-bold text-base">
                      {orgStructure.commander}
                    </div>
                  </div> */}
                  <OrgNode
                    member={orgMembers.find((m) => m.key === "commander")}
                  />
                </div>
              </div>

              {/* Line từ cấp 1 xuống cấp 2 */}
              <div className="hidden sm:grid grid-cols-5 gap-x-4 w-full">
                <div className="flex justify-center">
                  <div className="w-0.5 h-6 bg-[#546a2f]/40" />
                </div>

                <div />

                <div className="flex justify-center">
                  <div className="w-0.5 h-6 bg-[#546a2f]/40" />
                </div>
              </div>

              {/* Cấp 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-5 w-full">
                <div className="sm:col-start-1">
                  {/* <div className="h-full bg-[#546a2f] text-white rounded-xl px-6 py-4 text-center shadow-md">
                    <div className="font-bold text-base">
                      {orgStructure.deputyPol}
                    </div>
                  </div> */}
                  <OrgNode
                    member={orgMembers.find((m) => m.key === "deputyPol")}
                  />
                </div>

                <div className="hidden sm:flex items-center">
                  <div className="w-full h-0.5 bg-[#546a2f]/40" />
                </div>

                <div className="sm:col-start-3">
                  {/* <div className="h-full bg-[#546a2f] text-white rounded-xl px-6 py-4 text-center shadow-md">
                    <div className="font-bold text-base">
                      {orgStructure.deputy}
                    </div>
                  </div> */}
                  <OrgNode
                    member={orgMembers.find((m) => m.key === "deputy")}
                  />
                </div>
              </div>

              {/* Line từ cấp 2 xuống staff */}
              <div className="hidden sm:grid grid-cols-5 gap-x-4 w-full">
                <div className="flex justify-center">
                  <div className="w-0.5 h-12 bg-[#546a2f]/40" />
                </div>

                <div />

                <div className="flex justify-center">
                  <div className="w-0.5 h-4 bg-[#546a2f]/40" />
                </div>
              </div>

              {/* Cấp 3 */}
              <div className="w-full -mt-8">
                {/* Line nối staff */}
                <div className="hidden sm:grid grid-cols-5 gap-x-2 w-full">
                  <div />

                  <div className="col-start-2 col-span-4 relative h-8">
                    <div className="absolute top-0 left-[12.5%] right-[12.5%] h-0.5 bg-[#546a2f]/40" />

                    <div className="grid grid-cols-4 h-full">
                      {orgStructure.staff.slice(1).map((_, i) => (
                        <div key={i} className="flex justify-center">
                          <div className="w-0.5 h-8 bg-[#546a2f]/40" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-x-2 gap-y-3 w-full">
                  {/* {orgStructure.staff.map((s, i) => (
                    <div key={i} className="flex">
                      <div className="w-full min-h-[60px] bg-white border-2 border-[#546a2f]/30 rounded-xl px-2 py-3 text-center shadow-sm hover:border-[#546a2f] hover:shadow-md transition-all flex items-center justify-center">
                        <div className="text-xs font-medium text-gray-700 leading-snug">
                          {s}
                        </div>
                      </div>
                    </div>
                  ))} */}
                  {orgStructure.staff.map((s, i) => {
                    const member = orgMembers.find(
                      (m) => m.key === `staff-${i}`,
                    );

                    return (
                      <div key={i} className="flex">
                        <OrgNode member={member} variant="white" />
                      </div>
                    );
                  })}
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
                  onClick={() => setSelectedImage(label)}
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
        </aside>
      </section>
      <ImgPopup
        imageUrl={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
      <OrgMemberPopUp
        selectedMember={selectedMember}
        setSelectedMember={setSelectedMember}
      />
    </>
  );
}
