export interface FlowNode {
  text: string;
  reply: string;
  keywords?: string[];
  options?: FlowOption[];
}

export interface FlowOption {
  label: string;
  next: FlowNode;
}

const CONTACT_NODE: FlowNode = {
  text: "Liên hệ trực tiếp",
  reply:
    "Công dân nộp hồ sơ trực tiếp tại:\n- Trụ sở 1: 675 Hậu Giang, Phường Bình Phú\n- Trụ sở 2: 36bis An Dương Vương, Phường Bình Phú\nHotline: 02838667722",
  keywords: [
    "lien he",
    "lien hệ",
    "liên he",
    "liên hệ",
    "truc tiep",
    "trực tiếp",
    "dia chi",
    "địa chỉ",
    "hotline",
    "so dien thoai",
    "số điện thoại",
    "nop o dau",
    "nộp ở đâu",
    "nop ho so o dau",
    "nộp hồ sơ ở đâu",
    "dau nop",
    "đâu nộp",
    "o dau",
    "ở đâu",
  ],
};

const HO_SO_NODE: FlowNode = {
  text: "Hồ sơ đăng ký",
  reply:
    "Hồ sơ đăng ký TSQS gồm:\n- Đơn xin dự tuyển\n- CCCD/CMND\n- Học bạ THPT\n- Bằng tốt nghiệp THPT\n- Giấy khai sinh\n- Sơ yếu lý lịch có xác nhận",
  keywords: [
    "ho so",
    "hồ sơ",
    "ho sơ",
    "hồ so",
    "dang ky",
    "đăng ký",
    "đăng ki",
    "dang ki",
    "giay to",
    "giấy tờ",
    "giay tờ",
    "giấy to",
    "can gi",
    "cần gì",
    "can gi nop",
    "cần gì nộp",
    "giay khai sinh",
    "giấy khai sinh",
    "cccd",
    "cmnd",
    "hoc ba",
    "học bạ",
    "bang tot nghiep",
    "bằng tốt nghiệp",
    "so yeu ly lich",
    "sơ yếu lý lịch",
    "don xin",
    "đơn xin",
    "ho so can gi",
    "hồ sơ cần gì",
    "can nhung gi",
    "cần những gì",
  ],
  options: [
    { label: "Nộp ở đâu?", next: CONTACT_NODE },
    { label: "Liên hệ trực tiếp", next: CONTACT_NODE },
  ],
};

const DOI_TUONG_NODE: FlowNode = {
  text: "Đối tượng đăng ký",
  reply:
    "Điều kiện dự tuyển:\n- Nam/Nữ: 17–21 tuổi\n- Tốt nghiệp THPT\n- Đủ sức khỏe theo quy định Bộ Quốc phòng\n- Lý lịch chính trị rõ ràng\n- Hộ khẩu thường trú tại địa phương",
  keywords: [
    "doi tuong",
    "đối tượng",
    "doi tượng",
    "đối tuong",
    "dieu kien",
    "điều kiện",
    "dieu kiện",
    "điều kien",
    "tuoi",
    "tuổi",
    "bao nhieu tuoi",
    "bao nhiêu tuổi",
    "ai duoc",
    "ai được",
    "ai co the",
    "ai có thể",
    "tieu chuan",
    "tiêu chuẩn",
    "tieu chuẩn",
    "tiêu chuan",
    "suc khoe",
    "sức khỏe",
    "suc khoẻ",
    "ho khau",
    "hộ khẩu",
    "ho kẩu",
    "hộ khau",
    "ly lich",
    "lý lịch",
    "ly lịch",
    "lý lich",
    "du tuyen",
    "dự tuyển",
    "du tuyển",
    "dự tuyen",
  ],
  options: [
    { label: "Hồ sơ đăng ký", next: HO_SO_NODE },
    { label: "Liên hệ trực tiếp", next: CONTACT_NODE },
  ],
};

const TRUONG_QUAN_SU_NODE: FlowNode = {
  text: "Các trường quân sự",
  reply:
    "Hệ thống trường quân sự gồm nhiều học viện, trường sĩ quan thuộc Bộ Quốc phòng. Công dân vui lòng liên hệ để được tư vấn trường phù hợp với nguyện vọng.",
  keywords: [
    "truong quan su",
    "trường quân sự",
    "truong quan",
    "trường quan",
    "hoc vien",
    "học viện",
    "hoc viện",
    "học vien",
    "si quan",
    "sĩ quan",
    "si quân",
    "sĩ quân",
    "truong nao",
    "trường nào",
    "chon truong",
    "chọn trường",
    "nguyen vong",
    "nguyện vọng",
    "nguyen vọng",
    "nguyện vong",
    "truong si quan",
    "trường sĩ quan",
    "cac truong",
    "các trường",
    "danh sach truong",
    "danh sách trường",
  ],
  options: [{ label: "Liên hệ trực tiếp", next: CONTACT_NODE }],
};

