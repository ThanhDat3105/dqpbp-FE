"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import {
  militaryCvApi,
  type MilitaryCvFamily,
  type MilitaryCvHistory,
  type MilitaryCvProfile,
  type MilitaryCvRecord,
  type MilitaryCvRelative,
  type MilitaryCvReview,
  type MilitaryCvReviews,
} from "@/services/api/military-cv";
import { PhotoUploader } from "@/components/photoUploader/photoUploader";
const emptyReview: MilitaryCvReview = {
  note: "",
  reviewed_at: "",
  signer: "",
  title: "",
};

const emptyReviews: MilitaryCvReviews = {
  police: { ...emptyReview },
  military: { ...emptyReview },
  council: { ...emptyReview },
};

const display = (value: unknown) =>
  value === null || value === undefined || value === ""
    ? "Chưa cập nhật"
    : String(value);

const dateText = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "Chưa cập nhật";

const dateInputValue = (value: string | null | undefined) =>
  value ? value.slice(0, 10) : "";

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

function normalizeData<T>(data: T): T {
  if (data === null || data === undefined) return "" as T;

  if (typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => normalizeData(item)) as T;
  }

  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      // Null / undefined
      if (value === null || value === undefined) {
        return [key, ""];
      }

      // Date fields
      if (
        typeof value === "string" &&
        [
          "dob",
          "party_date",
          "party_full",
          "union_date",
          "reviewed_at",
        ].includes(key)
      ) {
        return [key, dateInputValue(value)];
      }

      // Alive: boolean -> text
      if (key === "alive") {
        if (value === true) return [key, "Còn sống"];
        if (value === false) return [key, "Đã mất"];
        return [key, ""];
      }

      // Gender: nam/nu -> Nam/Nữ
      if (key === "gender") {
        const gender = String(value).toLowerCase().trim();

        if (gender === "nam") return [key, "Nam"];
        if (gender === "nu" || gender === "nữ") return [key, "Nữ"];

        return [key, value];
      }

      if (key === "adopted") {
        if (value === true) return [key, "Con nuôi"];
      }

      return [key, normalizeData(value)];
    }),
  ) as T;
}

const nullableValue = (value: string | null | undefined) =>
  value === "" || value === undefined ? null : value;

const nullableNumber = (value: number | string | null | undefined) =>
  value === "" || value === undefined ? null : Number(value);

function buildUpdatePayload({
  topLevel,
  profile,
  family,
  history,
  reviews,
}: {
  topLevel: { full_name: string; dob: string; id_no: string; photo: string };
  profile: MilitaryCvProfile;
  family: MilitaryCvFamily;
  history: MilitaryCvHistory;
  reviews: MilitaryCvReviews;
}) {
  return {
    full_name: nullableValue(topLevel.full_name),
    dob: nullableValue(topLevel.dob),
    id_no: nullableValue(topLevel.id_no),
    photo: nullableValue(topLevel.photo),
    profile: {
      ...profile,
      party_date: nullableValue(profile.party_date),
      party_full: nullableValue(profile.party_full),
      union_date: nullableValue(profile.union_date),
    },
    family: {
      ...family,
      sibling_count: nullableNumber(family.sibling_count),
      son_count: nullableNumber(family.son_count),
      daughter_count: nullableNumber(family.daughter_count),
      birth_order: nullableNumber(family.birth_order),
      child_count: nullableNumber(family.child_count),
      father: normalizeRelative(family.father),
      mother: normalizeRelative(family.mother),
      spouse: normalizeRelative(family.spouse),
      siblings: family.siblings
        ?.map(normalizeRelative)
        .filter((item): item is MilitaryCvRelative => item !== null),
      children: family.children
        ?.map(normalizeRelative)
        .filter((item): item is MilitaryCvRelative => item !== null),
    },
    history: {
      ...history,
      politics: nullableValue(history.politics),
      periods: history.periods?.map((period) => ({
        ...period,
        year_from: nullableNumber(period.year_from),
        year_to: nullableNumber(period.year_to),
        note: nullableValue(period.note),
        econ: nullableValue(period.econ),
        politics: nullableValue(period.politics),
      })),
    },
    reviews: {
      police: normalizeReview(reviews.police),
      military: normalizeReview(reviews.military),
      council: normalizeReview(reviews.council),
    },
  };
}

