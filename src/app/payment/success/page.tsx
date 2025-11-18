"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useCart } from "@/contexts/CartContext";
import { api } from "@/utils/api";
import Link from "next/link";

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const { clearCart } = useCart();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (!orderId) {
      setError("Order ID not found");
      setVerifying(false);
      return;
    }

    // Verify payment
    const verifyPayment = async () => {
      try {
        const response = await api.purchases.verifyPayment(orderId);
        
        if (response.success && response.data) {
          setVerified(true);
          clearCart();
          addToast("Payment successful! Your tests have been purchased.", "success");
        } else {
          setError(response.message || "Payment verification failed");
        }
      } catch (e: any) {
        setError(e.message || "Failed to verify payment");
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [orderId, isAuthenticated, router, clearCart, addToast]);

  if (verifying) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-gray-50 py-12 px-6">
        <div className="container max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment...</h1>
            <p className="text-gray-600">Please wait while we verify your payment.</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !verified) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-gray-50 py-12 px-6">
        <div className="container max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Verification Failed</h1>
            <p className="text-gray-600 mb-6">{error || "We couldn't verify your payment. Please contact support if you were charged."}</p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors"
              >
                Go to Dashboard
              </Link>
              <Link
                href="/checkout"
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                Try Again
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 py-12 px-6">
      <div className="container max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Your payment has been verified and your mock tests have been added to your account.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard?purchased=true"
              className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors"
            >
              View My Tests
            </Link>
            <Link
              href="/tests"
              className="px-8 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Browse More Tests
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[calc(100vh-80px)] bg-gray-50 py-12 px-6">
          <div className="container max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading...</h1>
              <p className="text-gray-600">Please wait...</p>
            </div>
          </div>
        </main>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}

