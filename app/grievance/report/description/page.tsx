"use client";

import { Alert, Box } from "@mui/material";
import { useForm } from "@/Components/Form/FormProvider";
import { descriptionSchema } from "@/Lib/Validations/Grievance.schema";
import { useRouter } from "next/navigation";
import { saveDraft } from "@/Actions/Grievance.actions";
import { GrievanceData } from "@/Types/Grievance.types";
import { useFormValidation } from "@/Hooks/useFormValidation";
import { useAsyncAction } from "@/Hooks/useAsyncAction";
import { FormSection } from "@/Components/Form/FormSection";
import { FormField } from "@/Components/Form/FormField";
import { FormActions } from "@/Components/Form/FormActions";
import { FileUploadSection } from "@/Components/Form/FileUploadSection";

type FieldName = keyof GrievanceData;

interface DescriptionFieldConfig {
  name: FieldName;
  label: string;
  rows: number;
  required?: boolean;
}

const DESCRIPTION_FIELDS: DescriptionFieldConfig[] = [
  { name: "description", label: "Incident Description", rows: 4, required: true },
  { name: "impact", label: "Impact & Consequences", rows: 3, required: true },
  { name: "resolution", label: "Desired Resolution", rows: 3, required: true },
];

export default function DescriptionPage() {
  const { data, files, setData, setFiles } = useForm();
  const router = useRouter();
  const { errors, clearError, validate } = useFormValidation();
  const { loading, flash, executeAsync } = useAsyncAction();

  const handleFieldChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setData((prev: any) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) clearError(field);
  };

  const handleNext = () => {
    const processedData = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v || ""])
    );
    if (validate(processedData, descriptionSchema)) {
      router.push("/grievance/report/review");
    }
  };

  const handleBack = () => {
    router.push("/grievance/report/details");
  };

  const handleSaveDraft = async () => {
    const processedData = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, v || ""])
    );
    if (!validate(processedData, descriptionSchema)) return;

    await executeAsync(
      () => saveDraft(data, files),
      {
        successMessage: "Draft saved successfully.",
        errorMessage: "Failed to save draft. Please try again.",
      }
    );
  };

  return (
    <FormSection
      title="Incident Description"
      subtitle="Provide comprehensive details about the incident and its impact"
    >
      {flash && (
        <Alert
          severity={flash.includes("successfully") ? "success" : "error"}
          onClose={() => window.location.reload()}
          sx={{ borderRadius: 1 }}
        >
          {flash}
        </Alert>
      )}

      <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {DESCRIPTION_FIELDS.map((field) => (
          <FormField
            key={field.name}
            name={field.name}
            label={field.label}
            multiline
            rows={field.rows}
            value={(data[field.name] as string) || ""}
            error={Boolean(errors[field.name])}
            helperText={errors[field.name]}
            onChange={handleFieldChange(field.name)}
            required={field.required}
          />
        ))}

        <FileUploadSection
          title="Supporting Documents"
          files={files}
          onFilesChange={setFiles}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mov"
        />
      </Box>

      <FormActions
        onBack={handleBack}
        onSaveDraft={handleSaveDraft}
        onNext={handleNext}
        loading={loading}
      />
    </FormSection>
  );
}