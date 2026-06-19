"use client";

import { axiosInstance } from "@/lib/axios.config";

export type RegistrationCategory =
  | "tsqs"
  | "tuoi17"
  | "tinhnguyen"
  | "dqtt"
  | "doituongchinhsach"
  | "siquandubi";
export type RegistrationStatus = "pending" | "approved" | "rejected";

export interface RegistrationFormTemplate {
  id: string;
  title: string;
  description: string;
  fileType: "PDF" | "DOCX";
  fileSize: string;
  fileUrl: string;
}

export interface PublicRegistrationPayload {
  category: RegistrationCategory;
  full_name: string;
  phone: string;
  address: string;
  dob: string;
  workplace: string;
  guardian_phone: string;
  captcha_token: string;
}

export interface PublicRegistration {
  id: string;
  category: RegistrationCategory;
  full_name: string;
  phone: string;
  address: string;
  dob: string;
  workplace: string;
  guardian_phone: string;
  status: RegistrationStatus;
  created_at: string;
}

export interface AdminRegistration {
  id: string;
  category: RegistrationCategory;
  full_name: string;
  phone: string;
  address: string;
  dob: string;
  workplace: string;
  guardian_phone: string;
  status: RegistrationStatus;
  client_ip: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminRegistrationFilters {
  category?: RegistrationCategory | "";
  full_name?: string;
  phone?: string;
  address?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapTemplate = (row: any): RegistrationFormTemplate => ({
  id: String(row.id),
  title: row.title,
  description: row.description ?? "",
  fileType: (row.file_type ?? "PDF") as "PDF" | "DOCX",
  fileSize: row.file_size ?? "",
  fileUrl: row.file_url ?? "",
});

export const websiteRegistrationAPI = {
  async getForms(
    category: RegistrationCategory,
  ): Promise<RegistrationFormTemplate[]> {
    const res = await axiosInstance.get("/api/public/registration-templates", {
      params: { category },
    });
    const data = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
    return data.map(mapTemplate);
  },

  async createRegistration(
    payload: PublicRegistrationPayload,
  ): Promise<PublicRegistration> {
    const res = await axiosInstance.post("/api/public/registrations", payload);
    return res.data as PublicRegistration;
  },

  async getAdminRegistrations(
    filters?: AdminRegistrationFilters,
  ): Promise<AdminRegistration[]> {
    const params: Record<string, string> = {};
    if (filters?.category) params.category = filters.category;
    if (filters?.full_name) params.full_name = filters.full_name;
    if (filters?.phone) params.phone = filters.phone;
    if (filters?.address) params.address = filters.address;

    const res = await axiosInstance.get("/api/public/registrations", {
      params,
    });

    return res.data.metaData as AdminRegistration[];
  },
};
