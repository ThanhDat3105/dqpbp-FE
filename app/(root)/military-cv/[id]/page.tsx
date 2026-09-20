"use client";

import { ArrowLeft, Download, Loader2, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PhotoUploader } from "@/components/photoUploader/photoUploader";
import {
  MilitaryCvPeriod,
  type MilitaryCvFamily,
  type MilitaryCvHistory,
  type MilitaryCvProfile,
  type MilitaryCvRecord,
  type MilitaryCvRelative,
  type MilitaryCvReview,
  type MilitaryCvReviews,
  militaryCvApi,
} from "@/services/api/military-cv";

const emptyReview: MilitaryCvReview = {
  note: "",
  reviewed_at: "",
  signer: "",
  title: "",
};

type SelectOption = { value: string; label: string };

const GENDER_OPTIONS: SelectOption[] = [
  { value: "", label: "— Chưa chọn —" },
  { value: "nam", label: "Nam" },
  { value: "nu", label: "Nữ" },
];

const ALIVE_OPTIONS: SelectOption[] = [
  { value: "", label: "— Chưa rõ —" },
  { value: "true", label: "Còn sống" },
  { value: "false", label: "Đã mất" },
];

const ADOPTED_OPTIONS: SelectOption[] = [
  { value: "", label: "— Chưa rõ —" },
  { value: "false", label: "Con đẻ" },
  { value: "true", label: "Con nuôi" },
];

const SIBLING_LABEL_OPTIONS: SelectOption[] = [
  { value: "", label: "— Chưa chọn —" },
  { value: "anh", label: "Anh" },
  { value: "chi", label: "Chị" },
  { value: "em", label: "Em" },
];

const PERIOD_SUBJECT_OPTIONS: SelectOption[] = [
  { value: "", label: "— Chưa chọn —" },
  { value: "self", label: "Bản thân" },
  { value: "father", label: "Cha" },
  { value: "mother", label: "Mẹ" },
  { value: "spouse", label: "Vợ/chồng" },
  { value: "sibling", label: "Anh/chị/em" },
];

// Cột self_class là text tự do và export mapper in thẳng ra file DOCX, nên
// giá trị lưu xuống phải đúng dạng hiển thị (không dùng slug).
const SELF_CLASS_LAO_DONG = "Lao động";
const SELF_CLASS_PHU_THUOC = "Phụ thuộc";

const SELF_CLASS_OPTIONS: SelectOption[] = [
  { value: "", label: "— Chưa chọn —" },
  { value: SELF_CLASS_LAO_DONG, label: SELF_CLASS_LAO_DONG },
  { value: SELF_CLASS_PHU_THUOC, label: SELF_CLASS_PHU_THUOC },
];

/**
 * Dữ liệu cũ nhập tay nên lẫn lộn hoa thường ("Lao Động") và cả giá trị rác
 * ("123"). Quy về đúng một trong hai option, còn lại coi như chưa chọn.
 */
const normalizeSelfClass = (value: unknown) => {
  const text = String(value ?? "")
    .toLowerCase()
    .trim();
  if (text === "lao động" || text === "lao dong") return SELF_CLASS_LAO_DONG;
  if (text === "phụ thuộc" || text === "phu thuoc") return SELF_CLASS_PHU_THUOC;
  return "";
};

/**
 * Thái độ chính trị không cho người dùng nhập — mọi hồ sơ dùng chung câu này,
 * áp cho bản thân, cha mẹ, vợ/chồng, anh chị em và từng giai đoạn quá trình.
 */
const DEFAULT_POLITICS =
  "Bản thân luôn chấp hành chủ trương, đường lối của Đảng, chính sách, pháp luật của Nhà nước và quy định của địa phương. Không vi phạm pháp luật.";

/** Tình hình kinh tế cũng gán cứng, không cho nhập. */
const DEFAULT_ECON = "Ổn định";

const ID_NO_PATTERN = /^\d{12}$/;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const dateInputValue = (value: string | null | undefined): string => {
  if (!value) return "";

  // Nếu đã là yyyy-MM-dd thì giữ nguyên
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;

  return `${year}-${month}-${day}`;
};

/** boolean | null trong state  →  giá trị chuỗi của <select> */
const boolToSelect = (value: unknown) =>
  value === true ? "true" : value === false ? "false" : "";

/** giá trị chuỗi của <select>  →  boolean | null lưu vào state */
const selectToBool = (value: string) =>
  value === "true" ? true : value === "false" ? false : null;

/** Ô nhập số: để trống ⇒ null (KHÔNG phải 0). */
const numberInputValue = (value: string) => {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeGender = (value: unknown) => {
  const gender = String(value ?? "")
    .toLowerCase()
    .trim();
  if (gender === "nam") return "nam";
  if (gender === "nu" || gender === "nữ") return "nu";
  return "";
};

const getApiErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object") {
    const response = error as {
      message?: string;
      data?: { message?: string };
    };
    return response.data?.message ?? response.message;
  }
  return undefined;
};

const DATE_KEYS = new Set([
  "dob",
  "party_date",
  "party_full",
  "union_date",
  "reviewed_at",
]);

/**
 * Chuyển mọi field ngày về dạng `yyyy-MM-dd` để gắn vào <input type="date">.
 * Cố ý KHÔNG đụng tới gender / alive / adopted — các field đó nay do <select>
 * quản lý và giữ nguyên giá trị gốc của DB (nam|nu, boolean).
 */
