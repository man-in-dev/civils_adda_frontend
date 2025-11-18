const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

// Get auth token from localStorage
const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

// Set auth token in localStorage
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
};

// Remove auth token from localStorage
export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
};

// API request wrapper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle 401 Unauthorized - clear token and redirect to login
      if (response.status === 401) {
        removeToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }

      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Network error');
  }
};

// API methods
export const api = {
  // Auth
  auth: {
    register: async (name: string, email: string, password: string) => {
      const response = await apiRequest<{ user: any; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      return response;
    },

    login: async (email: string, password: string) => {
      const response = await apiRequest<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      return response;
    },

    getMe: async () => {
      const response = await apiRequest<{ user: any }>('/auth/me');
      return response;
    },

    getGoogleAuthUrl: async () => {
      const response = await apiRequest<{ authUrl: string }>('/auth/google');
      return response;
    },
  },

  // Tests
  tests: {
    getAll: async (params?: { category?: string; search?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.category) queryParams.append('category', params.category);
      if (params?.search) queryParams.append('search', params.search);
      const query = queryParams.toString();
      const response = await apiRequest<Array<any>>(`/tests${query ? `?${query}` : ''}`);
      return response;
    },

    getById: async (id: string) => {
      const response = await apiRequest<{ test: any; questions: any[] }>(`/tests/${id}`);
      return response;
    },
  },

  // Purchases
  purchases: {
    createPaymentOrder: async (testIds: string[]) => {
      const response = await apiRequest<{
        paymentSessionId: string;
        orderId: string;
        amount: number;
        testIds: string[];
      }>('/purchases/create-order', {
        method: 'POST',
        body: JSON.stringify({ testIds }),
      });
      return response;
    },

    verifyPayment: async (orderId: string) => {
      const response = await apiRequest<{
        orderId: string;
        paymentId: string;
        status: string;
      }>('/purchases/verify-payment', {
        method: 'POST',
        body: JSON.stringify({ orderId }),
      });
      return response;
    },

    purchaseTests: async (testIds: string[]) => {
      const response = await apiRequest<Array<any>>('/purchases', {
        method: 'POST',
        body: JSON.stringify({ testIds }),
      });
      return response;
    },

    getPurchasedTests: async () => {
      const response = await apiRequest<Array<any>>('/purchases');
      return response;
    },

    checkPurchase: async (testId: string) => {
      const response = await apiRequest<{ isPurchased: boolean }>(`/purchases/check/${testId}`);
      return response;
    },
  },

  // Attempts
  attempts: {
    create: async (testId: string) => {
      const response = await apiRequest<{ attemptId: string; testId: string; startedAt: string }>('/attempts', {
        method: 'POST',
        body: JSON.stringify({ testId }),
      });
      return response;
    },

    getById: async (id: string) => {
      const response = await apiRequest<{ 
        attempt: any; 
        questions: any[];
        test?: {
          instructions?: string[];
        };
      }>(`/attempts/${id}`);
      return response;
    },

    update: async (
      id: string, 
      data: {
        answers?: Record<string, number>;
        markedQuestions?: string[];
        currentQuestionIndex?: number;
        visitedQuestions?: string[];
      }
    ) => {
      const response = await apiRequest<{ 
        attemptId: string; 
        answers: Record<string, number>;
        markedQuestions: string[];
        currentQuestionIndex: number;
        visitedQuestions: string[];
      }>(`/attempts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    },

    start: async (id: string) => {
      const response = await apiRequest<{ startedAt: string }>(`/attempts/${id}/start`, {
        method: 'POST',
      });
      return response;
    },

    submit: async (id: string) => {
      const response = await apiRequest<{ score: number; totalQuestions: number; percentage: number }>(`/attempts/${id}/submit`, {
        method: 'POST',
      });
      return response;
    },

    getUserAttempts: async () => {
      const response = await apiRequest<Array<any>>('/attempts');
      return response;
    },

    getLeaderboard: async (limit?: number) => {
      const query = limit ? `?limit=${limit}` : '';
      const response = await apiRequest<{
        topPerformers: Array<{
          rank: number;
          userId: string;
          userName: string;
          userEmail: string;
          totalAttempts: number;
          averagePercentage: number;
          bestPercentage: number;
          bestScore: number;
        }>;
        userStats: {
          rank: number | null;
          userName: string;
          totalAttempts: number;
          averagePercentage: number;
          bestPercentage: number;
          bestScore: number;
        };
        totalUsers: number;
      }>(`/attempts/leaderboard${query}`);
      return response;
    },
  },

  // Performance
  performance: {
    getPerformance: async () => {
      const response = await apiRequest<any>('/performance');
      return response;
    },
  },
};

