"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/utils/api";
import Link from "next/link";

type AttemptSummary = {
  attemptId: string;
  testId: string;
  testTitle: string;
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
  totalQuestions: number;
};

export default function PerformancePage() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchPerformance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      // Fetch performance data from backend
      const response = await api.performance.getPerformance();
      
      if (response.success && response.data) {
        // Backend returns formatted performance data
        // For now, we'll also fetch attempts for compatibility
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
      }
    } catch (error) {
      console.error("Failed to fetch performance", error);
    } finally {
      setLoading(false);
    }
  };

  const completedAttempts = attempts.filter(a => a.submittedAt !== null && a.score !== null);
  const totalScore = completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
  const totalPossible = completedAttempts.reduce((sum, a) => sum + a.totalQuestions, 0);
  const averageScore = completedAttempts.length > 0 ? (totalScore / totalPossible) * 100 : 0;
  const bestScore = completedAttempts.length > 0 
    ? Math.max(...completedAttempts.map(a => ((a.score || 0) / a.totalQuestions) * 100))
    : 0;

  // Calculate scores by test
  const testPerformance: Record<string, { testTitle: string; attempts: number; avgScore: number; bestScore: number }> = {};
  completedAttempts.forEach(attempt => {
    if (!testPerformance[attempt.testId]) {
      testPerformance[attempt.testId] = {
        testTitle: attempt.testTitle,
        attempts: 0,
        avgScore: 0,
        bestScore: 0,
      };
    }
    const perf = testPerformance[attempt.testId];
    perf.attempts++;
    const scorePercent = ((attempt.score || 0) / attempt.totalQuestions) * 100;
    perf.avgScore = ((perf.avgScore * (perf.attempts - 1)) + scorePercent) / perf.attempts;
    perf.bestScore = Math.max(perf.bestScore, scorePercent);
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Analytics</h1>
        <p className="text-gray-600">Track your progress and identify areas for improvement</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : completedAttempts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <div className="text-5xl mb-4">📈</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No performance data yet</h3>
          <p className="text-gray-600 mb-6">Complete some tests to see your performance analytics</p>
          <Link href="/tests" className="btn btn-primary inline-block">
            Start Taking Tests
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Overall Average</div>
              <div className="text-4xl font-bold text-blue-600">{averageScore.toFixed(1)}%</div>
              <div className="text-xs text-gray-500 mt-1">{completedAttempts.length} completed tests</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Best Score</div>
              <div className="text-4xl font-bold text-green-600">{bestScore.toFixed(1)}%</div>
              <div className="text-xs text-gray-500 mt-1">Your highest achievement</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Total Questions Answered</div>
              <div className="text-4xl font-bold text-gray-900">{totalPossible}</div>
              <div className="text-xs text-gray-500 mt-1">Across all tests</div>
            </div>
          </div>

          {/* Performance by Test */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Performance by Test</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Test</th>
                    <th className="text-center py-3 px-6 text-sm font-semibold text-gray-700">Attempts</th>
                    <th className="text-center py-3 px-6 text-sm font-semibold text-gray-700">Average Score</th>
                    <th className="text-center py-3 px-6 text-sm font-semibold text-gray-700">Best Score</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(testPerformance).map(([testId, perf]) => (
                    <tr key={testId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6 font-medium text-gray-900">{perf.testTitle}</td>
                      <td className="py-4 px-6 text-center text-gray-600">{perf.attempts}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`font-bold ${
                          perf.avgScore >= 80 ? "text-green-600" :
                          perf.avgScore >= 60 ? "text-blue-600" :
                          perf.avgScore >= 40 ? "text-yellow-600" :
                          "text-red-600"
                        }`}>
                          {perf.avgScore.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="font-bold text-green-600">{perf.bestScore.toFixed(1)}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

