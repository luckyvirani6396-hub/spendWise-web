import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, User, getAuthToken, getStoredUser, removeAuthToken, getApiBaseUrl, setApiBaseUrl } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isNeonConnected: boolean;
  serverUrl: string;
  updateServerUrl: (url: string) => void;
  login: (identifier: string, password: string) => Promise<void>;
  register: (name: string, identifier: string, password: string, otp?: string) => Promise<void>;
  logout: () => void;
  checkBackendStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNeonConnected, setIsNeonConnected] = useState<boolean>(false);
  const [serverUrl, setServerUrlState] = useState<string>(getApiBaseUrl());

  const checkBackendStatus = async (): Promise<boolean> => {
    try {
      const res = await api.checkHealth();
      const ok = res.status === 'ok';
      setIsNeonConnected(ok);
      return ok;
    } catch {
      setIsNeonConnected(false);
      return false;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await checkBackendStatus();

      const existingToken = getAuthToken();
      if (existingToken) {
        try {
          const res = await api.getMe();
          setUser(res.user);
        } catch (err) {
          console.warn('Session expired or invalid, logging out:', err);
          removeAuthToken();
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const clearLocalCache = () => {
    localStorage.removeItem('spendwise_incomes_v1');
    localStorage.removeItem('spendwise_expenses_v1');
    localStorage.removeItem('spendwise_categories_v1');
    localStorage.removeItem('spendwise_alerts_v1');
  };

  const login = async (identifier: string, password: string) => {
    clearLocalCache();
    const res = await api.login(identifier, password);
    setUser(res.user);
    setToken(res.token);
    await checkBackendStatus();
  };

  const register = async (name: string, identifier: string, password: string) => {
    clearLocalCache();
    const res = await api.register(name, identifier, password);
    setUser(res.user);
    setToken(res.token);
    await checkBackendStatus();
  };

  const logout = () => {
    clearLocalCache();
    removeAuthToken();
    setUser(null);
    setToken(null);
  };

  const updateServerUrl = (url: string) => {
    setApiBaseUrl(url);
    setServerUrlState(url);
    checkBackendStatus();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isNeonConnected,
        serverUrl,
        updateServerUrl,
        login,
        register,
        logout,
        checkBackendStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
