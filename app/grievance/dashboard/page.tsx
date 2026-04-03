
import { fetchGrievances } from "@/Actions/Grievance.actions";
import { GrievanceFilters } from "@/Types/Grievance.types";
import DashboardClient from "@/Components/Dashboard/DashboardClient";

interface DashboardPageProps {
  searchParams: {
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
  };
}

export default async function Dashboard({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const filters: GrievanceFilters = {
    status: params.status,
    search: params.search,
    sortBy: (params.sortBy as any) || "createdAt",
    sortOrder: (params.sortOrder as any) || "desc",
    page: Number(params.page) || 1,
    pageSize: 5,
  };

  const { data, total } = await fetchGrievances(filters);

  return (
    <DashboardClient
      initialData={data}
      initialTotal={total}
      initialFilters={filters}
    />
  );
}




