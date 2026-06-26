export interface FlowNode {
  text: string;
  reply: string;
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
};

export const MOCK_FLOW: FlowOption[] = [
  {
    label: "Đối tượng đăng ký",
    next: {
      text: "Đối tượng đăng ký",
      reply:
        "Điều kiện dự tuyển:\n- Nam/Nữ: 17–21 tuổi\n- Tốt nghiệp THPT\n- Đủ sức khỏe theo quy định Bộ Quốc phòng\n- Lý lịch chính trị rõ ràng\n- Hộ khẩu thường trú tại địa phương",
      options: [
        {
          label: "Hồ sơ đăng ký",
          next: {
            text: "Hồ sơ đăng ký",
            reply:
              "Hồ sơ đăng ký TSQS gồm:\n- Đơn xin dự tuyển\n- CCCD/CMND\n- Học bạ THPT\n- Bằng tốt nghiệp THPT\n- Giấy khai sinh\n- Sơ yếu lý lịch có xác nhận",
            options: [
              { label: "Nộp ở đâu?", next: CONTACT_NODE },
              { label: "Liên hệ trực tiếp", next: CONTACT_NODE },
            ],
          },
        },
        { label: "Liên hệ trực tiếp", next: CONTACT_NODE },
      ],
    },
  },
  {
    label: "Hồ sơ đăng ký",
    next: {
      text: "Hồ sơ đăng ký",
      reply:
        "Hồ sơ đăng ký TSQS gồm:\n- Đơn xin dự tuyển\n- CCCD/CMND\n- Học bạ THPT\n- Bằng tốt nghiệp THPT\n- Giấy khai sinh\n- Sơ yếu lý lịch có xác nhận",
      options: [
        { label: "Nộp ở đâu?", next: CONTACT_NODE },
        { label: "Liên hệ trực tiếp", next: CONTACT_NODE },
      ],
    },
  },
  {
    label: "Các trường quân sự",
    next: {
      text: "Các trường quân sự",
      reply:
        "Hệ thống trường quân sự gồm nhiều học viện, trường sĩ quan thuộc Bộ Quốc phòng. Công dân vui lòng liên hệ để được tư vấn trường phù hợp với nguyện vọng.",
      options: [{ label: "Liên hệ trực tiếp", next: CONTACT_NODE }],
    },
  },
];
