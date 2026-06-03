import { axiosInstance } from "@/lib/axios.config";
import type { NewsArticle, WebsiteDocument, Slide } from "@/lib/mock/website";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
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
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDocument = (row: any): WebsiteDocument => ({
  id: row.id,
  title: row.title,
  docNumber: row.doc_number,
  issuedBy: row.issued_by,
  issuedDate: formatDate(row.issued_date),
  category: row.category,
  fileSize: row.file_size,
  fileType: (row.file_type ?? "PDF") as "PDF" | "DOCX",
  status: row.status as "active" | "expired" | "new",
  order: row.display_order,
  visible: row.is_visible,
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
  const raw = res.data as PaginatedResponse<unknown>;
  return { ...raw, data: raw.data.map(mapArticle) };
};

const getArticleById = async (id: number): Promise<NewsArticle | null> => {
  try {
    const res = await axiosInstance.get(`/api/website/articles/${id}`);
    return mapArticle(res.data);
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
  const raw = res.data as PaginatedResponse<unknown>;
  return { ...raw, data: raw.data.map(mapDocument) };
};

const getSlides = async (): Promise<Slide[]> => {
  const res = await axiosInstance.get("/api/website/slides");
  const raw = res.data as PaginatedResponse<unknown>;
  return raw.data.map(mapSlide);
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

export interface CreateArticleBody {
  title: string;
  category: string;
  content?: string;
  thumbnail_url?: string;
  display_order: number;
  is_featured: boolean;
  is_visible: boolean;
  excerpt?: string;
}

const ARTICLE_CATEGORY_TO_SLUG: Record<string, string> = {
  "Hoạt động": "hoat-dong",
  "Tin tức": "tin-tuc",
  "Thông báo": "thong-bao",
  "Văn bản pháp quy": "van-ban-phap-quy",
};

const ARTICLE_CATEGORY_FROM_SLUG: Record<string, string> = {
  "hoat-dong": "Hoạt động",
  "tin-tuc": "Tin tức",
  "thong-bao": "Thông báo",
  "van-ban-phap-quy": "Văn bản pháp quy",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapArticleAdmin = (row: any): NewsArticle => ({
  ...mapArticle(row),
  category: ARTICLE_CATEGORY_FROM_SLUG[row.category] ?? row.category,
});

const getAdminSlides = async (
  filters?: AdminListFilters,
): Promise<PaginatedResponse<Slide>> => {
  const res = await axiosInstance.get("/api/website/admin/slides", {
    params: filters,
  });
  const raw = res.data as PaginatedResponse<unknown>;
  return { ...raw, data: raw.data.map(mapSlide) };
};

const createSlide = async (body: CreateSlideBody): Promise<Slide> => {
  const res = await axiosInstance.post("/api/website/admin/slides", body);
  return mapSlide(res.data);
};

const updateSlide = async (
  id: number,
  body: Partial<CreateSlideBody>,
): Promise<Slide> => {
  const res = await axiosInstance.put(`/api/website/admin/slides/${id}`, body);
  return mapSlide(res.data);
};

const deleteSlide = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/website/admin/slides/${id}`);
};

const getAdminArticles = async (
  filters?: AdminListFilters,
): Promise<PaginatedResponse<NewsArticle>> => {
  const res = await axiosInstance.get("/api/website/admin/articles", {
    params: filters,
  });
  const raw = res.data as PaginatedResponse<unknown>;
  return { ...raw, data: raw.data.map(mapArticleAdmin) };
};

const createArticle = async (body: CreateArticleBody): Promise<NewsArticle> => {
  const payload = {
    ...body,
    category: ARTICLE_CATEGORY_TO_SLUG[body.category] ?? body.category,
  };
  const res = await axiosInstance.post("/api/website/admin/articles", payload);
  return mapArticleAdmin(res.data);
};

const updateArticle = async (
  id: number,
  body: Partial<CreateArticleBody>,
): Promise<NewsArticle> => {
  const payload = {
    ...body,
    ...(body.category && {
      category: ARTICLE_CATEGORY_TO_SLUG[body.category] ?? body.category,
    }),
  };
  const res = await axiosInstance.put(
    `/api/website/admin/articles/${id}`,
    payload,
  );
  return mapArticleAdmin(res.data);
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
  file_url?: string;
  file_size?: string;
  file_type?: string;
  status: "active" | "expired" | "new";
  display_order: number;
  is_visible: boolean;
}

const DOC_CATEGORY_TO_SLUG: Record<string, string> = {
  "Nhiệm vụ": "nhiem-vu",
  "Hành chính": "hanh-chinh",
  "Tuyên truyền": "tuyen-truyen",
  "Bảo mật": "bao-mat",
  "Hậu cần": "hau-can",
};

const DOC_CATEGORY_FROM_SLUG: Record<string, string> = {
  "nhiem-vu": "Nhiệm vụ",
  "hanh-chinh": "Hành chính",
  "tuyen-truyen": "Tuyên truyền",
  "bao-mat": "Bảo mật",
  "hau-can": "Hậu cần",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapDocumentAdmin = (row: any): WebsiteDocument => ({
  ...mapDocument(row),
  category: DOC_CATEGORY_FROM_SLUG[row.category] ?? row.category,
});

const getAdminDocuments = async (
  filters?: AdminListFilters & { status?: string },
): Promise<PaginatedResponse<WebsiteDocument>> => {
  const res = await axiosInstance.get("/api/website/admin/documents", {
    params: filters,
  });
  const raw = res.data as PaginatedResponse<unknown>;
  return { ...raw, data: raw.data.map(mapDocumentAdmin) };
};

const createDocument = async (
  body: CreateDocumentBody,
): Promise<WebsiteDocument> => {
  const payload = {
    ...body,
    category: DOC_CATEGORY_TO_SLUG[body.category] ?? body.category,
  };
  const res = await axiosInstance.post("/api/website/admin/documents", payload);
  return mapDocumentAdmin(res.data);
};

const updateDocument = async (
  id: number,
  body: Partial<CreateDocumentBody>,
): Promise<WebsiteDocument> => {
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
  return mapDocumentAdmin(res.data);
};

const deleteDocument = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/website/admin/documents/${id}`);
};

export const websiteAPI = {
  getArticles,
  getArticleById,
  getDocuments,
  getSlides,
  getAdminSlides,
  createSlide,
  updateSlide,
  deleteSlide,
  getAdminArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  getAdminDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
};
