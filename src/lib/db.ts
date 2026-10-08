import { 
  Category, 
  IncomeSource, 
  Expense, 
  BudgetAlert, 
  UserSettings 
} from '../types/finance';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_INCOME_SOURCES, 
  INITIAL_EXPENSES, 
  DEFAULT_USER_SETTINGS 
} from '../data/initialData';
import { api, getAuthToken } from './api';

const LOCAL_STORAGE_KEYS = {
  CATEGORIES: 'spendwise_categories_v1',
  INCOMES: 'spendwise_incomes_v1',
  EXPENSES: 'spendwise_expenses_v1',
  ALERTS: 'spendwise_alerts_v1',
  SETTINGS: 'spendwise_settings_v1',
};

// -------------------------------------------------------------
// LOCAL STORAGE ADAPTER HELPERS (Fallback / Offline Cache)
// -------------------------------------------------------------

function getLocalData<T>(key: string, defaultData: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error loading key ${key}:`, e);
    return defaultData;
  }
}

function setLocalData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving key ${key}:`, e);
  }
}

// -------------------------------------------------------------
// DATABASE SERVICE LAYER (NEON POSTGRESQL + LOCAL FALLBACK)
// -------------------------------------------------------------

export const dbService = {
  // Test connection to Neon PostgreSQL backend
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await api.checkHealth();
      if (res.status === 'ok') {
        return { success: true, message: `Connected to Neon PostgreSQL backend (${res.database})!` };
      }
      return { success: false, message: 'Backend returned unexpected status.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Cannot reach Neon PostgreSQL backend server.' };
    }
  },

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    if (getAuthToken()) {
      try {
        const cats = await api.getCategories();
        if (cats && cats.length > 0) {
          setLocalData(LOCAL_STORAGE_KEYS.CATEGORIES, cats);
          return cats;
        }
      } catch (err) {
        console.warn('Neon Postgres fetch failed, falling back to cache:', err);
      }
    }
    return getLocalData<Category[]>(LOCAL_STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },

  async saveCategory(category: Category): Promise<Category> {
    if (getAuthToken()) {
      try {
        const saved = await api.saveCategory(category);
        const local = getLocalData<Category[]>(LOCAL_STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
        const index = local.findIndex((c) => c.id === category.id);
        if (index >= 0) local[index] = saved;
        else local.push(saved);
        setLocalData(LOCAL_STORAGE_KEYS.CATEGORIES, local);
        return saved;
      } catch (err) {
        console.warn('Neon Postgres save failed, caching locally:', err);
      }
    }

    const local = getLocalData<Category[]>(LOCAL_STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const index = local.findIndex((c) => c.id === category.id);
    if (index >= 0) {
      local[index] = category;
    } else {
      local.push(category);
    }
    setLocalData(LOCAL_STORAGE_KEYS.CATEGORIES, local);
    return category;
  },

  async deleteCategory(id: string): Promise<boolean> {
    if (getAuthToken()) {
      try {
        await api.deleteCategory(id);
      } catch (err) {
        console.warn('Neon Postgres delete failed:', err);
      }
    }
    const local = getLocalData<Category[]>(LOCAL_STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    const updated = local.filter((c) => c.id !== id);
    setLocalData(LOCAL_STORAGE_KEYS.CATEGORIES, updated);
    return true;
  },

  // INCOME SOURCES
  async getIncomeSources(month?: string): Promise<IncomeSource[]> {
    if (getAuthToken()) {
      try {
        const data = await api.getIncomes();
        if (data) {
          setLocalData(LOCAL_STORAGE_KEYS.INCOMES, data);
          if (month) return data.filter((i) => i.month === month);
          return data;
        }
      } catch (err) {
        console.warn('Neon Postgres getIncomes failed:', err);
      }
    }
    const local = getLocalData<IncomeSource[]>(LOCAL_STORAGE_KEYS.INCOMES, INITIAL_INCOME_SOURCES);
    if (month) {
      return local.filter((i) => i.month === month);
    }
    return local;
  },

  async saveIncomeSource(income: IncomeSource): Promise<IncomeSource> {
    if (getAuthToken()) {
      try {
        const saved = await api.saveIncome(income);
        const local = getLocalData<IncomeSource[]>(LOCAL_STORAGE_KEYS.INCOMES, INITIAL_INCOME_SOURCES);
        const index = local.findIndex((i) => i.id === income.id);
        if (index >= 0) local[index] = saved;
        else local.unshift(saved);
        setLocalData(LOCAL_STORAGE_KEYS.INCOMES, local);
        return saved;
      } catch (err) {
        console.warn('Neon Postgres saveIncome failed:', err);
      }
    }
    const local = getLocalData<IncomeSource[]>(LOCAL_STORAGE_KEYS.INCOMES, INITIAL_INCOME_SOURCES);
    const index = local.findIndex((i) => i.id === income.id);
    if (index >= 0) {
      local[index] = income;
    } else {
      local.unshift(income);
    }
    setLocalData(LOCAL_STORAGE_KEYS.INCOMES, local);
    return income;
  },

  async deleteIncomeSource(id: string): Promise<boolean> {
    if (getAuthToken()) {
      try {
        await api.deleteIncome(id);
      } catch (err) {
        console.warn('Neon Postgres deleteIncome failed:', err);
      }
    }
    const local = getLocalData<IncomeSource[]>(LOCAL_STORAGE_KEYS.INCOMES, INITIAL_INCOME_SOURCES);
    const updated = local.filter((i) => i.id !== id);
    setLocalData(LOCAL_STORAGE_KEYS.INCOMES, updated);
    return true;
  },

  // EXPENSES
  async getExpenses(month?: string): Promise<Expense[]> {
    if (getAuthToken()) {
      try {
        const data = await api.getExpenses();
        if (data) {
          setLocalData(LOCAL_STORAGE_KEYS.EXPENSES, data);
          if (month) return data.filter((e) => e.date.startsWith(month));
          return data;
        }
      } catch (err) {
        console.warn('Neon Postgres getExpenses failed:', err);
      }
    }
    const local = getLocalData<Expense[]>(LOCAL_STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    if (month) {
      return local.filter((e) => e.date.startsWith(month));
    }
    return local;
  },

  async saveExpense(expense: Expense): Promise<Expense> {
    if (getAuthToken()) {
      try {
        const saved = await api.saveExpense(expense);
        const local = getLocalData<Expense[]>(LOCAL_STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
        const index = local.findIndex((e) => e.id === expense.id);
        if (index >= 0) local[index] = saved;
        else local.unshift(saved);
        setLocalData(LOCAL_STORAGE_KEYS.EXPENSES, local);
        return saved;
      } catch (err) {
        console.warn('Neon Postgres saveExpense failed:', err);
      }
    }
    const local = getLocalData<Expense[]>(LOCAL_STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    const index = local.findIndex((e) => e.id === expense.id);
    if (index >= 0) {
      local[index] = expense;
    } else {
      local.unshift(expense);
    }
    setLocalData(LOCAL_STORAGE_KEYS.EXPENSES, local);
    return expense;
  },

  async deleteExpense(id: string): Promise<boolean> {
    if (getAuthToken()) {
      try {
        await api.deleteExpense(id);
      } catch (err) {
        console.warn('Neon Postgres deleteExpense failed:', err);
      }
    }
    const local = getLocalData<Expense[]>(LOCAL_STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    const updated = local.filter((e) => e.id !== id);
    setLocalData(LOCAL_STORAGE_KEYS.EXPENSES, updated);
    return true;
  },

  // ALERTS
  async getAlerts(month?: string): Promise<BudgetAlert[]> {
    if (getAuthToken()) {
      try {
        const data = await api.getAlerts();
        if (data) {
          setLocalData(LOCAL_STORAGE_KEYS.ALERTS, data);
          if (month) return data.filter((a) => a.month === month);
          return data;
        }
      } catch (err) {
        console.warn('Neon Postgres getAlerts failed:', err);
      }
    }
    const local = getLocalData<BudgetAlert[]>(LOCAL_STORAGE_KEYS.ALERTS, []);
    if (month) return local.filter((a) => a.month === month);
    return local;
  },

  async saveAlert(alert: BudgetAlert): Promise<BudgetAlert> {
    if (getAuthToken()) {
      try {
        const saved = await api.saveAlert(alert);
        const local = getLocalData<BudgetAlert[]>(LOCAL_STORAGE_KEYS.ALERTS, []);
        local.unshift(saved);
        setLocalData(LOCAL_STORAGE_KEYS.ALERTS, local);
        return saved;
      } catch (err) {
        console.warn('Neon Postgres saveAlert failed:', err);
      }
    }
    const local = getLocalData<BudgetAlert[]>(LOCAL_STORAGE_KEYS.ALERTS, []);
    local.unshift(alert);
    setLocalData(LOCAL_STORAGE_KEYS.ALERTS, local);
    return alert;
  },

  async markAlertAsRead(id: string): Promise<boolean> {
    if (getAuthToken()) {
      try {
        await api.markAlertAsRead(id);
      } catch (err) {
        console.warn('Neon Postgres markAlertAsRead failed:', err);
      }
    }
    const local = getLocalData<BudgetAlert[]>(LOCAL_STORAGE_KEYS.ALERTS, []);
    const updated = local.map((a) => (a.id === id ? { ...a, is_read: true } : a));
    setLocalData(LOCAL_STORAGE_KEYS.ALERTS, updated);
    return true;
  },

  async clearAllAlerts(): Promise<boolean> {
    if (getAuthToken()) {
      try {
        await api.clearAlerts();
      } catch (err) {
        console.warn('Neon Postgres clearAlerts failed:', err);
      }
    }
    setLocalData(LOCAL_STORAGE_KEYS.ALERTS, []);
    return true;
  },

  // USER SETTINGS
  async getSettings(): Promise<UserSettings> {
    if (getAuthToken()) {
      try {
        const data = await api.getSettings();
        if (data) {
          setLocalData(LOCAL_STORAGE_KEYS.SETTINGS, data);
          return data;
        }
      } catch (err) {
        console.warn('Neon Postgres getSettings failed:', err);
      }
    }
    return getLocalData<UserSettings>(LOCAL_STORAGE_KEYS.SETTINGS, DEFAULT_USER_SETTINGS);
  },

  async saveSettings(settings: UserSettings): Promise<UserSettings> {
    if (getAuthToken()) {
      try {
        const saved = await api.saveSettings(settings);
        setLocalData(LOCAL_STORAGE_KEYS.SETTINGS, saved);
        return saved;
      } catch (err) {
        console.warn('Neon Postgres saveSettings failed:', err);
      }
    }
    setLocalData(LOCAL_STORAGE_KEYS.SETTINGS, settings);
    return settings;
  },

  // Reset to initial clean state
  resetAllData(): void {
    setLocalData(LOCAL_STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    setLocalData(LOCAL_STORAGE_KEYS.INCOMES, INITIAL_INCOME_SOURCES);
    setLocalData(LOCAL_STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    setLocalData(LOCAL_STORAGE_KEYS.ALERTS, []);
    setLocalData(LOCAL_STORAGE_KEYS.SETTINGS, DEFAULT_USER_SETTINGS);
  }
};
