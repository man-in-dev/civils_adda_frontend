"use client";
import { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/utils/api";

function LoginForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, register, isAuthenticated, loading: authLoading } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for OAuth errors
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      if (error === "oauth_failed") {
        addToast("Google authentication failed. Please try again.", "error");
      } else if (error === "oauth_not_configured") {
        addToast("Google Sign-In is not configured. Please use email/password login.", "error");
      } else if (error === "invalid_google_data") {
        addToast("Unable to retrieve user information from Google.", "error");
      }
      // Remove error from URL
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("error");
      router.replace(`/login?${newSearchParams.toString()}`, { scroll: false });
    }
  }, [searchParams, router, addToast]);

  // Redirect if already authenticated (wait for auth to load first)
  useEffect(() => {
    if (authLoading) return; // Wait for auth state to be determined
    
    if (isAuthenticated) {
      const redirect = searchParams.get("redirect") || "/dashboard";
      router.replace(redirect);
    }
  }, [isAuthenticated, authLoading, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        addToast("Login successful! Redirecting...", "success");
      } else {
        await register(email, password, name);
        addToast("Registration successful! Redirecting...", "success");
      }
      setTimeout(() => {
        const redirect = searchParams.get("redirect") || "/dashboard";
        router.push(redirect);
      }, 500);
    } catch (error: any) {
      addToast(error.message || "Authentication failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    const demoEmail = "demo@civilsadda.com";
    const demoPassword = "demo123";
    const demoName = "Demo User";

    try {
      // Try to login first
      try {
        await login(demoEmail, demoPassword);
        addToast("Demo login successful! Redirecting...", "success");
      } catch (loginError) {
        // If login fails, try to register the demo user
        await register(demoEmail, demoPassword, demoName);
        addToast("Demo account created! Redirecting...", "success");
      }
      setTimeout(() => {
        const redirect = searchParams.get("redirect") || "/dashboard";
        router.push(redirect);
      }, 500);
    } catch (error: any) {
      addToast(error.message || "Demo login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const response = await api.auth.getGoogleAuthUrl();
      if (response.success && response.data?.authUrl) {
        // Redirect to Google OAuth
        window.location.href = response.data.authUrl;
      } else {
        addToast("Failed to initiate Google Sign-In", "error");
        setLoading(false);
      }
    } catch (error: any) {
      addToast(error.message || "Failed to initiate Google Sign-In", "error");
      setLoading(false);
    }
  };

  // Show loading while checking authentication state
  if (authLoading) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  // Don't render login form if authenticated (will redirect)
  if (isAuthenticated) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isLogin ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-gray-600">
              {isLogin
                ? "Sign in to access your dashboard"
                : "Start your journey with Civils Adda"}
            </p>
          </div>

          {/* Toggle Login/Register */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${
                isLogin
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${
                !isLogin
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input w-full"
                  placeholder="Enter your name"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input w-full"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="input w-full"
                placeholder="••••••••"
              />
              {!isLogin && (
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>

          {/* Google Sign-In Button */}
          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>{loading ? "Loading..." : "Continue with Google"}</span>
            </button>
          </div>

          {/* Demo Login Button */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">or</span>
              </div>
            </div>
            
            {/* Demo Credentials Display */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-800 mb-2 text-center">
                🔐 Demo Credentials
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between bg-white/60 rounded px-3 py-2">
                  <span className="text-gray-600 font-medium">Email:</span>
                  <code className="text-blue-700 font-mono text-xs">demo@civilsadda.com</code>
                </div>
                <div className="flex items-center justify-between bg-white/60 rounded px-3 py-2">
                  <span className="text-gray-600 font-medium">Password:</span>
                  <code className="text-blue-700 font-mono text-xs">demo123</code>
                </div>
              </div>
              <p className="mt-3 text-xs text-center text-blue-700">
                💡 You can also use these credentials to login manually
              </p>
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="mt-4 w-full px-4 py-3 border-2 border-dashed border-blue-300 bg-blue-50 text-blue-700 font-semibold rounded-lg hover:bg-blue-100 hover:border-blue-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "🚀 Try Demo Login"}
            </button>
            <p className="mt-2 text-xs text-center text-gray-500">
              Click above to automatically login with demo account
            </p>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-blue-600"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-semibold mb-1">✨ Why create an account?</p>
          <ul className="list-disc list-inside space-y-1 text-blue-700">
            <li>Access your purchased mock tests</li>
            <li>Track your performance and scores</li>
            <li>Save your test attempts</li>
            <li>Get personalized recommendations</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-[calc(100vh-80px)] bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