const TUYEN_SINH_NODE: FlowNode = {
  text: "Tuyển sinh quân sự",
  reply: "Công dân cần hỗ trợ vấn đề gì?",
  keywords: [
    "tuyen sinh",
    "tuyển sinh",
    "tuyen sinh quan su",
    "tuyển sinh quân sự",
    "thi quan su",
    "thi quân sự",
    "thi vao quan doi",
    "thi vào quân đội",
    "xet tuyen",
    "xét tuyển",
    "xet tuyen quan su",
    "xét tuyển quân sự",
    "dang ky tuyen sinh",
    "đăng ký tuyển sinh",
    "tuyen quan",
    "tuyển quân",
  ],
  options: [
    { label: "Đối tượng đăng ký", next: DOI_TUONG_NODE },
    { label: "Hồ sơ đăng ký", next: HO_SO_NODE },
    { label: "Các trường quân sự", next: TRUONG_QUAN_SU_NODE },
  ],
};

const NV_DO_TUOI_NODE: FlowNode = {
  text: "Độ tuổi đối tượng",
  reply:
    "Nam công dân đủ 17 tuổi trong năm tuyển quân thuộc diện đăng ký nghĩa vụ quân sự. Công dân vui lòng liên hệ trực tiếp để được tư vấn cụ thể theo từng trường hợp.",
  keywords: [
    "do tuoi", "độ tuổi", "tuoi", "tuổi",
    "bao nhieu tuoi", "bao nhiêu tuổi",
    "17 tuoi", "18 tuoi", "tuoi nao", "tuổi nào",
    "doi tuong", "đối tượng",
    "ai phai dang ky", "ai phải đăng ký",
    "nam cong dan", "nam công dân",
    "thuoc dien", "thuộc diện",
    "dien dang ky", "diện đăng ký",
    "dieu kien tuoi", "điều kiện tuổi",
    "tuyen quan nam nao", "tuyển quân năm nào",
    "trong nam tuyen", "trong năm tuyển",
  ],
  options: [
    { label: "Hồ sơ đăng ký", next: {
      text: "Hồ sơ đăng ký NVQS",
      reply:
        "Hồ sơ đăng ký NVQS gồm:\n- Đơn đăng ký\n- CCCD/CMND\n- Giấy khai sinh\n- Học bạ / Bằng tốt nghiệp",
      keywords: [],
      options: [
        { label: "Nộp ở đâu?", next: CONTACT_NODE },
        { label: "Liên hệ trực tiếp", next: CONTACT_NODE },
      ],
    }},
    { label: "Liên hệ trực tiếp", next: CONTACT_NODE },
  ],
};

const NV_HO_SO_NODE: FlowNode = {
  text: "Hồ sơ đăng ký",
  reply:
    "Hồ sơ đăng ký NVQS gồm:\n- Đơn đăng ký\n- CCCD/CMND\n- Giấy khai sinh\n- Học bạ / Bằng tốt nghiệp",
  keywords: [
    "ho so", "hồ sơ", "dang ky", "đăng ký",
    "giay to", "giấy tờ", "can gi", "cần gì",
    "can nhung gi", "cần những gì",
    "ho so nvqs", "hồ sơ nvqs",
    "ho so nghia vu", "hồ sơ nghĩa vụ",
    "don dang ky", "đơn đăng ký",
    "giay khai sinh", "giấy khai sinh",
    "cccd", "cmnd",
    "hoc ba", "học bạ",
    "bang tot nghiep", "bằng tốt nghiệp",
    "can chuan bi gi", "cần chuẩn bị gì",
    "nop gi", "nộp gì",
    "ho so gom gi", "hồ sơ gồm gì",
  ],
  options: [
    { label: "Nộp ở đâu?", next: CONTACT_NODE },
    { label: "Liên hệ trực tiếp", next: CONTACT_NODE },
  ],
};