function normalizeDates<T>(data: T): T {
  if (Array.isArray(data)) return data.map(normalizeDates) as T;
  if (data === null || typeof data !== "object") return data;

  return Object.fromEntries(
    Object.entries(data as Record<string, unknown>).map(([key, value]) =>
      DATE_KEYS.has(key) && typeof value === "string"
        ? [key, dateInputValue(value)]
        : [key, normalizeDates(value)],
    ),
  ) as T;
}

const nullableValue = (value: string | null | undefined) =>
  value === "" || value === undefined || value === null ? null : value;

const nullableNumber = (value: number | string | null | undefined) => {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

// ─── Chuẩn hoá payload gửi lên API ────────────────────────────────────────────

function normalizeRelative(
  relative: MilitaryCvRelative | null | undefined,
): MilitaryCvRelative | null {
  if (!relative || typeof relative !== "object") return null;

  return {
    name: nullableValue(relative.name),
    alive: typeof relative.alive === "boolean" ? relative.alive : null,
    dob: nullableValue(relative.dob),
    job: nullableValue(relative.job),
    addr: nullableValue(relative.addr),
    label: nullableValue(relative.label) as MilitaryCvRelative["label"],
    gender: (normalizeGender(relative.gender) ||
      null) as MilitaryCvRelative["gender"],
    adopted: typeof relative.adopted === "boolean" ? relative.adopted : null,
    econ: DEFAULT_ECON,
    politics: DEFAULT_POLITICS,
  };
}

/**
 * Các field thực sự chứng tỏ "đã có nhập thông tin người này".
 * Cố ý loại `alive` / `gender` / `label` / `adopted`: đó là thuộc tính mô tả,
 * bản thân chúng không tạo ra một con người — một record chỉ có `alive: true`
 * là dữ liệu rác còn sót lại, phải coi như rỗng.
 * `econ` / `politics` cũng bị loại vì nay là giá trị mặc định tự sinh, ai cũng
 * như ai — giữ lại sẽ làm mọi người thân trông như "đã có dữ liệu".
 */
const RELATIVE_DATA_KEYS = [
  "name",
  "dob",
  "job",
  "addr",
] as const satisfies readonly (keyof MilitaryCvRelative)[];

const hasRelativeData = (relative: MilitaryCvRelative | null | undefined) => {
  if (!relative || typeof relative !== "object") return false;

  return RELATIVE_DATA_KEYS.some((key) => {
    const value = relative[key];
    return value !== null && value !== undefined && String(value).trim() !== "";
  });
};

function normalizeReview(review: MilitaryCvReview | null | undefined) {
  if (!review) return null;
  return {
    note: nullableValue(review.note),
    reviewed_at: nullableValue(review.reviewed_at),
    signer: nullableValue(review.signer),
    title: nullableValue(review.title),
  };
}

function normalizePeriod(period: MilitaryCvPeriod) {
  return {
    subject: nullableValue(period.subject) as MilitaryCvPeriod["subject"],
    // Không thu thập năm nữa — mốc thời gian nằm trong nội dung quá trình.
    year_from: null,
    year_to: null,
    note: nullableValue(period.note),
    econ: DEFAULT_ECON,
    politics: DEFAULT_POLITICS,
  } satisfies MilitaryCvPeriod;
}

type FamilyCounts = {
  sibling_count: number;
  son_count: number;
  daughter_count: number;
  child_count: number;
};

/**
 * Các dòng lặp lại (anh chị em, con, quá trình) mang thêm `_uid` chỉ tồn tại
 * phía client, dùng làm React key ổn định để xoá một dòng ở giữa không làm
 * các dòng sau mất focus. `_uid` bị loại bỏ khi build payload gửi lên API.
 */
type RelativeRow = MilitaryCvRelative & { _uid: string };
type PeriodRow = MilitaryCvPeriod & { _uid: string };

type FamilyState = Omit<MilitaryCvFamily, "siblings" | "children"> & {
  siblings?: RelativeRow[] | null;
  children?: RelativeRow[] | null;
};

type HistoryState = Omit<MilitaryCvHistory, "periods"> & {
  periods?: PeriodRow[] | null;
};

let uidCounter = 0;
const nextUid = () => {
  uidCounter += 1;
  return `row-${uidCounter}`;
};

const withUid = <T,>(item: T): T & { _uid: string } => ({
  ...item,
  _uid: nextUid(),
});

function buildUpdatePayload({
  topLevel,
  profile,
  family,
  counts,
  history,
  reviews,
}: {
  topLevel: { full_name: string; dob: string; id_no: string };
  profile: MilitaryCvProfile;
  family: FamilyState;
  counts: FamilyCounts;
  history: HistoryState;
  reviews: MilitaryCvReviews;
}) {
  return {
    full_name: nullableValue(topLevel.full_name),
    dob: nullableValue(topLevel.dob),
    id_no: nullableValue(topLevel.id_no),
    profile: {
      ...profile,
      // <select> đã cho sẵn giá trị hợp lệ; chuẩn hoá lần nữa phòng dữ liệu cũ
      gender: (normalizeGender(profile.gender) ||
        null) as MilitaryCvProfile["gender"],
      self_class: nullableValue(normalizeSelfClass(profile.self_class)),
      party_date: nullableValue(profile.party_date),
      party_full: nullableValue(profile.party_full),
      union_date: nullableValue(profile.union_date),
    },
    family: {
      ...family,
      ...counts,
      birth_order: nullableNumber(family.birth_order),
      father: normalizeRelative(family.father),
      mother: normalizeRelative(family.mother),
      // Vợ/chồng để trống hoàn toàn ⇒ lưu NULL thay vì một record toàn null.
      spouse: hasRelativeData(family.spouse)
        ? normalizeRelative(family.spouse)
        : null,
      siblings: (family.siblings ?? [])
        .map(normalizeRelative)
        .filter((item): item is MilitaryCvRelative => item !== null),
      children: (family.children ?? [])
        .map(normalizeRelative)
        .filter((item): item is MilitaryCvRelative => item !== null),
    },
    history: {
      ...history,
      politics: DEFAULT_POLITICS,
      periods: (history.periods ?? []).map(normalizePeriod),
    },
    reviews: {
      police: normalizeReview(reviews.police),
      military: normalizeReview(reviews.military),
      council: normalizeReview(reviews.council),
    },
  };
}

// ─── Mô tả field ──────────────────────────────────────────────────────────────

type FieldType = "text" | "date" | "number" | "select";

type FieldDef<T> = {
  field: keyof T;
  label: string;
  type?: FieldType;
  options?: SelectOption[];
  /** true ⇒ giá trị trong state là boolean | null, cần map qua boolToSelect */
  boolean?: boolean;
  /** true ⇒ hiện dấu * đỏ và được validateCv kiểm tra */
  required?: boolean;
};

const profileFields: FieldDef<MilitaryCvProfile>[] = [
  {
    field: "gender",
    label: "Giới tính",
    type: "select",
    options: GENDER_OPTIONS,
    // Bắt buộc vì các số đếm gia đình được tính từ giới tính; thiếu là lệch.
    required: true,
  },
  { field: "pob", label: "Nơi đăng ký khai sinh", required: true },
  { field: "hometown", label: "Quê quán", required: true },
  { field: "ethnicity", label: "Dân tộc", required: true },
  { field: "religion", label: "Tôn giáo", required: true },
  { field: "nationality", label: "Quốc tịch" },
  { field: "home_addr", label: "Nơi thường trú của gia đình", required: true },
  { field: "curr_addr", label: "Nơi ở hiện tại của bản thân", required: true },
  { field: "family_class", label: "Thành phần gia đình" },
  {
    field: "self_class",
    label: "Thành phần bản thân",
    type: "select",
    options: SELF_CLASS_OPTIONS,
    required: true,
  },
  { field: "edu_level", label: "Trình độ giáo dục phổ thông", required: true },
  { field: "degree", label: "Trình độ đào tạo", required: true },
  { field: "language", label: "Ngoại ngữ", required: true },
  { field: "major", label: "Chuyên ngành đào tạo" },
  { field: "party_date", label: "Ngày vào Đảng dự bị", type: "date" },
  { field: "party_full", label: "Ngày vào Đảng chính thức", type: "date" },
  { field: "union_date", label: "Ngày vào Đoàn", type: "date" },
  { field: "reward", label: "Khen thưởng" },
  { field: "discipline", label: "Kỷ luật" },
  { field: "job", label: "Nghề nghiệp", required: true },
  { field: "salary", label: "Lương" },
  { field: "grade", label: "Ngạch" },
  { field: "step", label: "Bậc" },
  { field: "workplace", label: "Nơi làm việc (học tập)", required: true },
  { field: "overseas", label: "Đã đi nước ngoài" },
];

/** Cha / Mẹ — theo biểu mẫu thì họ tên, tình trạng, ngày sinh, nghề nghiệp là bắt buộc. */
const parentFields: FieldDef<MilitaryCvRelative>[] = [
  { field: "name", label: "Họ tên", required: true },
  {
    field: "alive",
    label: "Tình trạng",
    type: "select",
    options: ALIVE_OPTIONS,
    boolean: true,
    required: true,
  },
  { field: "dob", label: "Ngày sinh", type: "date", required: true },
  { field: "job", label: "Nghề nghiệp", required: true },
  { field: "addr", label: "Nơi ở" },
];

/** Vợ/chồng dùng chung bố cục với cha mẹ nhưng không có field nào bắt buộc. */
const spouseFields: FieldDef<MilitaryCvRelative>[] = parentFields.map(
  (def) => ({
    ...def,
    required: false,
  }),
);

// ─── Kiểm tra dữ liệu bắt buộc ────────────────────────────────────────────────
// Cùng cách làm với validateForm() của form đăng ký công khai
// (app/website/tiep-nhan-dang-ky), bỏ các field không có ở trang này
// (phone, guardian_phone, training_system, captcha).
//
// Danh sách field bắt buộc KHÔNG khai báo lại ở đây — nó được suy ra từ cờ
// `required` trong các FieldDef phía trên, nên dấu * đỏ và phép kiểm tra không
// bao giờ lệch nhau.

const isBlank = (value: unknown) =>
  value === null || value === undefined || String(value).trim() === "";

/**
 * `invalid` chứa đường dẫn field để tô viền đỏ ("profile.pob", "father.name"…);
 * `messages` là các câu dùng cho toast khi bấm Lưu.
 */
type CvValidation = {
  invalid: Set<string>;
  messages: string[];
};

const RELATION_LABEL = { father: "Cha", mother: "Mẹ" } as const;

function validateCv({
  topLevel,
  profile,
  family,
}: {
  topLevel: { full_name: string; dob: string; id_no: string };
  profile: MilitaryCvProfile;
  family: FamilyState;
}): CvValidation {
  const invalid = new Set<string>();
  const messages: string[] = [];

  const fail = (key: string, message: string) => {
    invalid.add(key);
    messages.push(message);
  };

  if (isBlank(topLevel.full_name))
    fail("full_name", "Vui lòng nhập họ, chữ đệm và tên khai sinh.");

  if (isBlank(topLevel.dob)) {
    fail("dob", "Vui lòng chọn ngày sinh.");
  } else if (new Date(topLevel.dob) >= new Date()) {
    fail("dob", "Ngày sinh phải nhỏ hơn ngày hiện tại.");
  }

  if (isBlank(topLevel.id_no)) {
    fail("id_no", "Vui lòng nhập số thẻ căn cước/CCCD.");
  } else if (!ID_NO_PATTERN.test(topLevel.id_no)) {
    fail("id_no", "Số thẻ căn cước/CCCD gồm đúng 12 chữ số.");
  }

  // "chọn" cho select/date, "nhập" cho ô gõ tay.
  const verb = (type?: FieldType) =>
    type === "select" || type === "date" ? "chọn" : "nhập";

  for (const def of profileFields) {
    if (def.required && isBlank(profile[def.field]))
      fail(
        `profile.${String(def.field)}`,
        `Vui lòng ${verb(def.type)} ${def.label.toLowerCase()}.`,
      );
  }

  for (const relation of ["father", "mother"] as const) {
    const relative = family[relation] ?? {};
    for (const def of parentFields) {
      if (def.required && isBlank(relative[def.field]))
        fail(
          `${relation}.${String(def.field)}`,
          `${RELATION_LABEL[relation]}: vui lòng ${verb(def.type)} ${def.label.toLowerCase()}.`,
        );
    }
  }

  if (isBlank(family.birth_order))
    fail("birth_order", "Vui lòng nhập bản thân là con thứ mấy.");

  // Khối anh/chị/em cố ý KHÔNG ràng buộc field nào: có người khai đủ, có người
  // chỉ khai một phần, và cũng có người không có anh chị em. Vì vậy số con
  // trai/con gái chỉ đếm những ai đã chọn giới tính — không bắt phải khớp với
  // tổng số con, nếu không sẽ chặn lưu mà không chỉ ra được ô nào sai.

  return { invalid, messages };
}

const siblingFields: FieldDef<MilitaryCvRelative>[] = [
  {
    field: "label",
    label: "Quan hệ",
    type: "select",
    options: SIBLING_LABEL_OPTIONS,
  },
  { field: "name", label: "Họ tên" },
  { field: "dob", label: "Ngày sinh", type: "date" },
  { field: "job", label: "Nghề nghiệp" },
  { field: "addr", label: "Nơi ở" },
  {
    field: "gender",
    label: "Giới tính",
    type: "select",
    options: GENDER_OPTIONS,
  },
  {
    field: "alive",
    label: "Tình trạng",
    type: "select",
    options: ALIVE_OPTIONS,
    boolean: true,
  },
];

const childFields: FieldDef<MilitaryCvRelative>[] = [
  { field: "name", label: "Họ tên" },
  { field: "dob", label: "Ngày sinh", type: "date" },
  {
    field: "gender",
    label: "Giới tính",
    type: "select",
    options: GENDER_OPTIONS,
  },
  {
    field: "adopted",
    label: "Con đẻ / con nuôi",
    type: "select",
    options: ADOPTED_OPTIONS,
    boolean: true,
  },
];

// ─── Component nhập liệu ──────────────────────────────────────────────────────

const inputClass =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition-shadow focus:border-[#546a2f] focus:ring-2 focus:ring-[#dce5c8]";

/** Nhãn field, kèm dấu * đỏ khi bắt buộc. */
function FieldLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <span className="mb-1 block text-xs font-semibold text-gray-600">
      {label}
      {required ? <span className="text-red-500"> *</span> : null}
    </span>
  );
}

