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
  updateProfile: (data: { name?: string; email?: string; mobile?: string; password?: string; currency_symbol?: string }) => Promise<void>;
  deleteAccount: () => Promise<{ deletion_date: string }>;
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
        } catch (err: any) {
          const isAuthError = 
            err.message?.includes('401') || 
            err.message?.includes('403') || 
            err.message?.includes('User not found') ||
            err.message?.includes('Invalid token');

          if (isAuthError) {
            console.warn('Session expired or invalid, logging out:', err);
            removeAuthToken();
            setUser(null);
            setToken(null);
          } else {
            console.warn('Network issue or backend sleeping, preserving session & cached data:', err);
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (identifier: string, password: string) => {
    const res = await api.login(identifier, password);
    setUser(res.user);
    setToken(res.token);
    await checkBackendStatus();
  };

  const register = async (name: string, identifier: string, password: string, otp?: string) => {
    const res = await api.register(name, identifier, password, otp);
    setUser(res.user);
    setToken(res.token);
    await checkBackendStatus();
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (data: { name?: string; email?: string; mobile?: string; password?: string; currency_symbol?: string }) => {
    const res = await api.updateProfile(data);
    setUser(res.user);
  };

  const deleteAccount = async () => {
    const res = await api.deleteAccount();
    logout();
    return res;
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
        updateProfile,
        deleteAccount,
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
