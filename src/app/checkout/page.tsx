"use client";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { api } from "@/utils/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Declare Cashfree global type
declare global {
  interface Window {
    Cashfree?: (config: { mode: string }) => {
      checkout: (options: { paymentSessionId: string; redirectTarget?: string }) => Promise<any>;
    };
  }
}

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const total = getTotal();

  // Initialize Cashfree checkout
  const initializeCashfreeCheckout = (paymentSessionId: string) => {
    try {
      // Determine environment - use sandbox by default, or from env variable
      // You can set NEXT_PUBLIC_CASHFREE_MODE=sandbox or production in your .env.local
      const mode = (process.env.NEXT_PUBLIC_CASHFREE_MODE || 'sandbox') as 'sandbox' | 'production';
      
      if (!window.Cashfree) {
        throw new Error('Cashfree SDK not loaded');
      }
      
      // Initialize Cashfree with correct mode
      const cashfree = window.Cashfree({ mode });
      
      // Open checkout
      cashfree.checkout({
        paymentSessionId: paymentSessionId,
        redirectTarget: '_self', // Redirect in the same window
      }).then((result: any) => {
        if (result.error) {
          console.error('Cashfree checkout error:', result.error);
          addToast(result.error.message || 'Payment checkout failed', 'error');
          setLoading(false);
        }
        if (result.redirect) {
          // Redirection will happen automatically
          console.log('Redirecting to Cashfree checkout...');
        }
      }).catch((error: any) => {
        console.error('Cashfree checkout error:', error);
        addToast(error.message || 'Failed to open payment page', 'error');
        setLoading(false);
      });
    } catch (error: any) {
      console.error('Cashfree initialization error:', error);
      addToast(error.message || 'Failed to initialize payment', 'error');
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!isAuthenticated || !user?.id) {
      addToast("Please login to continue", "error");
      router.push("/login?redirect=/checkout");
      return;
    }

    setLoading(true);

    try {
      const testIds = items.map(item => item.id);
      
      // Create payment order
      const response = await api.purchases.createPaymentOrder(testIds);
      
      if (response.success && response.data) {
        // If total is 0 (free tests), handle directly
        if (total === 0) {
          clearCart();
          addToast(`Successfully purchased ${items.length} test${items.length > 1 ? 's' : ''}!`, "success");
          setTimeout(() => {
            router.push("/dashboard?purchased=true");
          }, 500);
          return;
        }

        // For paid tests, redirect to Cashfree payment page
        const { paymentSessionId } = response.data;
        
        // Check if Cashfree SDK is already loaded
        if (window.Cashfree) {
          initializeCashfreeCheckout(paymentSessionId);
        } else {
          // Load Cashfree checkout script
          const script = document.createElement('script');
          script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
          script.onload = () => {
            if (window.Cashfree) {
              initializeCashfreeCheckout(paymentSessionId);
            } else {
              throw new Error('Failed to load Cashfree SDK');
            }
          };
          script.onerror = () => {
            throw new Error('Failed to load Cashfree SDK');
          };
          document.body.appendChild(script);
        }
      } else {
        throw new Error(response.message || "Failed to create payment order");
      }
    } catch (e: any) {
      addToast(e.message || "Failed to complete checkout", "error");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-gray-50 py-12 px-6">
        <div className="container max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <Link 
              href="/cart" 
              className="inline-block px-8 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors"
            >
              Go to Cart
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 py-12 px-6">
      <div className="container max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start pb-4 border-b border-gray-100 last:border-0">
                    <div>
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {item.totalQuestions} questions • {item.durationMinutes} min
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">
                        {item.price === 0 ? (
                          <span className="text-green-600">Free</span>
                        ) : (
                          `₹${item.price}`
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax:</span>
                  <span>₹0</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-gray-900">₹{total}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : `Complete Purchase (₹${total})`}
              </button>

              <Link
                href="/cart"
                className="block mt-4 text-center text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors"
              >
                ← Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

