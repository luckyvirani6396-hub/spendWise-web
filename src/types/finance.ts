export type CategoryGroup = 
  | 'Family' 
  | 'Housing' 
  | 'Food' 
  | 'Travel' 
  | 'Bills' 
  | 'Personal' 
  | 'Financial';

export type PaymentMethod = 
  | 'Cash' 
  | 'UPI' 
  | 'Debit Card' 
  | 'Credit Card' 
  | 'Bank Transfer' 
  | 'Other';

export interface Category {
  id: string;
  name: string;
  group_name: CategoryGroup;
  monthly_limit: number;
  icon: string;
  color: string;
  description?: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

export interface IncomeSource {
  id: string;
  name: string;
  amount: number;
  is_recurring: boolean;
  status: 'received' | 'pending';
  date: string; // YYYY-MM-DD
  month: string; // YYYY-MM
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Expense {
  id: string;
  category_id: string;
  amount: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  description: string;
  payment_method: PaymentMethod;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export type BudgetStatusLevel = 'safe' | 'warning' | 'critical' | 'exceeded';

export interface CategoryBudgetStatus {
  category: Category;
  limit: number;
  spent: number;
  remaining: number;
  percentUsed: number;
  statusLevel: BudgetStatusLevel;
  statusLabel: string;
}

export interface BudgetAlert {
  id: string;
  category_id?: string;
  type: 'warning' | 'critical' | 'exceeded' | 'daily_summary' | 'info';
  threshold_percent?: number;
  title: string;
  message: string;
  month: string;
  is_read: boolean;
  created_at: string;
}

export interface UserSettings {
  daily_summary_time: string; // e.g. "21:30"
  daily_summary_enabled: boolean;
  currency_symbol: string; // default "₹"
  browser_notifications_enabled: boolean;
}

export interface DailySummaryData {
  date: string;
  today_total: number;
  month_total: number;
  breakdown: { category: string; amount: number }[];
  warnings: string[];
}