const NV_TAM_HOAN_NODE: FlowNode = {
  text: "Tạm hoãn / Miễn",
  reply:
    "Các trường hợp tạm hoãn NVQS gồm:\n- Đang học tại các cơ sở giáo dục\n- Là lao động duy nhất nuôi thân nhân\n- Có anh, chị, em đang tại ngũ\n- Sức khỏe không đủ điều kiện\n\nCông dân vui lòng liên hệ để được xác nhận từng trường hợp cụ thể.",
  keywords: [
    "tam hoan", "tạm hoãn", "hoan nghia vu", "hoãn nghĩa vụ",
    "mien", "miễn", "mien nghia vu", "miễn nghĩa vụ",
    "hoan ngu", "hoãn ngũ",
    "khong phai di", "không phải đi",
    "duoc hoan", "được hoãn", "duoc mien", "được miễn",
    "truong hop hoan", "trường hợp hoãn",
    "dang di hoc", "đang đi học",
    "lao dong duy nhat", "lao động duy nhất",
    "nuoi than nhan", "nuôi thân nhân",
    "anh chi em tai ngu", "anh chị em tại ngũ",
    "suc khoe khong du", "sức khỏe không đủ",
    "kham suc khoe khong dat", "khám sức khỏe không đạt",
    "co duoc hoan khong", "có được hoãn không",
    "dieu kien duoc hoan", "điều kiện được hoãn",
    "tam hoan vi ly do gi", "tạm hoãn vì lý do gì",
  ],
  options: [
    { label: "Liên hệ trực tiếp", next: CONTACT_NODE },
  ],
};

const NGHIA_VU_NODE: FlowNode = {
  text: "Nghĩa vụ quân sự",
  reply: "Công dân cần hỗ trợ về vấn đề gì?",
  keywords: [
    "nghia vu", "nghĩa vụ",
    "nvqs", "NVQS",
    "nghia vu quan su", "nghĩa vụ quân sự",
    "nhap ngu", "nhập ngũ",
    "goi nhap ngu", "gọi nhập ngũ",
    "goi len duong", "gọi lên đường",
    "kham tuyen nghia vu", "khám tuyển nghĩa vụ",
    "kham tuyen", "khám tuyển",
    "dang ky nghia vu", "đăng ký nghĩa vụ",
    "quan su", "quân sự",
    "quan doi", "quân đội",
    "di bo doi", "đi bộ đội",
    "len duong", "lên đường",
    "tuoi nhap ngu", "tuổi nhập ngũ",
    "nam nay co di khong", "năm nay có đi không",
  ],
  options: [
    { label: "Độ tuổi đối tượng", next: NV_DO_TUOI_NODE },
    { label: "Hồ sơ đăng ký", next: NV_HO_SO_NODE },
    { label: "Tạm hoãn / Miễn", next: NV_TAM_HOAN_NODE },
  ],
};

const DQ_DOI_TUONG_NODE: FlowNode = {
  text: "Đối tượng & Điều kiện",
  reply:
    "Công dân Việt Nam từ 18–45 tuổi (nam), 18–40 tuổi (nữ), có hộ khẩu thường trú tại phường, đủ sức khỏe, chưa là quân nhân tại ngũ đều có thể tham gia Dân quân.",
  keywords: [
    "doi tuong", "đối tượng", "dieu kien", "điều kiện",
    "tuoi tac", "tuổi tác", "tuoi", "tuổi",
    "bao nhieu tuoi", "bao nhiêu tuổi",
    "ai duoc tham gia", "ai được tham gia",
    "ai co the tham gia", "ai có thể tham gia",
    "dieu kien tham gia", "điều kiện tham gia",
    "yeu cau", "yêu cầu", "tieu chuan", "tiêu chuẩn",
    "can dieu kien gi", "cần điều kiện gì",
    "ho khau thuong tru", "hộ khẩu thường trú",
    "chua la quan nhan", "chưa là quân nhân",
    "suc khoe", "sức khỏe",
    "nam nu", "nam nữ", "nu gioi", "nữ giới",
    "gioi tinh", "giới tính",
    "45 tuoi", "40 tuoi", "18 tuoi",
  ],
  options: [
    { label: "Hồ sơ đăng ký", next: {
      text: "Hồ sơ tham gia Dân quân",
      reply:
        "Hồ sơ tham gia Dân quân gồm:\n- Đơn tình nguyện tham gia Dân quân\n- CCCD/CMND\n- Sơ yếu lý lịch có xác nhận\n- Giấy khám sức khỏe",
      keywords: [],
      options: [
        { label: "Nộp ở đâu?", next: CONTACT_NODE },
        { label: "Liên hệ trực tiếp", next: CONTACT_NODE },
      ],
    }},
    { label: "Liên hệ trực tiếp", next: CONTACT_NODE },
  ],
};

