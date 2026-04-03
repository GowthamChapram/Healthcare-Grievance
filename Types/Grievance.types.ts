import { z } from "zod";

export type GrievanceDetails = z.infer<typeof detailsSchema>;
export type GrievanceDescription = z.infer<typeof descriptionSchema>;
export type GrievanceData = z.infer<typeof fullSchema>;

import { detailsSchema, descriptionSchema, fullSchema } from "@/Lib/Validations/Grievance.schema";

// Dashboard-specific types
export interface Grievance {
  id: number;
  title: string;
  category: string;
  incidentDate: string;
  location: string;
  urgency: "Low" | "Medium" | "High";
  department: string;
  description: string;
  impact: string;
  resolution: string;
  status: "draft" | "submitted" | "resolved";
  createdAt: Date;
  updatedAt?: Date;
  evidenceFiles?: File[];
}

export interface GrievanceFilters {
  status?: string;
  search?: string;
  sortBy?: "createdAt" | "title" | "urgency" | "status";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}

export interface GrievanceResponse {
  data: Grievance[];
  total: number;
  page: number;
  totalPages: number;
}