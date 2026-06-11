"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DocumentFilters } from "./DocumentFilters";
import { DocumentTable } from "./DocumentTable";
import { UploadDocumentDialog } from "./UploadDocumentDialog";
import { documentAPI, DocumentItem } from "@/services/api/document";
import { departmentAPI, DepartmentInterface } from "@/services/api/department";
import AppPagination from "@/components/ui/AppPagination";
import useDebounce from "@/hooks/useDebounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

interface Params {
  page: number;
  limit: number;
  search: string;
  departmentId: string;
}

export function DocumentListPage() {
  const [params, setParams] = useState<Params>({
    page: 1,
    limit: 10,
    search: "",
    departmentId: "all",
  });

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);

  const debouncedParams = useDebounce(params, 300);

  const fetchDocuments = useCallback(async (p: Params) => {
    setLoading(true);
    try {
      const result = await documentAPI.fetchList({
        page: p.page,
        limit: p.limit,
        search: p.search || undefined,
        departmentId: p.departmentId !== "all" ? Number(p.departmentId) : undefined,
      });
      setDocuments(result.data);
      setTotal(result.total);
    } catch {
      setDocuments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    departmentAPI.getAllDepartment().then(setDepartments).catch(() => {});
  }, []);

  useEffect(() => {
    fetchDocuments(debouncedParams);
  }, [debouncedParams, fetchDocuments]);

  const handleSearchChange = (v: string) => {
    setParams((prev) => ({ ...prev, search: v, page: 1 }));
  };

  const handleDepartmentChange = (v: string) => {
    setParams((prev) => ({ ...prev, departmentId: v, page: 1 }));
  };

  const handleClear = () => {
    setParams((prev) => ({ ...prev, search: "", departmentId: "all", page: 1 }));
  };

  const handlePageChange = (p: number) => {
    setParams((prev) => ({ ...prev, page: p }));
  };

  const handleLimitChange = (v: string) => {
    setParams((prev) => ({ ...prev, limit: Number(v), page: 1 }));
  };

  return (
    <div className="flex flex-col min-h-screen space-y-6">
      <div>
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-bold text-slate-800">Danh Sách Tài Liệu</h1>
          <Button
            className="bg-[#556B2F] hover:bg-[#465e17] text-white cursor-pointer"
            onClick={() => setUploadOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm mới
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <DocumentFilters
            search={params.search}
            departmentId={params.departmentId}
            departments={departments}
            onSearchChange={handleSearchChange}
            onDepartmentChange={handleDepartmentChange}
            onClear={handleClear}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 flex flex-col">
        <div className="flex-1">
          <DocumentTable documents={documents} loading={loading} />
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Hiển thị</span>
            <Select
              value={String(params.limit)}
              onValueChange={handleLimitChange}
            >
              <SelectTrigger className="h-8 w-18 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>/ {total} tài liệu</span>
          </div>

          <AppPagination
            page={params.page}
            limit={params.limit}
            total={total}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      <UploadDocumentDialog
        open={uploadOpen}
        departments={departments}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => fetchDocuments({ ...params, page: 1 })}
      />
    </div>
  );
}
