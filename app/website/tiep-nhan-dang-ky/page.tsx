"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type PublicRegistration,
  type PublicRegistrationPayload,
  type RegistrationCategory,
  type RegistrationFormTemplate,
  websiteRegistrationAPI,
} from "@/services/api/website-registration";

const categories: Array<{
  value: RegistrationCategory;
  shortLabel: string;
  label: string;
  title: string;
  subtitle: string;
}> = [
  {
    value: "tsqs",
    shortLabel: "TSQS",
    label: "Tuyển sinh quân sự (TSQS)",
    title: "Tuyển sinh quân sự (TSQS)",
    subtitle: "Đăng ký sơ bộ nguyện vọng và tải biểu mẫu chuẩn bị hồ sơ.",
  },
  {
    value: "tuoi17",
    shortLabel: "Tuổi 17",
    label: "Đăng ký quân lý NVQS lần đầu (tuổi 17)",
    title: "Đăng ký NVQS lần đầu (tuổi 17)",
    subtitle:
      "Cung cấp thông tin ban đầu để Ban CHQS phường liên hệ hướng dẫn.",
  },
  {
    value: "tinhnguyen",
    shortLabel: "Tình nguyện",
    label: "Tình nguyện tham gia NVQS",
    title: "Tình nguyện tham gia NVQS",
    subtitle: "Gửi thông tin tình nguyện tham gia nghĩa vụ quân sự.",
  },
  {
    value: "dqtt",
    shortLabel: "DQTT",
    label: "Đăng ký tham gia DQTT",
    title: "Đăng ký tham gia DQTT",
    subtitle: "Đăng ký nhu cầu tham gia lực lượng dân quân thường trực.",
  },
  {
    value: "doituongchinhsach",
    shortLabel: "ĐTCS",
    label: "Đối tượng chính sách",
    title: "Đối tượng chính sách",
    subtitle: "Đăng ký thông tin đối tượng chính sách để được hỗ trợ.",
  },
  {
    value: "siquandubi",
    shortLabel: "SQDB",
    label: "Đăng ký đào tạo sĩ quan dự bị",
    title: "Đăng ký đào tạo sĩ quan dự bị",
    subtitle: "Đăng ký nguyện vọng tham gia đào tạo sĩ quan dự bị.",
  },
];

type FormState = Omit<
  PublicRegistrationPayload,
  "category" | "captcha_token" | "address"
> & {
  permanent_address: string;
  temporary_address: string;
  training_system: "cao_dang_dai_hoc" | "thieu_sinh_quan" | "";
};

const heOptions = [
  { value: "cdh", label: "Cao đẳng đại học" },
  { value: "tsq", label: "Thiếu sinh quân" },
] as const;
type FormErrors = Partial<Record<keyof FormState | "captcha", string>>;

const skeletonRows = [
  "form-skeleton-1",
  "form-skeleton-2",
  "form-skeleton-3",
  "form-skeleton-4",
];

const emptyForm: FormState = {
  full_name: "",
  phone: "",
  permanent_address: "",
  temporary_address: "",
  dob: "",
  workplace: "",
  guardian_phone: "",
  training_system: 'cao_dang_dai_hoc',
};

const phoneRegex = /^0\d{9}$/;

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
};

