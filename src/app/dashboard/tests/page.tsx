"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { api } from "@/utils/api";

type TestSummary = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  price: number;
};

export default function MyTestsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [purchased, setPurchased] = useState<TestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchPurchasedTests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchPurchasedTests = async () => {
    try {
      setLoading(true);
      const response = await api.purchases.getPurchasedTests();
      
      if (response.success && response.data) {
        const formattedTests = response.data.map((test: any) => ({
          id: test.id,
          title: test.title,
          description: test.description || '',
          durationMinutes: test.durationMinutes,
          price: test.price,
          totalQuestions: test.totalQuestions,
        }));
        setPurchased(formattedTests);
      }
    } catch (error) {
      console.error("Failed to fetch purchased tests", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Purchased Tests</h1>
        <p className="text-gray-600">Manage and access all your purchased mock tests</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : purchased.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <div className="text-5xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No tests purchased yet</h3>
          <p className="text-gray-600 mb-6">Start exploring our collection of mock tests</p>
          <Link href="/tests" className="btn btn-primary inline-block">
            Browse Tests
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchased.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 flex-1 pr-2">
                  {test.title}
                </h3>
                <span className="badge badge-success text-xs whitespace-nowrap">Owned</span>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {test.description}
              </p>
              <div className="flex gap-4 text-xs text-gray-500 mb-4">
                <span>📝 {test.totalQuestions} Questions</span>
                <span>⏱️ {test.durationMinutes} min</span>
              </div>
              <button
                onClick={async () => {
                  if (!isAuthenticated || !user?.id) {
                    addToast("Please login to start a test", "error");
                    router.push(`/login?redirect=/dashboard/tests`);
                    return;
                  }
                  try {
                    setStartingId(test.id);
                    const response = await api.attempts.create(test.id);
                    if (response.success && response.data) {
                      router.push(`/tests/${test.id}/attempt?attemptId=${encodeURIComponent(response.data.attemptId)}`);
                    }
                  } catch (err: any) {
                    addToast(err.message || "Failed to start test", "error");
                  } finally {
                    setStartingId(null);
                  }
                }}
                disabled={startingId === test.id}
                className={`btn btn-primary w-full text-center block ${startingId === test.id ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {startingId === test.id ? 'Starting...' : 'Start Test'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

