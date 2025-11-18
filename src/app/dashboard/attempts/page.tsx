"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/utils/api";

type AttemptSummary = {
  attemptId: string;
  testId: string;
  testTitle: string;
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
  totalQuestions: number;
};

export default function MyAttemptsPage() {
  const { user } = useAuth();
  const [attempts, setAttempts] = useState<AttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchAttempts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      const response = await api.attempts.getUserAttempts();
      
      if (response.success && response.data) {
        const formattedAttempts = response.data.map((attempt: any) => ({
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
    } catch (error) {
      console.error("Failed to fetch attempts", error);
    } finally {
      setLoading(false);
    }
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

  const getScoreColor = (score: number | null, total: number) => {
    if (score === null) return "text-gray-500";
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-blue-600";
    if (percentage >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Test Attempts</h1>
        <p className="text-gray-600">View and manage all your test attempts and performance</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : attempts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No attempts yet</h3>
          <p className="text-gray-600 mb-6">Start taking tests to see your performance here</p>
          <Link href="/tests" className="btn btn-primary inline-block">
            Start Your First Test
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Test</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Started</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Score</th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt) => {
                  const isCompleted = attempt.submittedAt !== null && attempt.score !== null;
                  const percentage = isCompleted && attempt.totalQuestions > 0
                    ? ((attempt.score || 0) / attempt.totalQuestions) * 100
                    : 0;

                  return (
                    <tr
                      key={attempt.attemptId}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">{attempt.testTitle}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {attempt.totalQuestions} questions
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {formatDate(attempt.startedAt)}
                      </td>
                      <td className="py-4 px-6">
                        {isCompleted ? (
                          <span className="badge badge-success text-xs">Completed</span>
                        ) : (
                          <span className="badge badge-warning text-xs">In Progress</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {isCompleted ? (
                          <div>
                            <span className={`text-lg font-bold ${getScoreColor(attempt.score, attempt.totalQuestions)}`}>
                              {attempt.score}/{attempt.totalQuestions}
                            </span>
                            <div className="text-xs text-gray-500">
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Link
                          href={`/tests/${attempt.testId}/attempt?attemptId=${attempt.attemptId}`}
                          className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                        >
                          {isCompleted ? "Review" : "Continue"}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

