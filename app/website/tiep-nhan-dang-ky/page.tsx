"use client";

import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  ShieldCheck,
  UserRound,
  CheckCircle,
  ArrowLeft,
  Save,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
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
import {
  militaryCvApi,
  type MilitaryCvCreatePayload,
  type MilitaryCvPeriod,
  type MilitaryCvRelative,
  type MilitaryCvRecord,
} from "@/services/api/military-cv";
import { PhotoUploader } from "@/components/photoUploader/photoUploader";

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
  {
    value: "khamsuckhoenghiavuquansu",
    shortLabel: "KSK",
    label: "Tờ khai khám sức khỏe nghĩa vụ quân sự",
    title: "Tờ khai khám sức khỏe nghĩa vụ quân sự",
    subtitle: "Tờ khai khám sức khỏe để xét nghĩa vụ quân sự.",
  },
];

type FormState = Omit<
  PublicRegistrationPayload,
  "category" | "captcha_token" | "address"
> & {
  permanent_address: string;
  temporary_address: string;
  id_no: string;
  military_cv: MilitaryCvCreatePayload;
  spouse_enabled: boolean;
  training_system: "cao_dang_dai_hoc" | "thieu_sinh_quan" | "";
};

type FormErrors = Partial<
  Record<keyof FormState | "captcha" | "family_counts", string>
>;

const skeletonRows = [
  "form-skeleton-1",
  "form-skeleton-2",
  "form-skeleton-3",
  "form-skeleton-4",
];

const emptyRelative = {
  name: "",
  alive: true,
  dob: "",
  job: "",
  addr: "",
  label: "",
  gender: "",
  adopted: null,
  econ: "",
  politics: "",
} as const;

const emptyMilitaryCv: MilitaryCvCreatePayload = {
  full_name: "",
  dob: "",
  id_no: "",
  photo: "",
  profile: {
    gender: "",
    pob: "",
    hometown: "",
    ethnicity: "Kinh",
    religion: "Không",
    nationality: "Việt Nam",
    home_addr: "",
    curr_addr: "",
    family_class: "",
    self_class: "",
    edu_level: "",
    degree: "",
    language: "",
    major: "",
    party_date: "",
    party_full: "",
    union_date: "",
    reward: "Chưa",
    discipline: "Chưa",
    job: "",
    salary: "",
    grade: "",
    step: "",
    workplace: "",
    overseas: "Không",
  },
  family: {
    sibling_count: 0,
    son_count: 0,
    daughter_count: 0,
    birth_order: 0,
    child_count: 0,
    father: { ...emptyRelative, gender: "nam" },
    mother: { ...emptyRelative, gender: "nu" },
    spouse: { ...emptyRelative },
    siblings: [],
    children: [],
  },
  history: {
    politics: "",
    periods: [],
  },
  reviews: null,
};

const emptyForm: FormState = {
  full_name: "",
  phone: "",
  permanent_address: "",
  temporary_address: "",
  id_no: "",
  military_cv: emptyMilitaryCv,
  spouse_enabled: false,
  dob: "",
  workplace: "",
  guardian_phone: "",
  training_system: "cao_dang_dai_hoc",
};

const phoneRegex = /^0\d{9}$/;

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
};

const nullableDate = (value: string | null | undefined) =>
  value?.trim() ? value : null;

