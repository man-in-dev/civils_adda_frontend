"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/utils/api";

type TestSummary = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  price: number;
};

type AttemptSummary = {
  attemptId: string;
  testId: string;
  testTitle: string;
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
  totalQuestions: number;
};

type LeaderboardEntry = {
  rank: number;
  userId: string;
  userName: string;
  userEmail: string;
  totalAttempts: number;
  averagePercentage: number;
  bestPercentage: number;
  bestScore: number;
};

type LeaderboardData = {
  topPerformers: LeaderboardEntry[];
  userStats: {
    rank: number | null;
    userName: string;
    totalAttempts: number;
    averagePercentage: number;
    bestPercentage: number;
    bestScore: number;
  };
  totalUsers: number;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [tests, setTests] = useState<TestSummary[]>([]);
  const [purchased, setPurchased] = useState<TestSummary[]>([]);
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchUserData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchUserData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      setError(null);

      // Fetch purchased tests from backend
      const purchasedResponse = await api.purchases.getPurchasedTests();
      if (purchasedResponse.success && purchasedResponse.data) {
        const formattedPurchased = purchasedResponse.data.map((test: any) => ({
          id: test.id,
          title: test.title,
          description: test.description || '',
          durationMinutes: test.durationMinutes,
          price: test.price,
          totalQuestions: test.totalQuestions,
        }));
        setPurchased(formattedPurchased);
      }

      // Fetch attempts from backend
      const attemptsResponse = await api.attempts.getUserAttempts();
      if (attemptsResponse.success && attemptsResponse.data) {
        const formattedAttempts = attemptsResponse.data.map((attempt: any) => ({
          attemptId: attempt.attemptId,
          testId: attempt.testId,
          testTitle: attempt.testTitle,
          startedAt: attempt.startedAt,
          submittedAt: attempt.submittedAt,
          score: attempt.score,
          totalQuestions: attempt.totalQuestions,
        }));
        setAttempts(formattedAttempts);
      }

      // Fetch all available tests
      const testsResponse = await api.tests.getAll();
      if (testsResponse.success && testsResponse.data) {
        const formattedTests = testsResponse.data.map((test: any) => ({
          id: test.id,
          title: test.title,
          description: test.description || '',
          durationMinutes: test.durationMinutes,
          price: test.price,
          totalQuestions: test.totalQuestions,
        }));
        setTests(formattedTests);
      }

      // Fetch leaderboard
      const leaderboardResponse = await api.attempts.getLeaderboard(10);
      if (leaderboardResponse.success && leaderboardResponse.data) {
        setLeaderboard(leaderboardResponse.data);
      }
    } catch (e: any) {
      setError(e.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    purchasedTests: purchased.length,
    completedAttempts: attempts.filter(a => a.submittedAt !== null && a.score !== null).length,
    totalAttempts: attempts.length,
    averageScore: attempts.length > 0
      ? attempts
          .filter(a => a.score !== null)
          .reduce((sum, a) => sum + (a.score || 0), 0) / attempts.filter(a => a.score !== null).length
      : 0,
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Overview</h1>
        <p className="text-gray-600">
          Welcome back{user?.name ? `, ${user.name}` : ""}! Here's a summary of your progress
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Purchased Tests</h3>
                  <span className="text-2xl">📚</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.purchasedTests}</p>
                <p className="text-xs text-gray-500 mt-1">Tests available</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Completed Tests</h3>
                  <span className="text-2xl">✅</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.completedAttempts}</p>
                <p className="text-xs text-gray-500 mt-1">Tests finished</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Total Attempts</h3>
                  <span className="text-2xl">📊</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalAttempts}</p>
                <p className="text-xs text-gray-500 mt-1">All attempts</p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">Average Score</h3>
                  <span className="text-2xl">🎯</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.averageScore > 0 ? `${stats.averageScore.toFixed(1)}%` : "N/A"}
                </p>
                <p className="text-xs text-gray-500 mt-1">Overall performance</p>
              </div>
            </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Purchases */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Purchases</h2>
            <Link
              href="/dashboard/tests"
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
            >
              View All →
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : purchased.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📦</div>
              <p className="text-sm text-gray-600 mb-3">No tests purchased yet</p>
              <Link href="/tests" className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
                Browse Tests →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {purchased.slice(0, 3).map((test) => (
                <Link
                  key={test.id}
                  href={`/tests/${test.id}`}
                  className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium text-gray-900 text-sm">{test.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {test.totalQuestions} questions • {test.durationMinutes} min
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Attempts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Attempts</h2>
            <Link
              href="/dashboard/attempts"
              className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
            >
              View All →
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : attempts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-sm text-gray-600 mb-3">No attempts yet</p>
              <Link href="/tests" className="text-blue-600 hover:text-blue-700 text-sm font-semibold">
                Start Test →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {attempts.slice(0, 3).map((attempt) => {
                const isCompleted = attempt.submittedAt !== null && attempt.score !== null;
                return (
                  <Link
                    key={attempt.attemptId}
                    href={`/tests/${attempt.testId}/attempt?attemptId=${attempt.attemptId}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">{attempt.testTitle}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(attempt.startedAt)}
                        </div>
                      </div>
                      {isCompleted && (
                        <div className="text-right">
                          <div className="font-bold text-blue-600 text-sm">
                            {attempt.score}/{attempt.totalQuestions}
                          </div>
                        </div>
                      )}
                    </div>
                    {!isCompleted && (
                      <span className="badge badge-warning text-xs mt-2">In Progress</span>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">🏆 Leaderboard</h2>
            <p className="text-sm text-gray-600">Compare your performance with other users</p>
          </div>
          {leaderboard && (
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Participants</div>
              <div className="text-2xl font-bold text-blue-600">{leaderboard.totalUsers}</div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading leaderboard...</div>
        ) : leaderboard ? (
          <div className="space-y-4">
            {/* User's Position Card */}
            {leaderboard.userStats.rank !== null ? (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                      #{leaderboard.userStats.rank}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 text-lg">Your Rank</div>
                      <div className="text-sm text-gray-600">{leaderboard.userStats.userName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Best Score</div>
                    <div className="text-2xl font-bold text-blue-600">{leaderboard.userStats.bestPercentage}%</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Avg: {leaderboard.userStats.averagePercentage}% • {leaderboard.userStats.totalAttempts} attempts
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <div className="font-semibold text-gray-900">Complete at least one test to appear on the leaderboard</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Your stats: {leaderboard.userStats.totalAttempts} attempts, Best: {leaderboard.userStats.bestPercentage}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top Performers */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
              <div className="space-y-2">
                {leaderboard.topPerformers.map((entry, index) => {
                  const isCurrentUser = entry.userId === user?.id;
                  const getMedal = () => {
                    if (entry.rank === 1) return '🥇';
                    if (entry.rank === 2) return '🥈';
                    if (entry.rank === 3) return '🥉';
                    return `#${entry.rank}`;
                  };

                  return (
                    <div
                      key={entry.userId}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                        isCurrentUser
                          ? 'bg-blue-50 border-blue-300 shadow-md'
                          : entry.rank <= 3
                          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                          entry.rank === 1 ? 'bg-yellow-400 text-yellow-900' :
                          entry.rank === 2 ? 'bg-gray-300 text-gray-800' :
                          entry.rank === 3 ? 'bg-orange-300 text-orange-900' :
                          'bg-gray-200 text-gray-700'
                        }`}>
                          {getMedal()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">
                              {entry.userName}
                              {isCurrentUser && <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">You</span>}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {entry.totalAttempts} attempts • Avg: {entry.averagePercentage}%
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Best Score</div>
                        <div className={`text-xl font-bold ${
                          entry.rank === 1 ? 'text-yellow-600' :
                          entry.rank === 2 ? 'text-gray-600' :
                          entry.rank === 3 ? 'text-orange-600' :
                          'text-blue-600'
                        }`}>
                          {entry.bestPercentage}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-sm text-gray-600 mb-3">No leaderboard data available yet</p>
            <p className="text-xs text-gray-500">Complete some tests to see rankings</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/tests"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl">🔍</span>
            <div>
              <div className="font-semibold text-gray-900">Browse Tests</div>
              <div className="text-xs text-gray-500">Explore all available tests</div>
            </div>
          </Link>
          <Link
            href="/dashboard/performance"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl">📈</span>
            <div>
              <div className="font-semibold text-gray-900">View Performance</div>
              <div className="text-xs text-gray-500">Check analytics</div>
            </div>
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl">⚙️</span>
            <div>
              <div className="font-semibold text-gray-900">Settings</div>
              <div className="text-xs text-gray-500">Manage account</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
