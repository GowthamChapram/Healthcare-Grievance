"use client";

import { useState, useCallback } from "react";

interface ExecuteAsyncOptions {
  successMessage: string;
  errorMessage: string;
  onSuccess?: () => void;
  autoHideDuration?: number;
}

interface UseAsyncActionReturn {
  loading: boolean;
  flash: string | null;
  executeAsync: (
    asyncFn: () => Promise<any>,
    options: ExecuteAsyncOptions
  ) => Promise<void>;
}

export function useAsyncAction(): UseAsyncActionReturn {
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const executeAsync = useCallback(
    async (asyncFn: () => Promise<any>, options: ExecuteAsyncOptions) => {
      setLoading(true);
      setFlash(null);

      try {
        await asyncFn();
        setFlash(options.successMessage);

        if (options.onSuccess) {
          options.onSuccess();
        }

        const duration = options.autoHideDuration || 2000;
        setTimeout(() => setFlash(null), duration);
      } catch (error: any) {
        // Display specific error message if available, otherwise use generic errorMessage
        const errorMsg = error?.message || options.errorMessage;
        setFlash(errorMsg);
        console.error("Async action error:", error);

        const duration = options.autoHideDuration || 2000;
        setTimeout(() => setFlash(null), duration);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, flash, executeAsync };
}
