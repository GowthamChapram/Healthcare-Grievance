"use client";

import { useState, useTransition, useEffect, useRef } from "react";
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
  Skeleton,
  Alert,
  Container,
  InputLabel,
  IconButton,
} from "@mui/material";
import {
  Search as SearchIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowUpward,
  ArrowDownward,
  Visibility,
} from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Grievance, GrievanceFilters } from "@/Types/Grievance.types";
import {
  deleteGrievance,
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
  const [flash, setFlash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

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

  const totalPages = Math.max(1, Math.ceil(total / (filters.pageSize || 5)));

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
    <Box sx={{ minHeight: "100vh", py: 4, px: 2, backgroundColor: "background.default" }}>
      <Container maxWidth="lg">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3, backgroundColor: "background.paper" }}>
          <Stack spacing={4}>
            <Box>
              <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: 0.5, mb: 1 }}>
                Grievance Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage and track all submitted grievances
              </Typography>
            </Box>

            {flash && (
              <Alert severity={flash.includes("successfully") ? "success" : "error"} sx={{ borderRadius: 2 }}>
                {flash}
              </Alert>
            )}

            <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
              <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                <TextField
                  placeholder="Search grievances..."
                  value={filters.search || ""}
                  onChange={(e) =>
                    handleFilterChange({ search: e.target.value })
                  }
                  size="small"
                  sx={{ minWidth: 280, flex: 1 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Sort By</InputLabel>
                  <Select
                    value={filters.sortBy}
                    label="Sort By"
                    onChange={(e) =>
                      handleFilterChange({ sortBy: e.target.value as any })
                    }
                  >
                    <MenuItem value="createdAt">Date</MenuItem>
                    <MenuItem value="title">Title</MenuItem>
                  </Select>
                </FormControl>

                <IconButton
                  onClick={() =>
                    handleFilterChange({
                      sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
                    })
                  }
                  sx={{ border: 1, borderColor: "divider" }}
                >
                  {filters.sortOrder === "asc" ? <ArrowUpward /> : <ArrowDownward />}
                </IconButton>
              </Stack>
            </Paper>

            {isLoading ? (
              <Stack spacing={2}>
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                ))}
              </Stack>
            ) : data.length === 0 ? (
              <Paper elevation={1} sx={{ p: 6, textAlign: "center", borderRadius: 2 }}>
                <Typography variant="h6" color="text.secondary">
                  No grievances found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Try adjusting your search or filters
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={3}>
                {data.map((item) => (
                  <Card key={item.id} sx={{ borderRadius: 2, boxShadow: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                            {item.title}
                          </Typography>
                          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                            <Chip
                              label={item.urgency}
                              color={getUrgencyColor(item.urgency)}
                              size="small"
                            />
                            <Typography variant="body2" color="text.secondary">
                              {item.category} • {item.location}
                            </Typography>
                          </Stack>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {item.description.length > 150
                              ? `${item.description.substring(0, 150)}...`
                              : item.description}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Submitted {new Date(item.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<Visibility />}
                            component={Link}
                            href={`/grievance/report/review?id=${item.id}`}
                          >
                            View
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDelete(item.id)}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}

            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", pt: 2 }}>
                <Pagination
                  count={totalPages}
                  page={filters.page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}