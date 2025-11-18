"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, setToken, removeToken } from "@/utils/api";

type User = {
  id: string;
  email: string;
  name: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load token from localStorage on mount
    const savedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    if (savedToken) {
      // Verify token by fetching user data
      api.auth.getMe()
        .then((response) => {
          if (response.success && response.data) {
            setUser({
              id: response.data.user.id,
              email: response.data.user.email,
              name: response.data.user.name,
            });
            setTokenState(savedToken);
          } else {
            // Invalid token
            removeToken();
          }
        })
        .catch(() => {
          // Token invalid or expired
          removeToken();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.auth.login(email, password);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || "Login failed");
    }

    const { user: userData, token: newToken } = response.data;
    
    // Save to state and localStorage
    setUser({
      id: userData.id,
      email: userData.email,
      name: userData.name,
    });
    setTokenState(newToken);
    setToken(newToken);
  };

  const register = async (email: string, password: string, name: string = "") => {
    const response = await api.auth.register(name, email, password);
    
    if (!response.success || !response.data) {
      throw new Error(response.message || "Registration failed");
    }

    const { user: userData, token: newToken } = response.data;
    
    // Save to state and localStorage
    setUser({
      id: userData.id,
      email: userData.email,
      name: userData.name,
    });
    setTokenState(newToken);
    setToken(newToken);
  };

  const logout = () => {
    setTokenState(null);
    setUser(null);
    removeToken();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token: token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

