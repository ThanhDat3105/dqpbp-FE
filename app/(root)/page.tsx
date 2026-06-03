import Footer from "@/components/Footer";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="bg-linear-to-br from-[#3d4f22] via-[#556B2F] to-[#6B8E23] flex-1 flex flex-col -mx-2 -mt-2 md:-mx-6 md:-mt-6 -mb-6">
      {/* HERO */}
      <section className="flex-1 flex flex-col items-center justify-center text-white min-h-[80vh] px-6 py-20">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          {/* Logo */}
          <div className="w-28 h-28 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-8 ring-4 ring-white/20 shadow-xl">
            <Image
              src="/img/logo-dqtv.png"
              alt="Logo Dân Quân Tự Vệ"
              width={80}
              height={80}
              className="object-contain"
              unoptimized
            />
          </div>

          {/* Label */}
          <span className="px-3 py-1 bg-white/15 rounded-full text-xs font-semibold uppercase tracking-widest text-white/80">
            Ban CHQS Phường Bình Phú
          </span>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-black mt-5 leading-tight tracking-tight">
            Hệ thống Quản lý <br />
            <span className="text-yellow-300">Dân quân Tự vệ</span>
          </h1>
        </div>
      </section>

      <Footer />
    </div>
  );
}
