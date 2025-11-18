"use client";
import { useState, useMemo, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/utils/api";
import Link from "next/link";

type TestSummary = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  price: number;
  category: string;
  isPurchased?: boolean;
};

export default function TestsPage() {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');
  const [selectedDuration, setSelectedDuration] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [tests, setTests] = useState<TestSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: { category?: string; search?: string } = {};
      
      if (selectedCategory !== 'All') {
        // Map frontend category names to backend category format
        const categoryMap: Record<string, string> = {
          'Polity': 'polity',
          'History': 'history',
          'Economy': 'economy',
          'Geography': 'geography',
          'Science': 'science',
          'Current Affairs': 'current-affairs',
        };
        params.category = categoryMap[selectedCategory] || selectedCategory.toLowerCase();
      }
      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await api.tests.getAll(params);
      
      if (response.success && response.data) {
        const formattedTests = response.data.map((test: any) => ({
          id: test.id || test._id,
          title: test.title,
          description: test.description || '',
          durationMinutes: test.durationMinutes,
          totalQuestions: test.totalQuestions || test.questions?.length || 0,
          price: test.price,
          category: test.category ? test.category.charAt(0).toUpperCase() + test.category.slice(1).replace('-', ' ') : '',
          isPurchased: test.isPurchased || false,
        }));
        setTests(formattedTests);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load tests');
      addToast(err.message || 'Failed to load tests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, searchQuery]);

  const categories = ['All', 'Polity', 'History', 'Economy', 'Geography', 'Science', 'Current Affairs'];
  const priceFilters = ['All', 'Free', 'Paid'];
  const durationFilters = ['All', '15 min', '20 min', '25 min'];

  const filteredTests = useMemo(() => {
    return tests.filter(test => {
      if (selectedPrice === 'Free' && test.price !== 0) {
        return false;
      }
      if (selectedPrice === 'Paid' && test.price === 0) {
        return false;
      }
      if (selectedDuration !== 'All') {
        const duration = parseInt(selectedDuration);
        if (test.durationMinutes !== duration) {
          return false;
        }
      }
      return true;
    });
  }, [tests, selectedPrice, selectedDuration]);

  const handleAddToCart = (test: TestSummary) => {
    addToCart({
      id: test.id,
      title: test.title,
      description: test.description,
      price: test.price,
      durationMinutes: test.durationMinutes,
      totalQuestions: test.totalQuestions,
    });
    addToast(`${test.title} added to cart!`, "success");
  };

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 py-12 px-6">
      <div className="container max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
            Available Mock Tests
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            Choose from our curated collection of practice tests
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="flex gap-3 flex-wrap">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm font-medium text-gray-700 cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'All' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>

              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm font-medium text-gray-700 cursor-pointer"
              >
                {priceFilters.map((price) => (
                  <option key={price} value={price}>
                    {price === 'All' ? 'All Prices' : price}
                  </option>
                ))}
              </select>

              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm font-medium text-gray-700 cursor-pointer"
              >
                {durationFilters.map((duration) => (
                  <option key={duration} value={duration}>
                    {duration === 'All' ? 'All Durations' : duration}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredTests.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{tests.length}</span> tests
            </p>
          </div>
        </div>

        {loading && (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Loading tests...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-white rounded-2xl p-12 text-center border border-red-200">
            <div className="text-red-600 mb-4">Error: {error}</div>
            <button
              onClick={fetchTests}
              className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && filteredTests.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No tests found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedPrice('All');
                setSelectedDuration('All');
                setSearchQuery('');
              }}
              className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : !loading && !error ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full mb-2">
                      {test.category}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{test.title}</h3>
                  </div>
                  {test.price === 0 ? (
                    <span className="badge badge-success text-xs px-3 py-1">Free</span>
                  ) : (
                    <span className="badge text-xs px-3 py-1">₹{test.price}</span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-4 flex-1 leading-relaxed">
                  {test.description}
                </p>

                <div className="flex gap-4 mb-4 text-xs text-gray-500">
                  <span>📝 {test.totalQuestions} Questions</span>
                  <span>⏱️ {test.durationMinutes} min</span>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/tests/${test.id}`}
                    className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-center text-sm"
                  >
                    View Details
                  </Link>
                  {test.isPurchased ? (
                    <button
                      disabled
                      className="flex-1 px-4 py-2.5 bg-green-500 text-white font-semibold rounded-lg cursor-not-allowed text-sm"
                    >
                      ✓ Purchased
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(test)}
                      className="flex-1 px-4 py-2.5 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
