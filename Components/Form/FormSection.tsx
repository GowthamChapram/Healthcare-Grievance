import { Box, Paper, Stack, Typography } from "@mui/material";
import { STYLES } from "@/Lib/Constants/styles";
import React from "react";

interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function FormSection({ title, subtitle, children }: FormSectionProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: STYLES.gradients.primary,
        py: 4,
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: STYLES.paper.maxWidth,
          mx: STYLES.paper.mx,
          p: STYLES.spacing.container,
          borderRadius: STYLES.paper.borderRadius,
          transition: "all 0.3s ease",
        }}
      >
        <Stack spacing={STYLES.spacing.gap}>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                color: "#1a1a1a",
                mb: 0.5,
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {children}
        </Stack>
      </Paper>
    </Box>
  );
}
