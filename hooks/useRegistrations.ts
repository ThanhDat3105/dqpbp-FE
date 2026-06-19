"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AdminRegistration,
  AdminRegistrationFilters,
  websiteRegistrationAPI,
} from "@/services/api/website-registration";
import useDebounce from "./useDebounce";

export function useRegistrations() {
  const [registrations, setRegistrations] = useState<AdminRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AdminRegistrationFilters>({
    category: "",
    full_name: "",
    phone: "",
    address: "",
  });

  const debouncedFilters = useDebounce(filters, 400);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const cleanFilters: AdminRegistrationFilters = {};
      if (debouncedFilters.category) cleanFilters.category = debouncedFilters.category;
      if (debouncedFilters.full_name?.trim()) cleanFilters.full_name = debouncedFilters.full_name.trim();
      if (debouncedFilters.phone?.trim()) cleanFilters.phone = debouncedFilters.phone.trim();
      if (debouncedFilters.address?.trim()) cleanFilters.address = debouncedFilters.address.trim();

      const data = await websiteRegistrationAPI.getAdminRegistrations(cleanFilters);
      setRegistrations(data);
    } catch (err) {
      console.error("Failed to fetch registrations:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedFilters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFilterChange = (
    key: keyof AdminRegistrationFilters,
    value: string,
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return { registrations, loading, filters, handleFilterChange };
}
