"use client";

import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
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
  party_joined: PartyJoined;
};

type KskCommonFields = Pick<
  FormState,
  | "full_name"
  | "dob"
  | "phone"
  | "id_no"
  | "permanent_address"
  | "temporary_address"
  | "workplace"
>;

type FormErrors = Partial<
  Record<keyof FormState | "captcha" | "family_counts", string>
>;

type PartyJoined = "yes" | "no" | "";

const skeletonRows = [
  "form-skeleton-1",
  "form-skeleton-2",
  "form-skeleton-3",
  "form-skeleton-4",
];

const DEFAULT_DOB = "2008-01-01";

const KSK_STEPS = [
  {
    id: 0,
    title: "Thông tin cá nhân",
    shortTitle: "Cá nhân",
  },
  {
    id: 1,
    title: "Thông tin gia đình",
    shortTitle: "Gia đình",
  },
  {
    id: 2,
    title: "Quá trình",
    shortTitle: "Quá trình",
  },
];

/**
 * Thái độ chính trị không cho người dùng nhập — mọi hồ sơ dùng chung câu này,
 * áp cho bản thân, cha mẹ, vợ/chồng, anh chị em và từng giai đoạn quá trình.
 */
const DEFAULT_POLITICS =
  "Bản thân luôn chấp hành chủ trương, đường lối của Đảng, chính sách, pháp luật của Nhà nước và quy định của địa phương. Không vi phạm pháp luật.";

/** Tình hình kinh tế cũng gán cứng, không cho nhập. */
const DEFAULT_ECON = "Ổn định";

/**
 * Khung giai đoạn dựng sẵn cho mục "III. Quá trình".
 *
 * Mốc thời gian ghi bằng chữ ngay trong nội dung, cố ý KHÔNG điền year_from /
 * year_to — export mapper thấy giai đoạn không có năm thì in thẳng nội dung
 * ("- Trước 18 tuổi: ...") thay vì "- Từ năm …… đến nay: ...".
 *
 * Anh/chị/em không dựng sẵn: mỗi hồ sơ một khác, người nhập tự thêm.
 */
const DEFAULT_PERIOD_LABELS: Array<{
  subject: NonNullable<MilitaryCvPeriod["subject"]>;
  label: string;
}> = [
  { subject: "self", label: "Từ 1 đến 5 tuổi" },
  { subject: "self", label: "Từ 6 đến 10 tuổi" },
  { subject: "self", label: "Từ 11 đến 15 tuổi" },
  { subject: "self", label: "Từ 15 đến 18 tuổi" },
  { subject: "self", label: "Từ 18 tuổi đến nay" },
  { subject: "father", label: "Trước 18 tuổi" },
  { subject: "father", label: "Sau 18 tuổi" },
  { subject: "father", label: "Hiện nay" },
  { subject: "mother", label: "Trước 18 tuổi" },
  { subject: "mother", label: "Sau 18 tuổi" },
  { subject: "mother", label: "Hiện nay" },
];

const defaultPeriods = (): MilitaryCvPeriod[] =>
  DEFAULT_PERIOD_LABELS.map(({ subject, label }) => ({
    subject,
    year_from: null,
    year_to: null,
    note: `${label}: `,
    econ: DEFAULT_ECON,
    politics: DEFAULT_POLITICS,
  }));

const emptyRelative = {
  name: "",
  alive: true,
  dob: "",
  job: "",
  addr: "",
  label: "",
  gender: "",
  adopted: null,
  econ: DEFAULT_ECON,
  politics: DEFAULT_POLITICS,
} as const;

const emptyMilitaryCv: MilitaryCvCreatePayload = {
  full_name: "",
  dob: "",
  id_no: "",
  photo: "",
  profile: {
    // Phần lớn người đăng ký khám NVQS là nam, nên chọn sẵn cho đỡ thao tác.
    gender: "nam",
    pob: "",
    hometown: "",
    ethnicity: "Kinh",
    religion: "Không",
    nationality: "Việt Nam",
    home_addr: "",
    curr_addr: "",
    family_class: "Lao động",
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
    politics: DEFAULT_POLITICS,
    periods: defaultPeriods(),
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
  dob: DEFAULT_DOB,
  workplace: "",
  guardian_phone: "",
  training_system: "cao_dang_dai_hoc",
  party_joined: "",
};

const phoneRegex = /^0\d{9}$/;

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
};

