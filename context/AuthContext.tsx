"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from "react";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { authApi, User } from "@/services/api/auth";
import { userApi } from "@/services/api/user";

// ------------------- TYPES -------------------
interface AuthContextType {
  isLoadingFetchUser: boolean;
  isLoadingSubmit: boolean;
  isAuth: boolean;
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User) => void;
}

// ------------------- CONTEXT -------------------
const AuthContext = createContext<AuthContextType>({
  isLoadingFetchUser: true,
  isLoadingSubmit: false,
  isAuth: false,
  token: null,
  user: null,
  login: async () => false,
  logout: async () => {},
  refreshUser: async () => {},
  setUser: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

// ------------------- PROVIDER -------------------
export function AuthProvider({ children }: AuthProviderProps) {
  const [isLoadingFetchUser, setIsLoadingFetchUser] = useState(true);
  const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

  const [isAuth, setIsAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // ------------------- INIT AUTH -------------------
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedToken = Cookies.get("authToken");
        const savedTokenAdmin = Cookies.get("adminAuthToken");

        if (savedToken) {
          const userData = await userApi.getMe();

          if (userData) {
            {
              setToken(savedToken);
              setUser(userData);
              setIsAuth(true);
            }
          }
        }

        if (savedTokenAdmin) {
          setToken(savedTokenAdmin);
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Authentication initialization error:", error);
      } finally {
        setIsLoadingFetchUser(false);
      }
    };

    initAuth();
  }, [isAdmin]);

  // ------------------- LOGIN -------------------
  const login = useCallback(async (email: string, password: string) => {
    setIsLoadingSubmit(true);

    try {
      const data = await authApi.login(email, password);

      const {
        token: { access_token: newToken },
        user: userData,
      } = data.metaData;

      Cookies.set("authToken", newToken, { expires: 1, secure: true });

      setToken(newToken);
      setUser(userData);
      setIsAuth(true);

      toast.success(data.message ? data.message : "Đăng nhập thành công");

      return !!data;
    } catch (error: any) {
      toast.error(
        error.data.message
          ? error.data.message
          : "Đăng nhập thất bại. Vui lòng thử lại.",
      );
      return false;
    }
  }, []);

  // ------------------- LOGOUT -------------------
  const logout = useCallback(async () => {
    // setIsLoadingFetchUser(true);

    try {
      const data = await authApi.logout();

      if (!data) {
        toast.error("Đăng xuất không thành công. Vui lòng thử lại.");
        return;
      }

      Cookies.remove("authToken");
      setToken(null);
      setUser(null);
      setIsAuth(false);

      toast.success("Đăng xuất thành công.");

      return data;
    } catch {
      toast.error("Đăng xuất không thành công. Vui lòng liên hệ hỗ trợ.");
    } finally {
      setIsLoadingFetchUser(false);
    }
  }, []);

  // ------------------- REFRESH USER -------------------
  const refreshUser = useCallback(async () => {
    if (!token) return;

    setIsLoadingFetchUser(true);

    try {
      const response = await userApi.getMe();

      if (response) {
        setUser(response);
      }
    } catch (error) {
      console.error("Error refreshing user:", error);
    } finally {
      setIsLoadingFetchUser(false);
    }
  }, [token]);

  // ------------------- MEMOIZED CONTEXT VALUE -------------------
  const value = useMemo(
    () => ({
      isLoadingFetchUser,
      isLoadingSubmit,
      isAuth,
      token,
      user,
      login,
      logout,
      refreshUser,
      setUser,
    }),
    [
      isLoadingFetchUser,
      isLoadingSubmit,
      isAuth,
      token,
      user,
      isAdmin,
      login,
      logout,
      refreshUser,
      setUser,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ------------------- HOOKS -------------------
export const useAuth = () => useContext(AuthContext);

export const useRequireAuth = (redirectUrl = "/") => {
  const auth = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (!auth.isLoadingFetchUser) {
      setIsCheckingAuth(false);

      if (!auth.isAuth && typeof window !== "undefined") {
        window.location.href = redirectUrl;
      }
    }
  }, [auth.isLoadingFetchUser, auth.isAuth, redirectUrl]);

  return { ...auth, isCheckingAuth };
};
