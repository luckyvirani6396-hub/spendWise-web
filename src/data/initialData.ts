import { Category, IncomeSource, Expense, UserSettings } from '../types/finance';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-groceries',
    name: 'Food & Groceries',
    group_name: 'Food',
    monthly_limit: 8000,
    icon: 'Utensils',
    color: '#10B981',
    description: 'Groceries, vegetables, daily meals & pantry',
    order_index: 1,
  },
  {
    id: 'cat-rent',
    name: 'Housing / Rent',
    group_name: 'Housing',
    monthly_limit: 12000,
    icon: 'Home',
    color: '#3B82F6',
    description: 'Apartment rent, housing & maintenance',
    order_index: 2,
  },
  {
    id: 'cat-utilities',
    name: 'Utilities & Bills',
    group_name: 'Bills',
    monthly_limit: 2500,
    icon: 'Zap',
    color: '#F59E0B',
    description: 'Electricity, gas, water & society dues',
    order_index: 3,
  },
  {
    id: 'cat-transport',
    name: 'Transport & Fuel',
    group_name: 'Travel',
    monthly_limit: 3000,
    icon: 'Train',
    color: '#8B5CF6',
    description: 'Metro, cab rides, petrol & commute',
    order_index: 4,
  },
  {
    id: 'cat-shopping',
    name: 'Shopping & Clothes',
    group_name: 'Personal',
    monthly_limit: 3000,
    icon: 'ShoppingBag',
    color: '#EC4899',
    description: 'Clothes, online shopping & personal items',
    order_index: 5,
  },
  {
    id: 'cat-mobile',
    name: 'Mobile & Internet',
    group_name: 'Bills',
    monthly_limit: 1000,
    icon: 'Wifi',
    color: '#06B6D4',
    description: 'Mobile recharge, Wi-Fi & subscriptions',
    order_index: 6,
  },
  {
    id: 'cat-entertainment',
    name: 'Dining & Entertainment',
    group_name: 'Personal',
    monthly_limit: 2500,
    icon: 'Coffee',
    color: '#F43F5E',
    description: 'Cafes, movies, weekend outings & dining out',
    order_index: 7,
  },
  {
    id: 'cat-health',
    name: 'Health & Pharmacy',
    group_name: 'Personal',
    monthly_limit: 1500,
    icon: 'Heart',
    color: '#EF4444',
    description: 'Medicines, consultations & fitness',
    order_index: 8,
  },
  {
    id: 'cat-investment',
    name: 'Savings & SIP',
    group_name: 'Financial',
    monthly_limit: 5000,
    icon: 'TrendingUp',
    color: '#059669',
    description: 'Monthly savings, emergency fund & mutual funds',
    order_index: 9,
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
