"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export default function AdminLogin() {
  const router = useRouter();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (errors[e.target.name as keyof typeof errors]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: any = {};

        error.issues.forEach((err) => {
          const field = err.path[0];
          fieldErrors[field] = err.message;
        });

        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const res = await login(formData.email, formData.password);

      if (res) {
        router.push("/");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#556B2F] p-6">
      {/* CARD */}
      <div className="w-full max-w-md rounded-2xl bg-white/90 shadow-2xl backdrop-blur-sm p-6">
        <Image
          src="/img/logo-dqtv.png"
          alt="Admin Login"
          width={40}
          height={40}
          className="absolute left-6 top-6 object-contain"
        />

        {/* HEADER */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#556B2F]">Đăng nhập</h2>
          <p className="text-sm text-gray-500">
            Chúc bạn 1 ngày làm việc tốt lành
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              type="text"
              placeholder="Nhập email của bạn"
              value={formData.email}
              onChange={handleChange}
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#556B2F] ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium mb-1">Mật khẩu</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu của bạn"
                value={formData.password}
                onChange={handleChange}
                className={`w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-[#556B2F] ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#556B2F] py-2 text-white font-semibold hover:bg-[#455A1A] transition"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </div>
    </div>
  );
}
