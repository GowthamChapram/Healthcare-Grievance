"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Card,
  CardContent,
  Chip,
  Pagination,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Checkbox,
  IconButton,
  Skeleton,
  Alert,
} from "@mui/material";
import {
  Search as SearchIcon,
  Sort as SortIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Grievance, GrievanceFilters } from "@/Types/Grievance.types";
import {
  deleteGrievance,
  bulkDeleteGrievances,
  fetchGrievances,
} from "@/Actions/Grievance.actions";

interface DashboardClientProps {
  initialData: Grievance[];
  initialTotal: number;
  initialFilters: GrievanceFilters;
}

export default function DashboardClient({
  initialData,
  initialTotal,
  initialFilters,
}: DashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [data, setData] = useState<Grievance[]>(initialData);
  const [total, setTotal] = useState(initialTotal);
  const [filters, setFilters] = useState<GrievanceFilters>(initialFilters);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const refetchData = async () => {
      setIsLoading(true);
      try {
        const result = await fetchGrievances(filters);
        setData(result.data);
        setTotal(result.total);
      } catch (error) {
        console.error("Failed to fetch grievances", error);
        setFlash("Failed to load grievances. Please try again.");
        setTimeout(() => setFlash(null), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    refetchData();
  }, [
    filters.search,
    filters.sortBy,
    filters.sortOrder,
    filters.status,
    filters.page,
    filters.pageSize,
  ]);

  const totalPages = Math.ceil(total / (filters.pageSize || 5));

  const updateURL = (updatedFilters: GrievanceFilters) => {
    const params = new URLSearchParams();

    if (updatedFilters.status) params.set("status", updatedFilters.status);
    if (updatedFilters.search) params.set("search", updatedFilters.search);
    if (updatedFilters.sortBy) params.set("sortBy", updatedFilters.sortBy);
    if (updatedFilters.sortOrder)
      params.set("sortOrder", updatedFilters.sortOrder);

    params.set("page", String(updatedFilters.page || 1));

    router.push(`/grievance/dashboard?${params.toString()}`);
  };

  const handleFilterChange = (newFilters: Partial<GrievanceFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);

    startTransition(() => {
      updateURL(updatedFilters);
    });
  };

  const handlePageChange = (_: any, page: number) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);

    startTransition(() => {
      updateURL(updatedFilters);
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? data.map((item) => item.id) : []);
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((itemId) => itemId !== id)
    );
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this grievance?")) return;

    startTransition(async () => {
      try {
        await deleteGrievance(id);
        setData((prev) => prev.filter((item) => item.id !== id));
        setTotal((prev) => prev - 1);
        setFlash("Grievance deleted successfully.");
        setTimeout(() => setFlash(null), 3000);
      } catch {
        setFlash("Failed to delete grievance. Please try again.");
        setTimeout(() => setFlash(null), 3000);
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} grievances?`)) return;

    startTransition(async () => {
      try {
        const deletedCount = await bulkDeleteGrievances(selectedIds);
        setData((prev) =>
          prev.filter((item) => !selectedIds.includes(item.id))
        );
        setTotal((prev) => prev - deletedCount);
        setSelectedIds([]);
        setFlash(`${deletedCount} grievances deleted successfully.`);
        setTimeout(() => setFlash(null), 3000);
      } catch {
        setFlash("Failed to delete grievances.");
        setTimeout(() => setFlash(null), 3000);
      }
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "High":
        return "error";
      case "Medium":
        return "warning";
      case "Low":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", py: 4, px: 2 }}>
      <Paper sx={{ maxWidth: 900, mx: "auto", p: 3 }}>
        <Stack spacing={3}>
          <Typography variant="h4">Grievance Dashboard</Typography>

          {flash && <Alert>{flash}</Alert>}

          <Stack direction="row" spacing={2}>
            <TextField
              placeholder="Search..."
              value={filters.search || ""}
              onChange={(e) =>
                handleFilterChange({ search: e.target.value })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl>
              <Select
                value={filters.sortBy}
                onChange={(e) =>
                  handleFilterChange({ sortBy: e.target.value as any })
                }
              >
                <MenuItem value="createdAt">Date</MenuItem>
                <MenuItem value="title">Title</MenuItem>
              </Select>
            </FormControl>

            <Button
              onClick={() =>
                handleFilterChange({
                  sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
                })
              }
            >
              {filters.sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </Stack>

          {isLoading ? (
            <Skeleton height={100} />
          ) : data.length === 0 ? (
            <Typography>No data</Typography>
          ) : (
            data.map((item) => (
              <Card key={item.id}>
                <CardContent>
                  <Typography>{item.title}</Typography>
                  <Chip label={item.urgency} />
                </CardContent>
              </Card>
            ))
          )}

          <Pagination
            count={totalPages}
            page={filters.page}
            onChange={handlePageChange}
          />
        </Stack>
      </Paper>
    </Box>
  );
}