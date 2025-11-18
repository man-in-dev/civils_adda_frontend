"use client";
import { useState, useEffect } from "react";
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
  category?: string;
  isPurchased?: boolean;
};

export default function Home() {
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const { isAuthenticated } = useAuth();
  const [tests, setTests] = useState<TestSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const response = await api.tests.getAll();
      
      if (response.success && response.data) {
        const formattedTests = response.data.map((test: any) => ({
          id: test.id || test._id,
          title: test.title,
          description: test.description || '',
          durationMinutes: test.durationMinutes,
          totalQuestions: test.totalQuestions || test.questions?.length || 0,
          price: test.price,
          category: test.category ? test.category.charAt(0).toUpperCase() + test.category.slice(1).replace('-', ' ') : undefined,
          isPurchased: test.isPurchased || false,
        }));
        setTests(formattedTests);
      }
    } catch (err: any) {
      console.error('Failed to load tests:', err);
      addToast('Failed to load tests', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Featured test (first one)
  const featuredTest = tests[0];
  // Trending tests (first 6, excluding featured)
  const trendingTests = tests.slice(1, 7);

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
    <main className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-blue-500 to-blue-600 pt-16">
      <section className="relative overflow-hidden py-20 px-6">
        {/* Decorative background elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl z-0"></div>
        <div className="absolute -bottom-36 -left-36 w-[500px] h-[500px] rounded-full bg-white/[0.08] blur-[100px] z-0"></div>
        
        <div className="container max-w-6xl mx-auto relative z-10">
          <div className="text-center text-white">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-md rounded-full text-sm font-semibold mb-8 border border-white/20">
              <span>✨</span>
              <span>Trusted by 10,000+ Aspirants</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight tracking-tight drop-shadow-lg">
              Ace Your Competitive Exams
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl opacity-95 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              Practice with curated mock tests designed by experts. Track your progress and excel in your preparation.
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center flex-wrap mb-12">
              <a 
                href="/tests" 
                className="px-8 py-4 text-base font-semibold rounded-xl bg-white text-blue-500 border-none shadow-lg transition-all duration-300 no-underline inline-block hover:-translate-y-0.5 hover:shadow-xl"
              >
                Browse Tests
              </a>
              <a 
                href="/dashboard" 
                className="px-8 py-4 text-base font-semibold rounded-xl bg-transparent text-white border-2 border-white/30 backdrop-blur-md transition-all duration-300 no-underline inline-block hover:bg-white/10 hover:border-white/50"
              >
                View Dashboard
              </a>
            </div>

            {/* Feature Pills */}
            <div className="flex gap-3 justify-center flex-wrap mt-12">
              {[
                { icon: '📚', text: '50+ Mock Tests' },
                { icon: '⚡', text: 'Instant Results' },
                { icon: '📊', text: 'Detailed Analytics' },
                { icon: '🎯', text: 'Expert Curated' }
              ].map((feature, idx) => (
                <div 
                  key={idx}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/12 backdrop-blur-md rounded-full text-sm font-medium border border-white/15 transition-all duration-200 hover:bg-white/18 hover:scale-105"
                >
                  <span>{feature.icon}</span>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 bg-white rounded-t-3xl shadow-[0_-12px_24px_rgba(0,0,0,0.06)] space-y-12 sm:space-y-16 lg:space-y-20">
        <div className="container pt-12 sm:pt-16 lg:pt-20 pb-8 px-6 max-w-6xl">
          {loading ? (
            <div className="card p-12 rounded-2xl shadow-lg mb-12 border border-gray-200 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
              <p className="text-gray-600">Loading tests...</p>
            </div>
          ) : featuredTest ? (
            <div className="card p-12 rounded-2xl shadow-lg mb-12 border border-gray-200">
              <div className="flex justify-between items-center gap-7 flex-wrap">
                <div className="flex-1 min-w-[360px]">
                  <div className="badge mb-3.5 text-sm px-4 py-2">Featured</div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">{featuredTest.title}</h2>
                  <p className="text-gray-600 text-lg">{featuredTest.description}</p>
                </div>
                <div className="flex gap-4">
                  <Link href={`/tests/${featuredTest.id}`} className="btn btn-secondary px-7 py-3.5 text-base">View Details</Link>
                  {featuredTest.isPurchased ? (
                    <button 
                      disabled
                      className="btn btn-primary px-7 py-3.5 text-base bg-green-500 hover:bg-green-500 cursor-not-allowed"
                    >
                      ✓ Purchased
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleAddToCart(featuredTest)} 
                      className="btn btn-primary px-7 py-3.5 text-base"
                    >
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {/* Trending Tests */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">Trending Tests</h3>
              <Link href="/tests" className="text-sm text-blue-500 font-bold">View all →</Link>
            </div>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-4"></div>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                <p className="text-gray-600">Loading tests...</p>
              </div>
            ) : trendingTests.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingTests.map((t) => (
                <div key={t.id} className="card p-8 border border-gray-200 rounded-2xl hover:shadow-lg transition-all duration-200">
                  <div className="flex justify-between items-start mb-3.5">
                    <div className="flex-1">
                      {t.category && (
                        <span className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full mb-2">
                          {t.category}
                        </span>
                      )}
                      <h4 className="font-bold text-gray-900 text-xl mb-2">{t.title}</h4>
                    </div>
                    {t.price === 0 ? (
                      <span className="badge badge-success text-xs px-3.5 py-1.5">Free</span>
                    ) : (
                      <span className="badge text-xs px-3.5 py-1.5">₹{t.price}</span>
                    )}
                  </div>
                  <p className="text-gray-600 text-base mb-3.5 leading-relaxed">{t.description}</p>
                  <div className="flex gap-5 text-sm text-gray-500 mb-4">
                    <span>📝 {t.totalQuestions} Qs</span>
                    <span>⏱️ {t.durationMinutes} min</span>
                  </div>
                  <div className="flex gap-3">
                    <Link 
                      href={`/tests/${t.id}`}
                      className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-center text-sm"
                    >
                      View
                    </Link>
                    {t.isPurchased ? (
                      <button
                        disabled
                        className="flex-1 px-4 py-2.5 bg-green-500 text-white font-semibold rounded-lg cursor-not-allowed text-sm"
                      >
                        ✓ Purchased
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(t)}
                        className="flex-1 px-4 py-2.5 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-600">
                <p>No tests available at the moment. Check back later!</p>
              </div>
            )}
          </div>
        </div>

        {/* Categories strip */}
        <div className="bg-gray-50 border-t border-gray-200 py-12 sm:py-16 lg:py-20 px-6">
          <div className="container max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
                Explore by Category
              </h3>
              <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
                Choose from a wide range of subjects and topics to focus your preparation
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
              {[
                { icon: '🏛️', label: 'Polity', color: 'from-blue-400 to-blue-600' },
                { icon: '📜', label: 'History', color: 'from-amber-400 to-orange-600' },
                { icon: '📊', label: 'Economy', color: 'from-green-400 to-green-600' },
                { icon: '🌎', label: 'Geography', color: 'from-teal-400 to-cyan-600' },
                { icon: '🧪', label: 'Science', color: 'from-purple-400 to-purple-600' },
                { icon: '🧠', label: 'Reasoning', color: 'from-pink-400 to-rose-600' },
              ].map((c) => (
                <a 
                  key={c.label} 
                  href="/tests" 
                  className="group card p-6 md:p-8 flex flex-col gap-4 items-center border border-gray-200 rounded-2xl bg-white hover:border-blue-300 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${c.color} flex items-center justify-center text-3xl md:text-4xl shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    {c.icon}
                  </div>
                  <div className="font-bold text-gray-800 text-base md:text-lg text-center group-hover:text-blue-600 transition-colors duration-300">
                    {c.label}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* How it Works */}
        <div className="bg-gradient-to-b from-white via-blue-50/30 to-white py-16 sm:py-20 lg:py-24 px-6 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-5">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container max-w-7xl mx-auto relative z-10">
            {/* Header */}
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-6">
                <span>🚀</span>
                <span>Simple & Effective</span>
              </div>
              <h3 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-4">
                How it <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Works</span>
              </h3>
              <div className="h-1.5 w-24 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full mx-auto mb-6"></div>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Get started in four simple steps and begin your journey to success
              </p>
            </div>

            {/* Steps Grid */}
            <div className="relative">
              {/* Connecting line for desktop */}
              <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200" style={{ width: 'calc(100% - 8rem)', margin: '0 4rem' }}></div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                {[
                  { 
                    step: '1', 
                    icon: '📚', 
                    title: 'Choose a Test', 
                    text: 'Browse our curated collection and pick the perfect test for your preparation needs.',
                    gradient: 'from-blue-500 to-blue-600',
                    bgGradient: 'from-blue-50 to-blue-100/50',
                    iconBg: 'bg-blue-500'
                  },
                  { 
                    step: '2', 
                    icon: '✍️', 
                    title: 'Attempt & Submit', 
                    text: 'Answer questions in a clean, distraction-free interface designed for focus.',
                    gradient: 'from-indigo-500 to-indigo-600',
                    bgGradient: 'from-indigo-50 to-indigo-100/50',
                    iconBg: 'bg-indigo-500'
                  },
                  { 
                    step: '3', 
                    icon: '📊', 
                    title: 'Get Results', 
                    text: 'Receive instant scores with detailed solutions and comprehensive analysis.',
                    gradient: 'from-purple-500 to-purple-600',
                    bgGradient: 'from-purple-50 to-purple-100/50',
                    iconBg: 'bg-purple-500'
                  },
                  { 
                    step: '4', 
                    icon: '📈', 
                    title: 'Improve & Track', 
                    text: 'Reattempt tests and monitor your progress with detailed analytics over time.',
                    gradient: 'from-pink-500 to-rose-600',
                    bgGradient: 'from-pink-50 to-rose-100/50',
                    iconBg: 'bg-pink-500'
                  },
                ].map((it, idx) => (
                  <div 
                    key={it.step} 
                    className="group relative"
                  >
                    {/* Step Card */}
                    <div className={`relative h-full bg-gradient-to-br ${it.bgGradient} border-2 border-transparent group-hover:border-blue-300 rounded-3xl p-8 sm:p-10 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 backdrop-blur-sm`}>
                      {/* Glow effect on hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${it.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500 blur-xl`}></div>
                      
                      {/* Step Number Badge */}
                      <div className="relative mb-6">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${it.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <span className="text-2xl font-black text-white">{it.step}</span>
                        </div>
                        {/* Animated ring */}
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${it.gradient} opacity-20 group-hover:opacity-40 group-hover:scale-125 transition-all duration-500`}></div>
                      </div>

                      {/* Icon */}
                      <div className="mb-6">
                        <div className={`w-20 h-20 ${it.iconBg} rounded-2xl flex items-center justify-center text-4xl shadow-md group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                          {it.icon}
                        </div>
                      </div>

                      {/* Content */}
                      <h4 className="font-extrabold text-gray-900 mb-3 text-xl sm:text-2xl group-hover:text-gray-800 transition-colors">
                        {it.title}
                      </h4>
                      <p className="text-gray-600 text-base leading-relaxed group-hover:text-gray-700 transition-colors">
                        {it.text}
                      </p>

                      {/* Arrow indicator for desktop (except last) */}
                      {idx < 3 && (
                        <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-20">
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-gray-200">
                            <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA below steps */}
            <div className="text-center mt-12 sm:mt-16">
              <a 
                href="/tests" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-base sm:text-lg"
              >
                <span>Get Started Now</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-b from-gray-50 to-transparent py-6 px-6 pb-8">
          <div className="container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { value: '1000+', label: 'Questions Practiced' },
              { value: '50+', label: 'Mock Tests' },
              { value: '95%', label: 'Positive Feedback' },
              { value: '24/7', label: 'Support' },
            ].map((s) => (
              <div key={s.label} className="card text-center p-10 border border-gray-200 rounded-2xl">
                <div className="text-4xl font-extrabold text-blue-500">{s.value}</div>
                <div className="text-gray-600 text-base mt-3">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="py-2 px-6 pb-8">
          <div className="container grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { name: 'Ananya', text: 'The mock tests closely mirror the real exam. Loved the explanations!' },
              { name: 'Rohit', text: 'Clean UI and helpful analytics. Great for daily practice.' },
              { name: 'Sana', text: 'Affordable and high quality content. Highly recommend.' },
            ].map((t) => (
              <div key={t.name} className="card p-9 border border-gray-200 rounded-2xl">
                <div className="text-xl font-bold text-gray-900 mb-3 leading-relaxed">"{t.text}"</div>
                <div className="text-gray-600 text-base">— {t.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* App Download */}
        <div className="bg-gray-50 border-t border-gray-200 py-12 sm:py-16 lg:py-20 px-6">
          <div className="container max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 mb-3">
                Practice on the go
              </h3>
              <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto mb-4"></div>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Download our mobile app and continue your preparation anywhere, anytime
              </p>
            </div>
            <div className="flex gap-4 justify-center items-center flex-wrap">
              <a href="#" className="btn btn-primary px-8 py-4 text-base font-semibold">Get Android App</a>
            </div>
          </div>
        </div>

        {/* Partners/Logos */}
        <div className="bg-white py-12 md:py-16 px-6">
          <div className="container max-w-6xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mb-3">
              Trusted by learners from
            </h3>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mx-auto mb-8"></div>
            <p className="text-gray-600 text-base mb-10">Join thousands of aspirants preparing for competitive exams</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
              {['Partner A', 'Partner B', 'Partner C', 'Partner D', 'Partner E'].map((p, idx) => (
                <div 
                  key={idx} 
                  className="card p-6 md:p-8 border border-gray-200 font-bold text-gray-700 text-sm md:text-base rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white/50 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-center h-12 md:h-14 mb-2">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-extrabold text-lg md:text-xl">
                      {p.charAt(p.length - 1)}
                    </div>
                  </div>
                  <div className="text-gray-800">{p}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-gray-50 border-t border-gray-200 py-6 px-6 pb-10">
          <div className="container max-w-4xl">
            <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 mb-3">FAQs</h3>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-6"></div>
            <div className="card p-8 border border-gray-200 mb-4 rounded-2xl">
              <div className="font-bold mb-2.5 text-gray-900 text-lg">Are the tests timed?</div>
              <div className="text-gray-600 text-base leading-relaxed">Yes, each test has a set duration shown on the details page.</div>
            </div>
            <div className="card p-8 border border-gray-200 mb-4 rounded-2xl">
              <div className="font-bold mb-2.5 text-gray-900 text-lg">Do you provide solutions?</div>
              <div className="text-gray-600 text-base leading-relaxed">Solutions and explanations are provided after submission.</div>
            </div>
            <div className="card p-8 border border-gray-200 rounded-2xl">
              <div className="font-bold mb-2.5 text-gray-900 text-lg">How do I purchase tests?</div>
              <div className="text-gray-600 text-base leading-relaxed">Browse our test collection, add tests to your cart, and complete checkout. Purchased tests will be available in your dashboard.</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="py-0 px-6 pb-10">
          <div className="container">
            <div className="card flex items-center justify-between gap-6 p-10 flex-wrap border border-gray-200 rounded-2xl">
              <div className="text-gray-800 font-extrabold text-xl">Ready to start your preparation?</div>
            <div className="flex gap-4">
              <Link href="/tests" className="btn btn-secondary px-7 py-3.5 text-base">Browse Tests</Link>
              <Link href="/dashboard" className="btn btn-primary px-7 py-3.5 text-base">Go to Dashboard</Link>
            </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
