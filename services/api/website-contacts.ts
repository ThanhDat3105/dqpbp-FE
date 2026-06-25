'use client';

import { axiosInstance } from "@/lib/axios.config";

export type ContactMode = "public" | "anonymous";

export interface WebsiteContactPayLoad {
  mode: ContactMode;
  full_name: string;
  phone: string;
  subject: string;
  message: string;
}

export const websiteContactApi = {
  async sendContact(payload: WebsiteContactPayLoad) {
    const res = await axiosInstance.post("/api/website/contacts", payload);
    console.log("Response from sendContact:", res.data);
    return res.data;
  }
}