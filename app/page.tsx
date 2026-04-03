"use client";

import { Suspense, useEffect, useState } from "react";
import { Alert, Box } from "@mui/material";
import { useForm } from "@/Components/Form/FormProvider";
import { detailsSchema } from "@/Lib/Validations/Grievance.schema";
import { useRouter, useSearchParams } from "next/navigation";
import {
  saveDraft,
  getGrievanceById,
  updateGrievance,
} from "@/Actions/Grievance.actions";
import { GrievanceData } from "@/Types/Grievance.types";
import { useFormValidation } from "@/Hooks/useFormValidation";
import { useAsyncAction } from "@/Hooks/useAsyncAction";
import { FormSection } from "@/Components/Form/FormSection";
import { FormField } from "@/Components/Form/FormField";
import { FormActions } from "@/Components/Form/FormActions";

type FieldName = keyof GrievanceData;

interface FormFieldConfig {
  name: FieldName;
  label: string;
  type?: string;
  options?: { label: string; value: string }[];
  required?: boolean;
}

const FORM_FIELDS: FormFieldConfig[] = [
  { name: "title", label: "Grievance Title", required: true },
  { name: "category", label: "Category", required: true },
  { name: "incidentDate", label: "Incident Date", type: "date", required: true },
  { name: "location", label: "Location", required: true },
  {
    name: "urgency",
    label: "Urgency Level",
    options: [
      { label: "Low", value: "Low" },
      { label: "Medium", value: "Medium" },
      { label: "High", value: "High" },
    ],
    required: true,
  },
  { name: "department", label: "Department", required: true },
];

function DetailsInner() {
  const { data, setData } = useForm();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { errors, clearError, validate } = useFormValidation();
  const { loading, flash, executeAsync } = useAsyncAction();

  const [draftId, setDraftId] = useState<number | null>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(true);

  useEffect(() => {
    const loadDraft = async () => {
      const id = searchParams.get("draftId");

      if (id) {
        try {
          const draftData = await getGrievanceById(Number(id));

          if (draftData) {
            setDraftId(Number(id));

            setData({
              title: draftData.title || "",
              category: draftData.category || "",
              incidentDate: draftData.incidentDate || "",
              location: draftData.location || "",
              urgency: draftData.urgency || "Low",
              department: draftData.department || "",
              description: draftData.description || "",
              impact: draftData.impact || "",
              resolution: draftData.resolution || "",
            });
          }
        } catch (error) {
          console.error("Failed to load draft", error);
        }
      }

      setIsLoadingDraft(false);
    };

    loadDraft();
  }, [searchParams, setData]);

  const handleFieldChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setData((prev: any) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) clearError(field);
    };

  const handleNext = () => {
    const processedData = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v || ""])
    );

    if (validate(processedData, detailsSchema)) {
      router.push("/grievance/report/description");
    }
  };

  const handleSaveDraft = async () => {
    const processedData = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v || ""])
    );

    if (!validate(processedData, detailsSchema)) return;

    if (draftId) {
      await executeAsync(() => updateGrievance(draftId, data), {
        successMessage: "Draft updated successfully.",
        errorMessage: "Failed to update draft. Please try again.",
      });
    } else {
      await executeAsync(() => saveDraft(data), {
        successMessage: "Draft saved successfully.",
        errorMessage: "Failed to save draft. Please try again.",
      });
    }
  };

  return (
    <FormSection
      title={draftId ? "Edit Draft Grievance" : "Report Grievance"}
      subtitle={
        draftId
          ? "Update your grievance draft"
          : "Provide detailed information about your grievance"
      }
    >
      {isLoadingDraft && (
        <Alert severity="info">Loading draft...</Alert>
      )}

      {flash && (
        <Alert
          severity={flash.includes("successfully") ? "success" : "error"}
          onClose={() => window.location.reload()}
        >
          {flash}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gap: 2.5,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
          opacity: isLoadingDraft ? 0.6 : 1,
          pointerEvents: isLoadingDraft ? "none" : "auto",
        }}
      >
        {FORM_FIELDS.map((field) => (
          <FormField
            key={field.name}
            name={field.name}
            label={field.label}
            type={field.type}
            options={field.options}
            value={(data[field.name] as string) || ""}
            error={Boolean(errors[field.name])}
            helperText={errors[field.name]}
            onChange={handleFieldChange(field.name)}
            required={field.required}
          />
        ))}
      </Box>

      <FormActions
        onSaveDraft={handleSaveDraft}
        onNext={handleNext}
        loading={loading || isLoadingDraft}
      />
    </FormSection>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DetailsInner />
    </Suspense>
  );
}