const normalizeMilitaryCvDates = (
  payload: MilitaryCvCreatePayload,
): MilitaryCvCreatePayload => ({
  ...payload,
  profile: payload.profile
    ? {
        ...payload.profile,
        party_date: nullableDate(payload.profile.party_date),
        party_full: nullableDate(payload.profile.party_full),
        union_date: nullableDate(payload.profile.union_date),
      }
    : payload.profile,
  family: payload.family
    ? {
        ...payload.family,
        father: payload.family.father
          ? {
              ...payload.family.father,
              dob: nullableDate(payload.family.father.dob),
            }
          : payload.family.father,
        mother: payload.family.mother
          ? {
              ...payload.family.mother,
              dob: nullableDate(payload.family.mother.dob),
            }
          : payload.family.mother,
        spouse: payload.family.spouse
          ? {
              ...payload.family.spouse,
              dob: nullableDate(payload.family.spouse.dob),
            }
          : payload.family.spouse,
        siblings: payload.family.siblings?.map((relative) => ({
          ...relative,
          dob: nullableDate(relative.dob),
        })),
        children: payload.family.children?.map((relative) => ({
          ...relative,
          dob: nullableDate(relative.dob),
        })),
      }
    : payload.family,
});

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
  if (category === "khamsuckhoenghiavuquansu" && !/^\d{12}$/.test(form.id_no)) {
    errors.id_no = "Số CCCD gồm đúng 12 chữ số.";
  }
  if (!form.dob) {
    errors.dob = "Vui lòng chọn ngày sinh.";
  } else if (new Date(form.dob) >= new Date()) {
    errors.dob = "Ngày sinh phải nhỏ hơn ngày hiện tại.";
  }
  if (!form.workplace.trim())
    errors.workplace = "Vui lòng nhập nơi học tập hoặc làm việc.";
  if (
    category !== "khamsuckhoenghiavuquansu" &&
    !phoneRegex.test(form.guardian_phone)
  ) {
    errors.guardian_phone =
      "Số điện thoại người thân gồm 10 chữ số và bắt đầu bằng 0.";
  }
  if (category === "tsqs" && !form.training_system)
    errors.training_system = "Vui lòng chọn hệ đào tạo.";
  if (
    category === "khamsuckhoenghiavuquansu" &&
    Number(form.military_cv.family.son_count ?? 0) +
      Number(form.military_cv.family.daughter_count ?? 0) !==
      Number(form.military_cv.family.sibling_count ?? 0)
  ) {
    errors.family_counts =
      "Số anh/em trai + số chị/em gái phải bằng tổng số anh chị em.";
  }
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

type MilitaryCvProfileState = NonNullable<MilitaryCvCreatePayload["profile"]>;
type MilitaryCvFamilyState = NonNullable<MilitaryCvCreatePayload["family"]>;
type MilitaryCvRelativeState = NonNullable<MilitaryCvFamilyState["father"]>;

