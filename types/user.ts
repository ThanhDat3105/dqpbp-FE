export type UserStatus = 'on_duty' | 'training' | 'on_leave' | 'other';

export interface UserDetailInterface {
    id: number;
    name: string;
    address: string | null;
    phone: string | null;
    email: string | null;
    role: string; // VD: 'DQTT', 'DQCD', 'CHI_HUY', 'TO_TRUONG'
    is_active: boolean;
    unit_code: string | null;
    status: UserStatus;
    department_id: number;
    date_of_birth: string | null; // ISO Date string
    enlistment_date: string | null; // ISO Date string
    military_rank: string | null;
    avatar_url: string | null;
}

export const DEPARTMENT_MAP: Record<number, string> = {
    1: "Tiểu đội Dân quân Tổ 1",
    2: "Tiểu đội Dân quân Tổ 2",
    3: "Trung đội Dân quân Cơ động",
    4: "Ban Chỉ huy Quân sự Phường",
};

export const MOCK_USERS: UserDetailInterface[] = [
    {
        id: 1,
        name: "Nguyễn Văn A",
        address: "123 Đường Tôn Đức Thắng, Phường Bến Nghé, Quận 1, TP.HCM",
        phone: "0901234567",
        email: "nguyenvana@example.com",
        role: "DQTT",
        is_active: true,
        unit_code: "DQTT-001",
        status: "on_duty",
        department_id: 1,
        date_of_birth: "1995-05-15T00:00:00Z",
        enlistment_date: "2023-01-10T00:00:00Z",
        military_rank: "Tiểu đội trưởng",
        avatar_url: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
    },
    {
        id: 2,
        name: "Trần Thị B",
        address: "456 Lê Lợi, Quận 1, TP.HCM",
        phone: "0912345678",
        email: "tranthib@example.com",
        role: "DQCD",
        is_active: true,
        unit_code: "DQCD-002",
        status: "training",
        department_id: 3,
        date_of_birth: "1998-10-20T00:00:00Z",
        enlistment_date: "2024-03-05T00:00:00Z",
        military_rank: "Chiến sĩ",
        avatar_url: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
    },
    {
        id: 3,
        name: "Lê Văn C",
        address: "789 Nguyễn Huệ, Quận 1, TP.HCM",
        phone: "0923456789",
        email: "levanc@example.com",
        role: "CHI_HUY",
        is_active: false,
        unit_code: "CH-001",
        status: "on_leave",
        department_id: 4,
        date_of_birth: "1985-12-05T00:00:00Z",
        enlistment_date: "2010-02-15T00:00:00Z",
        military_rank: "Chỉ huy trưởng",
        avatar_url: "https://i.pravatar.cc/150?u=a04258114e29026702d",
    },
    {
        id: 4,
        name: "Phạm Văn D",
        address: "321 Trần Hưng Đạo, Quận 5, TP.HCM",
        phone: "0934567890",
        email: "phamvand@example.com",
        role: "DQTT",
        is_active: true,
        unit_code: "DQTT-004",
        status: "other",
        department_id: 2,
        date_of_birth: "2000-08-25T00:00:00Z",
        enlistment_date: "2025-01-01T00:00:00Z",
        military_rank: "Chiến sĩ",
        avatar_url: "https://i.pravatar.cc/150?u=a048581f4e29026701d",
    },
];
