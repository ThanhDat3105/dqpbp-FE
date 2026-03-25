"use client";
import Link from "next/link";
import PasswordIcon from "@mui/icons-material/Password";
import PersonIcon from "@mui/icons-material/Person";
export default function LoginPage() {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-gray-100">
      {/* LEFT */}
      <div className="hidden md:flex flex-col justify-center items-center bg-linear-to-br from-[#556B2F] via-[#6B8E23] to-[#8B4513] text-white p-10">
        <img src="/img/logo-dqtv.png" className="w-24 mb-6" />

        <h1 className="text-3xl font-bold mb-4 text-center">
          Hệ thống Quản lý Dân quân
        </h1>

        <p className="text-white/80 text-center max-w-sm">
          Quản lý kế hoạch, lịch trực và nhiệm vụ một cách hiệu quả.
        </p>
      </div>

      {/* RIGHT */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border">
          <h2 className="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>

          <input
            type="text"
            placeholder="Tên đăng nhập"
            className="w-full mb-4 p-3 border rounded-lg focus:ring-2 focus:ring-olive"
          />

          <input
            type="password"
            placeholder="Mật khẩu"
            className="w-full mb-4 p-3 border rounded-lg focus:ring-2 focus:ring-olive"
          />

          <button className="w-full bg-blue-500 cursor-pointer hover:bg-blue-200 text-white py-3 rounded-lg font-semibold hover:bg-olive/90 transition">
            Đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}
