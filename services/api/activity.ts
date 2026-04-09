import { axiosInstance } from "@/lib/axios.config";

export interface Department {
  value: string;
  label: string;
  teams: {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
    phone: string;
    cccd: string;
  }[];
}

export const departments: Department[] = [
  {
    value: "administration_office",
    label: "Tổ Văn thư – Văn phòng",
    teams: [
      {
        id: "u1",
        name: "Ngô Trương Định",
        address: "12 Đường Bình Phú, KP.1",
        lat: 10.7531,
        lng: 106.6272,
        phone: "0901234001",
        cccd: "079201001001"
      },
      {
        id: "u2",
        name: "Ngô Hoài Bảo",
        address: "45 Đường Lê Tấn Kế, KP.1",
        lat: 10.7537,
        lng: 106.6265,
        phone: "0901234002",
        cccd: "079201001002"
      },
      {
        id: "u3",
        name: "Nguyễn Lý Minh Quang",
        address: "78 Đường Bình Phú, KP.2",
        lat: 10.7525,
        lng: 106.6281,
        phone: "0901234003",
        cccd: "079201001003"
      },
      {
        id: "u4",
        name: "Nguyễn Thành Tài",
        address: "23 Đường Hồ Học Lãm, KP.2",
        lat: 10.7542,
        lng: 106.6258,
        phone: "0901234004",
        cccd: "079201001004"
      },
      {
        id: "u5",
        name: "Trần Hoàng Phi",
        address: "31 Đường Bình Phú, KP.11",
        lat: 10.7495,
        lng: 106.6325,
        phone: "0901234023",
        cccd: "079201001023"
      },
      {
        id: "u6",
        name: "Lưu Vĩnh Cơ",
        address: "112 Đường Lê Tấn Kế, KP.11",
        lat: 10.7565,
        lng: 106.623,
        phone: "0901234024",
        cccd: "079201001024"
      },
      {
        id: "u7",
        name: "Lê Hải Triều",
        address: "48 Đường Hồ Học Lãm, KP.12",
        lat: 10.7508,
        lng: 106.6308,
        phone: "0901234025",
        cccd: "079201001025"
      },
      {
        id: "u8",
        name: "Hoàng Phạm Thế Lộc",
        address: "175 Đường An Dương Vương, KP.12",
        lat: 10.755,
        lng: 106.6248,
        phone: "0901234026",
        cccd: "079201001026"
      },
      {
        id: "u9",
        name: "Vương Quý Thắng",
        address: "64 Đường Bình Phú, KP.11",
        lat: 10.7538,
        lng: 106.627,
        phone: "0901234027",
        cccd: "079201001027"
      }
    ]
  },
  {
    value: "planning",
    label: "Tổ tham mưu",
    teams: [
      {
        id: "u10",
        name: "Lý Triệu An",
        address: "156 Đường Bình Phú, KP.3",
        lat: 10.7518,
        lng: 106.6293,
        phone: "0901234005",
        cccd: "079201001005"
      },
      {
        id: "u11",
        name: "Phạm Gia Bảo",
        address: "89 Đường An Dương Vương, KP.3",
        lat: 10.7512,
        lng: 106.6301,
        phone: "0901234006",
        cccd: "079201001006"
      },
      {
        id: "u12",
        name: "Lâm Ngọc Huyền",
        address: "34 Đường Hồ Học Lãm, KP.4",
        lat: 10.7548,
        lng: 106.6245,
        phone: "0901234007",
        cccd: "079201001007"
      },
      {
        id: "u13",
        name: "Đoàn Quốc Đạt",
        address: "67 Đường Bình Phú, KP.4",
        lat: 10.7505,
        lng: 106.6312,
        phone: "0901234008",
        cccd: "079201001008"
      },
      {
        id: "u14",
        name: "Nguyễn Thanh Nhân",
        address: "201 Đường An Dương Vương, KP.3",
        lat: 10.7522,
        lng: 106.6288,
        phone: "0901234009",
        cccd: "079201001009"
      }
    ],
  },
  {
    value: "political_affairs",
    label: "Tổ Chính trị",
    teams:
      [
        {
          id: "u15",
          name: "Phan Phong Phú",
          address: "15 Đường Lê Tấn Kế, KP.5",
          lat: 10.7555,
          lng: 106.6238,
          phone: "0901234010",
          cccd: "079201001010"
        }
      ],
  },
  {
    value: "logistics",
    label: "Tổ Hậu cần",
    teams: [
      {
        id: "u16",
        name: "Lại Tu Trung",
        address: "73 Đường Lê Tấn Kế, KP.7",
        lat: 10.7515,
        lng: 106.6298,
        phone: "0901234015",
        cccd: "079201001015"
      }
    ],
  },
  {
    value: "mobilization_recruitment",
    label: "Tổ Động viên - Tuyển quân",
    teams: [
      {
        id: "u17",
        name: "Võ Công Minh",
        address: "25 Đường Bình Phú, KP.9",
        lat: 10.7502,
        lng: 106.6322,
        phone: "0901234019",
        cccd: "079201001019"
      }
    ]
  }
];

export interface ActivityInterface {
  id: string;
  name: string;
  work_type: string;
  department: string;
  start_date: Date;
  end_date: Date;
  location: string;
  document_number: string;
  status: "pending" | "in_progress" | "completed" | "cancelled" | string;
  attached_files: string[];
  created_by: string;
  created_at: Date;
  updated_at: Date;
  tasks: TaskInterface[];
}

export interface CreateActivityInterface {
  name: string;
  work_type: string;
  department: string;
  start_date: string;
  end_date: string;
  location: string;
  document_number: string;
  attached_files: string[];
  tasks: Omit<TaskInterface, "id" | "activity_id">[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TaskInterface {
  id: string;
  activity_id: string;
  title: string;
  team: string[];
  assignees: string[];
  due_date: string;
  notes: string;
  report_fields: { name: string; value: string }[];
  accepted_at: string | null;
  created_at: string;
  updated_at: string;
  status: "pending" | "in_progress" | "completed" | "cancelled" | string;
  requires_dqcd: boolean;
}

export type TaskStatus = "pending" | "in_progress" | "completed";

const getActivities = async ({
  month,
  year,
}: {
  month: number;
  year: number;
}) => {
  try {
    const res = await axiosInstance.get("/api/activities", {
      params: { month, year },
    });
    return res.data.metaData;
  } catch (error) {
    throw error;
  }
};

const getActivityDetail = async (id: string): Promise<ActivityInterface> => {
  try {
    const res = await axiosInstance.get(`/api/activities/${id}`);

    return res.data.metaData;
  } catch (error) {
    throw error;
  }
};

const updateReportFields = async (
  activity_id: string,
  task_id: string,
  report_fields: { name: string; value: string }[],
) => {
  try {
    const res = await axiosInstance.patch(
      `/api/activities-task/${activity_id}/tasks/${task_id}`,
      { report_fields },
    );

    return res.data.metaData;
  } catch (error) {
    throw error;
  }
};

const updateTaskStatus = async (task_id: string, status: TaskStatus) => {
  try {
    const res = await axiosInstance.put(`/api/activities-task/${task_id}`, {
      status,
    });

    return res.data;
  } catch (error) {
    throw error;
  }
};

const createActivity = async (payload: CreateActivityInterface) => {
  try {
    const res = await axiosInstance.post(`/api/activities`, payload);

    console.log(res)

    return res.data;
  } catch (error) {
    throw error;
  }
};

export const activityAPI = {
  getActivities,
  getActivityDetail,
  updateReportFields,
  updateTaskStatus,
  createActivity,
};
