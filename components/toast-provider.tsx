"use client"

import { Toaster } from "sonner"

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "rgba(15, 23, 42, 0.8)",
          color: "#fff",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(8px)",
          borderRadius: "0.75rem",
        },
        success: {
          style: {
            background: "rgba(16, 185, 129, 0.2)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "#10B981",
          },
          icon: "✓",
        },
        error: {
          style: {
            background: "rgba(239, 68, 68, 0.95)", // More opaque red background
            border: "1px solid rgba(255, 255, 255, 0.2)", // Subtle white border
            color: "#FFFFFF", // White text for better contrast
            backdropFilter: "blur(8px)",
          },
          icon: "✕",
          iconTheme: {
            primary: "#FFFFFF",
            secondary: "rgba(239, 68, 68, 0.95)",
          },
        },
      }}
      closeButton
      richColors
      theme="dark"
    />
  )
}
