import { useCallback } from "react";

export const handleGetDepartment = (value: string) => {
    const departmentMap: Record<string, string> = {
        administration_office: "Văn phòng hành chính",
        planning: "Kế hoạch",
        political_affairs: "Chính trị",
        logistics: "Hậu cần",
        mobilization_recruitment: "Động viên tuyển quân",
    };

    return departmentMap[value] || "Không xác định";
}

export const handleGetWorkType = (value: string) => {
    const departmentMap: Record<string, string> = {
        suddenly: "Đột xuất",
        annual: "Định kỳ",
    };

    return departmentMap[value] || "Không xác định";
};
