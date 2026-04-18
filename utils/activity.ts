import dayjs from "dayjs";

export const handleGetDepartment = (value: string) => {
    const departmentMap: Record<string, string> = {
        administration_office: "Văn phòng hành chính",
        advise: "Tham mưu",
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

export type DeadlineDisplay = {
    text: string;
    color: "red" | "yellow" | "green" | "blue";
    className: string;
};

export const getDeadlineDisplay = (
    end_date: string | Date,
    completed_at: string | Date | null
): DeadlineDisplay => {
    const end = dayjs(end_date).startOf("day");

    if (completed_at !== null && completed_at !== undefined) {
        const completed = dayjs(completed_at).startOf("day");
        const diff = completed.diff(end, "day");

        if (diff > 0) return { text: `Hoàn thành trễ ${diff} ngày`, color: "red", className: "text-red-500" };
        return { text: "Hoàn thành đúng hạn", color: "green", className: "text-green-600" };
    }

    const today = dayjs().startOf("day");
    const diff = today.diff(end, "day");

    if (diff > 0) return { text: `Quá hạn ${diff} ngày`, color: "red", className: "text-red-500" };
    if (diff === 0) return { text: "Hạn hôm nay", color: "yellow", className: "text-yellow-500" };
    return { text: `Còn ${Math.abs(diff)} ngày`, color: "blue", className: "text-blue-600" };
};
