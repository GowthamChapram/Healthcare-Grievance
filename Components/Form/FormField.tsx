import { TextField, MenuItem } from "@mui/material";
import React from "react";

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  options?: { label: string; value: string }[];
  value: string | number;
  error?: boolean;
  helperText?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
}

export function FormField({
  name,
  label,
  type = "text",
  multiline = false,
  rows = 1,
  options,
  value,
  error,
  helperText,
  onChange,
  required,
}: FormFieldProps) {
  return (
    <TextField
      name={name}
      label={`${label}${required ? " *" : ""}`}
      type={type}
      multiline={multiline}
      rows={multiline ? rows : undefined}
      fullWidth
      value={value}
      error={error}
      helperText={helperText}
      onChange={onChange}
      select={Boolean(options)}
      InputLabelProps={
        type === "date" ? { shrink: true } : undefined
      }
    >
      {options?.map((opt) => (
        <MenuItem key={opt.value} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
