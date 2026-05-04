import { WarehouseItem } from './types';

export const mockItems: WarehouseItem[] = [
    { id: '1', name: 'Đồ dân quân', category: 'Quân trang', stock: 45, lowStockThreshold: 10, unit: 'bộ' },
    { id: '2', name: 'Bộ đàm', category: 'Liên lạc', stock: 12, lowStockThreshold: 5, unit: 'cái' },
    { id: '3', name: 'Áo phao cứu sinh', category: 'Cứu hộ', stock: 5, lowStockThreshold: 5, unit: 'cái' },
    { id: '4', name: 'Súng AK-47', category: 'Vũ khí', stock: 20, lowStockThreshold: 8, unit: 'khẩu' },
    { id: '5', name: 'Băng y tế', category: 'Y tế', stock: 3, lowStockThreshold: 10, unit: 'hộp' },
    { id: '6', name: 'Mũ bảo hiểm', category: 'Quân trang', stock: 30, lowStockThreshold: 8, unit: 'cái' },
    { id: '7', name: 'Đèn pin chiến thuật', category: 'Khác', stock: 8, lowStockThreshold: 5, unit: 'cái' },
    { id: '8', name: 'Dây thừng cứu hộ', category: 'Cứu hộ', stock: 15, lowStockThreshold: 5, unit: 'cuộn' },
    { id: '9', name: 'Áo giáp', category: 'Quân trang', stock: 2, lowStockThreshold: 5, unit: 'bộ' },
];