function validateForm(
  form: FormState,
  captchaToken: string | null,
  category: RegistrationCategory,
) {
  const errors: FormErrors = {};
  if (!form.full_name.trim()) errors.full_name = "Vui lòng nhập họ và tên.";
  if (!phoneRegex.test(form.phone))
    errors.phone = "Số điện thoại gồm 10 chữ số và bắt đầu bằng 0.";
  if (!form.permanent_address.trim())
    errors.permanent_address = "Vui lòng nhập địa chỉ thường trú.";
  if (!form.dob) {
    errors.dob = "Vui lòng chọn ngày sinh.";
  } else if (new Date(form.dob) >= new Date()) {
    errors.dob = "Ngày sinh phải nhỏ hơn ngày hiện tại.";
  }
  if (!form.workplace.trim())
    errors.workplace = "Vui lòng nhập nơi học tập hoặc làm việc.";
  if (!phoneRegex.test(form.guardian_phone)) {
    errors.guardian_phone =
      "Số điện thoại người thân gồm 10 chữ số và bắt đầu bằng 0.";
  }
  if (category === "tsqs" && !form.training_system)
    errors.training_system = "Vui lòng chọn hệ đào tạo.";
  if (!captchaToken)
    errors.captcha = "Vui lòng xác nhận captcha trước khi gửi.";
  return errors;
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-600"
      >
        {label} {required ? <span className="text-red-500">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}

function FormList({
  forms,
  loading,
}: {
  forms: RegistrationFormTemplate[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {skeletonRows.map((key) => (
          <div
            key={key}
            className="rounded-lg border border-gray-100 bg-white p-3"
          >
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="mt-2 h-3 w-full" />
            <Skeleton className="mt-3 h-8 w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {forms.map((form) => (
        <div
          key={form.id}
          className="flex min-h-24 items-center gap-3 rounded-lg border border-gray-200 bg-white p-3"
        >
          <div
            className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-md ${
              form.fileType === "PDF"
                ? "bg-red-50 text-red-600"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            <FileText className="h-5 w-5" />
            <span className="text-[10px] font-bold">{form.fileType}</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold leading-snug text-gray-800">
              {form.title}
            </h3>
            <p className="mt-1 line-clamp-2 text-xs text-gray-500">
              {form.description}
            </p>
            <p className="mt-1 text-xs text-gray-400">{form.fileSize}</p>
          </div>
          <a
            href={form.fileUrl}
            download
            className="inline-flex h-8 shrink-0 items-center gap-1 rounded bg-[#546a2f] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#3d5020]"
            onClick={(e) => e.stopPropagation()}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Download className="h-3.5 w-3.5" />
            Tải xuống
          </a>
        </div>
      ))}
    </div>
  );
}

export default function RegistrationPage() {
  const [category, setCategory] = useState<RegistrationCategory>("tsqs");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [forms, setForms] = useState<RegistrationFormTemplate[]>([]);
  const [formsLoading, setFormsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<PublicRegistration | null>(null);

  const activeCategory = useMemo(
    () => categories.find((item) => item.value === category) ?? categories[0],
    [category],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextCategory = params.get("category") as RegistrationCategory | null;
    if (
      nextCategory &&
      categories.some((item) => item.value === nextCategory)
    ) {
      setCategory(nextCategory);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    setFormsLoading(true);
    websiteRegistrationAPI
      .getForms(category)
      .then((data) => {
        if (mounted) setForms(data);
      })
      .catch(() => {
        if (mounted) {
          setForms([]);
          toast.error("Không thể tải danh sách biểu mẫu. Vui lòng thử lại.");
        }
      })
      .finally(() => {
        if (mounted) setFormsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [category]);

  const switchCategory = (nextCategory: RegistrationCategory) => {
    setCategory(nextCategory);
    setForm(emptyForm);
    setErrors({});
    setSuccess(null);
    window.history.replaceState(
      null,
      "",
      `/website/tiep-nhan-dang-ky?category=${nextCategory}`,
    );
  };

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setCaptchaToken(null);
    recaptchaRef.current?.reset();
    setErrors({});
    setSuccess(null);
    setCategory("tsqs");
    window.history.replaceState(null, "", "/website/tiep-nhan-dang-ky");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateForm(form, captchaToken, category);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error(
        nextErrors.captcha ?? "Vui lòng kiểm tra lại các trường bắt buộc.",
      );
      return;
    }

    setSubmitting(true);
    try {
      const { permanent_address, temporary_address, training_system, ...rest } = form;

      const payload: PublicRegistrationPayload = {
        category,
        ...rest,
        address: permanent_address.trim(),
        temporary_address: temporary_address.trim(),
        ...(category === "tsqs" && training_system
          ? { training_system }
          : {}),
        captcha_token: captchaToken as string,
      };
      const created = await websiteRegistrationAPI.createRegistration(payload);
      setSuccess(created);
      setCaptchaToken(null);
      recaptchaRef.current?.reset();
      toast.success("Đã gửi hồ sơ đăng ký thành công.");
    } catch (error) {
      recaptchaRef.current?.reset();
      setCaptchaToken(null);
      toast.error(
        error instanceof Error
          ? error.message
          : "Gửi hồ sơ thất bại. Vui lòng thử lại.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="bg-[#3d5020] text-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <nav className="flex items-center gap-2 text-xs text-white/65">
            <Link href="/website" className="hover:text-white">
              Trang chủ
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span>Tiếp nhận đăng ký</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-[#ffb300]">{activeCategory.shortLabel}</span>
          </nav>
          <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
            Tiếp Nhận Đăng Ký
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/75">
            Điền thông tin trực tuyến, tải biểu mẫu cần thiết và chờ Ban CHQS
            phường liên hệ hướng dẫn bước tiếp theo.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-[290px_1fr]">
        <aside className="space-y-4">
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 bg-[#546a2f] px-4 py-3 text-white">
              <ShieldCheck className="h-4 w-4 text-[#ffb300]" />
              <span className="text-sm font-bold">Danh mục đăng ký</span>
            </div>
            <div className="divide-y divide-gray-100">
              {categories.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => switchCategory(item.value)}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${
                    category === item.value
                      ? "bg-[#ffb300] font-semibold text-[#3d5020]"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-[#546a2f] p-4 text-white shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-[#ffb300]" />
              <h2 className="text-sm font-bold">Lưu ý quan trọng</h2>
            </div>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-white/85">
              <li>Thông tin gửi online chỉ là bước tiếp nhận ban đầu.</li>
              <li>
                Chuẩn bị bản giấy theo danh sách biểu mẫu trước khi được hẹn.
              </li>
              <li>Mang theo CCCD/CMND khi đến Ban CHQS phường.</li>
            </ul>
          </div>
        </aside>

        <div className="space-y-6">
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex items-start gap-3 bg-[#546a2f] px-5 py-4 text-white">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ffb300] text-[#3d5020]">
                {success ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <UserRound className="h-5 w-5" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold">{activeCategory.title}</h2>
                <p className="text-xs text-white/75">
                  {activeCategory.subtitle}
                </p>
              </div>
            </div>

            {success ? (
              <div className="p-5">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0" />
                    <div>
                      <h3 className="font-bold">
                        Bạn đã gửi đăng ký thành công
                      </h3>
                      <p className="mt-1 text-sm">
                        Cán bộ Ban CHQS phường sẽ liên hệ xác minh và hướng dẫn
                        chuẩn bị hồ sơ trong thời gian sớm nhất.
                      </p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-md border border-emerald-200 bg-white p-3">
                          <p className="text-xs text-emerald-700">
                            Cán bộ phụ trách TSQS
                          </p>
                          <p className="font-semibold text-gray-800">
                            Thượng úy Nguyễn Minh Tân
                          </p>
                          <p className="text-sm font-semibold text-[#546a2f]">
                            0901 234 567
                          </p>
                        </div>
                        <div className="rounded-md border border-emerald-200 bg-white p-3">
                          <p className="text-xs text-emerald-700">
                            Cán bộ quân lực
                          </p>
                          <p className="font-semibold text-gray-800">
                            Trung úy Lê Văn Hưng
                          </p>
                          <p className="text-sm font-semibold text-[#546a2f]">
                            0909 876 543
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-base font-bold text-gray-800">
                    Biểu mẫu cần tải trước khi gặp cán bộ
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Hồ sơ mã {success.id}, ngày gửi{" "}
                    {formatDate(success.created_at)}. Tải và điền các biểu mẫu
                    bên dưới.
                  </p>
                  <div className="mt-4">
                    <FormList forms={forms} loading={formsLoading} />
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex h-9 items-center gap-2 rounded bg-[#ffb300] px-4 text-sm font-bold text-[#3d5020] hover:bg-yellow-400"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Đăng ký mới
                  </button>
                  <Link
                    href="/website"
                    className="inline-flex h-9 items-center gap-2 rounded border border-gray-200 px-4 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Về trang chủ
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <Field
                    id="full_name"
                    label="Họ và tên"
                    required
                    error={errors.full_name}
                  >
                    <input
                      id="full_name"
                      value={form.full_name}
                      onChange={(event) =>
                        updateField("full_name", event.target.value)
                      }
                      placeholder="Ví dụ: Nguyễn Văn A"
                      className={`h-10 w-full rounded border px-3 text-sm outline-none focus:border-[#546a2f] ${
                        errors.full_name
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200"
                      }`}
                    />
                  </Field>
                  <Field
                    id="dob"
                    label="Ngày tháng năm sinh"
                    required
                    error={errors.dob}
                  >
                    <input
                      id="dob"
                      type="date"
                      value={form.dob}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(event) =>
                        updateField("dob", event.target.value)
                      }
                      className={`h-10 w-full rounded border px-3 text-sm outline-none focus:border-[#546a2f] ${
                        errors.dob
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200"
                      }`}
                    />
                  </Field>
                  <Field
                    id="phone"
                    label="Số điện thoại"
                    required
                    error={errors.phone}
                  >
                    <input
                      id="phone"
                      value={form.phone}
                      onChange={(event) =>
                        updateField("phone", event.target.value)
                      }
                      placeholder="Ví dụ: 0901234567"
                      className={`h-10 w-full rounded border px-3 text-sm outline-none focus:border-[#546a2f] ${
                        errors.phone
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200"
                      }`}
                    />
                  </Field>
                  <Field
                    id="guardian_phone"
                    label="Số điện thoại người thân"
                    required
                    error={errors.guardian_phone}
                  >
                    <input
                      id="guardian_phone"
                      value={form.guardian_phone}
                      onChange={(event) =>
                        updateField("guardian_phone", event.target.value)
                      }
                      placeholder="Ví dụ: 0912345678"
                      className={`h-10 w-full rounded border px-3 text-sm outline-none focus:border-[#546a2f] ${
                        errors.guardian_phone
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200"
                      }`}
                    />
                  </Field>
                  <Field
                    id="permanent_address"
                    label="Địa chỉ thường trú"
                    required
                    error={errors.permanent_address}
                  >
                    <input
                      id="permanent_address"
                      value={form.permanent_address}
                      onChange={(event) =>
                        updateField("permanent_address", event.target.value)
                      }
                      placeholder="Số nhà, đường, phường, tỉnh/thành phố"
                      className={`h-10 w-full rounded border px-3 text-sm outline-none focus:border-[#546a2f] ${
                        errors.permanent_address
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200"
                      }`}
                    />
                  </Field>
                  <Field
                    id="temporary_address"
                    label="Địa chỉ tạm trú"
                    error={errors.temporary_address}
                  >
                    <input
                      id="temporary_address"
                      value={form.temporary_address}
                      onChange={(event) =>
                        updateField("temporary_address", event.target.value)
                      }
                      placeholder="Để trống nếu trùng địa chỉ thường trú"
                      className={`h-10 w-full rounded border px-3 text-sm outline-none focus:border-[#546a2f] ${
                        errors.temporary_address
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200"
                      }`}
                    />
                  </Field>
                  <Field
                    id="workplace"
                    label="Nơi học tập / làm việc"
                    required
                    error={errors.workplace}
                  >
                    <input
                      id="workplace"
                      value={form.workplace}
                      onChange={(event) =>
                        updateField("workplace", event.target.value)
                      }
                      placeholder="Ví dụ: Trường THPT Bình Phú"
                      className={`h-10 w-full rounded border px-3 text-sm outline-none focus:border-[#546a2f] ${
                        errors.workplace
                          ? "border-red-400 bg-red-50"
                          : "border-gray-200"
                      }`}
                    />
                  </Field>
                  {category === "tsqs" ? (
                    <Field
                      id="training_system"
                      label="Hệ đào tạo"
                      required
                      error={errors.training_system}
                    >
                      <select
                        id="training_system"
                        value={form.training_system}
                        onChange={(event) =>
                          updateField("training_system", event.target.value)
                        }
                        className={`h-10 w-full rounded border px-3 text-sm outline-none focus:border-[#546a2f] ${
                          errors.training_system
                            ? "border-red-400 bg-red-50"
                            : "border-gray-200"
                        }`}
                      >
                        <option value="">-- Chọn hệ đào tạo --</option>
                        <option value="cao_dang_dai_hoc">Cao đẳng / Đại học</option>
                        <option value="thieu_sinh_quan">Thiếu sinh quan</option>
                      </select>
                    </Field>
                  ) : null}
                </div>

                <div className="mt-5">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ""}
                    onChange={(token) => {
                      setCaptchaToken(token);
                      setErrors((current) => ({
                        ...current,
                        captcha: undefined,
                      }));
                    }}
                    onExpired={() => setCaptchaToken(null)}
                  />
                  {errors.captcha ? (
                    <p className="mt-1 text-xs font-medium text-red-600">
                      {errors.captcha}
                    </p>
                  ) : null}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-10 items-center gap-2 rounded bg-[#ffb300] px-4 text-sm font-bold text-[#3d5020] transition-colors hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    Gửi đăng ký
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex h-10 items-center rounded border border-gray-200 px-4 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Xóa tất cả
                  </button>
                </div>
              </form>
            )}
          </div>

          {!success ? (
            <div>
              <h2 className="text-base font-bold text-gray-800">
                Tải biểu mẫu trước khi đến nộp hồ sơ
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Có thể tải trước, in và điền các thông tin chưa có sẵn để giảm
                thời gian làm việc trực tiếp tại Ban CHQS.
              </p>
              <div className="mt-4">
                <FormList forms={forms} loading={formsLoading} />
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
