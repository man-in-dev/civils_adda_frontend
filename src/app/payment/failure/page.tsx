"use client";
import Link from "next/link";

export default function PaymentFailurePage() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 py-12 px-6">
      <div className="container max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h1>
          <p className="text-gray-600 mb-6">
            Your payment could not be processed. Please try again or contact support if the problem persists.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/checkout"
              className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors"
            >
              Try Again
            </Link>
            <Link
              href="/cart"
              className="px-8 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

