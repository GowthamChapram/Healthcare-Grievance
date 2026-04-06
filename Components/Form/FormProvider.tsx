"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { GrievanceData, FileMetadata } from "@/Types/Grievance.types";

interface FormContextType {
  data: Partial<GrievanceData>;
  files: File[];
  fileMetadata: FileMetadata[];
  setData: React.Dispatch<React.SetStateAction<Partial<GrievanceData>>>;
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  clearForm: () => void;
}

const FormContext = createContext<FormContextType | null>(null);

interface FormProviderProps {
  children: ReactNode;
}

export function FormProvider({ children }: FormProviderProps) {
  const [isClient, setIsClient] = useState(false);
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
  const [fileMetadata, setFileMetadata] = useState<FileMetadata[]>([]);

  // Initialize on client
  useEffect(() => {
    setIsClient(true);
    // Load persisted data from localStorage
    try {
      const savedData = localStorage.getItem("grievance-form-data");
      if (savedData) {
        setData(JSON.parse(savedData));
      }
      const savedMetadata = localStorage.getItem("grievance-form-files");
      if (savedMetadata) {
        setFileMetadata(JSON.parse(savedMetadata));
      }
    } catch (error) {
      console.error("Failed to load form data from localStorage:", error);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!isClient) return;
    try {
      localStorage.setItem("grievance-form-data", JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save form data:", error);
    }
  }, [data, isClient]);

  // Save file metadata to localStorage whenever it changes
  useEffect(() => {
    if (!isClient) return;
    try {
      localStorage.setItem("grievance-form-files", JSON.stringify(fileMetadata));
    } catch (error) {
      console.error("Failed to save file metadata:", error);
    }
  }, [fileMetadata, isClient]);

  // Update file metadata when files change
  useEffect(() => {
    const metadata: FileMetadata[] = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setFileMetadata(metadata);
  }, [files]);

  const clearForm = () => {
    setData({
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
    setFiles([]);
    setFileMetadata([]);
    localStorage.removeItem("grievance-form-data");
    localStorage.removeItem("grievance-form-files");
  };

  return (
    <FormContext.Provider value={{ data, files, fileMetadata, setData, setFiles, clearForm }}>
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