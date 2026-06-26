export interface WebsiteContact {
  id: number;
  full_name: string;
  phone: string;
  email?: string | null;
  subject?: string | null;
  message: string;
  is_read: boolean;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}
