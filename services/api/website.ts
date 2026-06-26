import { categoryLabel } from "@/app/(cms)/quan-ly/website/ho-so-dang-ky/page";
import { axiosInstance } from "@/lib/axios.config";
import type {
  NewsArticle,
  QuickLink,
  Slide,
  WebsiteDocument,
} from "@/lib/mock/website";
import type { RegistrationCategory } from "./website-registration";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
};

const getFileType = (url?: string): "PDF" | "DOCX" => {
  const ext = String(url || "")
    .split("?")[0]
    .split(".")
    .pop()
    ?.toLowerCase();
  return ext === "doc" || ext === "docx" ? "DOCX" : "PDF";
};

const formatFileSize = (value?: string | number | null): string => {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapArticle = (row: any): NewsArticle => ({
  id: row.id,
  title: row.title,
  category: row.category,
  thumbnail: row.thumbnail_url ?? undefined,
  order: row.display_order,
  featured: row.is_featured,
  visible: row.is_visible,
  updatedAt: formatDate(row.updated_at),
  excerpt: row.excerpt ?? undefined,
  author: row.author ?? undefined,
  content: row.content ?? undefined,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDocument = (row: any): WebsiteDocument => ({
  id: row.id,
  title: row.title,
  docNumber: row.doc_number,
  issuedBy: row.issued_by,
  issuedDate: formatDate(row.issued_date),
  category: row.category,
  fileSize: formatFileSize(row.file_size),
  fileType: (row.file_type ?? getFileType(row.file_url)) as "PDF" | "DOCX",
  status: row.status as "active" | "expired" | "new",
  order: row.display_order,
  visible: row.is_visible,
  file_url: row.file_url,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapSlide = (row: any): Slide => ({
  id: row.id,
  name: row.name,
  description: row.description ?? undefined,
  imageUrl: row.image_url ?? undefined,
  order: row.display_order,
  featured: row.is_featured,
  visible: row.is_visible,
  updatedAt: formatDate(row.updated_at),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapQuickLink = (row: any): QuickLink => ({
  id: row.id,
  title: row.title,
  url: row.url ?? undefined,
  order: row.display_order,
  visible: row.is_visible,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const unwrapList = (payload: any): any[] => {
  const data = payload?.metaData ?? payload;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const unwrapItem = (payload: any): any => payload?.metaData ?? payload;

export interface ArticleFilters {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
}

export interface DocumentFilters {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  keyword?: string;
}

const getArticles = async (
  filters?: ArticleFilters,
): Promise<PaginatedResponse<NewsArticle>> => {
  const res = await axiosInstance.get("/api/website/articles", {
    params: filters,
  });
  const raw = res.data.metaData as PaginatedResponse<unknown>;
  return { ...raw, data: raw.data.map(mapArticle) };
};

const getArticleById = async (id: number): Promise<NewsArticle | null> => {
  try {
    const res = await axiosInstance.get(`/api/website/articles/${id}`);
    return mapArticle(res.data.metaData);
  } catch {
    return null;
  }
};

const getDocuments = async (
  filters?: DocumentFilters,
): Promise<PaginatedResponse<WebsiteDocument>> => {
  const res = await axiosInstance.get("/api/website/documents", {
    params: filters,
  });
  console.log(res, "resss");
  const raw = res.data as PaginatedResponse<unknown>;
  return { ...raw, data: raw.data.map(mapDocument) };
};

const getSlides = async (): Promise<Slide[]> => {
  const res = await axiosInstance.get("/api/website/slides");
  const raw = res.data.metaData as PaginatedResponse<unknown>;
  return raw.data.map(mapSlide);
};

const getQuickLinks = async (): Promise<QuickLink[]> => {
  const res = await axiosInstance.get("/api/website/quick-links");
  return unwrapList(res.data).map(mapQuickLink);
};

// --- Admin API ---

export interface AdminListFilters {
  page?: number;
  limit?: number;
  keyword?: string;
  category?: string;
}

export interface CreateSlideBody {
  name: string;
  image_url?: string;
  display_order: number;
  is_featured: boolean;
  is_visible: boolean;
}

export interface CreateQuickLinkBody {
  title: string;
  url: string;
  display_order: number;
  is_visible: boolean;
}

export interface UpdateQuickLinkBody {
  title?: string;
  url?: string;
  display_order?: number;
  is_visible?: boolean;
}

export interface CreateArticleBody {
  title: string;
  category: string;
  content?: string;
  thumbnail?: File;
  display_order: number;
  is_featured: boolean;
  is_visible: boolean;
  excerpt?: string;
}

const ARTICLE_CATEGORY_FROM_SLUG: Record<string, string> = {
  "hoat-dong": "Hoạt động",
  "tin-tuc": "Tin tức",
  "thong-bao": "Thông báo",
  "van-ban-phap-quy": "Văn bản pháp quy",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapArticleAdmin = (row: any): NewsArticle => ({
  ...mapArticle(row),
  category: ARTICLE_CATEGORY_FROM_SLUG[row.category] ?? row.category,
});

const getAdminSlides = async (
  filters?: AdminListFilters,
): Promise<PaginatedResponse<Slide>> => {
  const res = await axiosInstance.get("/api/website/admin/slides", {
    params: filters,
  });
  const raw = res.data.metaData as PaginatedResponse<unknown>;
  return { ...raw, data: raw.data.map(mapSlide) };
};

const createSlide = async (body: CreateSlideBody): Promise<Slide> => {
  const res = await axiosInstance.post("/api/website/admin/slides", body);
  return mapSlide(res.data.metaData);
};

const updateSlide = async (
  id: number,
  body: Partial<CreateSlideBody>,
): Promise<Slide> => {
  const res = await axiosInstance.put(`/api/website/admin/slides/${id}`, body);
  return mapSlide(res.data.metaData);
};

const deleteSlide = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/website/admin/slides/${id}`);
};

const getAdminQuickLinks = async (
  filters?: AdminListFilters,
): Promise<PaginatedResponse<QuickLink>> => {
  const res = await axiosInstance.get("/api/website/admin/quick-links", {
    params: filters,
  });
  const raw = unwrapItem(res.data) as PaginatedResponse<unknown>;
  return { ...raw, data: raw.data.map(mapQuickLink) };
};

const createQuickLink = async (
  body: CreateQuickLinkBody,
): Promise<QuickLink> => {
  const res = await axiosInstance.post("/api/website/admin/quick-links", body);
  return mapQuickLink(unwrapItem(res.data));
};

const updateQuickLink = async (
  id: number,
  body: UpdateQuickLinkBody,
): Promise<QuickLink> => {
  const res = await axiosInstance.put(
    `/api/website/admin/quick-links/${id}`,
    body,
  );
  return mapQuickLink(unwrapItem(res.data));
};

const deleteQuickLink = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/website/admin/quick-links/${id}`);
};

const getAdminArticles = async (
  filters?: AdminListFilters,
): Promise<PaginatedResponse<NewsArticle>> => {
  const res = await axiosInstance.get("/api/website/admin/articles", {
    params: filters,
  });

  const raw = res.data.metaData as PaginatedResponse<unknown>;
  return res.data.metaData;
  return { ...raw, data: res.data.metaData.data.map(mapArticleAdmin) };
};

const createArticle = async (body: CreateArticleBody): Promise<NewsArticle> => {
  const form = buildArticleForm(body);
  const res = await axiosInstance.post("/api/website/admin/articles", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  const data = res.data?.metaData ?? res.data;
  return mapArticleAdmin(data);
};

const buildArticleForm = (body: Partial<CreateArticleBody>): FormData => {
  const form = new FormData();

  if (body.thumbnail) form.append("thumbnail", body.thumbnail);
  if (body.title) form.append("title", body.title);
  if (body.category) form.append("category", body.category);
  if (body.content != null) form.append("content", body.content);
  if (body.excerpt != null) form.append("excerpt", body.excerpt);
  if (body.display_order != null) {
    form.append("display_order", String(body.display_order));
  }
  if (body.is_featured != null) {
    form.append("is_featured", String(body.is_featured));
  }
  if (body.is_visible != null) {
    form.append("is_visible", String(body.is_visible));
  }

  return form;
};

const updateArticle = async (
  id: number,
  body: Partial<CreateArticleBody>,
): Promise<NewsArticle> => {
  if (body.thumbnail) {
    const form = buildArticleForm(body);
    const res = await axiosInstance.put(
      `/api/website/admin/articles/${id}`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    const data = res.data?.metaData ?? res.data;
    return mapArticleAdmin(data);
  }

  const payload = {
    ...body,
    ...(body.category && {
      category: body.category,
    }),
  };
  const res = await axiosInstance.put(
    `/api/website/admin/articles/${id}`,
    payload,
  );
  const data = res.data?.metaData ?? res.data;
  return mapArticleAdmin(data);
};

const deleteArticle = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/website/admin/articles/${id}`);
};

export interface CreateDocumentBody {
  title: string;
  doc_number?: string;
  issued_by?: string;
  issued_date?: string;
  category: string;
  file: File;
  status: "active" | "expired" | "new";
  display_order: number;
  is_visible: boolean;
}

const DOC_CATEGORY_TO_SLUG: Record<string, string> = {
  "Tuyển sinh quân sự": "tsqs",
  "Tuổi 17": "tuoi17",
  "Tình nguyện": "tinhnguyen",
  "Dân quân tự vệ": "dqtt",
  "Tu nguyen quan su": "tsqs",
  "Tuoi 17": "tuoi17",
  "Tinh nguyen": "tinhnguyen",
  "Dan quan tu ve": "dqtt",
  "Nhiem vu": "nhiem-vu",
  "Hanh chinh": "hanh-chinh",
  "Tuyen truyen": "tuyen-truyen",
  "Bao mat": "bao-mat",
  "Hau can": "hau-can",
  "Nhiệm vụ": "nhiem-vu",
  "Hành chính": "hanh-chinh",
  "Tuyên truyền": "tuyen-truyen",
  "Bảo mật": "bao-mat",
  "Hậu cần": "hau-can",
};

const DOC_CATEGORY_FROM_SLUG: Record<string, string> = {
  tsqs: "Tuyển sinh quân sự",
  tuoi17: "Tuổi 17",
  tinhnguyen: "Tình nguyện",
  dqtt: "Dân quân tự vệ",
  "nhiem-vu": "Nhiệm vụ",
  "hanh-chinh": "Hành chính",
  "tuyen-truyen": "Tuyên truyền",
  "bao-mat": "Bảo mật",
  "hau-can": "Hậu cần",
};

const DOC_CATEGORY_LABELS: Record<string, string> = {
  tsqs: "Tuyển sinh quân sự",
  tuoi17: "Tuổi 17",
  tinhnguyen: "Tình nguyện",
  dqtt: "Dân quân tự vệ",
  "nhiem-vu": "Nhiem vu",
  "hanh-chinh": "Hanh chinh",
  "tuyen-truyen": "Tuyen truyen",
  "bao-mat": "Bao mat",
  "hau-can": "Hau can",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDocumentAdmin = (row: any): WebsiteDocument => ({
  ...mapDocument(row),
  category: (DOC_CATEGORY_LABELS[row.category] ??
    DOC_CATEGORY_FROM_SLUG[row.category] ??
    categoryLabel[row.category as RegistrationCategory] ??
    row.category) as unknown as RegistrationCategory,
});

const getAdminDocuments = async (
  filters?: AdminListFilters & { status?: string },
): Promise<PaginatedResponse<WebsiteDocument>> => {
  const res = await axiosInstance.get("/api/website/admin/documents", {
    params: filters,
  });

  console.log(res, "resss");

  return {
    ...res.data,
    data: res.data.data.map(mapDocumentAdmin),
  };
};

const createDocument = async (
  body: CreateDocumentBody,
): Promise<WebsiteDocument> => {
  const form = buildDocumentForm(body);

  const res = await axiosInstance.post("/api/website/admin/documents", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return mapDocumentAdmin(unwrapItem(res.data));
};

const buildDocumentForm = (body: Partial<CreateDocumentBody>): FormData => {
  const form = new FormData();

  if (body.file) form.append("file", body.file);
  if (body.title) form.append("title", body.title);
  if (body.category) {
    form.append(
      "category",
      DOC_CATEGORY_TO_SLUG[body.category] ?? body.category,
    );
  }
  if (body.status) form.append("status", body.status);
  if (body.display_order != null) {
    form.append("display_order", String(body.display_order));
  }
  if (body.is_visible != null) {
    form.append("is_visible", String(body.is_visible));
  }
  if (body.doc_number) form.append("doc_number", body.doc_number);
  if (body.issued_by) form.append("issued_by", body.issued_by);
  if (body.issued_date) form.append("issued_date", body.issued_date);

  return form;
};

const updateDocument = async (
  id: number,
  body: Partial<CreateDocumentBody>,
): Promise<WebsiteDocument> => {
  if (body.file) {
    const form = buildDocumentForm(body);
    const res = await axiosInstance.put(
      `/api/website/admin/documents/${id}`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return mapDocumentAdmin(unwrapItem(res.data));
  }

  const payload = {
    ...body,
    ...(body.category && {
      category: DOC_CATEGORY_TO_SLUG[body.category] ?? body.category,
    }),
  };
  const res = await axiosInstance.put(
    `/api/website/admin/documents/${id}`,
    payload,
  );
  return mapDocumentAdmin(unwrapItem(res.data));
};

const deleteDocument = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/website/admin/documents/${id}`);
};

export const websiteAPI = {
  getArticles,
  getArticleById,
  getDocuments,
  getSlides,
  getQuickLinks,
  getAdminSlides,
  createSlide,
  updateSlide,
  deleteSlide,
  getAdminQuickLinks,
  createQuickLink,
  updateQuickLink,
  deleteQuickLink,
  getAdminArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  getAdminDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
};
