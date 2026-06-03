import { axiosInstance } from "@/lib/axios.config";

interface KnowledgeSource {
  type: string;
  path: string;
}

interface AIResponse {
  knowledge_files: string[];
  knowledge_sources: KnowledgeSource[];
  model: string;
  reply: string;
}

const sendMessage = async (message: string): Promise<AIResponse> => {
  const res = await axiosInstance.post("/api/chat", { message });
  return res.data.metaData;
};

export const chatAPI = {
  sendMessage,
};