function normalizeRelative(relative: MilitaryCvRelative | null | undefined) {
  if (!relative || typeof relative !== "object") return null;

  const rawAlive = relative.alive as boolean | string | null | undefined;

  const rawAdopted = relative.adopted as boolean | string | null | undefined;

  let alive: boolean | null = null;

  if (rawAlive === true || rawAlive === "true" || rawAlive === "Còn sống") {
    alive = true;
  } else if (
    rawAlive === false ||
    rawAlive === "false" ||
    rawAlive === "Đã mất"
  ) {
    alive = false;
  }

  let adopted: boolean | null = null;

  if (
    rawAdopted === true ||
    rawAdopted === "true" ||
    rawAdopted === "Con nuôi"
  ) {
    adopted = true;
  } else if (rawAdopted === false || rawAdopted === "false") {
    adopted = false;
  }

  let gender: string | null = null;

  const rawGender = relative.gender as string | null | undefined;

  if (rawGender === "Nam" || rawGender === "nam") {
    gender = "nam";
  } else if (rawGender === "Nữ" || rawGender === "nữ" || rawGender === "nu") {
    gender = "nu";
  } else if (rawGender) {
    gender = rawGender;
  }

  return {
    ...relative,

    name: nullableValue(relative.name),
    alive,
    dob: nullableValue(relative.dob),
    job: nullableValue(relative.job),
    addr: nullableValue(relative.addr),
    label: nullableValue(relative.label),
    gender,
    adopted,
    econ: nullableValue(relative.econ),
    politics: nullableValue(relative.politics),
  } as MilitaryCvRelative;
}

function normalizeReview(review: MilitaryCvReview | null | undefined) {
  if (!review) return null;
  return {
    note: nullableValue(review.note),
    reviewed_at: nullableValue(review.reviewed_at),
    signer: nullableValue(review.signer),
    title: nullableValue(review.title),
  };
}

function ReadonlyGrid({ values }: { values: Array<[string, unknown]> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {values.map(([label, value]) => (
        <div key={label} className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            {label}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">
            {display(value)}
          </p>
        </div>
      ))}
    </div>
  );
}

