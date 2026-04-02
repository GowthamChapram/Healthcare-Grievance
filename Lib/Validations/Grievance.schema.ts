import { z } from "zod";

export const detailsSchema = z.object({
  title: z.string().min(1, "Title is required").min(3, "Title must be at least 3 characters"),
  category: z.string().min(1, "Category is required"),
  incidentDate: z.string().min(1, "Incident date is required"),
  location: z.string().min(1, "Location is required").min(2, "Location must be at least 2 characters"),
  urgency: z.enum(["Low", "Medium", "High"], {
    message: "Please select an urgency level"
  }),
  department: z.string().min(1, "Department is required").min(2, "Department must be at least 2 characters"),
});

export const descriptionSchema = z.object({
  description: z.string().min(1, "Description is required").min(10, "Description must be at least 10 characters"),
  impact: z.string().min(1, "Impact description is required").min(5, "Please provide more details about the impact"),
  resolution: z.string().min(1, "Desired resolution is required").min(5, "Please provide more details about the desired resolution"),
});

export const fullSchema = detailsSchema.merge(descriptionSchema);