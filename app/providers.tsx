"use client";

import { ReactNode } from "react";
import { CacheProvider } from "@emotion/react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import createEmotionCache from "@/Lib/createEmotionCache";
import theme from "@/Lib/theme";

const clientSideEmotionCache = createEmotionCache();

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <CacheProvider value={clientSideEmotionCache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </CacheProvider>
  );
}
