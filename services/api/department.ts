import { axiosInstance } from "@/lib/axios.config";

export interface DepartmentInterface {
    id: number,
    code: string,
    name: string,
    created_at: string,
    updated_at: string
}

const getAllDepartment = async (): Promise<DepartmentInterface[]> => {
    const res = await axiosInstance.get("/api/department");

    return res.data.data;
};

export const departmentAPI = {
    getAllDepartment
}