const isOver18 = (dob: string) => {
  if (!dob) return false;

  const birthDate = new Date(`${dob}T00:00:00`);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();

  // const birthdayPassed =
  //   today.getMonth() > birthDate.getMonth() ||
  //   (today.getMonth() === birthDate.getMonth() &&
  //     today.getDate() >= birthDate.getDate());

  // if (!birthdayPassed) age--;

  return age >= 18;
};

const validateKskStep = (
  step: number,
  form: FormState,
  partyJoined: PartyJoined,
): FormErrors => {
  const errors: FormErrors = {};

  const profile = form.military_cv.profile;
  const family = form.military_cv.family;

  if (step === 0) {
    if (!form.full_name.trim()) {
      errors.full_name = "Vui lòng nhập họ và tên.";
    }

    if (!/^\d{12}$/.test(form.id_no)) {
      errors.id_no = "Số CCCD gồm đúng 12 chữ số.";
    }

    if (!phoneRegex.test(form.phone)) {
      errors.phone = "Số điện thoại gồm 10 chữ số và bắt đầu bằng 0.";
    }

    if (!form.workplace.trim()) {
      errors.workplace = "Vui lòng nhập nơi học tập hoặc làm việc.";
    }

    if (!form.dob) {
      errors.dob = "Vui lòng chọn ngày sinh.";
    } else if (!isOver18(form.dob)) {
      errors.dob = "Người đăng ký phải trên 18 tuổi.";
    }

    if (!form.permanent_address.trim()) {
      errors.permanent_address = "Vui lòng nhập địa chỉ thường trú.";
    }

    if (!profile.gender) {
      errors.military_cv = "Vui lòng chọn giới tính.";
    }

    if (!profile.pob?.trim()) {
      errors.military_cv = "Vui lòng nhập nơi đăng ký khai sinh.";
    }

    if (!profile.hometown?.trim()) {
      errors.military_cv = "Vui lòng nhập quê quán.";
    }

    if (!profile.edu_level?.trim()) {
      errors.military_cv = "Vui lòng nhập trình độ giáo dục phổ thông.";
    }

    if (!profile.degree?.trim()) {
      errors.military_cv = "Vui lòng chọn trình độ đào tạo.";
    }

    if (!profile.self_class?.trim()) {
      errors.military_cv = "Vui lòng chọn thành phần bản thân.";
    }

    if (!partyJoined) {
      errors.military_cv = "Vui lòng chọn bạn đã vào Đảng hay chưa.";
    }

    if (partyJoined === "yes" && (!profile.party_date || !profile.party_full)) {
      errors.military_cv =
        "Vui lòng nhập đầy đủ ngày vào Đảng dự bị và chính thức.";
    }
  }

  if (step === 1) {
    const siblingCount = Number(family.sibling_count ?? 0);
    const sonCount = Number(family.son_count ?? 0);
    const daughterCount = Number(family.daughter_count ?? 0);

    if (sonCount + daughterCount !== siblingCount) {
      errors.family_counts =
        "Số anh/em trai + số chị/em gái phải bằng tổng số anh chị em.";
    }
  }

  return errors;
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
              econ: DEFAULT_ECON,
              politics: DEFAULT_POLITICS,
            }
          : payload.family.father,
        mother: payload.family.mother
          ? {
              ...payload.family.mother,
              dob: nullableDate(payload.family.mother.dob),
              econ: DEFAULT_ECON,
              politics: DEFAULT_POLITICS,
            }
          : payload.family.mother,
        spouse: payload.family.spouse
          ? {
              ...payload.family.spouse,
              dob: nullableDate(payload.family.spouse.dob),
              econ: DEFAULT_ECON,
              politics: DEFAULT_POLITICS,
            }
          : payload.family.spouse,
        siblings: payload.family.siblings?.map((relative) => ({
          ...relative,
          dob: nullableDate(relative.dob),
          econ: DEFAULT_ECON,
          politics: DEFAULT_POLITICS,
        })),
        children: payload.family.children?.map((relative) => ({
          ...relative,
          dob: nullableDate(relative.dob),
          econ: DEFAULT_ECON,
          politics: DEFAULT_POLITICS,
        })),
      }
    : payload.family,
  history: payload.history
    ? {
        ...payload.history,
        politics: DEFAULT_POLITICS,
        periods: payload.history.periods?.map((period) => ({
          ...period,
          // Không thu thập năm nữa — mốc thời gian nằm trong nội dung quá trình.
          year_from: null,
          year_to: null,
          econ: DEFAULT_ECON,
          politics: DEFAULT_POLITICS,
        })),
      }
    : payload.history,
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
  } else if (!isOver18(form.dob)) {
    errors.dob = "Người đăng ký phải trên 18 tuổi.";
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
    <Field id={id} label={label} required={required}>
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
  partyJoined,
  onPartyJoinedChange,
  currentStep,
  setCurrentStep,
  commonFields,
  onCommonFieldChange,
  errors,
}: {
  value: MilitaryCvCreatePayload;
  onChange: (value: MilitaryCvCreatePayload) => void;
  spouseEnabled: boolean;
  onSpouseEnabledChange: (enabled: boolean) => void;
  familyCountError?: string;
  partyJoined: PartyJoined;
  onPartyJoinedChange: (value: PartyJoined) => void;
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  commonFields: KskCommonFields;
  onCommonFieldChange: (field: keyof KskCommonFields, value: string) => void;
  errors: FormErrors;
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
    periods[index] = { ...periods[index], [field]: next };
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
            year_from: null,
            year_to: null,
            note: "",
            econ: DEFAULT_ECON,
            politics: DEFAULT_POLITICS,
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CvSelect
            id={`${relation}-alive`}
            label="Tình trạng"
            // Token "unknown" chứ không phải "": <select> của CvSelect luôn có
            // required, để giá trị rỗng là trình duyệt chặn gửi form.
            value={
              relative.alive === true
                ? "true"
                : relative.alive === false
                  ? "false"
                  : "unknown"
            }
            options={[
              { value: "true", label: "Còn sống" },
              { value: "false", label: "Đã mất" },
              { value: "unknown", label: "Không rõ" },
            ]}
            onChange={(next) =>
              updateRelative(
                relation,
                "alive",
                next === "true" ? true : next === "false" ? false : null,
              )
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
        </div>
      </div>
    );
  };

  const profileFields: Array<{
    key: keyof MilitaryCvProfileState;
    label: string;
    type?: "text" | "date";
    required?: boolean;
    placeholder?: string;
  }> = [
    { key: "reward", label: "Khen thưởng" },
    { key: "discipline", label: "Kỷ luật" },
    { key: "job", label: "Nghề nghiệp" },
  ];

  return (
    <div className="mt-6 space-y-6 border-t border-gray-200 pt-6">
      {currentStep === 0 && (
        <>
          {/* I. Sơ yếu lý lịch */}
          <div>
            <h3 className="text-base font-bold text-gray-800">
              I. Sơ yếu lý lịch
            </h3>{" "}
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                id="ksk-full_name"
                label="Họ và tên"
                required
                error={errors.full_name}
              >
                <input
                  id="ksk-full_name"
                  value={commonFields.full_name}
                  onChange={(event) =>
                    onCommonFieldChange("full_name", event.target.value)
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
                id="ksk-dob"
                label="Ngày tháng năm sinh"
                required
                error={errors.dob}
              >
                <input
                  id="ksk-dob"
                  type="date"
                  value={commonFields.dob}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(event) =>
                    onCommonFieldChange("dob", event.target.value)
                  }
                  className={`h-10 w-full rounded border px-3 text-sm outline-none focus:border-[#546a2f] ${
                    errors.dob ? "border-red-400 bg-red-50" : "border-gray-200"
                  }`}
                />
              </Field>

              <Field
                id="ksk-phone"
                label="Số điện thoại"
                required
                error={errors.phone}
              >
                <input
                  id="ksk-phone"
                  value={commonFields.phone}
                  inputMode="numeric"
                  maxLength={10}
                  onChange={(event) =>
                    onCommonFieldChange("phone", event.target.value)
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
                id="ksk-id_no"
                label="Số CCCD"
                required
                error={errors.id_no}
              >
                <input
                  id="ksk-id_no"
                  value={commonFields.id_no}
                  inputMode="numeric"
                  maxLength={12}
                  onChange={(event) =>
                    onCommonFieldChange("id_no", event.target.value)
                  }
                  placeholder="Nhập 12 chữ số CCCD"
                  className={`h-10 w-full rounded border px-3 text-sm outline-none focus:border-[#546a2f] ${
                    errors.id_no
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200"
                  }`}
                />
              </Field>

              <Field
                id="ksk-permanent_address"
                label="Địa chỉ thường trú"
                required
                error={errors.permanent_address}
              >
                <input
                  id="ksk-permanent_address"
                  value={commonFields.permanent_address}
                  onChange={(event) =>
                    onCommonFieldChange("permanent_address", event.target.value)
                  }
                  placeholder="Nhập địa chỉ thường trú"
                  className={`h-10 w-full rounded border px-3 text-sm outline-none focus:border-[#546a2f] ${
                    errors.permanent_address
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200"
                  }`}
                />

                <p className="mt-1.5 text-xs leading-5 text-gray-500">
                  Lưu ý: Có thể nhập địa chỉ theo địa chỉ mới hoặc địa chỉ cũ.
                </p>
              </Field>

              <Field
                id="ksk-temporary_address"
                label="Địa chỉ tạm trú"
                error={errors.temporary_address}
              >
                <input
                  id="ksk-temporary_address"
                  value={commonFields.temporary_address}
                  onChange={(event) =>
                    onCommonFieldChange("temporary_address", event.target.value)
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
                id="ksk-workplace"
                label="Nơi học tập / làm việc"
                required
                error={errors.workplace}
              >
                <input
                  id="ksk-workplace"
                  value={commonFields.workplace}
                  onChange={(event) =>
                    onCommonFieldChange("workplace", event.target.value)
                  }
                  placeholder="Ví dụ: Trường THPT Bình Phú"
                  className={`h-10 w-full rounded border px-3 text-sm outline-none focus:border-[#546a2f] ${
                    errors.workplace
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200"
                  }`}
                />
              </Field>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <CvSelect
                id="profile-gender"
                label="Giới tính"
                value={String(profile.gender ?? "")}
                options={[
                  { value: "", label: "-- Chọn giới tính --" },
                  { value: "nam", label: "Nam" },
                  { value: "nu", label: "Nữ" },
                ]}
                onChange={(next) => updateProfile("gender", next)}
              />
              <div>
                <CvInput
                  id="profile-pob"
                  label="Nơi đăng ký khai sinh"
                  value={String(profile.pob ?? "")}
                  placeholder="Nhập nơi đăng ký khai sinh"
                  onChange={(next) => updateProfile("pob", next)}
                />

                <p className="mt-1.5 text-xs leading-5 text-gray-500">
                  Ghi theo thông tin trên giấy khai sinh hoặc địa chỉ đăng ký
                  mới.
                </p>
              </div>
              <CvInput
                id="profile-hometown"
                label="Quê quán"
                value={String(profile.hometown ?? "")}
                placeholder="Nhập quê quán theo địa chỉ mới"
                onChange={(next) => updateProfile("hometown", next)}
              />
              <CvInput
                id="profile-ethnicity"
                label="Dân tộc"
                value={String(profile.ethnicity ?? "")}
                placeholder="Kinh"
                onChange={(next) => updateProfile("ethnicity", next)}
              />
              <CvInput
                id="profile-religion"
                label="Tôn giáo"
                value={String(profile.religion ?? "")}
                placeholder="Kinh"
                onChange={(next) => updateProfile("religion", next)}
              />
              <CvInput
                id="profile-nationality"
                label="Quốc tịch"
                value={String(profile.nationality ?? "")}
                placeholder="Kinh"
                onChange={(next) => updateProfile("nationality", next)}
              />
              <Field id="profile-family-class" label="Thành phần gia đình">
                <input
                  id="profile-family-class"
                  value="Lao động"
                  disabled
                  className="h-10 w-full rounded border border-gray-200 bg-gray-100 px-3 text-sm text-gray-600"
                />
              </Field>
              <CvSelect
                id="profile-self-class"
                label="Thành phần bản thân"
                value={String(profile.self_class ?? "")}
                options={[
                  { value: "", label: "-- Chọn --" },
                  { value: "Lao động", label: "Lao động" },
                  { value: "Phụ thuộc", label: "Phụ thuộc" },
                ]}
                onChange={(next) => updateProfile("self_class", next)}
              />
              <CvInput
                id="profile-language"
                label="Ngoại ngữ"
                value={String(profile.language ?? "")}
                placeholder="Tiếng Anh"
                onChange={(next) => updateProfile("language", next)}
              />
              <CvInput
                id="profile-major"
                label="Chuyên ngành đào tạo"
                value={String(profile.major ?? "")}
                placeholder="Nhập chuyên ngành đào tạo"
                required={false}
                onChange={(next) => updateProfile("major", next)}
              />
              <CvInput
                id="profile-edu_level"
                label="Trình độ giáo dục phổ thông"
                value={String(profile.edu_level ?? "")}
                placeholder="12/12, 9/12"
                onChange={(next) => updateProfile("edu_level", next)}
              />
              <CvSelect
                id="profile-degree"
                label="Trình độ đào tạo"
                value={String(profile.degree ?? "")}
                options={[
                  { value: "", label: "-- Chọn trình độ đào tạo --" },
                  { value: "chua", label: "Chưa qua đào tạo" },
                  { value: "so_cap", label: "Sơ cấp" },
                  { value: "trung_cap", label: "Trung cấp" },
                  { value: "cao_dang", label: "Cao đẳng" },
                  { value: "dai_hoc", label: "Đại học" },
                  { value: "thac_si", label: "Thạc sĩ" },
                  { value: "tien_si", label: "Tiến sĩ" },
                ]}
                onChange={(next) => updateProfile("degree", next)}
              />
              <CvSelect
                id="party-joined"
                label="Đã vào Đảng chưa?"
                value={partyJoined}
                options={[
                  { value: "", label: "-- Chọn --" },
                  { value: "yes", label: "Đã vào Đảng" },
                  { value: "no", label: "Chưa vào Đảng" },
                ]}
                onChange={(next) => {
                  const joined = next as PartyJoined;

                  onPartyJoinedChange(joined);

                  if (joined === "no") {
                    onChange({
                      ...value,
                      profile: {
                        ...profile,
                        party_date: "",
                        party_full: "",
                      },
                    });
                  }
                }}
              />
              {partyJoined === "yes" ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <CvInput
                    id="party-date"
                    label="Ngày vào Đảng dự bị"
                    type="date"
                    value={String(profile.party_date ?? "")}
                    onChange={(next) => updateProfile("party_date", next)}
                    required={false}
                  />

                  <CvInput
                    id="party-full"
                    label="Ngày vào Đảng chính thức"
                    type="date"
                    value={String(profile.party_full ?? "")}
                    onChange={(next) => updateProfile("party_full", next)}
                    required={false}
                  />
                </div>
              ) : partyJoined === "no" ? (
                <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
                  Chưa vào Đảng
                </div>
              ) : null}
              <CvInput
                id="profile-union-date"
                label="Ngày vào Đoàn"
                type="date"
                required={false}
                value={String(profile.union_date ?? "")}
                onChange={(next) => updateProfile("union_date", next)}
              />
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
              <CvInput
                id="profile-salary"
                label="Lương"
                required={false}
                value={String(profile.salary ?? "")}
                placeholder="Không bắt buộc"
                onChange={(next) => updateProfile("salary", next)}
              />

              <CvInput
                id="profile-grade"
                label="Ngạch lương"
                required={false}
                value={String(profile.grade ?? "")}
                placeholder="Không bắt buộc"
                onChange={(next) => updateProfile("grade", next)}
              />

              <CvInput
                id="profile-step"
                label="Bậc lương"
                required={false}
                value={String(profile.step ?? "")}
                placeholder="Không bắt buộc"
                onChange={(next) => updateProfile("step", next)}
              />
              <CvSelect
                id="profile-overseas"
                label="Đã từng đi nước ngoài"
                value={String(profile.overseas ?? "Không")}
                options={[
                  { value: "Không", label: "Không" },
                  { value: "Có", label: "Có" },
                ]}
                onChange={(next) => updateProfile("overseas", next)}
              />
            </div>
          </div>
        </>
      )}

      {currentStep === 1 && (
        <>
          {/* Gia đình */}
          <div>
            <h3 className="text-base font-bold text-gray-800">II. Gia đình</h3>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
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
                onChange={(next) =>
                  updateFamily("daughter_count", Number(next))
                }
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
        </>
      )}

      {currentStep === 2 && (
        <>
          {/* II. Quá trình */}{" "}
          <div>
            <h3 className="text-base font-bold text-gray-800">
              III. Quá trình
            </h3>
            <div className="mt-4 rounded border border-gray-200 bg-white">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-200 p-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-700">
                    Các giai đoạn quá trình
                  </h4>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Khai báo quá trình của bản thân và thân nhân
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addPeriod}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded bg-[#546a2f] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#42551f]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Thêm giai đoạn
                </button>
              </div>

              {/* Tiêu đề cột — chỉ hiện trên desktop; ở mobile mỗi field tự có
                  nhãn riêng (nhãn bị sr-only ở desktop để hàng gọn lại). */}
              <div className="hidden items-center gap-4 border-b border-gray-100 bg-gray-50/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 sm:flex">
                <span className="w-10 shrink-0" />
                <span className="w-[260px] shrink-0">
                  Đối tượng <span className="text-red-500">*</span>
                </span>
                <span className="min-w-0 flex-1">
                  Nội dung quá trình <span className="text-red-500">*</span>
                </span>
                <span className="w-9 shrink-0" />
              </div>

              <div className="divide-y divide-gray-100">
                {(history.periods ?? []).map((period, index) => (
                  <div
                    key={`period-${index}`}
                    className="flex flex-col gap-3 px-4 py-3 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <span className="inline-flex h-10 w-10 shrink-0 select-none items-center justify-center self-start rounded border border-gray-200 bg-gray-50 text-xs font-bold tabular-nums text-gray-500 sm:self-auto">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="w-full sm:w-[260px] sm:shrink-0 sm:[&_label]:sr-only">
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
                        onChange={(next) =>
                          updatePeriod(index, "subject", next)
                        }
                      />
                    </div>

                    <div className="w-full min-w-0 flex-1 sm:[&_label]:sr-only">
                      <CvInput
                        id={`period-${index}-note`}
                        label="Nội dung quá trình"
                        value={period.note ?? ""}
                        placeholder="Ví dụ: Học tại trường THPT..."
                        onChange={(next) => updatePeriod(index, "note", next)}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removePeriod(index)}
                      title="Xóa giai đoạn"
                      aria-label="Xóa giai đoạn"
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center self-end rounded border border-red-200 text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 sm:self-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {(history.periods ?? []).length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-gray-400">
                  Chưa có giai đoạn nào.
                </p>
              ) : null}

              <div className="border-t border-gray-100 p-3">
                <button
                  type="button"
                  onClick={addPeriod}
                  className="inline-flex items-center gap-1.5 rounded px-2 py-1.5 text-xs font-semibold text-[#546a2f] transition-colors hover:bg-[#546a2f]/10"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Thêm giai đoạn khác
                </button>
              </div>
            </div>
          </div>
        </>
      )}
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
  const [currentStep, setCurrentStep] = useState(0);
  const [partyJoined, setPartyJoined] = useState<PartyJoined>("");

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

  const switchCategory = (nextCategory: RegistrationCategory) => {
    router.replace(`/website/tiep-nhan-dang-ky?category=${nextCategory}`, {
      scroll: false,
    });
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
                  // Chưa kết hôn ⇒ gửi null. Nếu gửi record rỗng thì export
                  // mapper vẫn in nguyên khối "Vợ (chồng)" trống vào file Word,
                  // vì nó dựa vào econ/politics để quyết định có in hay không.
                  spouse: spouse_enabled ? military_cv.family.spouse : null,
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

                <div className="mt-6 flex flex-wrap gap-3">
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
                {category !== "khamsuckhoenghiavuquansu" ? (
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
                        placeholder="Nhập địa chỉ thường trú"
                        className={`h-10 w-full rounded border px-3 text-sm outline-none focus:border-[#546a2f] ${
                          errors.permanent_address
                            ? "border-red-400 bg-red-50"
                            : "border-gray-200"
                        }`}
                      />

                      <p className="mt-1.5 text-xs leading-5 text-gray-500">
                        Lưu ý: Có thể nhập địa chỉ theo địa chỉ mới hoặc địa chỉ
                        cũ.
                      </p>
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
                          <option value="thieu_sinh_quan">
                            Thiếu sinh quan
                          </option>
                        </select>
                      </Field>
                    ) : null}
                  </div>
                ) : null}
                {category === "khamsuckhoenghiavuquansu" ? (
                  <div className="mb-6 overflow-x-auto pb-2">
                    <div className="flex min-w-[620px] items-center">
                      {KSK_STEPS.map((step, index) => {
                        const active = currentStep === step.id;
                        const completed = currentStep > step.id;

                        return (
                          <div
                            key={step.id}
                            className="flex flex-1 items-center"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                if (step.id <= currentStep) {
                                  setCurrentStep(step.id);
                                }
                              }}
                              className="flex min-w-0 flex-col items-center"
                            >
                              <div
                                className={[
                                  "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors",
                                  completed
                                    ? "bg-[#546a2f] text-white"
                                    : active
                                      ? "bg-[#ffb300] text-[#3d5020]"
                                      : "bg-gray-200 text-gray-500",
                                ].join(" ")}
                              >
                                {completed ? (
                                  <CheckCircle2 className="h-5 w-5" />
                                ) : (
                                  index + 1
                                )}
                              </div>

                              <span
                                className={[
                                  "mt-2 text-center text-xs font-semibold",
                                  active ? "text-[#546a2f]" : "text-gray-500",
                                ].join(" ")}
                              >
                                {step.shortTitle}
                              </span>
                            </button>

                            {index < KSK_STEPS.length - 1 ? (
                              <div
                                className={[
                                  "mx-2 h-0.5 flex-1",
                                  currentStep > index
                                    ? "bg-[#546a2f]"
                                    : "bg-gray-200",
                                ].join(" ")}
                              />
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
                {category === "khamsuckhoenghiavuquansu" ? (
                  <KskCvFields
                    value={form.military_cv}
                    spouseEnabled={form.spouse_enabled}
                    partyJoined={partyJoined}
                    familyCountError={errors.family_counts}
                    errors={errors}
                    commonFields={{
                      full_name: form.full_name,
                      dob: form.dob,
                      phone: form.phone,
                      id_no: form.id_no,
                      permanent_address: form.permanent_address,
                      temporary_address: form.temporary_address,
                      workplace: form.workplace,
                    }}
                    onCommonFieldChange={(field, value) => {
                      updateField(field, value);
                    }}
                    onPartyJoinedChange={setPartyJoined}
                    onSpouseEnabledChange={(spouse_enabled) =>
                      setForm((current) => ({
                        ...current,
                        spouse_enabled,
                      }))
                    }
                    onChange={(military_cv) =>
                      setForm((current) => ({
                        ...current,
                        military_cv,
                      }))
                    }
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                  />
                ) : null}
                {category === "khamsuckhoenghiavuquansu" ? (
                  <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    {/* Quay lại */}
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentStep((step) => Math.max(0, step - 1))
                      }
                      disabled={currentStep === 0}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded border border-gray-200 px-4 text-sm font-semibold text-gray-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Quay lại
                    </button>

                    {/* Tiếp theo */}
                    {currentStep < KSK_STEPS.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => {
                          const nextErrors = validateKskStep(
                            currentStep,
                            form,
                            partyJoined,
                          );

                          setErrors((current) => ({
                            ...current,
                            ...nextErrors,
                          }));

                          if (Object.keys(nextErrors).length > 0) {
                            toast.error(
                              "Vui lòng kiểm tra lại thông tin trước khi tiếp tục.",
                            );
                            return;
                          }

                          setCurrentStep((step) =>
                            Math.min(KSK_STEPS.length - 1, step + 1),
                          );

                          window.scrollTo({
                            top: 0,
                            behavior: "smooth",
                          });
                        }}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded bg-[#546a2f] px-5 text-sm font-bold text-white hover:bg-[#3d5020]"
                      >
                        Tiếp theo
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                ) : null}

                {category !== "khamsuckhoenghiavuquansu" ||
                currentStep === KSK_STEPS.length - 1 ? (
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
                ) : null}

                <div className="mt-5 flex flex-wrap gap-3">
                  {category !== "khamsuckhoenghiavuquansu" ||
                  currentStep === KSK_STEPS.length - 1 ? (
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
                  ) : null}

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
