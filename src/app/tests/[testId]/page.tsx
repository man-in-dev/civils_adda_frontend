"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { api } from "@/utils/api";

type Question = { id: string; text: string; options: string[] };

type Highlight = { icon?: string; title: string; description: string };

type TestDetail = {
  test: { 
    id: string; 
    title: string; 
    description: string; 
    category?: string;
    durationMinutes: number; 
    totalQuestions: number; 
    price: number; 
    isPurchased?: boolean;
    highlights: Highlight[];
    instructions: string[];
  };
  questions: Question[];
};

export default function TestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const testId = String(params.testId);
  const [data, setData] = useState<TestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId, isAuthenticated]);

  const fetchTest = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.tests.getById(testId);
      
      if (response.success && response.data) {
        const testData = response.data;
        setData({
          test: {
            id: testData.test.id,
            title: testData.test.title,
            description: testData.test.description || '',
            category: testData.test.category,
            durationMinutes: testData.test.durationMinutes,
            totalQuestions: testData.test.totalQuestions,
            price: testData.test.price,
            isPurchased: testData.test.isPurchased,
            highlights: testData.test.highlights || [],
            instructions: testData.test.instructions || [],
          },
          questions: testData.questions.map((q: any, index: number) => ({
            id: q.id || index.toString(),
            text: q.text,
            options: q.options,
          })),
        });
      } else {
        setError("Test not found");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load test");
      addToast(err.message || "Failed to load test", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!data) return;
    addToCart({
      id: data.test.id,
      title: data.test.title,
      description: data.test.description || "",
      price: data.test.price || 0,
      durationMinutes: data.test.durationMinutes,
      totalQuestions: data.test.totalQuestions,
    });
    addToast(`${data.test.title} added to cart!`, "success");
    router.push("/cart");
  };

  const startAttempt = async () => {
    if (!isAuthenticated || !user?.id || !data) {
      addToast("Please login to start a test", "error");
      router.push(`/login?redirect=/tests/${testId}`);
      return;
    }

    // Check if test is purchased
    if (data.test.price > 0 && !data.test.isPurchased) {
      addToast("Please purchase this test before attempting", "error");
      return;
    }

    try {
      // Create attempt via API
      const response = await api.attempts.create(testId);
      
      if (response.success && response.data) {
        router.push(`/tests/${testId}/attempt?attemptId=${encodeURIComponent(response.data.attemptId)}`);
      }
    } catch (err: any) {
      addToast(err.message || "Failed to start test", "error");
    }
  };

  const formatCategory = (category?: string) => {
    if (!category) return '';
    return category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
  };

  const getCategoryIcon = (category?: string) => {
    const icons: Record<string, string> = {
      'polity': '🏛️',
      'history': '📜',
      'geography': '🌎',
      'economy': '📊',
      'science': '🧪',
      'current-affairs': '📰',
    };
    return icons[category || ''] || '📚';
  };

  const highlightColorPalette = ['bg-blue-50', 'bg-green-50', 'bg-purple-50', 'bg-orange-50', 'bg-pink-50'];
  const instructionColorPalette = [
    { container: 'bg-blue-50', badge: 'text-blue-500' },
    { container: 'bg-green-50', badge: 'text-green-500' },
    { container: 'bg-purple-50', badge: 'text-purple-500' },
    { container: 'bg-orange-50', badge: 'text-orange-500' },
    { container: 'bg-red-50', badge: 'text-red-500' },
  ];

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-gray-50 py-12 px-6">
        <div className="container max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Loading test details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-gray-50 py-12 px-6">
        <div className="container max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">⚠️</span>
              <h2 className="text-xl font-bold text-red-900">Error Loading Test</h2>
            </div>
            <p className="text-red-700 mb-6">{error || "Test not found"}</p>
            <Link 
              href="/tests" 
              className="inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
            >
              Browse All Tests
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 py-8 px-6">
      <div className="container max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/tests" className="hover:text-blue-600 transition-colors">Tests</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{data.test.title}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                  {data.test.category && (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-sm font-semibold rounded-full mb-4">
                      <span>{getCategoryIcon(data.test.category)}</span>
                      <span>{formatCategory(data.test.category)}</span>
                    </div>
                  )}
                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                    {data.test.title}
                  </h1>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {data.test.description}
                  </p>
                </div>
                {data.test.price === 0 && (
                  <span className="px-4 py-2 bg-green-100 text-green-700 text-sm font-bold rounded-lg whitespace-nowrap">
                    FREE
                  </span>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-xl">
                <div className="text-center">
                  <div className="text-3xl mb-2">📝</div>
                  <div className="text-2xl font-bold text-gray-900">{data.test.totalQuestions}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Questions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">⏱️</div>
                  <div className="text-2xl font-bold text-gray-900">{data.test.durationMinutes}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">💰</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {data.test.price === 0 ? 'Free' : `₹${data.test.price}`}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Price</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="text-2xl font-bold text-gray-900">{data.test.price === 0 ? 'Yes' : 'Paid'}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Access</div>
                </div>
              </div>
            </div>

            {/* What You'll Get */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-blue-500">✨</span>
                What You'll Get
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.test.highlights.map((highlight, index) => (
                  <div
                    key={`${highlight.title}-${index}`}
                    className={`flex items-start gap-4 p-4 rounded-xl border border-transparent ${highlightColorPalette[index % highlightColorPalette.length]}`}
                  >
                    <div className="text-2xl">{highlight.icon || "✨"}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{highlight.title}</h3>
                      <p className="text-sm text-gray-600">{highlight.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-blue-500">📋</span>
                Instructions
              </h2>
              <div className="space-y-3">
                {data.test.instructions.map((instruction, index) => {
                  const palette = instructionColorPalette[index % instructionColorPalette.length];
                  return (
                    <div key={`${index}-${instruction.slice(0, 10)}`} className={`flex items-start gap-3 p-4 rounded-lg ${palette.container}`}>
                      <span className={`${palette.badge} font-bold mt-0.5`}>{index + 1}.</span>
                      <p className="text-gray-700">{instruction}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Purchase/Action Card */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200">
                <div className="text-center mb-6">
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {data.test.price === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      <>₹{data.test.price}</>
                    )}
                  </div>
                  {data.test.price > 0 && (
                    <p className="text-sm text-gray-500">One-time purchase</p>
                  )}
                </div>

                <div className="space-y-3 mb-6">
                  {data.test.price > 0 && data.test.isPurchased ? (
                    <button
                      disabled
                      className="w-full px-6 py-4 bg-green-500 text-white font-bold rounded-xl cursor-not-allowed shadow-lg"
                    >
                      ✓ Purchased
                    </button>
                  ) : data.test.price > 0 && !data.test.isPurchased ? (
                    <button
                      onClick={handleAddToCart}
                      className="w-full px-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Add to Cart
                    </button>
                  ) : null}
                  <button
                    onClick={startAttempt}
                    disabled={data.test.price > 0 && !data.test.isPurchased}
                    className={`w-full px-6 py-4 font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                      data.test.price > 0 && !data.test.isPurchased
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
                    }`}
                  >
                    {data.test.price > 0 && !data.test.isPurchased
                      ? 'Purchase to Start'
                      : isAuthenticated
                      ? 'Start Test Now'
                      : 'Login to Start'}
                  </button>
                  {data.test.price === 0 && (
                    <button
                      onClick={handleAddToCart}
                      className="w-full px-6 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Add to Cart Anyway
                    </button>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3 text-gray-600">
                      <span className="text-green-500">✓</span>
                      <span>Instant access after purchase</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <span className="text-green-500">✓</span>
                      <span>Unlimited attempts</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <span className="text-green-500">✓</span>
                      <span>Detailed solutions included</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                      <span className="text-green-500">✓</span>
                      <span>Performance analytics</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-4">Test Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="opacity-90">Category</span>
                    <span className="font-bold">{formatCategory(data.test.category)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-90">Questions</span>
                    <span className="font-bold">{data.test.totalQuestions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-90">Duration</span>
                    <span className="font-bold">{data.test.durationMinutes} min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-90">Type</span>
                    <span className="font-bold">{data.test.price === 0 ? 'Free' : 'Premium'}</span>
                  </div>
                </div>
              </div>

              {/* Help Card */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Need Help?</h3>
                    <p className="text-sm text-gray-600 mb-3">Having trouble accessing the test or have questions?</p>
                    <Link 
                      href="/dashboard" 
                      className="text-sm text-blue-600 font-semibold hover:underline"
                    >
                      Visit Dashboard →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