function EditField({
  label,
  value,
  onChange,
  type = "text",
  required,
  invalid,
  maxLength,
}: {
  label: string;
  value: string | number | null | undefined;
  onChange: (value: string) => void;
  type?: "text" | "date" | "number";
  required?: boolean;
  /** Tô viền đỏ; không kèm dòng text — lý do được báo qua toast khi bấm Lưu. */
  invalid?: boolean;
  maxLength?: number;
}) {
  return (
    <label>
      <FieldLabel label={label} required={required} />
      <input
        type={type}
        value={value ?? ""}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        className={
          invalid
            ? `${inputClass} border-red-400 focus:border-red-400 focus:ring-red-100`
            : inputClass
        }
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  required,
  invalid,
}: {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  required?: boolean;
  invalid?: boolean;
}) {
  return (
    <label>
      <FieldLabel label={label} required={required} />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        className={
          invalid
            ? `${inputClass} border-red-400 focus:border-red-400 focus:ring-red-100`
            : inputClass
        }
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Render EditField hoặc SelectField dựa theo mô tả field. */
function FormField<T>({
  def,
  source,
  onChange,
  invalid,
}: {
  def: FieldDef<T>;
  source: Partial<T>;
  onChange: (field: keyof T, value: string) => void;
  invalid?: boolean;
}) {
  const raw = source[def.field];

  if (def.type === "select") {
    return (
      <SelectField
        label={def.label}
        options={def.options ?? []}
        value={def.boolean ? boolToSelect(raw) : String(raw ?? "")}
        onChange={(value) => onChange(def.field, value)}
        required={def.required}
        invalid={invalid}
      />
    );
  }

  return (
    <EditField
      label={def.label}
      type={def.type ?? "text"}
      value={raw as string | number | null | undefined}
      onChange={(value) => onChange(def.field, value)}
      required={def.required}
      invalid={invalid}
    />
  );
}

function ReadonlyCount({
  label,
  value,
  required,
}: {
  label: string;
  value: number;
  required?: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
      <p className="text-xs font-semibold text-gray-600">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </p>
      <p className="mt-1 text-sm font-semibold text-gray-800">{value}</p>
    </div>
  );
}

function ReviewEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: MilitaryCvReview;
  onChange: (value: MilitaryCvReview) => void;
}) {
  const update = (field: keyof MilitaryCvReview, next: string) =>
    onChange({ ...value, [field]: next });

  return (
    <div className="rounded-xl border border-amber-200 bg-[#fffaf0] p-5">
      <h3 className="mb-4 font-semibold text-[#5d4a18]">{label}</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-gray-600">
            Nội dung kết luận
          </span>
          <textarea
            value={value.note ?? ""}
            onChange={(event) => update("note", event.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-200 bg-white p-3 text-sm outline-none transition-shadow focus:border-[#546a2f] focus:ring-2 focus:ring-[#f1e3ad]"
            placeholder="Ví dụ: Đủ điều kiện nhập ngũ"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-gray-600">
            Ngày kết luận
          </span>
          <input
            type="date"
            value={value.reviewed_at ?? ""}
            onChange={(event) => update("reviewed_at", event.target.value)}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition-shadow focus:border-[#546a2f] focus:ring-2 focus:ring-[#f1e3ad]"
          />
        </label>
        <label>
          <span className="mb-1 block text-xs font-semibold text-gray-600">
            Người ký
          </span>
          <input
            value={value.signer ?? ""}
            onChange={(event) => update("signer", event.target.value)}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition-shadow focus:border-[#546a2f] focus:ring-2 focus:ring-[#f1e3ad]"
            placeholder="Nhập họ tên người ký"
          />
        </label>
        <label className="md:col-span-2">
          <span className="mb-1 block text-xs font-semibold text-gray-600">
            Chức danh
          </span>
          <input
            value={value.title ?? ""}
            onChange={(event) => update("title", event.target.value)}
            className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition-shadow focus:border-[#546a2f] focus:ring-2 focus:ring-[#f1e3ad]"
            placeholder="Ví dụ: Trưởng Công an"
          />
        </label>
      </div>
    </div>
  );
}

const emptyRelative = (): RelativeRow =>
  withUid<MilitaryCvRelative>({
    label: "",
    name: "",
    dob: "",
    job: "",
    addr: "",
    gender: "",
    alive: null,
    adopted: null,
    econ: "",
    politics: "",
  });

const emptyPeriod = (): PeriodRow =>
  withUid<MilitaryCvPeriod>({
    subject: null,
    year_from: null,
    year_to: null,
    note: "",
    econ: "",
    politics: "",
  });

// ─── Trang ────────────────────────────────────────────────────────────────────

export default function MilitaryCvDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [record, setRecord] = useState<MilitaryCvRecord | null>(null);
  const [topLevel, setTopLevel] = useState({
    full_name: "",
    dob: "",
    id_no: "",
  });
  const [profile, setProfile] = useState<MilitaryCvProfile>({});
  const [family, setFamily] = useState<FamilyState>({});
  const [history, setHistory] = useState<HistoryState>({});
  const [reviews, setReviews] = useState<MilitaryCvReviews>({
    police: { ...emptyReview },
    military: { ...emptyReview },
    council: { ...emptyReview },
  });
  const [baseline, setBaseline] = useState<string | null>(null);
  // Form vợ/chồng chỉ hiện khi hồ sơ đã có dữ liệu, hoặc khi người dùng bấm thêm.
  const [showSpouse, setShowSpouse] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  /**
   * Số thành viên gia đình được TÍNH RA từ danh sách, không lưu rời trong state
   * nên không bao giờ lệch. Theo schema, `sibling_count` là tổng số con của cha
   * mẹ — đã bao gồm bản thân, nên cộng thêm 1.
   */
  const counts = useMemo<FamilyCounts>(() => {
    const siblings = family.siblings ?? [];
    const children = family.children ?? [];
    const selfGender = normalizeGender(profile.gender);

    const countGender = (target: "nam" | "nu") =>
      siblings.filter((item) => normalizeGender(item.gender) === target)
        .length + (selfGender === target ? 1 : 0);

    return {
      sibling_count: siblings.length + 1,
      son_count: countGender("nam"),
      daughter_count: countGender("nu"),
      child_count: children.length,
    };
  }, [family.siblings, family.children, profile.gender]);

  const payload = useMemo(
    () =>
      buildUpdatePayload({
        topLevel,
        profile,
        family,
        counts,
        history,
        reviews,
      }),
    [topLevel, profile, family, counts, history, reviews],
  );

  const { invalid, messages } = useMemo(
    () => validateCv({ topLevel, profile, family }),
    [topLevel, profile, family],
  );

  const isDirty = baseline !== null && JSON.stringify(payload) !== baseline;

  const applyRecord = useCallback((data: MilitaryCvRecord) => {
    const normalized = normalizeDates(data);

    setRecord(normalized);
    setTopLevel({
      full_name: normalized.full_name ?? "",
      dob: normalized.dob ?? "",
      id_no: normalized.id_no ?? "",
    });
    setProfile({
      ...(normalized.profile ?? {}),
      // Quy giá trị cũ về đúng option, nếu không <select> sẽ hiển thị rỗng
      // trong khi state vẫn giữ chuỗi cũ và lưu ngược lại y nguyên.
      self_class: normalizeSelfClass(normalized.profile?.self_class),
    });
    setFamily({
      ...(normalized.family ?? {}),
      siblings: (normalized.family?.siblings ?? []).map(withUid),
      children: (normalized.family?.children ?? []).map(withUid),
    });
    setShowSpouse(hasRelativeData(normalized.family?.spouse));
    setHistory({
      ...(normalized.history ?? {}),
      periods: (normalized.history?.periods ?? []).map(withUid),
    });
    setReviews({
      police: { ...emptyReview, ...(normalized.reviews?.police ?? {}) },
      military: { ...emptyReview, ...(normalized.reviews?.military ?? {}) },
      council: { ...emptyReview, ...(normalized.reviews?.council ?? {}) },
    });
    // Mốc so sánh để biết form có thay đổi chưa lưu hay không.
    setBaseline(null);
  }, []);

  const fetchRecord = useCallback(async () => {
    try {
      applyRecord(await militaryCvApi.getById(Number(id)));
    } catch {
      toast.error("Không tìm thấy hồ sơ NVQS.");
      router.push("/military-cv");
    } finally {
      setLoading(false);
    }
  }, [applyRecord, id, router]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  // Sau khi state đã được nạp xong, chụp lại payload làm mốc "chưa chỉnh sửa".
  useEffect(() => {
    if (!loading && baseline === null) setBaseline(JSON.stringify(payload));
  }, [loading, baseline, payload]);

  // Cảnh báo khi đóng tab / reload lúc còn thay đổi chưa lưu.
  useEffect(() => {
    if (!isDirty) return;

    const handler = (event: BeforeUnloadEvent) => event.preventDefault();

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const goBack = () => {
    if (
      isDirty &&
      !window.confirm("Còn thay đổi chưa lưu. Rời khỏi trang và bỏ thay đổi?")
    ) {
      return;
    }
    router.push("/military-cv");
  };

  const updateReview = (
    key: keyof MilitaryCvReviews,
    value: MilitaryCvReview,
  ) => setReviews((current) => ({ ...current, [key]: value }));

  const saveAll = async () => {
    if (messages.length > 0) {
      toast.error(messages[0] ?? "Vui lòng kiểm tra lại các trường bắt buộc.");
      return;
    }

    setSaving(true);
    try {
      const saved = await militaryCvApi.update(Number(id), payload);
      // Nạp lại state từ bản ghi server trả về để form luôn khớp với DB.
      applyRecord(saved);
      toast.success("Đã lưu toàn bộ hồ sơ NVQS.");
    } catch (error) {
      toast.error(getApiErrorMessage(error) ?? "Lưu hồ sơ thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const exportDocx = async () => {
    // File DOCX được sinh từ dữ liệu trong DB, nên thay đổi chưa lưu sẽ không
    // xuất hiện trong file tải về.
    if (
      isDirty &&
      !window.confirm(
        "Còn thay đổi chưa lưu — file DOCX sẽ lấy dữ liệu đã lưu trước đó. Vẫn tải?",
      )
    ) {
      return;
    }

    setExporting(true);
    try {
      const result = await militaryCvApi.exportDocx(
        Number(id),
        payload.full_name ?? "",
      );
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      toast.success("Đã tải file DOCX.");
    } catch (error) {
      toast.error(getApiErrorMessage(error) ?? "Không thể tải file DOCX.");
    } finally {
      setExporting(false);
    }
  };

  const parseRelativeField = (
    field: keyof MilitaryCvRelative,
    value: string,
  ) => (field === "alive" || field === "adopted" ? selectToBool(value) : value);

  const updateRelative = (
    relation: "father" | "mother" | "spouse",
    field: keyof MilitaryCvRelative,
    value: string,
  ) =>
    // Dùng updater-form: đọc từ `state` chứ không từ biến `family` của render
    // hiện tại, tránh mất thay đổi khi nhiều update dồn trong cùng một batch.
    setFamily((state) => ({
      ...state,
      [relation]: {
        ...(state[relation] ?? {}),
        [field]: parseRelativeField(field, value),
      },
    }));

  const updateRelativeList = (
    relation: "siblings" | "children",
    index: number,
    field: keyof MilitaryCvRelative,
    value: string,
  ) =>
    setFamily((state) => {
      const list = [...(state[relation] ?? [])];
      list[index] = {
        ...(list[index] ?? {}),
        [field]: parseRelativeField(field, value),
      };
      return { ...state, [relation]: list };
    });

  const addRelative = (relation: "siblings" | "children") =>
    setFamily((state) => ({
      ...state,
      [relation]: [...(state[relation] ?? []), emptyRelative()],
    }));

  const removeRelative = (relation: "siblings" | "children", index: number) =>
    setFamily((state) => ({
      ...state,
      [relation]: (state[relation] ?? []).filter((_, i) => i !== index),
    }));

  const addSpouse = () => {
    setShowSpouse(true);
    setFamily((state) => ({ ...state, spouse: state.spouse ?? {} }));
  };

  const removeSpouse = () => {
    if (
      hasRelativeData(family.spouse) &&
      !window.confirm("Xoá toàn bộ thông tin vợ/chồng?")
    ) {
      return;
    }
    setShowSpouse(false);
    setFamily((state) => ({ ...state, spouse: null }));
  };

  const addHistoryPeriod = () =>
    setHistory((state) => ({
      ...state,
      periods: [...(state.periods ?? []), emptyPeriod()],
    }));

  const removeHistoryPeriod = (index: number) =>
    setHistory((state) => ({
      ...state,
      periods: (state.periods ?? []).filter((_, i) => i !== index),
    }));

  const updatePeriod = (
    index: number,
    field: keyof MilitaryCvPeriod,
    value: string,
  ) =>
    setHistory((state) => {
      const periods = [...(state.periods ?? [])];
      periods[index] = { ...(periods[index] ?? {}), [field]: value };
      return { ...state, periods };
    });

  const renderRelativeEditor = (
    relation: "father" | "mother" | "spouse",
    label: string,
    onRemove?: () => void,
  ) => {
    const relative = family[relation] ?? {};
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-gray-700">{label}</h3>
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50"
            >
              Xóa
            </button>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {(relation === "spouse" ? spouseFields : parentFields).map((def) => (
            <FormField
              key={String(def.field)}
              def={def}
              source={relative}
              invalid={invalid.has(`${relation}.${String(def.field)}`)}
              onChange={(field, value) =>
                updateRelative(relation, field, value)
              }
            />
          ))}
        </div>
      </div>
    );
  };

  const saveButton = (extraClass = "") => (
    <button
      type="button"
      onClick={() => void saveAll()}
      disabled={saving}
      className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors disabled:opacity-60 ${
        messages.length > 0
          ? "bg-gray-400 hover:bg-gray-500"
          : "bg-[#546a2f] hover:bg-[#3d5020]"
      } ${extraClass}`}
    >
      {saving ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      {saving ? "Đang lưu..." : "Lưu hồ sơ"}
    </button>
  );

  if (loading)
    return (
      <div className="animate-pulse rounded-xl bg-white p-8 text-gray-400">
        Đang tải hồ sơ...
      </div>
    );
  if (!record) return null;

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#dce5c8] bg-[#f7f9f1] p-5">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-white hover:text-[#546a2f]"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#71834a]">
              Chi tiết hồ sơ
            </p>
            <span className="text-xs text-gray-500">Mã hồ sơ #{record.id}</span>
          </div>
          <button
            type="button"
            onClick={() => void exportDocx()}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-lg border border-[#546a2f] px-3 py-2 text-sm font-semibold text-[#546a2f] transition-colors hover:bg-white disabled:opacity-60"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {exporting ? "Đang tải..." : "Tải DOCX"}
          </button>
          {saveButton()}
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <EditField
            label="Họ và tên"
            value={topLevel.full_name}
            required
            invalid={invalid.has("full_name")}
            onChange={(value) =>
              setTopLevel((state) => ({ ...state, full_name: value }))
            }
          />
          <EditField
            label="Ngày sinh"
            type="date"
            value={topLevel.dob}
            required
            invalid={invalid.has("dob")}
            onChange={(value) =>
              setTopLevel((state) => ({ ...state, dob: value }))
            }
          />
          <EditField
            label="Số CCCD"
            value={topLevel.id_no}
            maxLength={12}
            required
            invalid={invalid.has("id_no")}
            onChange={(value) =>
              setTopLevel((state) => ({
                ...state,
                id_no: value.replace(/\D/g, "").slice(0, 12),
              }))
            }
          />
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#71834a]">
            Phần I
          </p>
          <h2 className="mt-1 text-lg font-bold text-gray-800">
            Sơ yếu lý lịch
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {profileFields.map((def) => (
            <FormField
              key={String(def.field)}
              def={def}
              source={profile}
              invalid={invalid.has(`profile.${String(def.field)}`)}
              onChange={(field, value) =>
                setProfile((state) => ({ ...state, [field]: value }))
              }
            />
          ))}
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#71834a]">
            Thông tin gia đình
          </p>
          <h2 className="mt-1 text-lg font-bold text-gray-800">
            Cha mẹ, vợ/chồng, anh chị em và con
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <ReadonlyCount
            label="Tổng số con của cha mẹ"
            value={counts.sibling_count}
            required
          />
          <ReadonlyCount
            label="Số con trai của cha mẹ"
            value={counts.son_count}
            required
          />
          <ReadonlyCount
            label="Số con gái của cha mẹ"
            value={counts.daughter_count}
            required
          />
          <EditField
            label="Bản thân là con thứ mấy"
            type="number"
            value={family.birth_order}
            required
            invalid={invalid.has("birth_order")}
            onChange={(value) =>
              setFamily((state) => ({
                ...state,
                birth_order: numberInputValue(value),
              }))
            }
          />
          <ReadonlyCount label="Số con" value={counts.child_count} />
        </div>
        <p className="text-xs text-gray-400">
          Các ô được tô xám tự động tính từ danh sách bên dưới và giới tính ở
          phần Sơ yếu lý lịch.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {renderRelativeEditor("father", "Cha")}
          {renderRelativeEditor("mother", "Mẹ")}
          {showSpouse ? (
            renderRelativeEditor("spouse", "Vợ/chồng", removeSpouse)
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 p-4 text-center">
              <p className="text-sm text-gray-400">
                Chưa có thông tin vợ/chồng
              </p>
              <button
                type="button"
                onClick={addSpouse}
                className="rounded-lg border border-[#546a2f] px-3 py-2 text-sm font-semibold text-[#546a2f] transition-colors hover:bg-[#f7f9f1]"
              >
                + Thêm vợ/chồng
              </button>
            </div>
          )}
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Anh/chị/em</h3>

            <button
              type="button"
              onClick={() => addRelative("siblings")}
              className="rounded-lg border border-[#546a2f] px-3 py-2 text-sm font-semibold text-[#546a2f] transition-colors hover:bg-[#f7f9f1]"
            >
              + Thêm anh/chị/em
            </button>
          </div>

          {(family.siblings ?? []).length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-400">
              Chưa có thông tin anh/chị/em
            </div>
          )}

          {(family.siblings ?? []).map((relative, index) => (
            <div
              key={relative._uid}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-700">
                  Anh/chị/em {index + 1}
                </h3>

                <button
                  type="button"
                  onClick={() => removeRelative("siblings", index)}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50"
                >
                  Xóa
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {siblingFields.map((def) => (
                  <FormField
                    key={String(def.field)}
                    def={def}
                    source={relative}
                    onChange={(field, value) =>
                      updateRelativeList("siblings", index, field, value)
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ==================== CON ==================== */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#3d5020]">Con</h3>

            <button
              type="button"
              onClick={() => addRelative("children")}
              className="rounded-lg border border-[#546a2f] px-3 py-2 text-sm font-semibold text-[#546a2f] transition-colors hover:bg-[#f7f9f1]"
            >
              + Thêm con
            </button>
          </div>

          {(family.children ?? []).length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-400">
              Chưa có thông tin con
            </div>
          )}

          {(family.children ?? []).map((relative, index) => (
            <div
              key={relative._uid}
              className="rounded-lg border border-[#dce5c8] bg-[#f7f9f1] p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-[#3d5020]">
                  Con {index + 1}
                </h3>

                <button
                  type="button"
                  onClick={() => removeRelative("children", index)}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50"
                >
                  Xóa
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {childFields.map((def) => (
                  <FormField
                    key={String(def.field)}
                    def={def}
                    source={relative}
                    onChange={(field, value) =>
                      updateRelativeList("children", index, field, value)
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#71834a]">
            Phần II + III
          </p>
          <h2 className="mt-1 text-lg font-bold text-gray-800">
            Quá trình kinh tế, chính trị và công tác
          </h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">
              Quá trình kinh tế, chính trị và công tác
            </h3>

            <button
              type="button"
              onClick={addHistoryPeriod}
              className="rounded-lg border border-[#546a2f] px-3 py-2 text-sm font-semibold text-[#546a2f] transition-colors hover:bg-[#f7f9f1]"
            >
              + Thêm quá trình
            </button>
          </div>

          {(history.periods ?? []).length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-400">
              Chưa có quá trình công tác
            </div>
          )}

          {(history.periods ?? []).map((period, index) => (
            <div
              key={period._uid}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-700">
                  Quá trình {index + 1}
                </h3>

                <button
                  type="button"
                  onClick={() => removeHistoryPeriod(index)}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50"
                >
                  Xóa
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <SelectField
                  label="Đối tượng"
                  value={period.subject ?? ""}
                  options={PERIOD_SUBJECT_OPTIONS}
                  onChange={(value) => updatePeriod(index, "subject", value)}
                />

                <EditField
                  label="Nội dung"
                  value={period.note}
                  onChange={(value) => updatePeriod(index, "note", value)}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a7b25]">
            Phần IV + V + VI
          </p>
          <h2 className="mt-1 text-lg font-bold text-gray-800">
            Kết luận của cơ quan
          </h2>
        </div>
        <ReviewEditor
          label="IV. Công an cấp phường"
          value={reviews.police ?? { ...emptyReview }}
          onChange={(value) => updateReview("police", value)}
        />
        <ReviewEditor
          label="V. Ban CHQS cấp phường"
          value={reviews.military ?? { ...emptyReview }}
          onChange={(value) => updateReview("military", value)}
        />
        <ReviewEditor
          label="VI. Hội đồng NVQS"
          value={reviews.council ?? { ...emptyReview }}
          onChange={(value) => updateReview("council", value)}
        />
        {saveButton("sticky bottom-3")}
      </section>
    </div>
  );
}
