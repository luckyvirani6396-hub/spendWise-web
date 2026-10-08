import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Category, 
  IncomeSource, 
  Expense, 
  BudgetAlert, 
  UserSettings, 
  CategoryBudgetStatus,
  BudgetStatusLevel,
  DailySummaryData
} from '../types/finance';
import { dbService } from '../lib/db';
import { getApiBaseUrl, getAuthToken } from '../lib/api';
import { format } from 'date-fns';
import { useAuth } from './AuthContext';

interface FinanceContextType {
  // Data
  categories: Category[];
  incomes: IncomeSource[];
  expenses: Expense[];
  alerts: BudgetAlert[];
  settings: UserSettings;
  selectedMonth: string; // YYYY-MM
  loading: boolean;
  unreadAlertsCount: number;

  // Dynamic Calculated Totals
  totalMonthlyIncome: number;
  totalAllocatedBudget: number;
  unallocatedBudget: number;
  totalSpent: number;
  totalInvestments: number;
  remainingBudget: number;
  todaySpent: number;
  categoryStatuses: CategoryBudgetStatus[];

  // Mutations
  setSelectedMonth: (month: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) => Promise<Expense>;
  updateExpense: (expense: Expense) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  
  addIncome: (income: Omit<IncomeSource, 'id' | 'created_at' | 'updated_at'>) => Promise<IncomeSource>;
  updateIncome: (income: IncomeSource) => Promise<IncomeSource>;
  deleteIncome: (id: string) => Promise<void>;

  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  updateCategory: (category: Category) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;

  markAlertAsRead: (id: string) => Promise<void>;
  clearAllAlerts: () => Promise<void>;
  updateSettings: (settings: UserSettings) => Promise<void>;

  // Daily Summary / Notifications
  triggerDailyExpenseSummary: () => Promise<DailySummaryData>;
  refreshData: () => Promise<void>;
  resetToDefault: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const currentMonth = format(new Date(), 'yyyy-MM');
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [categories, setCategories] = useState<Category[]>([]);
  const [incomes, setIncomes] = useState<IncomeSource[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    daily_summary_time: '21:30',
    daily_summary_enabled: true,
    currency_symbol: '₹',
    browser_notifications_enabled: true,
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Load all data
  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, incs, exps, alrts, sttgs] = await Promise.all([
        dbService.getCategories(),
        dbService.getIncomeSources(),
        dbService.getExpenses(),
        dbService.getAlerts(),
        dbService.getSettings(),
      ]);

