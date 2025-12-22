// src/contexts/AuthContext.tsx
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLoginMutation, useLogoutMutation } from "../redux/services/authApi";
import {
  AuthContextType,
  AuthResponse,
  LoginCredentials,
  RegisterData,
  User,
} from "../types/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [loginMutation] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();

  // src/contexts/AuthContext.tsx (updated useEffect)
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          // Optional: You can validate the token here with an API call
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          console.log("Auth restored");
        }
      } catch (error) {
        console.error("Failed to restore session:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // LOGIN
  // src/contexts/AuthContext.tsx
  // In the login function, add setLoading to prevent race conditions:
  const login = async (
    credentials: LoginCredentials
  ): Promise<AuthResponse> => {
    try {
      setError(null);
      setLoading(true); // Set loading to true during login

      const response = await loginMutation(credentials).unwrap();
      const { token: authToken, user: userData } = response;

      setUser(userData);
      setToken(authToken);

      localStorage.setItem("authToken", authToken);
      localStorage.setItem("user", JSON.stringify(userData));

      return response;
    } catch (err: any) {
      const message = err.data?.message || "Login failed";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false); // Always set loading to false
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutMutation().unwrap();
    } catch {}

    setUser(null);
    setToken(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  };

  const updateProfile = async (profileData: Partial<User>): Promise<User> => {
    const updated = { ...user, ...profileData } as User;
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
    return updated;
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    login,
    register: async () => {
      throw new Error("Not implemented");
    },
    logout,
    updateProfile,
    changePassword: async () => {
      throw new Error("Not implemented");
    },
    clearError: () => setError(null),
    isAuthenticated: !!user && !!token,
    hasPermission: () => false,
    hasAnyPermission: () => false,
    hasAllPermissions: () => false,
    hasRole: () => false,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#269A99] border-r-transparent"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