const DQ_HO_SO_NODE: FlowNode = {
  text: "Hồ sơ đăng ký",
  reply:
    "Hồ sơ tham gia Dân quân gồm:\n- Đơn tình nguyện tham gia Dân quân\n- CCCD/CMND\n- Sơ yếu lý lịch có xác nhận\n- Giấy khám sức khỏe",
  keywords: [
    "ho so", "hồ sơ", "dang ky", "đăng ký",
    "giay to", "giấy tờ", "can gi", "cần gì",
    "can nhung gi", "cần những gì",
    "ho so tham gia", "hồ sơ tham gia",
    "don tinh nguyen", "đơn tình nguyện",
    "don dang ky", "đơn đăng ký",
    "giay kham suc khoe", "giấy khám sức khỏe",
    "kham suc khoe", "khám sức khỏe",
    "cccd", "cmnd",
    "so yeu ly lich", "sơ yếu lý lịch",
    "ho so gom nhung gi", "hồ sơ gồm những gì",
    "can chuan bi gi", "cần chuẩn bị gì",
    "nop gi", "nộp gì",
  ],
  options: [
    { label: "Nộp ở đâu?", next: CONTACT_NODE },
    { label: "Liên hệ trực tiếp", next: CONTACT_NODE },
  ],
};

const DQ_QUYEN_LOI_NODE: FlowNode = {
  text: "Quyền lợi & Chế độ",
  reply:
    "Dân quân được hưởng:\n- Phụ cấp ngày huấn luyện\n- Bảo hiểm tai nạn trong khi làm nhiệm vụ\n- Được tính thời gian tham gia vào thâm niên công tác theo quy định",
  keywords: [
    "quyen loi", "quyền lợi", "che do", "chế độ",
    "phu cap", "phụ cấp", "bao hiem", "bảo hiểm",
    "luong", "lương", "thu nhap", "thu nhập",
    "tham nien", "thâm niên",
    "huan luyen", "huấn luyện",
    "quyen loi the nao", "quyền lợi thế nào",
    "duoc gi", "được gì", "co loi gi", "có lợi gì",
    "che do dai ngo", "chế độ đãi ngộ", "dai ngo", "đãi ngộ",
    "tai nan", "tai nạn", "bao hiem tai nan", "bảo hiểm tai nạn",
    "co duoc luong khong", "có được lương không",
    "tien phu cap", "tiền phụ cấp",
    "loi ich", "lợi ích",
  ],
  options: [
    { label: "Liên hệ trực tiếp", next: CONTACT_NODE },
  ],
};

const DAN_QUAN_NODE: FlowNode = {
  text: "Tham gia dân quân thường trực",
  reply: "Công dân cần hỗ trợ về vấn đề gì?",
  keywords: [
    "dan quan", "dân quân",
    "dan quan thuong truc", "dân quân thường trực",
    "thuong truc", "thường trực",
    "tham gia dan quan", "tham gia dân quân",
    "dan quan tu ve", "dân quân tự vệ",
    "tu ve", "tự vệ",
    "dang ky dan quan", "đăng ký dân quân",
    "luc luong dan quan", "lực lượng dân quân",
    "dan phong", "dân phòng",
    "dqtv", "DQTV",
    "gia nhap dan quan", "gia nhập dân quân",
    "vao dan quan", "vào dân quân",
    "lam dan quan", "làm dân quân",
    "tro thanh dan quan", "trở thành dân quân",
  ],
  options: [
    { label: "Đối tượng & Điều kiện", next: DQ_DOI_TUONG_NODE },
    { label: "Hồ sơ đăng ký", next: DQ_HO_SO_NODE },
    { label: "Quyền lợi & Chế độ", next: DQ_QUYEN_LOI_NODE },
  ],
};