      setCategories(cats);
      setIncomes(incs);
      setExpenses(exps);
      setAlerts(alrts);
      setSettings(sttgs);
    } catch (err) {
      console.error('Failed to load financial data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData, user?.id]);

  // Request browser notification permission if enabled
  useEffect(() => {
    if ('Notification' in window && settings.browser_notifications_enabled) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [settings.browser_notifications_enabled]);

  // Client-side timer check for daily reminder & summary at configured time (default 22:00 / 10:00 PM)
  useEffect(() => {
    if (!settings.daily_summary_enabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const targetTime = settings.daily_summary_time || '22:00';

      if (currentTimeStr === targetTime && now.getSeconds() < 15) {
        // Trigger reminder if not already created today
        const todayStr = format(now, 'yyyy-MM-dd');
        const alreadyTriggeredKey = `reminder_sent_${todayStr}`;
        if (!sessionStorage.getItem(alreadyTriggeredKey)) {
          sessionStorage.setItem(alreadyTriggeredKey, 'true');
          triggerDailyExpenseSummary();
        }
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [settings]);

  // Filtered lists for the active month
  const monthIncomes = useMemo(() => {
    return incomes.filter((i) => i.month === selectedMonth);
  }, [incomes, selectedMonth]);

  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => e.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  // Today's expenses
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todaySpent = useMemo(() => {
    return expenses
      .filter((e) => e.date === todayStr)
      .reduce((sum, e) => sum + Number(e.amount), 0);
  }, [expenses, todayStr]);

  // 1. Dynamic Total Monthly Income
  const totalMonthlyIncome = useMemo(() => {
    if (monthIncomes.length > 0) {
      return monthIncomes.reduce((sum, i) => sum + Number(i.amount), 0);
    }
    // If no explicit records for this month yet, take recurring incomes
    const recurring = incomes.filter((i) => i.is_recurring);
    if (recurring.length > 0) {
      return recurring.reduce((sum, i) => sum + Number(i.amount), 0);
    }
    return 0;
  }, [monthIncomes, incomes]);

  // 2. Dynamic Total Allocated Budget
  const totalAllocatedBudget = useMemo(() => {
    return categories.reduce((sum, c) => sum + Number(c.monthly_limit), 0);
  }, [categories]);

  // 3. Dynamic Unallocated Budget
  const unallocatedBudget = useMemo(() => {
    return totalMonthlyIncome - totalAllocatedBudget;
  }, [totalMonthlyIncome, totalAllocatedBudget]);

  // 4. Dynamic Total Spent for selected month
  const totalSpent = useMemo(() => {
    return monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  }, [monthExpenses]);

  // 5. Dynamic Investments (Category: SIP / Investment)
  const totalInvestments = useMemo(() => {
    const sipCategory = categories.find((c) => c.name.toLowerCase().includes('sip') || c.name.toLowerCase().includes('investment'));
    if (!sipCategory) return 0;
    const spent = monthExpenses
      .filter((e) => e.category_id === sipCategory.id)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return spent;
  }, [categories, monthExpenses]);

  // 6. Remaining budget overall (Income minus total spent)
  const remainingBudget = useMemo(() => {
    if (totalMonthlyIncome > 0) {
      return Math.max(0, totalMonthlyIncome - totalSpent);
    }
    return 0;
  }, [totalMonthlyIncome, totalSpent]);

  // 7. Category Budget Statuses
  const categoryStatuses = useMemo<CategoryBudgetStatus[]>(() => {
    return categories.map((cat) => {
      const catSpent = monthExpenses
        .filter((e) => e.category_id === cat.id)
        .reduce((sum, e) => sum + Number(e.amount), 0);

      const limit = Number(cat.monthly_limit);
      const remaining = limit - catSpent;
      const percentUsed = limit > 0 ? Math.round((catSpent / limit) * 100) : 0;

      let statusLevel: BudgetStatusLevel = 'safe';
      let statusLabel = 'Safe';

      if (percentUsed >= 100) {
        statusLevel = 'exceeded';
        statusLabel = 'Exceeded';
      } else if (percentUsed >= 90) {
        statusLevel = 'critical';
        statusLabel = 'Critical';
      } else if (percentUsed >= 70) {
        statusLevel = 'warning';
        statusLabel = 'Warning';
      } else {
        statusLevel = 'safe';
        statusLabel = 'Safe';
      }

      return {
        category: cat,
        limit,
        spent: catSpent,
        remaining,
        percentUsed,
        statusLevel,
        statusLabel,
      };
    });
  }, [categories, monthExpenses]);

  // 8. Alerts check and generation function (Threshold checks: 70%, 90%, 100%)
  const checkBudgetThresholds = async (categoryId: string, addedExpense: Expense) => {
    const cat = categories.find((c) => c.id === categoryId);
    if (!cat || cat.monthly_limit <= 0) return;

    // Recalculate spending with this new expense included
    const allCatExpenses = [...expenses, addedExpense].filter(
      (e) => e.category_id === categoryId && e.date.startsWith(selectedMonth)
    );
    const newSpent = allCatExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const limit = cat.monthly_limit;
    const percent = (newSpent / limit) * 100;

    let alertType: 'warning' | 'critical' | 'exceeded' | null = null;
    let title = '';
    let message = '';

    if (percent >= 100) {
      alertType = 'exceeded';
      const exceededBy = newSpent - limit;
      title = `🔴 ${cat.name} budget exceeded`;
      message = `Budget: ${settings.currency_symbol}${limit.toLocaleString()} | Spent: ${settings.currency_symbol}${newSpent.toLocaleString()} | Exceeded by: ${settings.currency_symbol}${exceededBy.toLocaleString()}`;
    } else if (percent >= 90) {
      alertType = 'critical';
      const remaining = limit - newSpent;
      title = `🟠 ${cat.name} budget almost exhausted`;
      message = `Only ${settings.currency_symbol}${remaining.toLocaleString()} remains out of ${settings.currency_symbol}${limit.toLocaleString()} (${Math.round(percent)}% used).`;
    } else if (percent >= 70) {
      alertType = 'warning';
      title = `🟡 ${cat.name} budget warning`;
      message = `You have used ${Math.round(percent)}% of your ${settings.currency_symbol}${limit.toLocaleString()} budget.`;
    }

    if (alertType) {
      // Check if duplicate alert of same type already exists for this category this month
      const duplicateExists = alerts.some(
        (a) => a.category_id === categoryId && a.type === alertType && a.month === selectedMonth
      );

      if (!duplicateExists) {
        const newAlert: BudgetAlert = {
          id: `alert-${Date.now()}`,
          category_id: categoryId,
          type: alertType,
          threshold_percent: percent,
          title,
          message,
          month: selectedMonth,
          is_read: false,
          created_at: new Date().toISOString(),
        };

        const saved = await dbService.saveAlert(newAlert);
        setAlerts((prev) => [saved, ...prev]);

        // Browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted' && settings.browser_notifications_enabled) {
          try {
            new Notification(title, {
              body: message,
              icon: '/favicon.svg',
            });
          } catch (e) {
            console.error('Notification dispatch error:', e);
          }
        }
      }
    }
  };

  // Add Expense
  const addExpense = async (data: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): Promise<Expense> => {
    const newExpense: Expense = {
      ...data,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };

    const saved = await dbService.saveExpense(newExpense);
    setExpenses((prev) => [saved, ...prev]);

    // Check thresholds
    await checkBudgetThresholds(data.category_id, saved);
    return saved;
  };

  const updateExpense = async (expense: Expense): Promise<Expense> => {
    const updated = await dbService.saveExpense(expense);
    setExpenses((prev) => prev.map((e) => (e.id === expense.id ? updated : e)));
    return updated;
  };

  const deleteExpense = async (id: string): Promise<void> => {
    await dbService.deleteExpense(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Income Operations
  const addIncome = async (data: Omit<IncomeSource, 'id' | 'created_at' | 'updated_at'>): Promise<IncomeSource> => {
    const newIncome: IncomeSource = {
      ...data,
      id: `inc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString(),
    };
    const saved = await dbService.saveIncomeSource(newIncome);
    setIncomes((prev) => [saved, ...prev]);
    return saved;
  };

  const updateIncome = async (income: IncomeSource): Promise<IncomeSource> => {
    const updated = await dbService.saveIncomeSource(income);
    setIncomes((prev) => prev.map((i) => (i.id === income.id ? updated : i)));
    return updated;
  };

  const deleteIncome = async (id: string): Promise<void> => {
    await dbService.deleteIncomeSource(id);
    setIncomes((prev) => prev.filter((i) => i.id !== id));
  };

  // Category Operations
  const addCategory = async (data: Omit<Category, 'id'>): Promise<Category> => {
    const newCat: Category = {
      ...data,
      id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      order_index: categories.length + 1,
    };
    const saved = await dbService.saveCategory(newCat);
    setCategories((prev) => [...prev, saved]);
    return saved;
  };

  const updateCategory = async (category: Category): Promise<Category> => {
    const updated = await dbService.saveCategory(category);
    setCategories((prev) => prev.map((c) => (c.id === category.id ? updated : c)));
    return updated;
  };

  const deleteCategory = async (id: string): Promise<void> => {
    await dbService.deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // Alerts
  const markAlertAsRead = async (id: string): Promise<void> => {
    await dbService.markAlertAsRead(id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_read: true } : a)));
  };

  const clearAllAlerts = async (): Promise<void> => {
    await dbService.clearAllAlerts();
    setAlerts([]);
  };

  // Settings
  const updateSettings = async (newSettings: UserSettings): Promise<void> => {
    const saved = await dbService.saveSettings(newSettings);
    setSettings(saved);
  };

  // 9. DAILY EXPENSE SUMMARY GENERATOR
  const triggerDailyExpenseSummary = async (): Promise<DailySummaryData> => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayExpenses = expenses.filter((e) => e.date === today);
    const dayTotal = todayExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const monthTotal = totalSpent;

    // Group by category
    const catMap: { [catId: string]: number } = {};
    todayExpenses.forEach((e) => {
      catMap[e.category_id] = (catMap[e.category_id] || 0) + Number(e.amount);
    });

    const breakdown = Object.entries(catMap).map(([catId, amount]) => {
      const cat = categories.find((c) => c.id === catId);
      return {
        category: cat ? cat.name : 'Other',
        amount,
      };
    });

    const warnings: string[] = [];
    categoryStatuses.forEach((cs) => {
      if (cs.percentUsed >= 80) {
        warnings.push(`⚠️ ${cs.category.name} is now at ${cs.percentUsed}%.`);
      }
    });

    const breakdownText = breakdown.map((b) => `• ${b.category}: ${settings.currency_symbol}${b.amount}`).join('\n');
    const warningText = warnings.length > 0 ? `\n\n${warnings.join('\n')}` : '';

    const reminderTitle = `⏰ 10:00 PM Reminder — Log Today's Expenses`;
    const reminderMessage = dayTotal > 0 
      ? `Today's recorded spending: ${settings.currency_symbol}${dayTotal.toLocaleString()}\n\n` +
        `${breakdownText}\n` +
        warningText +
        `\n\nMonthly spending: ${settings.currency_symbol}${monthTotal.toLocaleString()}\n` +
        `Remaining monthly budget: ${settings.currency_symbol}${remainingBudget.toLocaleString()}\n\n` +
        `Did you miss any cash, UPI, or card payments today? Tap to record.`
      : `You haven't logged any expenses today yet! Did you spend on food, transit, or shopping? Tap to record before the day ends.\n\nRemaining monthly budget: ${settings.currency_symbol}${remainingBudget.toLocaleString()}`;

    const summaryAlert: BudgetAlert = {
      id: `daily-reminder-${Date.now()}`,
      type: 'daily_summary',
      title: reminderTitle,
      message: reminderMessage,
      month: selectedMonth,
      is_read: false,
      created_at: new Date().toISOString(),
    };

    const savedAlert = await dbService.saveAlert(summaryAlert);
    setAlerts((prev) => [savedAlert, ...prev]);

    // Dispatch system / browser notification
    if ('Notification' in window && Notification.permission === 'granted' && settings.browser_notifications_enabled) {
      try {
        new Notification(reminderTitle, {
          body: dayTotal > 0
            ? `Today: ${settings.currency_symbol}${dayTotal.toLocaleString()} recorded. Did you miss any expenses today? Tap to check.`
            : `Did you spend on food, transit, or shopping today? Tap to record before the day ends.`,
          icon: '/favicon.svg',
        });
      } catch (err) {
        console.error('Failed to show browser notification:', err);
      }
    }

    // Call backend to trigger email reminder via user's configured Gmail
    try {
      const baseUrl = getApiBaseUrl();
      const token = getAuthToken();
      if (token) {
        fetch(`${baseUrl}/alerts/send-nightly-reminder`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            todaySpent: dayTotal,
            remainingBudget,
          }),
        }).catch(() => {});
      }
    } catch {
      // Ignore background fetch error
    }

    return {
      date: today,
      today_total: dayTotal,
      month_total: monthTotal,
      breakdown,
      warnings,
    };
  };

  const resetToDefault = () => {
    dbService.resetAllData();
    loadAllData();
  };

  const unreadAlertsCount = useMemo(() => {
    return alerts.filter((a) => !a.is_read).length;
  }, [alerts]);

  return (
    <FinanceContext.Provider
      value={{
        categories,
        incomes,
        expenses,
        alerts,
        settings,
        selectedMonth,
        loading,
        unreadAlertsCount,
        totalMonthlyIncome,
        totalAllocatedBudget,
        unallocatedBudget,
        totalSpent,
        totalInvestments,
        remainingBudget,
        todaySpent,
        categoryStatuses,
        setSelectedMonth,
        addExpense,
        updateExpense,
        deleteExpense,
        addIncome,
        updateIncome,
        deleteIncome,
        addCategory,
        updateCategory,
        deleteCategory,
        markAlertAsRead,
        clearAllAlerts,
        updateSettings,
        triggerDailyExpenseSummary,
        refreshData: loadAllData,
        resetToDefault,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
