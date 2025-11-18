"use client";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import Link from "next/link";

export default function CartPage() {
  const { items, removeFromCart, getTotal, clearCart } = useCart();
  const { addToast } = useToast();
  const total = getTotal();

  const handleRemove = (itemId: string, itemTitle: string) => {
    removeFromCart(itemId);
    addToast(`${itemTitle} removed from cart`, "info");
  };

  const handleClearCart = () => {
    clearCart();
    addToast("Cart cleared", "info");
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 py-12 px-6">
      <div className="container max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some tests to get started with your preparation</p>
            <Link 
              href="/tests" 
              className="inline-block px-8 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors"
            >
              Browse Tests
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {items.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white rounded-xl p-6 border border-gray-200 flex justify-between items-start gap-4"
                >
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>📝 {item.totalQuestions} Questions</span>
                      <span>⏱️ {item.durationMinutes} min</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-3">
                    <div className="text-2xl font-bold text-gray-900">
                      {item.price === 0 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `₹${item.price}`
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(item.id, item.title)}
                      className="text-red-500 hover:text-red-600 font-medium text-sm transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-700">Total:</span>
                <span className="text-3xl font-bold text-gray-900">
                  ₹{total}
                </span>
              </div>
              <div className="flex gap-4">
                <Link
                  href="/tests"
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-center"
                >
                  Continue Shopping
                </Link>
                <Link
                  href="/checkout"
                  className="flex-1 px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors text-center"
                >
                  Proceed to Checkout
                </Link>
              </div>
            </div>

            <button
              onClick={handleClearCart}
              className="text-gray-500 hover:text-red-600 text-sm font-medium transition-colors"
            >
              Clear Cart
            </button>
          </>
        )}
      </div>
    </main>
  );
}

