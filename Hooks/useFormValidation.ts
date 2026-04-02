"use client";

import { useState, useCallback } from "react";
import { ZodSchema } from "zod";

interface UseFormValidationReturn {
  errors: Record<string, string>;
  setErrors: (errors: Record<string, string>) => void;
  clearError: (fieldName: string) => void;
  validate: (data: any, schema: ZodSchema) => boolean;
}

export function useFormValidation(): UseFormValidationReturn {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const clearError = useCallback((fieldName: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const validate = useCallback(
    (data: any, schema: ZodSchema) => {
      const result = schema.safeParse(data);

      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            fieldErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(fieldErrors);
        return false;
      }

      setErrors({});
      return true;
    },
    []
  );

  return { errors, setErrors, clearError, validate };
}
