"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import { setToken } from "@/utils/api";

export default function GoogleAuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");
    const redirect = searchParams.get("redirect") || "/dashboard";

    if (error) {
      addToast("Google authentication failed", "error");
      router.push("/login");
      return;
    }

    if (token) {
      // Store token
      setToken(token);
      addToast("Successfully signed in with Google!", "success");
      
      // Reload page to trigger AuthContext to refresh
      // Or redirect after a short delay
      setTimeout(() => {
        window.location.href = redirect;
      }, 500);
    } else {
      addToast("No token received", "error");
      router.push("/login");
    }
  }, [searchParams, router, addToast]);

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </main>
  );
}

