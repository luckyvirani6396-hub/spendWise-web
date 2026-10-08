import { Category, IncomeSource, Expense, UserSettings } from '../types/finance';

export const INITIAL_CATEGORIES: Category[] = [
  // Family
  {
    id: 'cat-mom',
    name: 'Mom',
    group_name: 'Family',
    monthly_limit: 15000,
    icon: 'HeartHandshake',
    color: '#EC4899',
    description: 'Monthly family support for Mom',
    order_index: 1,
  },
  {
    id: 'cat-agra-elec',
    name: 'Agra Home Electricity',
    group_name: 'Family',
    monthly_limit: 2000,
    icon: 'Zap',
    color: '#F59E0B',
    description: 'Home electricity bill in Agra',
    order_index: 2,
  },
  // Housing
  {
    id: 'cat-noida-rent',
    name: 'Noida Rent',
    group_name: 'Housing',
    monthly_limit: 5000,
    icon: 'Home',
    color: '#3B82F6',
    description: 'Monthly apartment rent in Noida',
    order_index: 3,
  },
  {
    id: 'cat-noida-elec',
    name: 'Noida Electricity',
    group_name: 'Housing',
    monthly_limit: 250,
    icon: 'Lightbulb',
    color: '#EAB308',
    description: 'Noida accommodation power bill',
    order_index: 4,
  },
  {
    id: 'cat-maint',
    name: 'Maintenance',
    group_name: 'Housing',
    monthly_limit: 75,
    icon: 'Wrench',
    color: '#64748B',
    description: 'Building maintenance & society dues',
    order_index: 5,
  },
  // Food
  {
    id: 'cat-food',
    name: 'Food & Groceries',
    group_name: 'Food',
    monthly_limit: 2500,
    icon: 'Utensils',
    color: '#10B981',
    description: 'Daily groceries, vegetable markets & meals',
    order_index: 6,
  },
  // Travel
  {
    id: 'cat-travel',
    name: 'Noida ↔ Agra Travel',
    group_name: 'Travel',
    monthly_limit: 1600,
    icon: 'Train',
    color: '#8B5CF6',
    description: 'Up to two Noida ↔ Agra round trips per month at ₹800 per round trip',
    order_index: 7,
  },
  // Bills
  {
    id: 'cat-mobile',
    name: 'Mobile & Internet',
    group_name: 'Bills',
    monthly_limit: 300,
    icon: 'Wifi',
    color: '#06B6D4',
    description: 'Mobile data recharge and internet',
    order_index: 8,
  },
  // Personal
  {
    id: 'cat-personal',
    name: 'Personal',
    group_name: 'Personal',
    monthly_limit: 1000,
    icon: 'ShoppingBag',
    color: '#F43F5E',
    description: 'Hangouts, clothes, grooming, small personal purchases',
    order_index: 9,
  },
  // Financial
  {
    id: 'cat-emi',
    name: 'EMI',
    group_name: 'Financial',
    monthly_limit: 3636,
    icon: 'CreditCard',
    color: '#EF4444',
    description: 'Monthly installment obligations',
    order_index: 10,
  },
  {
    id: 'cat-sip',
    name: 'SIP / Investment',
    group_name: 'Financial',
    monthly_limit: 6000,
    icon: 'TrendingUp',
    color: '#059669',
    description: 'Systematic monthly mutual fund investments & wealth building',
    order_index: 11,
  },
];

const currentMonthStr = new Date().toISOString().slice(0, 7);
const todayStr = new Date().toISOString().slice(0, 10);

export const INITIAL_INCOME_SOURCES: IncomeSource[] = [];

export const INITIAL_EXPENSES: Expense[] = [];

export const DEFAULT_USER_SETTINGS: UserSettings = {
  daily_summary_time: '22:00',
  daily_summary_enabled: true,
  currency_symbol: '₹',
  browser_notifications_enabled: true,
};
