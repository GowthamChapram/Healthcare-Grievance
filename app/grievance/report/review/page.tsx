"use client";

import { Alert, Box, Stack, CircularProgress, Typography } from "@mui/material";
import { Description, Gavel, Folder, CheckCircle, InsertDriveFile } from "@mui/icons-material";
import { useForm } from "@/Components/Form/FormProvider";
import { useRouter } from "next/navigation";
import { submitGrievance, saveDraft } from "@/Actions/Grievance.actions";
import { useAsyncAction } from "@/Hooks/useAsyncAction";
import { FormSection } from "@/Components/Form/FormSection";
import { ReviewCard, ReviewField } from "@/Components/Review/ReviewCard";
import { FormActions } from "@/Components/Form/FormActions";
import { useState } from "react";

export default function Review() {
  const { data, files } = useForm();
  const router = useRouter();
  const { loading, flash, executeAsync } = useAsyncAction();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleBack = () => router.push("/grievance/report/description");

  const handleSaveDraft = async () => {
    await executeAsync(
      () => saveDraft(data, files),
      {
        successMessage: "Draft saved successfully.",
        errorMessage: "Failed to save draft. Please try again.",
      }
    );
  };

  const handleSubmit = async () => {
    const completeData = {
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

    const missingFields = Object.entries(completeData)
      .filter(([_, value]) => !value || value.trim() === "")
      .map(([key]) => key);

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(", ")}`);
      return;
    }

    await executeAsync(
      () => submitGrievance(completeData, files),
      {
        successMessage: "Grievance submitted successfully!",
        errorMessage: "Failed to submit grievance. Please try again.",
        onSuccess: () => {
          setIsRedirecting(true);
          router.push("/grievance/dashboard");
        },
      }
    );
  };

  const showLoader = loading || isRedirecting;

  return (
    <>
      {showLoader && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            zIndex: 9999,
          }}
        >
          <Box textAlign="center">
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>
              {isRedirecting ? "Redirecting..." : "Processing..."}
            </Typography>
          </Box>
        </Box>
      )}

      <FormSection
        title="Review & Submit"
        subtitle="Please review your grievance details before submitting"
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

        <Stack spacing={3}>
          <ReviewCard icon={Description} title="Basic Details">
            <Stack spacing={1}>
              <ReviewField label="Title" value={data.title} />
              <ReviewField label="Category" value={data.category} />
              <ReviewField label="Date" value={data.incidentDate} />
              <ReviewField label="Location" value={data.location} />
              <ReviewField label="Urgency" value={data.urgency} />
              <ReviewField label="Department" value={data.department} />
            </Stack>
          </ReviewCard>

          <ReviewCard icon={Gavel} title="Incident Description">
            <Typography sx={{ whiteSpace: "pre-wrap", color: "text.secondary" }}>
              {data.description || "Not provided"}
            </Typography>
          </ReviewCard>

          <ReviewCard icon={CheckCircle} title="Impact & Consequences">
            <Typography sx={{ whiteSpace: "pre-wrap", color: "text.secondary" }}>
              {data.impact || "Not provided"}
            </Typography>
          </ReviewCard>

          <ReviewCard icon={Folder} title="Supporting Documents">
            {files.length > 0 ? (
              <Stack spacing={0.5}>
                {files.map((file, index) => (
                  <Box key={index} sx={{ display: "flex", gap: 1 }}>
                    <InsertDriveFile />
                    <Typography variant="body2">{file.name}</Typography>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography>No supporting documents uploaded</Typography>
            )}
          </ReviewCard>

          <ReviewCard icon={CheckCircle} title="Desired Resolution">
            <Typography sx={{ whiteSpace: "pre-wrap", color: "text.secondary" }}>
              {data.resolution || "Not provided"}
            </Typography>
          </ReviewCard>
        </Stack>

        <FormActions
          onBack={handleBack}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </FormSection>
    </>
  );
}