// Utility functions for managing data in localStorage (frontend-only)

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

// Keys for localStorage
const KEYS = {
  PURCHASED_TESTS: (userId: string) => `purchased_tests_${userId}`,
  ATTEMPTS: (userId: string) => `attempts_${userId}`,
};

// Purchased Tests Management
export function getPurchasedTests(userId: string): TestSummary[] {
  try {
    const data = localStorage.getItem(KEYS.PURCHASED_TESTS(userId));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addPurchasedTest(userId: string, test: TestSummary): void {
  const purchased = getPurchasedTests(userId);
  // Check if test already exists
  if (!purchased.find(t => t.id === test.id)) {
    purchased.push(test);
    localStorage.setItem(KEYS.PURCHASED_TESTS(userId), JSON.stringify(purchased));
  }
}

export function addPurchasedTests(userId: string, tests: TestSummary[]): void {
  const purchased = getPurchasedTests(userId);
  const existingIds = new Set(purchased.map(t => t.id));
  
  tests.forEach(test => {
    if (!existingIds.has(test.id)) {
      purchased.push(test);
      existingIds.add(test.id);
    }
  });
  
  localStorage.setItem(KEYS.PURCHASED_TESTS(userId), JSON.stringify(purchased));
}

export function isTestPurchased(userId: string, testId: string): boolean {
  const purchased = getPurchasedTests(userId);
  return purchased.some(t => t.id === testId);
}

// Attempts Management
export function getAttempts(userId: string): AttemptSummary[] {
  try {
    const data = localStorage.getItem(KEYS.ATTEMPTS(userId));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getAttempt(userId: string, attemptId: string): AttemptSummary | null {
  const attempts = getAttempts(userId);
  return attempts.find(a => a.attemptId === attemptId) || null;
}

export function createAttempt(
  userId: string,
  attemptId: string,
  testId: string,
  testTitle: string,
  totalQuestions: number
): AttemptSummary {
  const attempts = getAttempts(userId);
  const newAttempt: AttemptSummary = {
    attemptId,
    testId,
    testTitle,
    startedAt: new Date().toISOString(),
    submittedAt: null,
    score: null,
    totalQuestions,
  };
  
  attempts.unshift(newAttempt); // Add to beginning
  localStorage.setItem(KEYS.ATTEMPTS(userId), JSON.stringify(attempts));
  return newAttempt;
}

export function updateAttempt(
  userId: string,
  attemptId: string,
  updates: {
    answers?: Record<string, number>;
    submittedAt?: string;
    score?: number;
  }
): void {
  const attempts = getAttempts(userId);
  const index = attempts.findIndex(a => a.attemptId === attemptId);
  
  if (index !== -1) {
    attempts[index] = {
      ...attempts[index],
      ...updates,
    };
    localStorage.setItem(KEYS.ATTEMPTS(userId), JSON.stringify(attempts));
  }
}

export function submitAttempt(
  userId: string,
  attemptId: string,
  score: number
): void {
  updateAttempt(userId, attemptId, {
    submittedAt: new Date().toISOString(),
    score,
  });
}

// Get user ID from auth
export function getUserId(): string | null {
  try {
    const userStr = localStorage.getItem("auth_user");
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return user.id || null;
  } catch {
    return null;
  }
}

