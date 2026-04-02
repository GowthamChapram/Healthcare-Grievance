
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
  const filters: GrievanceFilters = {
    status: searchParams.status,
    search: searchParams.search,
    sortBy: (searchParams.sortBy as any) || "createdAt",
    sortOrder: (searchParams.sortOrder as any) || "desc",
    page: Number(searchParams.page) || 1,
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




