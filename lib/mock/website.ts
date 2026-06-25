export interface NewsArticle {
  id: number;
  title: string;
  category: string;
  thumbnail: string;
  order: number;
  featured: boolean;
  visible: boolean;
  updatedAt: string;
  excerpt?: string;
  author?: string;
  content?: string;
}

export interface WebsiteDocument {
  id: number;
  title: string;
  docNumber: string;
  issuedBy: string;
  issuedDate: string;
  category: string;
  fileSize: string;
  fileType: "PDF" | "DOCX";
  status: "active" | "expired" | "new";
  order: number;
  visible: boolean;
  file_url: string;
}

export interface Slide {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  order: number;
  featured: boolean;
  visible: boolean;
  updatedAt: string;
}

export interface QuickLink {
  id: number;
  title: string;
  url?: string;
  order: number;
  visible: boolean;
}

export interface WebsiteNotification {
  id: number;
  title: string;
  date: string;
  isNew: boolean;
}

export interface WebsiteEvent {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  status: "upcoming" | "past" | "important";
}

// export const mockNews: NewsArticle[] = [
//   {
//     id: 1,
//     title: 'Ban CHQS Phường Bình Phú tổ chức huấn luyện dân quân năm 2025',
//     category: 'Hoạt động',
//     order: 1,
//     featured: true,
//     visible: true,
//     updatedAt: '15/05/2025',
//     excerpt:
//       'Ban CHQS Phường Bình Phú đã tổ chức thành công đợt huấn luyện dân quân năm 2025 với sự tham gia của 150 cán bộ chiến sĩ trên địa bàn phường.',
//     author: 'Ban biên tập',
//   },
//   {
//     id: 2,
//     title: 'Kết quả kiểm tra sẵn sàng chiến đấu quý I/2025',
//     category: 'Tin tức',
//     order: 2,
//     featured: true,
//     visible: true,
//     updatedAt: '10/05/2025',
//     excerpt:
//       'Kết quả kiểm tra sẵn sàng chiến đấu quý I năm 2025 đạt loại Khá, vượt chỉ tiêu đề ra, ghi nhận sự nỗ lực của toàn đơn vị.',
//     author: 'Ban biên tập',
//   },
//   {
//     id: 3,
//     title: 'Thông báo về đợt nghĩa vụ quân sự năm 2025',
//     category: 'Thông báo',
//     order: 3,
//     featured: false,
//     visible: true,
//     updatedAt: '08/05/2025',
//     excerpt:
//       'Ban CHQS Phường Bình Phú thông báo kế hoạch tuyển chọn thanh niên tham gia nghĩa vụ quân sự năm 2025 với nhiều chính sách hỗ trợ mới.',
//     author: 'Ban biên tập',
//   },
//   {
//     id: 4,
//     title: 'Giao lưu văn nghệ chào mừng ngày Quân đội nhân dân Việt Nam',
//     category: 'Hoạt động',
//     order: 4,
//     featured: false,
//     visible: true,
//     updatedAt: '30/04/2025',
//     excerpt:
//       'Buổi giao lưu văn nghệ đã diễn ra sôi nổi với sự tham gia của các đơn vị dân quân trên địa bàn phường Bình Phú.',
//     author: 'Ban biên tập',
//   },
//   {
//     id: 5,
//     title: 'Hội nghị tổng kết công tác quân sự địa phương năm 2024',
//     category: 'Tin tức',
//     order: 5,
//     featured: false,
//     visible: true,
//     updatedAt: '10/01/2025',
//     excerpt:
//       'Hội nghị đã đánh giá toàn diện kết quả công tác quân sự địa phương năm 2024 và đề ra phương hướng, nhiệm vụ năm 2025.',
//     author: 'Ban biên tập',
//   },
//   {
//     id: 6,
//     title: 'Triển khai Nghị định mới về chế độ, chính sách dân quân',
//     category: 'Văn bản pháp quy',
//     order: 6,
//     featured: false,
//     visible: false,
//     updatedAt: '20/03/2025',
//     excerpt:
//       'Ban CHQS tổ chức quán triệt và triển khai Nghị định số 72/2024/NĐ-CP về chế độ, chính sách đối với dân quân tự vệ.',
//     author: 'Ban biên tập',
//   },
// ];