const HP_HO_SO_THU_TUC_NODE: FlowNode = {
  text: "Hồ sơ thủ tục",
  reply:
    "Để được hướng dẫn cụ thể theo từng đối tượng, công dân vui lòng liên hệ trực tiếp để được hỗ trợ rà soát hồ sơ.",
  keywords: [
    "ho so", "hồ sơ", "thu tuc", "thủ tục",
    "giay to", "giấy tờ", "can gi", "cần gì",
    "ho so thu tuc", "hồ sơ thủ tục",
    "lam thu tuc", "làm thủ tục",
    "can chuan bi gi", "cần chuẩn bị gì",
    "nop gi", "nộp gì", "ho so gom gi", "hồ sơ gồm gì",
    "thu tuc nhu the nao", "thủ tục như thế nào",
  ],
  options: [
    { label: "Liên hệ trực tiếp", next: CONTACT_NODE },
  ],
};

const HP_THUONG_BINH_NODE: FlowNode = {
  text: "Thương binh",
  reply:
    "Thương binh, bệnh binh được hưởng:\n- Trợ cấp hàng tháng theo tỷ lệ thương tật\n- Bảo hiểm y tế\n- Ưu tiên trong tuyển dụng, đào tạo nghề\n- Các chế độ ưu đãi khác theo quy định",
  keywords: [
    "thuong binh", "thương binh",
    "benh binh", "bệnh bình",
    "thuong tat", "thương tật",
    "ty le thuong tat", "tỷ lệ thương tật",
    "bi thuong", "bị thương",
    "mat suc chien dau", "mất sức chiến đấu",
    "che do thuong binh", "chế độ thương binh",
    "tro cap thuong binh", "trợ cấp thương binh",
    "chinh sach thuong binh", "chính sách thương binh",
  ],
  options: [
    { label: "Hồ sơ thủ tục", next: HP_HO_SO_THU_TUC_NODE },
    { label: "Liên hệ trực tiếp", next: CONTACT_NODE },
  ],
};

const HP_THAN_NHAN_QN_NODE: FlowNode = {
  text: "Thân nhân / Quân nhân xuất ngũ",
  reply: "Công dân thuộc trường hợp nào?",
  keywords: [
    "than nhan", "thân nhân",
    "quan nhan xuat ngu", "quân nhân xuất ngũ",
    "xuat ngu", "xuất ngũ",
    "ve ngu", "về ngũ",
    "roi quan doi", "rời quân đội",
    "sau xuat ngu", "sau xuất ngũ",
    "than nhan quan nhan", "thân nhân quân nhân",
    "vo chong quan nhan", "vợ chồng quân nhân",
    "con quan nhan", "con quân nhân",
    "bo me quan nhan", "bố mẹ quân nhân",
  ],
  options: [
    {
      label: "Lựa chọn: Thân nhân",
      next: {
        text: "Chế độ thân nhân quân nhân tại ngũ",
        reply:
          "Thân nhân quân nhân tại ngũ được hưởng các chế độ hỗ trợ theo quy định của Bộ Quốc phòng. Công dân vui lòng liên hệ để được tư vấn cụ thể.",
        keywords: [
          "than nhan", "thân nhân", "tai ngu", "tại ngũ",
          "than nhan tai ngu", "thân nhân tại ngũ",
          "vo chong dang ngu", "vợ chồng đang ngũ",
        ],
        options: [{ label: "Liên hệ trực tiếp", next: CONTACT_NODE }],
      },
    },
    {
      label: "Lựa chọn: Quân nhân xuất ngũ",
      next: {
        text: "Chế độ quân nhân xuất ngũ",
        reply:
          "Quân nhân xuất ngũ được hỗ trợ:\n- Trợ cấp xuất ngũ một lần\n- Hỗ trợ đào tạo nghề, việc làm\n- Các chế độ khác theo quy định",
        keywords: [
          "xuat ngu", "xuất ngũ", "tro cap xuat ngu", "trợ cấp xuất ngũ",
          "dao tao nghe", "đào tạo nghề", "viec lam", "việc làm",
          "ho tro xuat ngu", "hỗ trợ xuất ngũ",
        ],
        options: [
          { label: "Hồ sơ thủ tục", next: HP_HO_SO_THU_TUC_NODE },
          { label: "Liên hệ trực tiếp", next: CONTACT_NODE },
        ],
      },
    },
    { label: "Liên hệ trực tiếp", next: CONTACT_NODE },
  ],
};

