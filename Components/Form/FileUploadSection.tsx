"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  IconButton,
} from "@mui/material";
import { CloudUpload, Delete, InsertDriveFile } from "@mui/icons-material";
import React from "react";

interface FileUploadSectionProps {
  title: string;
  files: File[];
  onFilesChange: (files: File[]) => void;
  accept?: string;
}

export function FileUploadSection({
  title,
  files,
  onFilesChange,
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.mp4,.mov",
}: FileUploadSectionProps) {
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    onFilesChange([...files, ...selectedFiles]);
    event.target.value = "";
  };

  const handleFileRemove = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const inputId = `file-upload-${title.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, p: 1 }}>
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
          {title}
        </Typography>

        <Box
          sx={{
            border: "2px dashed",
            borderColor: "grey.300",
            borderRadius: 1,
            p: 1.5,
            textAlign: "center",
            backgroundColor: "grey.50",
            "&:hover": {
              borderColor: "primary.main",
              backgroundColor: "primary.50",
            },
            mb: files.length > 0 ? 1.5 : 0,
          }}
        >
          <input
            type="file"
            multiple
            accept={accept}
            onChange={handleFileSelect}
            style={{ display: "none" }}
            id={inputId}
          />
          <label htmlFor={inputId} style={{ cursor: "pointer" }}>
            <Box sx={{ py: 0.5 }}>
              <CloudUpload sx={{ fontSize: 32, color: "grey.400", mb: 0.5 }} />
              <Typography variant="body2" sx={{ mb: 0.5, fontSize: "0.875rem" }}>
                Click to upload or drag and drop
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {accept.replace(/\./g, "").toUpperCase()}
              </Typography>
            </Box>
          </label>
        </Box>

        {files.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontSize: "0.875rem" }}>
              Files ({files.length})
            </Typography>
            <Stack spacing={0.5}>
              {files.map((file, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 1,
                    py: 0.5,
                    border: "1px solid",
                    borderColor: "grey.200",
                    borderRadius: 1,
                    backgroundColor: "grey.50",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flex: 1, minWidth: 0 }}>
                    <InsertDriveFile sx={{ color: "grey.600", fontSize: 16 }} />
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 500, fontSize: "0.8rem" }} noWrap>
                        {file.name}
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ fontSize: "0.7rem" }}>
                        {formatFileSize(file.size)}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => handleFileRemove(index)}
                    sx={{ color: "error.main", p: 0.25 }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
