"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { api } from "@/utils/api";

type Question = { id: string; text: string; options: string[]; selectedAnswer?: number | null };

type TestDetail = {
  test: { id: string; title: string; durationMinutes: number };
  questions: Question[];
};

type QuestionStatus = {
  answered: boolean;
  marked: boolean;
  visited: boolean;
};

export default function AttemptPage() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const testId = String(params.testId);
  const attemptId = search.get("attemptId");
  const [detail, setDetail] = useState<TestDetail | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [markedQuestions, setMarkedQuestions] = useState<Set<string>>(new Set());
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submitted, setSubmitted] = useState<{ score: number; totalQuestions: number; percentage: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [testInstructions, setTestInstructions] = useState<string[]>([]);
  const [testStarted, setTestStarted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const blockNavigationRef = useRef(true);

  // Prevent page navigation/close during test (unless submitted)
  useEffect(() => {
    if (submitted || !testStarted) {
      blockNavigationRef.current = false;
      return;
    }

    blockNavigationRef.current = true;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "You have an ongoing test. Are you sure you want to leave? Your progress will be saved but the timer will continue.";
      return e.returnValue;
    };

    const handlePopState = (e: PopStateEvent) => {
      if (blockNavigationRef.current && !submitted) {
        window.history.pushState(null, "", window.location.href);
        addToast("You cannot navigate away during the test. Please submit the test first.", "warning");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [submitted, testStarted, addToast]);

  // Make fullscreen on test start
  useEffect(() => {
    if (testStarted && !submitted) {
      // Request fullscreen after a short delay to ensure page is ready
      const requestFullscreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          // Try to enter fullscreen
          elem.requestFullscreen().catch(() => {
            // User denied or browser doesn't support - that's okay
          });
        }
      };
      // Small delay to ensure UI is ready
      const timer = setTimeout(requestFullscreen, 500);
      return () => clearTimeout(timer);
    }
  }, [testStarted, submitted]);

  // Auto-submit on ESC key press
  useEffect(() => {
    if (!testStarted || submitted || submitting || !attemptId || !detail) {
      return;
    }

    const handleKeyDown = async (e: KeyboardEvent) => {
      // Check if ESC key is pressed
      if (e.key === "Escape" || e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();
        
        // Show warning and auto-submit
        if (confirm("Pressing ESC will automatically submit your exam. Are you sure you want to submit now?")) {
          setSubmitting(true);
          try {
            const response = await api.attempts.submit(attemptId);
            
            if (response.success && response.data) {
              setSubmitted({
                score: response.data.score,
                totalQuestions: response.data.totalQuestions,
                percentage: response.data.percentage,
              });
              blockNavigationRef.current = false;
              addToast("Test submitted successfully via ESC key!", "success");
            }
          } catch (err: any) {
            addToast(err.message || "Failed to submit test", "error");
          } finally {
            setSubmitting(false);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [testStarted, submitted, submitting, attemptId, detail, addToast]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/tests/${testId}/attempt?attemptId=${attemptId}`);
      return;
    }

    if (!attemptId) {
      addToast("Attempt ID is required", "error");
      router.push(`/tests/${testId}`);
      return;
    }

    fetchAttempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId, testId, isAuthenticated]);

  // Auto-submit handler
  const handleAutoSubmit = useCallback(async () => {
    if (submitted || submitting || !attemptId || !detail) return;
    
    // Clear the interval to prevent multiple submissions
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setSubmitting(true);
    try {
      const response = await api.attempts.submit(attemptId);
      
      if (response.success && response.data) {
        setSubmitted({
          score: response.data.score,
          totalQuestions: response.data.totalQuestions,
          percentage: response.data.percentage,
        });
        addToast("Time's up! Test auto-submitted.", "info");
      }
    } catch (err: any) {
      addToast(err.message || "Failed to auto-submit test", "error");
    } finally {
      setSubmitting(false);
    }
  }, [submitted, submitting, attemptId, detail, addToast]);

  // Auto-submit when time reaches 0
  useEffect(() => {
    if (detail && !submitted && !submitting && timeRemaining === 0 && attemptId) {
      handleAutoSubmit();
    }
  }, [timeRemaining, submitted, submitting, detail, attemptId, handleAutoSubmit]);

  // Timer countdown
  useEffect(() => {
    if (detail && !submitted && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;
          // Clear interval when time reaches 0
          if (newTime <= 0) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return 0;
          }
          return newTime;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      // Clear interval if test is submitted or time is 0
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail, submitted]);

  const fetchAttempt = async () => {
    try {
      setLoading(true);
      const response = await api.attempts.getById(attemptId!);
      
      if (response.success && response.data) {
        const attemptData = response.data;
        
        // Load saved answers
        const savedAnswers: Record<string, number> = {};
        attemptData.questions.forEach((q: any) => {
          if (q.selectedAnswer !== null && q.selectedAnswer !== undefined) {
            savedAnswers[q.id] = q.selectedAnswer;
          }
        });

        setAnswers(savedAnswers);
        
        // Load marked questions and current question index from backend
        const savedMarkedQuestions = attemptData.attempt.markedQuestions || [];
        setMarkedQuestions(new Set(savedMarkedQuestions));
        setCurrentQuestionIndex(attemptData.attempt.currentQuestionIndex || 0);
        
        setDetail({
          test: {
            id: attemptData.attempt.testId,
            title: attemptData.attempt.testTitle,
            durationMinutes: attemptData.attempt.durationMinutes || 60,
          },
          questions: attemptData.questions.map((q: any) => ({
            id: q.id,
            text: q.text,
            options: q.options,
            selectedAnswer: q.selectedAnswer,
          })),
        });

        // Check if test has been started
        const hasStarted = !!attemptData.attempt.startedAt;
        setTestStarted(hasStarted);
        
        // Load test instructions if available
        if (attemptData.test?.instructions) {
          setTestInstructions(attemptData.test.instructions);
        } else {
          // Default instructions
          setTestInstructions([
            "Read each question carefully before selecting your answer.",
            "You can navigate between questions using the Previous/Next buttons or the Question Palette.",
            "Mark questions for review if you want to revisit them later.",
            "The timer will start once you click 'Start Test'. Make sure you have a stable internet connection.",
            "You can change your answers before submitting the test.",
            "Once submitted, you cannot modify your answers.",
            "The test will auto-submit when the time runs out.",
            "Ensure you have answered all questions before submitting."
          ]);
        }

        // Show instructions if test hasn't started
        if (!hasStarted && !attemptData.attempt.submittedAt) {
          setShowInstructions(true);
        }

        // Calculate remaining time
        if (hasStarted && !attemptData.attempt.submittedAt) {
          const durationSeconds = (attemptData.attempt.durationMinutes || 60) * 60;
          const startedAt = new Date(attemptData.attempt.startedAt);
          const now = new Date();
          const elapsedSeconds = Math.floor((now.getTime() - startedAt.getTime()) / 1000);
          const remaining = Math.max(0, durationSeconds - elapsedSeconds);
          setTimeRemaining(remaining);
          startTimeRef.current = startedAt;
        } else if (!attemptData.attempt.submittedAt) {
          // New attempt - set full duration
          const durationSeconds = (attemptData.attempt.durationMinutes || 60) * 60;
          setTimeRemaining(durationSeconds);
        }

        // If already submitted, show results
        if (attemptData.attempt.submittedAt) {
          setSubmitted({
            score: attemptData.attempt.score || 0,
            totalQuestions: attemptData.attempt.totalQuestions,
            percentage: attemptData.attempt.percentage || 0,
          });
        }
      }
    } catch (err: any) {
      addToast(err.message || "Failed to load attempt", "error");
      router.push(`/tests/${testId}`);
    } finally {
      setLoading(false);
    }
  };

  const onChange = async (qid: string, idx: number) => {
    const newAnswers = { ...answers, [qid]: idx };
    setAnswers(newAnswers);
    
    // Auto-save answers to backend
    if (attemptId && !submitted) {
      try {
        await api.attempts.update(attemptId, { answers: newAnswers });
      } catch (err) {
        console.error("Failed to save answer", err);
      }
    }
  };

  const toggleMarkQuestion = useCallback(async (qid: string) => {
    setMarkedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(qid)) {
        newSet.delete(qid);
      } else {
        newSet.add(qid);
      }
      
      // Save to backend
      if (attemptId && !submitted) {
        const markedArray = Array.from(newSet);
        api.attempts.update(attemptId, { markedQuestions: markedArray }).catch((err) => {
          console.error("Failed to save marked questions", err);
        });
      }
      
      return newSet;
    });
  }, [attemptId, submitted]);

  const navigateToQuestion = async (index: number) => {
    if (index >= 0 && index < (detail?.questions.length || 0)) {
      setCurrentQuestionIndex(index);
      
      // Save to backend
      if (attemptId && !submitted) {
        try {
          await api.attempts.update(attemptId, { currentQuestionIndex: index });
        } catch (err) {
          console.error("Failed to save current question index", err);
        }
      }
    }
  };

  const goToNext = async () => {
    if (detail && currentQuestionIndex < detail.questions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      
      // Save to backend
      if (attemptId && !submitted) {
        try {
          await api.attempts.update(attemptId, { currentQuestionIndex: newIndex });
        } catch (err) {
          console.error("Failed to save current question index", err);
        }
      }
    }
  };

  const goToPrevious = async () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      
      // Save to backend
      if (attemptId && !submitted) {
        try {
          await api.attempts.update(attemptId, { currentQuestionIndex: newIndex });
        } catch (err) {
          console.error("Failed to save current question index", err);
        }
      }
    }
  };

  const onSubmit = async () => {
    if (!confirm("Are you sure you want to submit? You won't be able to change your answers.")) return;
    if (!attemptId || !detail || submitting) return;

    setShowSubmitModal(false);
    setSubmitting(true);
    try {
      const response = await api.attempts.submit(attemptId);
      
      if (response.success && response.data) {
        setSubmitted({
          score: response.data.score,
          totalQuestions: response.data.totalQuestions,
          percentage: response.data.percentage,
        });
        // Allow navigation after submission
        blockNavigationRef.current = false;
        addToast("Test submitted successfully!", "success");
      }
    } catch (err: any) {
      addToast(err.message || "Failed to submit test", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const startTest = async () => {
    if (!attemptId) return;
    
    try {
      // Mark attempt as started
      const response = await api.attempts.start(attemptId);
      
      if (response.success) {
        setShowInstructions(false);
        setTestStarted(true);
        const durationSeconds = (detail?.test.durationMinutes || 60) * 60;
        setTimeRemaining(durationSeconds);
        startTimeRef.current = new Date();
        addToast("Test started! Timer is now running.", "success");
        
        // Block navigation after test starts
        blockNavigationRef.current = true;
      }
    } catch (err: any) {
      addToast(err.message || "Failed to start test", "error");
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (index: number): QuestionStatus => {
    const question = detail?.questions[index];
    if (!question) return { answered: false, marked: false, visited: false };
    
    return {
      answered: question.id in answers,
      marked: markedQuestions.has(question.id),
      visited: index === currentQuestionIndex || (question.id in answers) || markedQuestions.has(question.id),
    };
  };

  const getQuestionStats = () => {
    if (!detail) return { answered: 0, unanswered: 0, marked: 0, notVisited: 0 };
    
    let answered = 0;
    let unanswered = 0;
    let marked = 0;
    let notVisited = 0;
    
    detail.questions.forEach((q, idx) => {
      const status = getQuestionStatus(idx);
      if (status.answered) answered++;
      else unanswered++;
      if (status.marked) marked++;
      if (!status.visited) notVisited++;
    });
    
    return { answered, unanswered, marked, notVisited };
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="fixed inset-0 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Test not found</p>
          <button
            onClick={() => router.push(`/tests/${testId}`)}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Show instructions screen if test hasn't started
  if (showInstructions && !testStarted) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-6">
                <span>📋</span>
                <span>Test Instructions</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
                {detail.test.title}
              </h1>
              <div className="flex items-center justify-center gap-6 text-gray-600 mb-8">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⏱️</span>
                  <span className="font-semibold">{detail.test.durationMinutes} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">❓</span>
                  <span className="font-semibold">{detail.questions.length} questions</span>
                </div>
              </div>
            </div>

            {/* Instructions Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8 lg:p-10 mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span className="text-3xl">📝</span>
                <span>Important Instructions</span>
              </h2>
              
              <div className="space-y-4 mb-8">
                {testInstructions.map((instruction, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500 hover:shadow-md transition-shadow"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-gray-700 text-base sm:text-lg leading-relaxed flex-1">
                      {instruction}
                    </p>
                  </div>
                ))}
              </div>

              {/* Additional Info */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h3 className="font-bold text-yellow-900 mb-2">Please Note:</h3>
                    <ul className="text-yellow-800 space-y-1 text-sm sm:text-base">
                      <li>• The timer will start as soon as you click "Start Test"</li>
                      <li>• You cannot pause the test once started</li>
                      <li>• Make sure you have a stable internet connection</li>
                      <li>• Do not refresh the page during the test</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push(`/tests/${testId}`)}
                  className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-bold text-lg transition-all duration-300 hover:shadow-lg"
                >
                  ← Go Back
                </button>
                <button
                  onClick={startTest}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-bold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
                >
                  <span>Start Test</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = detail.questions[currentQuestionIndex];
  const stats = getQuestionStats();

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden flex flex-col">
      {/* Warning Banner - Only show during active test */}
      {testStarted && !submitted && (
        <div className="bg-red-600 text-white text-center py-2 px-4 text-sm font-semibold z-[60] flex-shrink-0">
          ⚠️ Exam in Progress - Do not close this window or navigate away. Press ESC to submit. Your progress is being saved automatically.
        </div>
      )}
      
      {/* Top Header Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm z-50 flex-shrink-0">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-bold text-gray-900">{detail.test.title}</h1>
              <div className="hidden md:block text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {detail.questions.length}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className={`px-4 py-2 rounded-lg font-mono font-bold text-lg ${
                timeRemaining < 300 ? 'bg-red-100 text-red-700' : 
                timeRemaining < 600 ? 'bg-yellow-100 text-yellow-700' : 
                'bg-green-100 text-green-700'
              }`}>
                {formatTime(timeRemaining)}
              </div>
              
              {/* Submit Button */}
              {!submitted && (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  disabled={submitting}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50"
                >
                  Submit Test
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Question Area */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
                <div className="text-center mb-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Test Submitted Successfully!</h2>
                  <p className="text-gray-600">Your results are displayed below</p>
                </div>
                
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-xl p-6 text-center border border-blue-200">
                    <div className="text-2xl font-semibold text-blue-700 mb-2">Score</div>
                    <div className="text-4xl font-bold text-blue-900">{submitted.score}/{submitted.totalQuestions}</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-6 text-center border border-green-200">
                    <div className="text-2xl font-semibold text-green-700 mb-2">Percentage</div>
                    <div className="text-4xl font-bold text-green-900">{submitted.percentage}%</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-6 text-center border border-purple-200">
                    <div className="text-2xl font-semibold text-purple-700 mb-2">Performance</div>
                    <div className="text-4xl font-bold text-purple-900">
                      {submitted.percentage >= 80 ? 'Excellent' : 
                       submitted.percentage >= 60 ? 'Good' : 
                       submitted.percentage >= 40 ? 'Average' : 'Needs Improvement'}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => router.push(`/dashboard/attempts`)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    View All Attempts
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard`)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 lg:p-8">
                {/* Question Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                      Question {currentQuestionIndex + 1}
                    </span>
                    {markedQuestions.has(currentQuestion.id) && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-semibold text-xs">
                        ⭐ Marked for Review
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => toggleMarkQuestion(currentQuestion.id)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                      markedQuestions.has(currentQuestion.id)
                        ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {markedQuestions.has(currentQuestion.id) ? '✓ Marked' : 'Mark for Review'}
                  </button>
                </div>

                {/* Question Text */}
                <div className="mb-8">
                  <p className="text-xl font-semibold text-gray-900 leading-relaxed">{currentQuestion.text}</p>
                </div>

                {/* Options */}
                <div className="space-y-3 mb-8">
                  {currentQuestion.options.map((option, optIdx) => (
                    <label
                      key={optIdx}
                      className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        answers[currentQuestion.id] === optIdx
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestion.id}`}
                        value={optIdx}
                        checked={answers[currentQuestion.id] === optIdx}
                        onChange={() => onChange(currentQuestion.id, optIdx)}
                        className="mt-1 mr-4 w-5 h-5 text-blue-600 cursor-pointer"
                      />
                      <span className="text-gray-800 text-lg flex-1">{option}</span>
                    </label>
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                  <button
                    onClick={goToPrevious}
                    disabled={currentQuestionIndex === 0}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Previous
                  </button>
                  
                  <div className="text-sm text-gray-600">
                    {stats.answered} answered • {stats.unanswered} unanswered • {stats.marked} marked
                  </div>
                  
                  {currentQuestionIndex < detail.questions.length - 1 ? (
                    <button
                      onClick={goToNext}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                    >
                      Next →
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors"
                    >
                      Review & Submit
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Question Palette Sidebar */}
          {!submitted && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sticky top-24 overflow-x-hidden">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Question Palette</h3>
                
                {/* Statistics */}
                <div className="grid grid-cols-2 gap-2 mb-4 pb-4 border-b border-gray-200">
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-700">{stats.answered}</div>
                    <div className="text-xs text-green-600">Answered</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded-lg">
                    <div className="text-lg font-bold text-red-700">{stats.unanswered}</div>
                    <div className="text-xs text-red-600">Unanswered</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-50 rounded-lg">
                    <div className="text-lg font-bold text-yellow-700">{stats.marked}</div>
                    <div className="text-xs text-yellow-600">Marked</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-700">{stats.notVisited}</div>
                    <div className="text-xs text-gray-600">Not Visited</div>
                  </div>
                </div>

                {/* Legend */}
                <div className="mb-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-200 border-2 border-green-400 rounded"></div>
                    <span>Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-200 border-2 border-red-400 rounded"></div>
                    <span>Not Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-yellow-200 border-2 border-yellow-400 rounded"></div>
                    <span>Marked for Review</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-300 border-2 border-blue-500 rounded"></div>
                    <span>Current Question</span>
                  </div>
                </div>

                {/* Question Grid */}
                <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto overflow-x-hidden">
                  {detail.questions.map((q, idx) => {
                    const status = getQuestionStatus(idx);
                    const isCurrent = idx === currentQuestionIndex;
                    const isAnswered = status.answered;
                    const isMarked = status.marked;
                    
                    return (
                      <button
                        key={q.id}
                        onClick={() => navigateToQuestion(idx)}
                        className={`w-10 h-10 rounded-lg border-2 font-semibold text-sm transition-all hover:shadow-lg hover:brightness-110 ${
                          isCurrent
                            ? 'bg-blue-500 text-white border-blue-700 shadow-lg'
                            : isAnswered && isMarked
                            ? 'bg-yellow-300 border-yellow-500 text-yellow-900'
                            : isAnswered
                            ? 'bg-green-200 border-green-400 text-green-900'
                            : isMarked
                            ? 'bg-yellow-200 border-yellow-400 text-yellow-900'
                            : 'bg-red-200 border-red-400 text-red-900'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Confirm Submission</h3>
            <div className="mb-6 space-y-2">
              <p className="text-gray-700">Are you sure you want to submit the test?</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Once submitted, you cannot change your answers.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Answered:</span>
                    <span className="font-semibold ml-2 text-green-700">{stats.answered}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Unanswered:</span>
                    <span className="font-semibold ml-2 text-red-700">{stats.unanswered}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Marked:</span>
                    <span className="font-semibold ml-2 text-yellow-700">{stats.marked}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Not Visited:</span>
                    <span className="font-semibold ml-2 text-gray-700">{stats.notVisited}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onSubmit}
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50 transition-colors"
              >
                {submitting ? "Submitting..." : "Submit Test"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