const HP_DOI_TUONG_KHAC_NODE: FlowNode = {
  text: "Đối tượng khác",
  reply:
    "Công dân vui lòng liên hệ trực tiếp để được xác định đối tượng và hướng dẫn cụ thể.\nHotline: 02838667722 – Trực ban 24/7",
  keywords: [
    "doi tuong khac", "đối tượng khác",
    "khac", "khác", "loai khac", "loại khác",
    "khong biet thuoc doi tuong nao", "không biết thuộc đối tượng nào",
    "khong ro", "không rõ", "khong biet", "không biết",
    "tu van", "tư vấn", "xac dinh doi tuong", "xác định đối tượng",
    "toi thuoc loai nao", "tôi thuộc loại nào",
    "huong dan cu the", "hướng dẫn cụ thể",
  ],
  options: [
    { label: "Liên hệ trực tiếp", next: CONTACT_NODE },
  ],
};

const HP_GIA_DINH_LIET_SI_NODE: FlowNode = {
  text: "Gia đình liệt sĩ",
  reply:
    "Gia đình liệt sĩ được hưởng:\n- Trợ cấp tuất hàng tháng\n- Bảo hiểm y tế\n- Hỗ trợ nhà ở, đất ở theo quy định\n- Ưu tiên trong tuyển học, học nghề, việc làm",
  keywords: [
    "liet si", "liệt sĩ", "gia dinh liet si", "gia đình liệt sĩ",
    "than nhan liet si", "thân nhân liệt sĩ",
    "bo me liet si", "bố mẹ liệt sĩ",
    "vo con liet si", "vợ con liệt sĩ",
    "tro cap tuat", "trợ cấp tuất",
    "tuat liet si", "tuất liệt sĩ",
    "chinh sach liet si", "chính sách liệt sĩ",
    "che do liet si", "chế độ liệt sĩ",
    "nha tinh nghia", "nhà tình nghĩa",
    "ho tro nha o", "hỗ trợ nhà ở",
  ],
  options: [
    { label: "Hồ sơ thủ tục", next: HP_HO_SO_THU_TUC_NODE },
    { label: "Liên hệ trực tiếp", next: CONTACT_NODE },
  ],
};

const HAU_PHUONG_NODE: FlowNode = {
  text: "Hậu phương và chính sách người có công",
  reply: "Công dân thuộc đối tượng nào?",
  keywords: [
    "hau phuong", "hậu phương",
    "chinh sach", "chính sách",
    "nguoi co cong", "người có công",
    "co cong", "có công",
    "thuong binh", "thương binh",
    "benh binh", "bệnh binh",
    "liet si", "liệt sĩ",
    "gia dinh co cong", "gia đình có công",
    "tro cap", "trợ cấp",
    "che do", "chế độ",
    "phu cap", "phụ cấp",
    "uu dai", "ưu đãi",
    "chinh sach xa hoi", "chính sách xã hội",
    "xuat ngu", "xuất ngũ",
    "than nhan", "thân nhân",
    "bao hiem y te", "bảo hiểm y tế",
    "tro cap hang thang", "trợ cấp hàng tháng",
    "che do dai ngo", "chế độ đãi ngộ",
    "nguoi co cong voi cach mang", "người có công với cách mạng",
  ],
  options: [
    { label: "Thương binh", next: HP_THUONG_BINH_NODE },
    { label: "Gia đình liệt sĩ", next: HP_GIA_DINH_LIET_SI_NODE },
    { label: "Đối tượng khác", next: HP_DOI_TUONG_KHAC_NODE },
    { label: "Thân nhân / Quân nhân xuất ngũ", next: HP_THAN_NHAN_QN_NODE },
  ],
};

export const ROOT_OPTIONS: FlowOption[] = [
  { label: "Tuyển sinh quân sự", next: TUYEN_SINH_NODE },
  { label: "Nghĩa vụ quân sự", next: NGHIA_VU_NODE },
  { label: "Tham gia dân quân thường trực", next: DAN_QUAN_NODE },
  { label: "Hậu phương và chính sách người có công", next: HAU_PHUONG_NODE },
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

export function matchOptionByInput(
  input: string,
  options: FlowOption[],
): FlowOption | null {
  const normalized = normalize(input);
  let bestMatch: FlowOption | null = null;
  let bestScore = 0;

  for (const opt of options) {
    const keywords = opt.next.keywords ?? [];
    for (const kw of keywords) {
      const normalizedKw = normalize(kw);
      if (
        normalized.includes(normalizedKw) ||
        normalizedKw.includes(normalized)
      ) {
        const score = normalizedKw.length;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = opt;
        }
      }
    }
  }

  return bestMatch;
}
