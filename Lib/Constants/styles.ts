// Reusable styling constants
export const STYLES = {
  gradients: {
    primary: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    button: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  spacing: {
    container: {
      xs: 2.5,
      sm: 4,
    },
    gap: 4,
  },
  paper: {
    maxWidth: 720,
    mx: "auto",
    elevation: 3,
    borderRadius: 2,
  },
  card: {
    borderRadius: 2,
  },
} as const;

export const URGENCY_COLORS = {
  High: "error",
  Medium: "warning",
  Low: "success",
} as const;

export const STATUS_COLORS = {
  submitted: "success",
  draft: "warning",
} as const;
