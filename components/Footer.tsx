import Image from "next/image";
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left */}
          <div className="flex items-center gap-4">
            <Image
              src="/img/logo-dqtv.png"
              alt="Logo"
              width={40}
              height={40}
              className="size-12 object-contain"
            />

            <div>
              <p className="font-bold">Phường đội Bình Phú</p>
              <p className="text-sm text-gray-400">
                Ban CHQS phường Bình Phú, TP.HCM
              </p>
            </div>
          </div>

          {/* Right */}
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Hệ thống Quản lý Dân quân
          </p>
        </div>
      </div>
    </footer>
  );
}
