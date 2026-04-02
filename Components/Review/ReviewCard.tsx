import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  SvgIconProps,
} from "@mui/material";
import { STYLES, URGENCY_COLORS } from "@/Lib/Constants/styles";
import React from "react";

interface ReviewCardProps {
  icon?: React.ComponentType<SvgIconProps>;
  title: string;
  children?: React.ReactNode;
  variant?: "primary" | "default";
}

export function ReviewCard({
  icon: Icon,
  title,
  children,
  variant = "default",
}: ReviewCardProps) {
  const isPrimary = variant === "primary";

  return (
    <Card
      variant="outlined"
      sx={{
        ...STYLES.card,
        ...(isPrimary && {
          borderColor: "primary.light",
          bgcolor: "primary.50",
        }),
      }}
    >
      <CardContent>
        {Icon && (
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Icon sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
          </Box>
        )}
        {!Icon && (
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

interface ReviewFieldProps {
  label: string;
  value?: string | number;
  fallback?: string;
  variant?: "text" | "chip";
  chipColor?: keyof typeof URGENCY_COLORS;
}

export function ReviewField({
  label,
  value,
  fallback = "Not provided",
  variant = "text",
  chipColor,
}: ReviewFieldProps) {
  if (variant === "chip" && chipColor) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography>
          <strong>{label}:</strong>
        </Typography>
        {value ? (
          <Chip
            label={value}
            size="small"
            color={URGENCY_COLORS[chipColor] as any}
          />
        ) : (
          <Typography color="text.secondary">{fallback}</Typography>
        )}
      </Box>
    );
  }

  return (
    <Typography>
      <strong>{label}:</strong> {value || fallback}
    </Typography>
  );
}
