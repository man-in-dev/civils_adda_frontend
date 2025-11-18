"use client";
import { createContext, useContext, ReactNode } from "react";
import toast, { Toaster } from "react-hot-toast";

export type ToastType = "success" | "error" | "info" | "warning";

type ToastContextType = {
  addToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const addToast = (message: string, type: ToastType = "success") => {
    switch (type) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      case "info":
        toast(message, {
          icon: "ℹ️",
        });
        break;
      case "warning":
        toast(message, {
          icon: "⚠️",
          style: {
            background: "#f59e0b",
            color: "#fff",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#f59e0b",
          },
          duration: 4000,
        });
        break;
    }
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <Toaster
        position="top-right"
        containerStyle={{
          top: "80px", // Position below header (64px) with some spacing
        }}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#333",
            borderRadius: "8px",
            padding: "12px 16px",
            fontSize: "14px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            fontWeight: "500",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#fff",
            },
            style: {
              background: "#10b981",
              color: "#fff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#fff",
            },
            style: {
              background: "#ef4444",
              color: "#fff",
            },
            duration: 4000,
          },
        }}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
