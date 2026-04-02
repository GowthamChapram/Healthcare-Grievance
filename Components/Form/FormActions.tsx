import { Box, Button, Divider, Stack } from "@mui/material";
import { ChevronLeft } from "@mui/icons-material";
import { STYLES } from "@/Lib/Constants/styles";
import React from "react";

interface FormActionsProps {
  onBack?: () => void;
  onSaveDraft?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  loading?: boolean;
  hideDivider?: boolean;
}

export function FormActions({
  onBack,
  onSaveDraft,
  onNext,
  onSubmit,
  loading = false,
  hideDivider = false,
}: FormActionsProps) {
  return (
    <>
      {!hideDivider && <Divider sx={{ my: 2 }} />}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ pt: 1 }}
      >
        {onBack && (
          <Button
            onClick={onBack}
            variant="outlined"
            startIcon={<ChevronLeft />}
            disabled={loading}
            sx={{
              textTransform: "capitalize",
              borderColor: "#e0e0e0",
              color: "#666",
              "&:hover": { borderColor: "#667eea", color: "#667eea" },
            }}
          >
            Back
          </Button>
        )}
        <Box sx={{ flex: 1 }} />
        {onSaveDraft && (
          <Button
            onClick={onSaveDraft}
            disabled={loading}
            variant="contained"
            color="warning"
            sx={{ textTransform: "capitalize" }}
          >
            {loading ? "Saving..." : "Save Draft"}
          </Button>
        )}
        {onNext && (
          <Button
            onClick={onNext}
            disabled={loading}
            variant="contained"
            sx={{
              textTransform: "capitalize",
              background: STYLES.gradients.button,
            }}
          >
            {loading ? "Processing..." : "Next"}
          </Button>
        )}
        {onSubmit && (
          <Button
            onClick={onSubmit}
            disabled={loading}
            variant="contained"
            sx={{
              textTransform: "capitalize",
              background: STYLES.gradients.button,
            }}
          >
            {loading ? "Submitting..." : "Submit Grievance"}
          </Button>
        )}
      </Stack>
    </>
  );
}
