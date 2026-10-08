import { Category, IncomeSource, Expense, BudgetAlert, UserSettings } from '../types/finance';

const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function getApiBaseUrl(): string {
  try {
    const saved = localStorage.getItem('spendwise_api_url') || localStorage.getItem('finflow_api_url');
    if (saved && saved.trim()) {
      let clean = saved.trim().replace(/\/+$/, '');
      if (!clean.endsWith('/api') && !clean.includes('/api/')) {
        clean = `${clean}/api`;
      }
      return clean;
    }
  } catch (e) {
    // Ignore storage errors
  }
  return DEFAULT_API_URL;
}

export function setApiBaseUrl(url: string): void {
  let clean = url.trim().replace(/\/+$/, '');
  if (!clean.endsWith('/api') && !clean.includes('/api/')) {
    clean = `${clean}/api`;
  }
  localStorage.setItem('spendwise_api_url', clean);
}

export function getAuthToken(): string | null {
  return localStorage.getItem('spendwise_token') || localStorage.getItem('finflow_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('spendwise_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('spendwise_token');
  localStorage.removeItem('spendwise_user');
  localStorage.removeItem('finflow_token');
  localStorage.removeItem('finflow_user');
}

export interface User {
  id: string;
  name: string;
  email?: string | null;
  mobile?: string | null;
  currency_symbol: string;
}

export function getStoredUser(): User | null {
  try {
    const str = localStorage.getItem('spendwise_user') || localStorage.getItem('finflow_user');
    return str ? JSON.parse(str) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  localStorage.setItem('spendwise_user', JSON.stringify(user));
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err: any) {
    if (err.name === 'TypeError' || err.message?.includes('Failed to fetch')) {
      throw new Error(`Cannot connect to backend server at ${baseUrl}. Please ensure the SpendWise backend is running on port 5000.`);
    }
    throw err;
  }

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}`;
    try {
      const data = await response.json();
      if (data.error) errorMsg = data.error;
    } catch {
      // Ignore json parse error
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Health
  checkHealth: async (): Promise<{ status: string; database: string }> => {
    return request('/health');
  },

  // Auth
  sendRegisterOtp: async (email: string, name?: string): Promise<{ success: boolean; message: string; previewUrl?: string }> => {
    return request('/auth/send-register-otp', {
      method: 'POST',
      body: JSON.stringify({ email, name }),
    });
  },

  register: async (name: string, identifier: string, password: string, otp?: string): Promise<{ token: string; user: User }> => {
    const isEmail = identifier.includes('@');
    const res = await request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name,
        email: isEmail ? identifier : null,
        mobile: !isEmail ? identifier : null,
        password,
        otp,
      }),
    });
    setAuthToken(res.token);
    setStoredUser(res.user);
    return res;
  },

  login: async (identifier: string, password: string): Promise<{ token: string; user: User }> => {
    const res = await request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
    setAuthToken(res.token);
    setStoredUser(res.user);
    return res;
  },

  getMe: async (): Promise<{ user: User }> => {
    return request('/auth/me');
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; message: string; previewUrl?: string }> => {
    return request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  verifyOtp: async (email: string, otp: string): Promise<{ success: boolean; message: string }> => {
    return request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  resetPassword: async (email: string, otp: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    return request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, newPassword }),
    });
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    return request('/categories');
  },

  saveCategory: async (category: Partial<Category>): Promise<Category> => {
    if (category.id) {
      return request(`/categories/${category.id}`, {
        method: 'PUT',
        body: JSON.stringify(category),
      });
    }
    return request('/categories', {
      method: 'POST',
      body: JSON.stringify(category),
    });
  },

  deleteCategory: async (id: string): Promise<{ success: boolean }> => {
    return request(`/categories/${id}`, { method: 'DELETE' });
  },

  // Incomes
  getIncomes: async (): Promise<IncomeSource[]> => {
    return request('/incomes');
  },

  saveIncome: async (income: Partial<IncomeSource>): Promise<IncomeSource> => {
    if (income.id) {
      return request(`/incomes/${income.id}`, {
        method: 'PUT',
        body: JSON.stringify(income),
      });
    }
    return request('/incomes', {
      method: 'POST',
      body: JSON.stringify(income),
    });
  },

  deleteIncome: async (id: string): Promise<{ success: boolean }> => {
    return request(`/incomes/${id}`, { method: 'DELETE' });
  },

  // Expenses
  getExpenses: async (): Promise<Expense[]> => {
    return request('/expenses');
  },

  saveExpense: async (expense: Partial<Expense>): Promise<Expense> => {
    if (expense.id) {
      return request(`/expenses/${expense.id}`, {
        method: 'PUT',
        body: JSON.stringify(expense),
      });
    }
    return request('/expenses', {
      method: 'POST',
      body: JSON.stringify(expense),
    });
  },

  deleteExpense: async (id: string): Promise<{ success: boolean }> => {
    return request(`/expenses/${id}`, { method: 'DELETE' });
  },

  // Alerts
  getAlerts: async (): Promise<BudgetAlert[]> => {
    return request('/alerts');
  },

  saveAlert: async (alert: Partial<BudgetAlert>): Promise<BudgetAlert> => {
    return request('/alerts', {
      method: 'POST',
      body: JSON.stringify(alert),
    });
  },

  markAlertAsRead: async (id: string): Promise<{ success: boolean }> => {
    return request(`/alerts/${id}/read`, { method: 'PUT' });
  },

  clearAlerts: async (): Promise<{ success: boolean }> => {
    return request('/alerts', { method: 'DELETE' });
  },

  // Settings
  getSettings: async (): Promise<UserSettings> => {
    return request('/settings');
  },

  saveSettings: async (settings: Partial<UserSettings>): Promise<UserSettings> => {
    return request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },
};