// export const mockDocuments: WebsiteDocument[] = [
//   {
//     id: 1,
//     title: 'Kế hoạch huấn luyện dân quân năm 2025',
//     docNumber: 'KH-01/2025',
//     issuedBy: 'Ban CHQS Phường Bình Phú',
//     issuedDate: '15/01/2025',
//     category: 'Nhiệm vụ',
//     fileSize: '1.2 MB',
//     fileType: 'PDF',
//     status: 'active',
//     order: 1,
//     visible: true,
//   },
//   {
//     id: 2,
//     title: 'Quyết định thành lập Ban CHQS phường nhiệm kỳ 2024-2026',
//     docNumber: 'QĐ-15/2024',
//     issuedBy: 'UBND Phường Bình Phú',
//     issuedDate: '01/06/2024',
//     category: 'Hành chính',
//     fileSize: '850 KB',
//     fileType: 'DOCX',
//     status: 'active',
//     order: 2,
//     visible: true,
//   },
//   {
//     id: 3,
//     title: 'Nghị quyết về tăng cường công tác tuyên truyền quốc phòng',
//     docNumber: 'NQ-08/2024',
//     issuedBy: 'Đảng ủy Phường Bình Phú',
//     issuedDate: '20/11/2024',
//     category: 'Tuyên truyền',
//     fileSize: '620 KB',
//     fileType: 'PDF',
//     status: 'new',
//     order: 3,
//     visible: true,
//   },
//   {
//     id: 4,
//     title: 'Quy chế bảo mật thông tin trong lực lượng dân quân',
//     docNumber: 'QC-03/2023',
//     issuedBy: 'Ban CHQS Phường Bình Phú',
//     issuedDate: '10/03/2023',
//     category: 'Bảo mật',
//     fileSize: '980 KB',
//     fileType: 'PDF',
//     status: 'expired',
//     order: 4,
//     visible: true,
//   },
//   {
//     id: 5,
//     title: 'Thông tư về chế độ chính sách hậu cần cho dân quân',
//     docNumber: 'TT-12/2024',
//     issuedBy: 'Bộ Quốc phòng',
//     issuedDate: '15/08/2024',
//     category: 'Hậu cần',
//     fileSize: '2.1 MB',
//     fileType: 'PDF',
//     status: 'active',
//     order: 5,
//     visible: true,
//   },
//   {
//     id: 6,
//     title: 'Chỉ thị về nâng cao chất lượng huấn luyện năm 2025',
//     docNumber: 'CT-02/2025',
//     issuedBy: 'Ban CHQS Phường Bình Phú',
//     issuedDate: '01/02/2025',
//     category: 'Nhiệm vụ',
//     fileSize: '745 KB',
//     fileType: 'DOCX',
//     status: 'new',
//     order: 6,
//     visible: true,
//   },
// ];

// export const mockSlides: Slide[] = [
//   {
//     id: 1,
//     name: 'Banner chào mừng 80 năm Quân đội nhân dân',
//     description: 'Kỷ niệm 80 năm ngày thành lập Quân đội nhân dân Việt Nam',
//     order: 1,
//     featured: true,
//     visible: true,
//     updatedAt: '01/05/2025',
//   },
//   {
//     id: 2,
//     name: 'Hình ảnh huấn luyện dân quân 2025',
//     description: 'Đợt huấn luyện dân quân tháng 3 năm 2025',
//     order: 2,
//     featured: true,
//     visible: true,
//     updatedAt: '20/04/2025',
//   },
//   {
//     id: 3,
//     name: 'Lễ ra quân huấn luyện năm 2025',
//     description: 'Lễ ra quân huấn luyện dân quân năm 2025',
//     order: 3,
//     featured: false,
//     visible: true,
//     updatedAt: '15/03/2025',
//   },
//   {
//     id: 4,
//     name: 'Giao lưu thể thao các đơn vị dân quân',
//     description: 'Giải thể thao truyền thống các đơn vị dân quân Phường Bình Phú',
//     order: 4,
//     featured: false,
//     visible: false,
//     updatedAt: '10/02/2025',
//   },
// ];

// export const mockNotifications: WebsiteNotification[] = [
//   { id: 1, title: 'Triệu tập tập huấn cán bộ dân quân tháng 6/2025', date: '18/05/2025', isNew: true },
//   { id: 2, title: 'Lịch trực sẵn sàng chiến đấu tháng 6/2025', date: '15/05/2025', isNew: true },
//   { id: 3, title: 'Thông báo kiểm tra vũ khí trang bị định kỳ', date: '10/05/2025', isNew: false },
//   { id: 4, title: 'Kết quả thi đua đơn vị quý I/2025', date: '05/05/2025', isNew: false },
//   { id: 5, title: 'Kế hoạch diễn tập phòng thủ khu vực năm 2025', date: '28/04/2025', isNew: false },
// ];

// export const mockEvents: WebsiteEvent[] = [
//   {
//     id: 1,
//     title: 'Diễn tập chiến đấu phòng thủ khu vực 2025',
//     date: '15/06/2025',
//     time: '07:00',
//     location: 'Sân vận động Phường Bình Phú',
//     status: 'upcoming',
//   },
//   {
//     id: 2,
//     title: 'Hội thi bắn súng tiểu liên AK cấp phường',
//     date: '20/07/2025',
//     time: '08:00',
//     location: 'Trường bắn Phường Bình Phú',
//     status: 'upcoming',
//   },
//   {
//     id: 3,
//     title: 'Lễ kỷ niệm 80 năm thành lập QĐND Việt Nam',
//     date: '22/12/2024',
//     time: '09:00',
//     location: 'Hội trường UBND Phường',
//     status: 'past',
//   },
//   {
//     id: 4,
//     title: 'Tổng kết phong trào thi đua năm 2024',
//     date: '28/12/2024',
//     time: '14:00',
//     location: 'Hội trường UBND Phường',
//     status: 'past',
//   },
// ];
