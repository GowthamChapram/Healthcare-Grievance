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
import { useRouter, useSearchParams } from "next/navigation";
import { Grievance, GrievanceFilters } from "@/Types/Grievance.types";
import { deleteGrievance, bulkDeleteGrievances, fetchGrievances } from "@/Actions/Grievance.actions";

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
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [data, setData] = useState<Grievance[]>(initialData);
  const [total, setTotal] = useState(initialTotal);
  const [filters, setFilters] = useState<GrievanceFilters>(initialFilters);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync filters with URL search parameters
  useEffect(() => {
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;
    const sortBy = (searchParams.get("sortBy") as any) || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") as any) || "desc";
    const page = Number(searchParams.get("page")) || 1;

    setFilters({
      status,
      search,
      sortBy,
      sortOrder,
      page,
      pageSize: filters.pageSize,
    });
  }, [searchParams]);

  // Refetch data when filters change
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
  }, [filters.search, filters.sortBy, filters.sortOrder, filters.status, filters.page, filters.pageSize]);

  const totalPages = Math.ceil(total / (filters.pageSize || 5));

  const handleFilterChange = (newFilters: Partial<GrievanceFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);

    // Update URL
    const params = new URLSearchParams();
    if (updatedFilters.status) params.set("status", updatedFilters.status);
    if (updatedFilters.search) params.set("search", updatedFilters.search);
    if (updatedFilters.sortBy) params.set("sortBy", updatedFilters.sortBy);
    if (updatedFilters.sortOrder) params.set("sortOrder", updatedFilters.sortOrder);
    params.set("page", "1");

    startTransition(() => {
      router.push(`/grievance/dashboard?${params.toString()}`);
    });
  };

  const handlePageChange = (_: any, page: number) => {
    const updatedFilters = { ...filters, page };
    setFilters(updatedFilters);

    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());

    startTransition(() => {
      router.push(`/grievance/dashboard?${params.toString()}`);
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? data.map(item => item.id) : []);
  };

  const handleSelectItem = (id: number, checked: boolean) => {
    setSelectedIds(prev =>
      checked
        ? [...prev, id]
        : prev.filter(itemId => itemId !== id)
    );
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this grievance?")) return;

    startTransition(async () => {
      try {
        await deleteGrievance(id);
        setData(prev => prev.filter(item => item.id !== id));
        setTotal(prev => prev - 1);
        setFlash("Grievance deleted successfully.");
        setTimeout(() => setFlash(null), 3000);
      } catch (error) {
        setFlash("Failed to delete grievance. Please try again.");
        setTimeout(() => setFlash(null), 3000);
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} grievances?`)) return;

    startTransition(async () => {
      try {
        const deletedCount = await bulkDeleteGrievances(selectedIds);
        setData(prev => prev.filter(item => !selectedIds.includes(item.id)));
        setTotal(prev => prev - deletedCount);
        setSelectedIds([]);
        setFlash(`${deletedCount} grievances deleted successfully.`);
        setTimeout(() => setFlash(null), 3000);
      } catch (error) {
        setFlash("Failed to delete grievances. Please try again.");
        setTimeout(() => setFlash(null), 3000);
      }
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "High": return "error";
      case "Medium": return "warning";
      case "Low": return "success";
      default: return "default";
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)", py: 4, px: 2 }}>
      <Paper elevation={3} sx={{ maxWidth: 900, mx: "auto", p: { xs: 2.5, sm: 4 }, borderRadius: 2 }}>
        <Stack spacing={4}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              Grievance Dashboard
            </Typography>
            <Typography variant="body2" color="textSecondary">
              View and manage your grievance submissions
            </Typography>
          </Box>

          {flash && (
            <Alert
              severity={flash.includes("successfully") ? "success" : "error"}
              onClose={() => setFlash(null)}
              sx={{ borderRadius: 1 }}
            >
              {flash}
            </Alert>
          )}

          {/* Search and Filters */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
            <TextField
              placeholder="Search grievances..."
              value={filters.search || ""}
              onChange={(e) => handleFilterChange({ search: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ flex: 1 }}
              size="small"
            />

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={filters.sortBy || "createdAt"}
                onChange={(e) => handleFilterChange({ sortBy: e.target.value as any })}
                startAdornment={<SortIcon sx={{ mr: 1 }} />}
              >
                <MenuItem value="createdAt">Date Created</MenuItem>
                <MenuItem value="title">Title</MenuItem>
                <MenuItem value="urgency">Urgency</MenuItem>
                <MenuItem value="status">Status</MenuItem>
              </Select>
            </FormControl>

            <Button
              onClick={() => handleFilterChange({
                sortOrder: filters.sortOrder === "asc" ? "desc" : "asc"
              })}
              variant="outlined"
              size="small"
            >
              {filters.sortOrder === "asc" ? "↑" : "↓"}
            </Button>
          </Stack>

          {/* Status Filters and Actions */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Link href="/grievance/dashboard" style={{ textDecoration: "none" }}>
              <Button
                variant={!filters.status ? "contained" : "outlined"}
                sx={{ textTransform: "capitalize" }}
                size="small"
              >
                All ({total})
              </Button>
            </Link>
            <Link href="/grievance/dashboard?status=draft" style={{ textDecoration: "none" }}>
              <Button
                variant={filters.status === "draft" ? "contained" : "outlined"}
                color="warning"
                sx={{ textTransform: "capitalize" }}
                size="small"
              >
                Drafts
              </Button>
            </Link>
            <Link href="/grievance/dashboard?status=submitted" style={{ textDecoration: "none" }}>
              <Button
                variant={filters.status === "submitted" ? "contained" : "outlined"}
                color="success"
                sx={{ textTransform: "capitalize" }}
                size="small"
              >
                Submitted
              </Button>
            </Link>

            <Box sx={{ flex: 1 }} />

            {selectedIds.length > 0 && (
              <Button
                onClick={handleBulkDelete}
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                size="small"
                disabled={isPending || isLoading}
              >
                Delete ({selectedIds.length})
              </Button>
            )}

            <Link href="/grievance/report/details" style={{ textDecoration: "none" }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  textTransform: "capitalize",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                }}
                size="small"
              >
                New Grievance
              </Button>
            </Link>
          </Stack>

          {/* Bulk Select Header */}
          {data.length > 0 && (
            <Stack direction="row" alignItems="center" spacing={2}>
              <Checkbox
                checked={selectedIds.length === data.length && data.length > 0}
                indeterminate={selectedIds.length > 0 && selectedIds.length < data.length}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
              <Typography variant="body2" color="textSecondary">
                Select All
              </Typography>
            </Stack>
          )}

          {/* Grievance List */}
          <Stack spacing={2}>
            {isPending || isLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} variant="outlined">
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Skeleton variant="rectangular" width={24} height={24} />
                      <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="60%" height={28} />
                        <Skeleton variant="text" width="40%" height={20} />
                        <Skeleton variant="text" width="80%" height={20} />
                      </Box>
                      <Skeleton variant="rectangular" width={60} height={24} />
                    </Stack>
                  </CardContent>
                </Card>
              ))
            ) : data.length === 0 ? (
              <Typography variant="body2" color="textSecondary" sx={{ textAlign: "center", py: 4 }}>
                No grievances found.
              </Typography>
            ) : (
              data.map((item) => (
                <Card key={item.id} variant="outlined">
                  <CardContent>
                    <Stack direction="row" alignItems="flex-start" spacing={2}>
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                      />

                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" gutterBottom>
                              {item.title}
                            </Typography>
                            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                              <Chip
                                label={item.category}
                                size="small"
                                variant="outlined"
                              />
                              <Chip
                                label={item.urgency}
                                size="small"
                                color={getUrgencyColor(item.urgency)}
                              />
                            </Stack>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                              {item.incidentDate} • {item.location} • {item.department}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden"
                              }}
                            >
                              {item.description}
                            </Typography>
                          </Box>

                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={item.status}
                              color={item.status === "submitted" ? "success" : "warning"}
                              size="small"
                            />
                            {item.status === "draft" && (
                              <Link href={`/grievance/report/details?draftId=${item.id}`} style={{ textDecoration: "none" }}>
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  size="small"
                                  sx={{ textTransform: "none" }}
                                >
                                  Edit
                                </Button>
                              </Link>
                            )}
                            <IconButton
                              onClick={() => handleDelete(item.id)}
                              color="error"
                              size="small"
                              disabled={isPending || isLoading}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))
            )}
          </Stack>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Pagination
                count={totalPages}
                page={filters.page || 1}
                onChange={handlePageChange}
                color="primary"
                disabled={isPending || isLoading}
              />
            </Box>
          )}

          <Typography variant="body2" color="textSecondary" sx={{ textAlign: "center" }}>
            Total grievances: {total}
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}