function CvInput({
  id,
  label,
  value,
  onChange,
  placeholder = "",
  required = true,
  type = "text",
}: {
  id: string;
  label: string;
  value: string | number;
  placeholder?: string;
  onChange: (value: string) => void;
  type?: "text" | "date" | "number";
  required?: boolean;
}) {
  return (
    <Field id={id} label={label} required>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded border border-gray-200 px-3 text-sm outline-none focus:border-[#546a2f]"
      />
    </Field>
  );
}

function CvSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <Field id={id} label={label} required>
      <select
        id={id}
        value={value}
        required
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded border border-gray-200 px-3 text-sm outline-none focus:border-[#546a2f]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function KskCvFields({
  value,
  onChange,
  spouseEnabled,
  onSpouseEnabledChange,
  familyCountError,
}: {
  value: MilitaryCvCreatePayload;
  onChange: (value: MilitaryCvCreatePayload) => void;
  spouseEnabled: boolean;
  onSpouseEnabledChange: (enabled: boolean) => void;
  familyCountError?: string;
}) {
  const profile = value.profile as MilitaryCvProfileState;
  const family = value.family as MilitaryCvFamilyState;
  const history = value.history as NonNullable<
    MilitaryCvCreatePayload["history"]
  >;

  const updateProfile = (field: keyof MilitaryCvProfileState, next: string) =>
    onChange({ ...value, profile: { ...profile, [field]: next } });

  const updateFamily = (
    field: keyof MilitaryCvFamilyState,
    next: string | number,
  ) => {
    const nextFamily = { ...family, [field]: next };
    const siblingCount = Math.max(0, Number(nextFamily.sibling_count) || 0);
    const sonCount = Math.max(0, Number(nextFamily.son_count) || 0);
    const daughterCount = Math.max(0, Number(nextFamily.daughter_count) || 0);
    const childCount = Math.max(0, Number(nextFamily.child_count) || 0);

    const siblings: MilitaryCvRelative[] = Array.from(
      { length: siblingCount },
      (_, index) => ({
        ...(family.siblings?.[index] ?? emptyRelative),
        gender:
          index < sonCount
            ? "nam"
            : index < sonCount + daughterCount
              ? "nu"
              : "",
      }),
    );
    const children: MilitaryCvRelative[] = Array.from(
      { length: childCount },
      (_, index) => ({
        ...(family.children?.[index] ?? emptyRelative),
      }),
    );

    onChange({
      ...value,
      family: {
        ...nextFamily,
        sibling_count: siblingCount,
        son_count: sonCount,
        daughter_count: daughterCount,
        child_count: childCount,
        siblings,
        children,
      },
    });
  };

  const updateRelative = (
    relation: "father" | "mother" | "spouse",
    field: keyof MilitaryCvRelativeState,
    next: string | boolean | null,
  ) =>
    onChange({
      ...value,
      family: {
        ...family,
        [relation]: {
          ...family[relation],
          [field]: next,
        },
      },
    });

  const updateRelativeList = (
    relation: "siblings" | "children",
    index: number,
    field: keyof MilitaryCvRelative,
    next: string | boolean,
  ) => {
    const relatives = [...(family[relation] ?? [])];
    relatives[index] = { ...relatives[index], [field]: next };
    onChange({ ...value, family: { ...family, [relation]: relatives } });
  };

  const updatePeriod = (
    index: number,
    field: keyof MilitaryCvPeriod,
    next: string,
  ) => {
    const periods = [...(history.periods ?? [])];
    periods[index] = {
      ...periods[index],
      [field]: field.startsWith("year_") ? Number(next) : next,
    };
    onChange({ ...value, history: { ...history, periods } });
  };

  const addPeriod = () =>
    onChange({
      ...value,
      history: {
        ...history,
        periods: [
          ...(history.periods ?? []),
          {
            subject: "self",
            year_from: 0,
            year_to: 0,
            note: "",
            econ: "",
            politics: "",
          },
        ],
      },
    });

  const removePeriod = (index: number) =>
    onChange({
      ...value,
      history: {
        ...history,
        periods: (history.periods ?? []).filter(
          (_, itemIndex) => itemIndex !== index,
        ),
      },
    });

  const renderRelative = (
    relation: "father" | "mother" | "spouse",
    title: string,
  ) => {
    const relative = family[relation] as MilitaryCvRelativeState;
    return (
      <div className="rounded border border-gray-200 p-4">
        <h4 className="mb-3 text-sm font-bold text-gray-700">{title}</h4>
        <div className="grid gap-4 md:grid-cols-2">
          <CvSelect
            id={`${relation}-alive`}
            label="Tình trạng"
            value={relative.alive ? "true" : "false"}
            options={[
              { value: "true", label: "Còn sống" },
              { value: "false", label: "Đã mất" },
            ]}
            onChange={(next) =>
              updateRelative(relation, "alive", next === "true")
            }
          />
          <CvSelect
            id={`${relation}-gender`}
            label="Giới tính"
            value={relative.gender ?? ""}
            options={[
              { value: "", label: "-- Chọn --" },
              { value: "nam", label: "Nam" },
              { value: "nu", label: "Nữ" },
            ]}
            onChange={(next) => updateRelative(relation, "gender", next)}
          />
          <CvInput
            id={`${relation}-name`}
            label="Họ tên"
            value={relative.name ?? ""}
            placeholder="Ví dụ: Nguyễn Văn B"
            onChange={(next) => updateRelative(relation, "name", next)}
          />
          <CvInput
            id={`${relation}-dob`}
            label="Ngày sinh"
            type="date"
            value={relative.dob ?? ""}
            onChange={(next) => updateRelative(relation, "dob", next)}
          />
          <CvInput
            id={`${relation}-job`}
            label="Nghề nghiệp"
            value={relative.job ?? ""}
            placeholder="Ví dụ: Công nhân"
            onChange={(next) => updateRelative(relation, "job", next)}
          />
          <CvInput
            id={`${relation}-addr`}
            label="Nơi ở hiện tại"
            value={relative.addr ?? ""}
            placeholder="Ví dụ: Phường Bình Phú, TP.HCM"
            onChange={(next) => updateRelative(relation, "addr", next)}
          />
          <CvInput
            id={`${relation}-econ`}
            label="Tình hình kinh tế"
            value={relative.econ ?? ""}
            placeholder="Ví dụ: Ổn định"
            onChange={(next) => updateRelative(relation, "econ", next)}
          />
          <CvInput
            id={`${relation}-politics`}
            label="Thái độ chính trị"
            value={relative.politics ?? ""}
            placeholder="Ví dụ: Chấp hành tốt chủ trương, pháp luật"
            onChange={(next) => updateRelative(relation, "politics", next)}
          />
        </div>
      </div>
    );
  };

  const profileFields: Array<{
    key: keyof MilitaryCvProfileState;
    label: string;
    type?: "text" | "date";
    required?: boolean;
  }> = [
    { key: "gender", label: "Giới tính" },
    { key: "pob", label: "Nơi đăng ký khai sinh" },
    { key: "hometown", label: "Quê quán" },
    { key: "ethnicity", label: "Dân tộc" },
    { key: "religion", label: "Tôn giáo" },
    { key: "nationality", label: "Quốc tịch" },
    { key: "family_class", label: "Thành phần gia đình" },
    { key: "self_class", label: "Thành phần bản thân" },
    { key: "edu_level", label: "Trình độ giáo dục phổ thông" },
    { key: "degree", label: "Trình độ đào tạo" },
    { key: "language", label: "Ngoại ngữ" },
    { key: "major", label: "Chuyên ngành đào tạo" },
    {
      key: "party_date",
      label: "Ngày vào Đảng dự bị",
      type: "date",
      required: false,
    },
    {
      key: "party_full",
      label: "Ngày vào Đảng chính thức",
      type: "date",
      required: false,
    },
    {
      key: "union_date",
      label: "Ngày vào Đoàn",
      type: "date",
      required: false,
    },
    { key: "reward", label: "Khen thưởng" },
    { key: "discipline", label: "Kỷ luật" },
    { key: "job", label: "Nghề nghiệp" },
    { key: "salary", label: "Lương" },
    { key: "grade", label: "Ngạch lương" },
    { key: "step", label: "Bậc lương" },
    { key: "overseas", label: "Đã đi nước ngoài" },
  ];

  return (
    <div className="mt-6 space-y-6 border-t border-gray-200 pt-6">
      <div>
        <h3 className="text-base font-bold text-gray-800">I. Sơ yếu lý lịch</h3>
        <div className="mt-4">
          {/* <CvInput
            id="photo"
            label="Ảnh 4x6 (URL hoặc đường dẫn tệp)"
            value={value.photo}
            placeholder="Ví dụ: /uploads/cvs/cccd.jpg"
            onChange={(next) => onChange({ ...value, photo: next })}
          />           <PhotoUploader
            value={value.photo}
            onChange={(next) =>
              onChange({
                ...value,
                photo: next,
              })
            }
          />*/}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {profileFields.map((field) => (
            <CvInput
              key={field.key}
              id={`profile-${field.key}`}
              label={field.label}
              type={field.type}
              value={String(profile[field.key] ?? "")}
              placeholder={
                field.type === "date"
                  ? "Chọn ngày"
                  : `Nhập ${field.label.toLowerCase()}`
              }
              onChange={(next) => updateProfile(field.key, next)}
            />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base font-bold text-gray-800">Gia đình</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <CvInput
            id="sibling-count"
            label="Tổng số anh chị em"
            type="number"
            value={family.sibling_count ?? 0}
            placeholder="Ví dụ: 2"
            onChange={(next) => updateFamily("sibling_count", Number(next))}
          />
          <CvInput
            id="son-count"
            label="Số anh/em trai"
            type="number"
            value={family.son_count ?? 0}
            placeholder="Ví dụ: 1"
            onChange={(next) => updateFamily("son_count", Number(next))}
          />
          <CvInput
            id="daughter-count"
            label="Số chị/em gái"
            type="number"
            value={family.daughter_count ?? 0}
            placeholder="Ví dụ: 1"
            onChange={(next) => updateFamily("daughter_count", Number(next))}
          />
          <CvInput
            id="birth-order"
            label="Bản thân là con thứ"
            type="number"
            value={family.birth_order ?? 0}
            placeholder="Ví dụ: 2"
            onChange={(next) => updateFamily("birth_order", Number(next))}
          />
          <CvInput
            id="child-count"
            label="Số con của bản thân"
            type="number"
            value={family.child_count ?? 0}
            placeholder="Chưa có con: 0, có con: nhập số lượng"
            onChange={(next) => updateFamily("child_count", Number(next))}
          />
        </div>
        {familyCountError ? (
          <p className="mt-2 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
            {familyCountError}
          </p>
        ) : null}
        <div className="mt-4 space-y-4">
          {renderRelative("father", "Cha")}
          {renderRelative("mother", "Mẹ")}
          <div className="rounded border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-bold text-gray-700">
                Vợ / chồng (không bắt buộc)
              </h4>
              {spouseEnabled ? (
                <button
                  type="button"
                  onClick={() => onSpouseEnabledChange(false)}
                  className="rounded border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
                >
                  Xóa vợ / chồng
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onSpouseEnabledChange(true)}
                  className="rounded bg-[#546a2f] px-3 py-2 text-xs font-semibold text-white"
                >
                  Thêm vợ / chồng
                </button>
              )}
            </div>
            {spouseEnabled ? (
              <div className="mt-4">
                {renderRelative("spouse", "Thông tin vợ / chồng")}
              </div>
            ) : (
              <p className="mt-2 text-xs text-gray-500">
                Có thể bỏ qua nếu chưa kết hôn.
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 rounded border border-gray-200 p-4">
          <h4 className="text-sm font-bold text-gray-700">
            Anh, chị, em ruột ({family.sibling_count ?? 0})
          </h4>
          {(family.siblings ?? []).map((relative, index) => (
            <div
              key={`sibling-${index}`}
              className="mt-4 rounded-lg border border-[#dce5c8] bg-[#f7f9f1] p-4 shadow-sm"
            >
              <h5 className="mb-4 border-b border-[#dce5c8] pb-2 text-sm font-bold text-[#3d5020]">
                Thông tin anh/chị/em thứ {index + 1}
              </h5>
              <div className="grid gap-4 md:grid-cols-2">
                <CvSelect
                  id={`sibling-${index}-label`}
                  label="Quan hệ"
                  value={relative.label ?? ""}
                  options={[
                    { value: "", label: "-- Chọn --" },
                    { value: "anh", label: "Anh" },
                    { value: "chi", label: "Chị" },
                    { value: "em", label: "Em" },
                  ]}
                  onChange={(next) =>
                    updateRelativeList("siblings", index, "label", next)
                  }
                />
                <CvInput
                  id={`sibling-${index}-name`}
                  label="Họ tên"
                  value={relative.name ?? ""}
                  placeholder="Ví dụ: Nguyễn Văn B"
                  onChange={(next) =>
                    updateRelativeList("siblings", index, "name", next)
                  }
                />
                <CvInput
                  id={`sibling-${index}-dob`}
                  label="Ngày sinh"
                  type="date"
                  value={relative.dob ?? ""}
                  onChange={(next) =>
                    updateRelativeList("siblings", index, "dob", next)
                  }
                />
                <CvInput
                  id={`sibling-${index}-job`}
                  label="Nghề nghiệp"
                  value={relative.job ?? ""}
                  placeholder="Ví dụ: Nhân viên văn phòng"
                  onChange={(next) =>
                    updateRelativeList("siblings", index, "job", next)
                  }
                />
                <CvInput
                  id={`sibling-${index}-addr`}
                  label="Ngụ tại"
                  value={relative.addr ?? ""}
                  placeholder="Ví dụ: Phường Bình Phú, TP.HCM"
                  onChange={(next) =>
                    updateRelativeList("siblings", index, "addr", next)
                  }
                />
                <CvSelect
                  id={`sibling-${index}-gender`}
                  label="Giới tính"
                  value={relative.gender ?? ""}
                  options={[
                    { value: "", label: "-- Chọn --" },
                    { value: "nam", label: "Nam" },
                    { value: "nu", label: "Nữ" },
                  ]}
                  onChange={(next) =>
                    updateRelativeList("siblings", index, "gender", next)
                  }
                />
                <CvInput
                  id={`sibling-${index}-econ`}
                  label="Tình hình kinh tế"
                  value={relative.econ ?? ""}
                  placeholder="Ví dụ: Ổn định"
                  onChange={(next) =>
                    updateRelativeList("siblings", index, "econ", next)
                  }
                />
                <CvInput
                  id={`sibling-${index}-politics`}
                  label="Thái độ chính trị"
                  value={relative.politics ?? ""}
                  placeholder="Ví dụ: Chấp hành tốt pháp luật"
                  onChange={(next) =>
                    updateRelativeList("siblings", index, "politics", next)
                  }
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded border border-gray-200 p-4">
          <h4 className="text-sm font-bold text-gray-700">
            Con đẻ / con nuôi ({family.child_count ?? 0})
          </h4>
          {(family.children ?? []).map((relative, index) => (
            <div
              key={`child-${index}`}
              className="mt-4 rounded-lg border border-[#dce5c8] bg-[#f7f9f1] p-4 shadow-sm"
            >
              <h5 className="mb-4 border-b border-[#dce5c8] pb-2 text-sm font-bold text-[#3d5020]">
                Thông tin người con thứ {index + 1}
              </h5>
              <div className="grid gap-4 md:grid-cols-2">
                <CvInput
                  id={`child-${index}-name`}
                  label="Họ tên"
                  value={relative.name ?? ""}
                  placeholder="Ví dụ: Nguyễn Văn C"
                  onChange={(next) =>
                    updateRelativeList("children", index, "name", next)
                  }
                />
                <CvInput
                  id={`child-${index}-dob`}
                  label="Ngày sinh"
                  type="date"
                  value={relative.dob ?? ""}
                  onChange={(next) =>
                    updateRelativeList("children", index, "dob", next)
                  }
                />
                <CvSelect
                  id={`child-${index}-gender`}
                  label="Giới tính"
                  value={relative.gender ?? ""}
                  options={[
                    { value: "", label: "-- Chọn --" },
                    { value: "nam", label: "Nam" },
                    { value: "nu", label: "Nữ" },
                  ]}
                  onChange={(next) =>
                    updateRelativeList("children", index, "gender", next)
                  }
                />
                <CvSelect
                  id={`child-${index}-adopted`}
                  label="Con nuôi"
                  value={relative.adopted ? "true" : "false"}
                  options={[
                    { value: "false", label: "Không" },
                    { value: "true", label: "Có" },
                  ]}
                  onChange={(next) =>
                    updateRelativeList(
                      "children",
                      index,
                      "adopted",
                      next === "true",
                    )
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base font-bold text-gray-800">II. Quá trình</h3>
        <div className="mt-4">
          <CvInput
            id="history-politics"
            label="Thái độ chính trị của bản thân"
            value={history.politics ?? ""}
            placeholder="Ví dụ: Luôn chấp hành chủ trương, pháp luật"
            onChange={(next) =>
              onChange({ ...value, history: { ...history, politics: next } })
            }
          />
        </div>
        <div className="mt-4 rounded border border-gray-200 p-4">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-bold text-gray-700">
              Các giai đoạn quá trình
            </h4>
            <button
              type="button"
              onClick={addPeriod}
              className="rounded bg-[#546a2f] px-3 py-2 text-xs font-semibold text-white"
            >
              Thêm giai đoạn
            </button>
          </div>
          {(history.periods ?? []).map((period, index) => (
            <div
              key={`period-${index}`}
              className="mt-4 grid gap-4 border-t border-gray-100 pt-4 md:grid-cols-2"
            >
              <CvSelect
                id={`period-${index}-subject`}
                label="Đối tượng"
                value={period.subject ?? ""}
                options={[
                  { value: "self", label: "Bản thân" },
                  { value: "father", label: "Cha" },
                  { value: "mother", label: "Mẹ" },
                  { value: "spouse", label: "Vợ / chồng" },
                  { value: "sibling", label: "Anh / chị / em" },
                ]}
                onChange={(next) => updatePeriod(index, "subject", next)}
              />
              <CvInput
                id={`period-${index}-year-from`}
                label="Từ năm"
                type="number"
                value={period.year_from ?? 0}
                placeholder="Ví dụ: 2021"
                onChange={(next) => updatePeriod(index, "year_from", next)}
              />
              <CvInput
                id={`period-${index}-year-to`}
                label="Đến năm"
                type="number"
                value={period.year_to ?? 0}
                placeholder="Ví dụ: 2024"
                onChange={(next) => updatePeriod(index, "year_to", next)}
              />
              <CvInput
                id={`period-${index}-note`}
                label="Nội dung quá trình"
                value={period.note ?? ""}
                placeholder="Ví dụ: Học tại trường THPT..."
                onChange={(next) => updatePeriod(index, "note", next)}
              />
              <CvInput
                id={`period-${index}-econ`}
                label="Tình hình kinh tế"
                value={period.econ ?? ""}
                placeholder="Ví dụ: Ổn định"
                onChange={(next) => updatePeriod(index, "econ", next)}
              />
              <CvInput
                id={`period-${index}-politics`}
                label="Thái độ chính trị"
                value={period.politics ?? ""}
                placeholder="Ví dụ: Chấp hành tốt pháp luật"
                onChange={(next) => updatePeriod(index, "politics", next)}
              />
              <button
                type="button"
                onClick={() => removePeriod(index)}
                className="h-10 self-end rounded border border-red-200 px-3 text-sm font-semibold text-red-600"
              >
                Xóa giai đoạn
              </button>
            </div>
          ))}
        </div>
      </div>
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

function RegistrationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [category, setCategory] = useState<RegistrationCategory>("tsqs");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [forms, setForms] = useState<RegistrationFormTemplate[]>([]);
  const [formsLoading, setFormsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<
    PublicRegistration | MilitaryCvRecord | null
  >(null);

  const activeCategory = useMemo(
    () => categories.find((item) => item.value === category) ?? categories[0],
    [category],
  );

  // useEffect(() => {
  //   const params = new URLSearchParams(window.location.search);
  //   const nextCategory = params.get("category") as RegistrationCategory | null;
  //   if (
  //     nextCategory &&
  //     categories.some((item) => item.value === nextCategory)
  //   ) {
  //     setCategory(nextCategory);
  //   }
  // }, []);

  useEffect(() => {
    const nextCategory = searchParams.get(
      "category",
    ) as RegistrationCategory | null;

    if (
      nextCategory &&
      categories.some((item) => item.value === nextCategory)
    ) {
      setCategory(nextCategory);
      setForm(emptyForm);
      setErrors({});
      setSuccess(null);
    }
  }, [searchParams]);

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

  // const switchCategory = (nextCategory: RegistrationCategory) => {
  //   setCategory(nextCategory);
  //   setForm(emptyForm);
  //   setErrors({});
  //   setSuccess(null);
  //   window.history.replaceState(
  //     null,
  //     "",
  //     `/website/tiep-nhan-dang-ky?category=${nextCategory}`,
  //   );
  // };

  const switchCategory = (nextCategory: RegistrationCategory) => {
    router.replace(`/website/tiep-nhan-dang-ky?category=${nextCategory}`, {
      scroll: false,
    });
  };

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  // const resetForm = () => {
  //   setForm(emptyForm);
  //   setCaptchaToken(null);
  //   recaptchaRef.current?.reset();
  //   setErrors({});
  //   setSuccess(null);
  //   setCategory("tsqs");
  //   window.history.replaceState(null, "", "/website/tiep-nhan-dang-ky");
  // };

  const resetForm = () => {
    setForm(emptyForm);
    setCaptchaToken(null);
    recaptchaRef.current?.reset();
    setErrors({});
    setSuccess(null);

    router.replace("/website/tiep-nhan-dang-ky?category=tsqs", {
      scroll: false,
    });
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
      const {
        permanent_address,
        temporary_address,
        training_system,
        id_no,
        military_cv,
        spouse_enabled,
        ...rest
      } = form;

      const created =
        category === "khamsuckhoenghiavuquansu"
          ? await militaryCvApi.create(
              normalizeMilitaryCvDates({
                ...military_cv,
                full_name: rest.full_name.trim(),
                dob: rest.dob,
                id_no: id_no.trim(),
                photo: military_cv.photo || "",
                profile: {
                  ...military_cv.profile,
                  home_addr: permanent_address.trim(),
                  curr_addr:
                    temporary_address.trim() || permanent_address.trim(),
                  workplace: rest.workplace.trim(),
                },
                family: {
                  ...military_cv.family,
                  spouse: spouse_enabled
                    ? military_cv.family.spouse
                    : { ...emptyRelative },
                },
                reviews: null,
              }),
            )
          : await websiteRegistrationAPI.createRegistration({
              category,
              ...rest,
              address: permanent_address.trim(),
              temporary_address: temporary_address.trim(),
              ...(category === "tsqs" && training_system
                ? { training_system }
                : {}),
              captcha_token: captchaToken as string,
            });
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
                {/* <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
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
                </div> */}
                <div className="flex flex-col items-center justify-center p-10 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Gửi thành công!
                  </h3>
                  <p className="text-gray-500 text-sm mb-6">
                    Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi sớm nhất có
                    thể.
                  </p>
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
                  {category === "khamsuckhoenghiavuquansu" ? (
                    <Field
                      id="id_no"
                      label="Số CCCD"
                      required
                      error={errors.id_no}
                    >
                      <input
                        id="id_no"
                        value={form.id_no}
                        inputMode="numeric"
                        maxLength={12}
                        onChange={(event) =>
                          updateField("id_no", event.target.value)
                        }
                        placeholder="Nhập 12 chữ số CCCD"
                        className={`h-10 w-full rounded border px-3 text-sm outline-none focus:border-[#546a2f] ${
                          errors.id_no
                            ? "border-red-400 bg-red-50"
                            : "border-gray-200"
                        }`}
                      />
                    </Field>
                  ) : (
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
                  )}
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
                        <option value="cao_dang_dai_hoc">
                          Cao đẳng / Đại học
                        </option>
                        <option value="thieu_sinh_quan">Thiếu sinh quan</option>
                      </select>
                    </Field>
                  ) : null}
                </div>

                {category === "khamsuckhoenghiavuquansu" ? (
                  <KskCvFields
                    value={form.military_cv}
                    spouseEnabled={form.spouse_enabled}
                    familyCountError={errors.family_counts}
                    onSpouseEnabledChange={(spouse_enabled) =>
                      setForm((current) => ({ ...current, spouse_enabled }))
                    }
                    onChange={(military_cv) =>
                      setForm((current) => ({ ...current, military_cv }))
                    }
                  />
                ) : null}

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

export default function RegistrationPage() {
  return (
    <Suspense>
      <RegistrationContent />
    </Suspense>
  );
}
