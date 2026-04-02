"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { GrievanceData } from "@/Types/Grievance.types";

interface FormContextType {
  data: Partial<GrievanceData>;
  files: File[];
  setData: React.Dispatch<React.SetStateAction<Partial<GrievanceData>>>;
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

const FormContext = createContext<FormContextType | null>(null);

interface FormProviderProps {
  children: ReactNode;
}

export function FormProvider({ children }: FormProviderProps) {
  const [data, setData] = useState<Partial<GrievanceData>>({
    title: "",
    category: "",
    incidentDate: "",
    location: "",
    urgency: "Low",
    department: "",
    description: "",
    impact: "",
    resolution: "",
  });
  const [files, setFiles] = useState<File[]>([]);

  return (
    <FormContext.Provider value={{ data, files, setData, setFiles }}>
      {children}
    </FormContext.Provider>
  );
}

export const useForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useForm must be used within a FormProvider");
  }
  return context;
};