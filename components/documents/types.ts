export interface Document {
    id: string;
    name: string;
    type: string;
    category: string;
    createdAt: string;   // "DD/MM/YYYY"
    createdBy: string;
    fileCount: number;
}
