"use server";

import { fullSchema } from "../Lib/Validations/Grievance.schema";
import { Grievance, GrievanceFilters, GrievanceResponse } from "@/Types/Grievance.types";
import { promises as fs } from "fs";
import { join } from "path";

const DB_FILE = join(process.cwd(), "data", "grievances.json");

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(join(process.cwd(), "data"), { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

// Load grievances from file
async function loadDB(): Promise<Grievance[]> {
  await ensureDataDir();
  try {
    const content = await fs.readFile(DB_FILE, "utf-8");
    const data = JSON.parse(content);
    // Convert createdAt strings back to Date objects
    return data.map((g: any) => ({
      ...g,
      createdAt: new Date(g.createdAt),
      updatedAt: g.updatedAt ? new Date(g.updatedAt) : undefined,
    }));
  } catch (error) {
    // File doesn't exist yet, return empty array
    return [];
  }
}

// Save grievances to file
async function saveDB(data: Grievance[]) {
  await ensureDataDir();
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function saveDraft(data: any, files?: File[]) {
  // Ensure all required fields have default values for drafts
  const draftData = {
    title: data.title || "",
    category: data.category || "",
    incidentDate: data.incidentDate || "",
    location: data.location || "",
    urgency: data.urgency || "Low",
    department: data.department || "",
    description: data.description || "",
    impact: data.impact || "",
    resolution: data.resolution || "",
    ...data, // Spread the original data to preserve any additional fields
  };

  const DB = await loadDB();
  const grievance: Grievance = {
    ...draftData,
    id: Date.now(),
    status: "draft",
    createdAt: new Date(),
    evidenceFiles: files,
  };

  DB.push(grievance);
  await saveDB(DB);
  return grievance;
}

export async function submitGrievance(data: any, files?: File[]) {
  try {
    // Ensure all required fields have values before validation
    const validatedData = {
      title: data.title || "",
      category: data.category || "",
      incidentDate: data.incidentDate || "",
      location: data.location || "",
      urgency: data.urgency || "Low",
      department: data.department || "",
      description: data.description || "",
      impact: data.impact || "",
      resolution: data.resolution || "",
    };

    const parsed = fullSchema.parse(validatedData);

    const DB = await loadDB();

    const grievance: Grievance = {
      ...parsed,
      id: Date.now(),
      status: "submitted",
      createdAt: new Date(),
      evidenceFiles: files,
    };

    DB.push(grievance);
    await saveDB(DB);
    return grievance;
  } catch (error: any) {
    // Handle Zod validation errors with field-specific messages
    if (error.issues && Array.isArray(error.issues)) {
      const missingFields = error.issues.map((issue: any) => {
        const fieldPath = issue.path.join(".");
        return `${fieldPath}: ${issue.message}`;
      }).join(", ");
      throw new Error(`Validation failed: ${missingFields}`);
    }
    throw error;
  }
}

export async function fetchGrievances(filters: GrievanceFilters = {}): Promise<GrievanceResponse> {
  const DB = await loadDB();
  const {
    status,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    page = 1,
    pageSize = 5,
  } = filters;

  let filtered = [...DB];

  // Filter by status
  if (status) {
    filtered = filtered.filter((g) => g.status === status);
  }

  // Search functionality
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter((g) =>
      g.title.toLowerCase().includes(searchLower) ||
      g.description.toLowerCase().includes(searchLower) ||
      g.category.toLowerCase().includes(searchLower) ||
      g.location.toLowerCase().includes(searchLower)
    );
  }

  // Sorting
  filtered.sort((a, b) => {
    let aValue: any = a[sortBy];
    let bValue: any = b[sortBy];

    // Handle date sorting
    if (sortBy === "createdAt") {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    data: filtered.slice(startIndex, endIndex),
    total,
    page,
    totalPages,
  };
}

export async function deleteGrievance(id: number) {
  let DB = await loadDB();
  const index = DB.findIndex((g) => g.id === id);
  if (index !== -1) {
    DB.splice(index, 1);
    await saveDB(DB);
    return true;
  }
  return false;
}

export async function bulkDeleteGrievances(ids: number[]) {
  let DB = await loadDB();
  const initialLength = DB.length;
  DB = DB.filter((g) => !ids.includes(g.id));
  await saveDB(DB);
  return initialLength - DB.length;
}

export async function getGrievanceById(id: number) {
  const DB = await loadDB();
  return DB.find((g) => g.id === id);
}

export async function updateGrievance(id: number, data: any, files?: File[]) {
  let DB = await loadDB();
  const index = DB.findIndex((g) => g.id === id);
  if (index !== -1) {
    // Ensure all fields have values (use existing values as fallback)
    const updatedData = {
      ...DB[index],
      title: data.title || DB[index].title || "",
      category: data.category || DB[index].category || "",
      incidentDate: data.incidentDate || DB[index].incidentDate || "",
      location: data.location || DB[index].location || "",
      urgency: data.urgency || DB[index].urgency || "Low",
      department: data.department || DB[index].department || "",
      description: data.description || DB[index].description || "",
      impact: data.impact || DB[index].impact || "",
      resolution: data.resolution || DB[index].resolution || "",
      ...data,
      evidenceFiles: files || DB[index].evidenceFiles,
      updatedAt: new Date(),
    };

    DB[index] = updatedData;
    await saveDB(DB);
    return DB[index];
  }
  throw new Error("Grievance not found");
}