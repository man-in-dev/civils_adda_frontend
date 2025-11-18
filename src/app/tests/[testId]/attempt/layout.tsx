"use client";
import { useEffect } from "react";

export default function AttemptLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Prevent body scroll during exam
    document.body.style.overflow = "hidden";
    document.body.style.height = "100%";
    document.documentElement.style.height = "100%";
    
    return () => {
      // Restore scroll when leaving
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.documentElement.style.height = "";
    };
  }, []);

  return <>{children}</>;
}