function EditField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number | null | undefined;
  onChange: (value: string) => void;
  type?: "text" | "date" | "number";
}) {
  return (
    <label>
      <span className="mb-1 block text-xs font-semibold text-gray-600">
        {label}
      </span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition-shadow focus:border-[#546a2f] focus:ring-2 focus:ring-[#dce5c8]"
      />
    </label>
  );
}

const profileFields: Array<[keyof MilitaryCvProfile, string, "text" | "date"]> =
  [
    ["gender", "Giới tính", "text"],
    ["pob", "Nơi đăng ký khai sinh", "text"],
    ["hometown", "Quê quán", "text"],
    ["ethnicity", "Dân tộc", "text"],
    ["religion", "Tôn giáo", "text"],
    ["nationality", "Quốc tịch", "text"],
    ["home_addr", "Thường trú", "text"],
    ["curr_addr", "Nơi ở hiện tại", "text"],
    ["family_class", "Thành phần gia đình", "text"],
    ["self_class", "Thành phần bản thân", "text"],
    ["edu_level", "Trình độ phổ thông", "text"],
    ["degree", "Trình độ đào tạo", "text"],
    ["language", "Ngoại ngữ", "text"],
    ["major", "Chuyên ngành", "text"],
    ["party_date", "Ngày vào Đảng dự bị", "date"],
    ["party_full", "Ngày vào Đảng chính thức", "date"],
    ["union_date", "Ngày vào Đoàn", "date"],
    ["reward", "Khen thưởng", "text"],
    ["discipline", "Kỷ luật", "text"],
    ["job", "Nghề nghiệp", "text"],
    ["salary", "Lương", "text"],
    ["grade", "Ngạch", "text"],
    ["step", "Bậc", "text"],
    ["workplace", "Nơi học tập/làm việc", "text"],
    ["overseas", "Đã đi nước ngoài", "text"],
  ];

const parentFields: Array<[keyof MilitaryCvRelative, string, "text" | "date"]> =
  [
    ["name", "Họ tên", "text"],
    ["alive", "Còn sống (true/false)", "text"],
    ["dob", "Ngày sinh", "date"],
    ["job", "Nghề nghiệp", "text"],
    ["addr", "Nơi ở", "text"],
    ["econ", "Kinh tế", "text"],
    ["politics", "Chính trị", "text"],
  ];

const siblingFields: Array<
  [keyof MilitaryCvRelative, string, "text" | "date"]
> = [
  ["label", "Quan hệ", "text"],
  ["name", "Họ tên", "text"],
  ["dob", "Ngày sinh", "date"],
  ["job", "Nghề nghiệp", "text"],
  ["addr", "Nơi ở", "text"],
  ["gender", "Giới tính", "text"],
  ["econ", "Kinh tế", "text"],
  ["politics", "Chính trị", "text"],
];

const childFields: Array<[keyof MilitaryCvRelative, string, "text" | "date"]> =
  [
    ["name", "Họ tên", "text"],
    ["dob", "Ngày sinh", "date"],
    ["gender", "Giới tính", "text"],
    ["adopted", "Con nuôi (true/false)", "text"],
  ];

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

export default function MilitaryCvDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [record, setRecord] = useState<MilitaryCvRecord | null>(null);
  const [topLevel, setTopLevel] = useState({
    full_name: "",
    dob: "",
    id_no: "",
    photo: "",
  });
  const [profile, setProfile] = useState<MilitaryCvProfile>({});
  const [family, setFamily] = useState<MilitaryCvFamily>({});
  const [history, setHistory] = useState<MilitaryCvHistory>({});
  const [reviews, setReviews] = useState<MilitaryCvReviews>(emptyReviews);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchRecord = useCallback(async () => {
    try {
      const data = await militaryCvApi.getById(Number(id));
      const normalized = normalizeData(data);
      setRecord(normalized);
      setTopLevel({
        full_name: normalized.full_name,
        dob: dateInputValue(normalized.dob),
        id_no: normalized.id_no ?? "",
        photo: normalized.photo ?? "",
      });
      setProfile(
        normalized.profile
          ? {
              ...normalized.profile,
              party_date: dateInputValue(normalized.profile.party_date),
              party_full: dateInputValue(normalized.profile.party_full),
              union_date: dateInputValue(normalized.profile.union_date),
            }
          : {},
      );
      setFamily(
        normalized.family
          ? {
              ...normalized.family,
              father: normalized.family.father
                ? {
                    ...normalized.family.father,
                    dob: dateInputValue(normalized.family.father.dob),
                  }
                : normalized.family.father,
              mother: normalized.family.mother
                ? {
                    ...normalized.family.mother,
                    dob: dateInputValue(normalized.family.mother.dob),
                  }
                : normalized.family.mother,
              spouse: normalized.family.spouse
                ? {
                    ...normalized.family.spouse,
                    dob: dateInputValue(normalized.family.spouse.dob),
                  }
                : normalized.family.spouse,
              siblings: normalized.family.siblings?.map((item) => ({
                ...item,
                dob: dateInputValue(item.dob),
              })),
              children: normalized.family.children?.map((item) => ({
                ...item,
                dob: dateInputValue(item.dob),
              })),
            }
          : {},
      );
      setHistory(normalized.history ?? {});
      setReviews({
        ...emptyReviews,
        ...(normalized.reviews ?? {}),
        police: {
          ...emptyReview,
          ...(normalized.reviews?.police ?? {}),
          reviewed_at: dateInputValue(normalized.reviews?.police?.reviewed_at),
        },
        military: {
          ...emptyReview,
          ...(normalized.reviews?.military ?? {}),
          reviewed_at: dateInputValue(
            normalized.reviews?.military?.reviewed_at,
          ),
        },
        council: {
          ...emptyReview,
          ...(normalized.reviews?.council ?? {}),
          reviewed_at: dateInputValue(normalized.reviews?.council?.reviewed_at),
        },
      });
    } catch {
      toast.error("Không tìm thấy hồ sơ NVQS.");
      router.push("/military-cv");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  const updateReview = (
    key: keyof MilitaryCvReviews,
    value: MilitaryCvReview,
  ) => setReviews((current) => ({ ...current, [key]: value }));

  const saveAll = async () => {
    setSaving(true);
    try {
      const saved = await militaryCvApi.update(
        Number(id),
        buildUpdatePayload({ topLevel, profile, family, history, reviews }),
      );
      setRecord(saved);
      toast.success("Đã lưu toàn bộ hồ sơ NVQS.");
    } catch (error) {
      toast.error(getApiErrorMessage(error) ?? "Lưu hồ sơ thất bại.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="animate-pulse rounded-xl bg-white p-8 text-gray-400">
        Đang tải hồ sơ...
      </div>
    );
  if (!record) return null;

  const updateRelative = (
    relation: "father" | "mother" | "spouse",
    field: keyof MilitaryCvRelative,
    value: string,
  ) => {
    const current = family[relation] ?? {};
    const parsed =
      field === "alive" || field === "adopted"
        ? value === ""
          ? null
          : value === "true"
        : value;
    setFamily((state) => ({
      ...state,
      [relation]: { ...current, [field]: parsed },
    }));
  };

  const updateRelativeList = (
    relation: "siblings" | "children",
    index: number,
    field: keyof MilitaryCvRelative,
    value: string,
  ) => {
    const list = [...(family[relation] ?? [])];
    const current = list[index] ?? {};
    const parsed =
      field === "alive" || field === "adopted"
        ? value === ""
          ? null
          : value === "true"
        : value;
    list[index] = { ...current, [field]: parsed };
    setFamily((state) => ({ ...state, [relation]: list }));
  };

  const updateFamilyCounts = (
    siblings: MilitaryCvRelative[],
    children: MilitaryCvRelative[],
  ) => {
    const sonCount = siblings.filter(
      (item) => String(item.gender).toLowerCase() === "nam",
    ).length;

    const daughterCount = siblings.filter((item) => {
      const gender = String(item.gender).toLowerCase();
      return gender === "nữ" || gender === "nu";
    }).length;

    return {
      sibling_count: siblings.length,
      son_count: sonCount,
      daughter_count: daughterCount,
      child_count: children.length,
    };
  };

  const addSibling = () => {
    setFamily((state) => {
      const siblings = [
        ...(state.siblings ?? []),
        {
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
        } as MilitaryCvRelative,
      ];

      return {
        ...state,
        siblings,
        ...updateFamilyCounts(siblings, state.children ?? []),
      };
    });
  };

  const removeSibling = (index: number) => {
    setFamily((state) => {
      const siblings = (state.siblings ?? []).filter((_, i) => i !== index);

      return {
        ...state,
        siblings,
        ...updateFamilyCounts(siblings, state.children ?? []),
      };
    });
  };

  const addChild = () => {
    setFamily((state) => {
      const children = [
        ...(state.children ?? []),
        {
          name: "",
          dob: "",
          gender: "",
          alive: null,
          adopted: null,
          job: "",
          addr: "",
          econ: "",
          politics: "",
        } as MilitaryCvRelative,
      ];

      return {
        ...state,
        children,
        ...updateFamilyCounts(state.siblings ?? [], children),
      };
    });
  };

  const removeChild = (index: number) => {
    setFamily((state) => {
      const children = (state.children ?? []).filter((_, i) => i !== index);

      return {
        ...state,
        children,
        ...updateFamilyCounts(state.siblings ?? [], children),
      };
    });
  };
  const addHistoryPeriod = () => {
    setHistory((state) => ({
      ...state,
      periods: [
        ...(state.periods ?? []),
        {
          subject: "",
          year_from: null,
          year_to: null,
          note: "",
          econ: "",
          politics: "",
        } as any,
      ],
    }));
  };

  const removeHistoryPeriod = (index: number) => {
    setHistory((state) => ({
      ...state,
      periods: (state.periods ?? []).filter((_, i) => i !== index),
    }));
  };

  const updatePeriod = (index: number, field: string, value: string) => {
    const periods = [...(history.periods ?? [])];
    periods[index] = {
      ...periods[index],
      [field]: field.startsWith("year_") ? Number(value) : value,
    };
    setHistory((state) => ({ ...state, periods }));
  };

  const renderRelativeEditor = (
    relation: "father" | "mother" | "spouse",
    label: string,
  ) => {
    const relative = family[relation] ?? {};
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="mb-3 font-semibold text-gray-700">{label}</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {parentFields.map(([field, fieldLabel, type]) => (
            <EditField
              key={field}
              label={fieldLabel}
              type={type}
              value={relative[field] as string | number | null | undefined}
              onChange={(value) => updateRelative(relation, field, value)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 pb-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#dce5c8] bg-[#f7f9f1] p-5">
        <button
          type="button"
          onClick={() => router.push("/military-cv")}
          className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-white hover:text-[#546a2f]"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại danh sách
        </button>
        <div className="text-right">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#71834a]">
            Chi tiết hồ sơ
          </p>
          <span className="text-xs text-gray-500">Mã hồ sơ #{record.id}</span>
        </div>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <EditField
            label="Họ và tên"
            value={topLevel.full_name}
            onChange={(value) =>
              setTopLevel((state) => ({ ...state, full_name: value }))
            }
          />
          <EditField
            label="Ngày sinh"
            type="date"
            value={topLevel.dob}
            onChange={(value) =>
              setTopLevel((state) => ({ ...state, dob: value }))
            }
          />
          <EditField
            label="Số CCCD"
            value={topLevel.id_no}
            onChange={(value) =>
              setTopLevel((state) => ({ ...state, id_no: value }))
            }
          />
          <PhotoUploader
            value={topLevel.photo}
            onChange={(next) =>
              setTopLevel((state) => ({
                ...state,
                photo: next,
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
          {profileFields.map(([field, label, type]) => (
            <EditField
              key={field}
              label={label}
              type={type}
              value={profile[field] as string | null | undefined}
              onChange={(value) =>
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
          {(
            [
              ["Tổng anh chị em", "sibling_count"],
              ["Anh/em trai", "son_count"],
              ["Chị/em gái", "daughter_count"],
              ["Con thứ", "birth_order"],
              ["Số con", "child_count"],
            ] as const
          ).map(([label, field]) => (
            <EditField
              key={field}
              label={label}
              type="number"
              value={family[field] as number | null | undefined}
              onChange={(value) =>
                setFamily((state) => ({ ...state, [field]: Number(value) }))
              }
            />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {renderRelativeEditor("father", "Cha")}
          {renderRelativeEditor("mother", "Mẹ")}
          {renderRelativeEditor("spouse", "Vợ/chồng")}
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700">Anh/chị/em</h3>

            <button
              type="button"
              onClick={addSibling}
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
              key={`sibling-${index}`}
              className="rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-700">
                  Anh/chị/em {index + 1}
                </h3>

                <button
                  type="button"
                  onClick={() => removeSibling(index)}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50"
                >
                  Xóa
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {siblingFields.map(([field, label, type]) => (
                  <EditField
                    key={field}
                    label={label}
                    type={type}
                    value={
                      relative[field] as string | number | null | undefined
                    }
                    onChange={(value) =>
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
              onClick={addChild}
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
              key={`child-${index}`}
              className="rounded-lg border border-[#dce5c8] bg-[#f7f9f1] p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold text-[#3d5020]">
                  Con {index + 1}
                </h3>

                <button
                  type="button"
                  onClick={() => removeChild(index)}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50"
                >
                  Xóa
                </button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {childFields.map(([field, label, type]) => (
                  <EditField
                    key={field}
                    label={label}
                    type={type}
                    value={
                      relative[field] as string | number | null | undefined
                    }
                    onChange={(value) =>
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
        <EditField
          label="Thái độ chính trị"
          value={history.politics}
          onChange={(value) =>
            setHistory((state) => ({ ...state, politics: value }))
          }
        />
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
              key={`period-${index}`}
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
                <EditField
                  label="Đối tượng"
                  value={period.subject}
                  onChange={(value) => updatePeriod(index, "subject", value)}
                />

                <EditField
                  label="Từ năm"
                  type="number"
                  value={period.year_from}
                  onChange={(value) => updatePeriod(index, "year_from", value)}
                />

                <EditField
                  label="Đến năm"
                  type="number"
                  value={period.year_to}
                  onChange={(value) => updatePeriod(index, "year_to", value)}
                />

                <EditField
                  label="Nội dung"
                  value={period.note}
                  onChange={(value) => updatePeriod(index, "note", value)}
                />

                <EditField
                  label="Kinh tế"
                  value={period.econ}
                  onChange={(value) => updatePeriod(index, "econ", value)}
                />

                <EditField
                  label="Chính trị"
                  value={period.politics}
                  onChange={(value) => updatePeriod(index, "politics", value)}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void saveAll();
        }}
        className="space-y-5 rounded-2xl border border-amber-200 bg-white p-6 shadow-sm"
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9a7b25]">
            Phần IV + V + VI
          </p>
          <h2 className="mt-1 text-lg font-bold text-gray-800">
            Kết luận của cơ quan
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Có thể cập nhật toàn bộ hồ sơ và phần kết luận IV/V/VI tại đây.
          </p>
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
        <button
          type="submit"
          disabled={saving}
          className="sticky bottom-3 inline-flex items-center gap-2 rounded-lg bg-[#546a2f] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[#3d5020] disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {saving ? "Đang lưu..." : "Lưu phần kết luận"}
        </button>
      </form>
    </div>
  );
}
