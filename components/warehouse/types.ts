export type WarehouseCategory =
    | 'Quân trang'
    | 'Liên lạc'
    | 'Cứu hộ'
    | 'Vũ khí'
    | 'Y tế'
    | 'Khác';

export interface WarehouseItem {
    id: string;
    name: string;
    category: WarehouseCategory;
    stock: number;
    lowStockThreshold: number;
    unit: string;
}
