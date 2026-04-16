import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { api, getAuthToken, setAuthToken } from "@/lib/api";
import { AuthResponse, Role } from "@/types";

type AuthUser = {
  userId: number;
  email: string;
  name: string;
  role: Role;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const USER_KEY = "lms.user";

function loadStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadStoredUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) {
      setUser(null);
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  function persist(u: AuthUser, token: string) {
    setAuthToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    setUser(u);
  }

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const res = await api.post<AuthResponse>("/auth/login", { email, password });
      const u: AuthUser = {
        userId: res.data.userId,
        email: res.data.email,
        name: res.data.name,
        role: res.data.role,
      };
      persist(u, res.data.token);
      return u;
    } finally {
      setLoading(false);
    }
  }

  async function register(name: string, email: string, password: string) {
    setLoading(true);
    try {
      const res = await api.post<AuthResponse>("/auth/register", { name, email, password });
      const u: AuthUser = {
        userId: res.data.userId,
        email: res.data.email,
        name: res.data.name,
        role: res.data.role,
      };
      persist(u, res.data.token);
      return u;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    setAuthToken(null);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
