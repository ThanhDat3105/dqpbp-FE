import { axiosInstance } from "@/lib/axios.config";

export const uploadAPI = {
  uploadDocument: async (file: File, folder = "documents"): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await axiosInstance.post(
      `/api/upload/document?folder=${folder}`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data.metaData.url as string;
  },

  uploadMedia: async (file: File, folder = "uploads"): Promise<string> => {
    const form = new FormData();
    form.append("file", file);
    const res = await axiosInstance.post(
      `/api/upload/single?folder=${folder}`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return res.data.metaData.url as string;
  },

  deleteFile: async (url: string): Promise<void> => {
    await axiosInstance.delete("/api/upload", { data: { url } });
  },
};
