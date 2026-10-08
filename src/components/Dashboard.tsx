import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Wallet, 
  TrendingUp, 
  CreditCard, 
  ChevronRight, 
  Plus, 
  Bell, 
  PiggyBank, 
  Zap, 
  Sparkles,
  BarChart3,
  CheckCircle2,
  HelpCircle,
  X
} from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

interface DashboardProps {
  onOpenAddExpense: (categoryId?: string) => void;
  onOpenAddIncome?: () => void;
  onOpenHowItWorks?: () => void;
  onNavigateTab: (tab: string) => void;
  onTriggerDailySummary: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onOpenAddExpense, 
  onOpenAddIncome,
  onOpenHowItWorks,
  onNavigateTab,
  onTriggerDailySummary 
}) => {
  const { user } = useAuth();
  const { 
    incomes,
    totalMonthlyIncome, 
    totalAllocatedBudget, 
    totalSpent, 
    totalInvestments, 
    remainingBudget,
    categoryStatuses,
    expenses,
    settings,
    selectedMonth,
    unreadAlertsCount
  } = useFinance();

  // Onboarding Checklist State
  const [isDismissedOnboarding, setIsDismissedOnboarding] = useState<boolean>(() => {
    return localStorage.getItem('spendwise_dismissed_onboarding') === 'true';
  });

  const hasIncome = (incomes && incomes.length > 0) || totalMonthlyIncome > 0;
  const hasExpenses = (expenses && expenses.length > 0) || totalSpent > 0;
  const hasBudgets = categoryStatuses.some((c) => Number(c.limit) > 0);
  const completedCount = (hasIncome ? 1 : 0) + (hasBudgets ? 1 : 0) + (hasExpenses ? 1 : 0);

  // Auto-dismiss once completed all 3
  useEffect(() => {
    if (completedCount >= 3) {
      setIsDismissedOnboarding(true);
      localStorage.setItem('spendwise_dismissed_onboarding', 'true');
    }
  }, [completedCount]);

  const handleDismissOnboarding = () => {
    setIsDismissedOnboarding(true);
    localStorage.setItem('spendwise_dismissed_onboarding', 'true');
  };

  // Top 4 budget categories for Home Overview
  const topCategories = categoryStatuses.slice(0, 4);
  const recentExpenses = expenses.slice(0, 4);

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const userName = user?.name ? user.name.split(' ')[0] : 'Lucky';

  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-10">
      
      {/* 1. Header Greeting Section matching Screen 1 */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0F6443] to-[#10B981] flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
            {userName.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">
              {greeting},
            </div>
            <div className="text-base font-black text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>{userName}</span>
              <span>👋</span>
            </div>
            <div className="text-[11px] text-slate-400 hidden sm:block">
              Let's manage your money wisely
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* How It Works Guide Trigger */}
          <button
            onClick={() => onOpenHowItWorks?.()}
            className="px-3 py-1.5 bg-[#E8F5EE] hover:bg-[#d8efe2] text-[#0F6443] rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
            title="How SpendWise works"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">How It Works</span>
            <span className="sm:hidden">Guide</span>
          </button>

          {/* Quick Record Button */}
          <button
            onClick={() => onOpenAddExpense()}
            className="hidden sm:flex px-3.5 py-1.5 bg-[#0F6443] hover:bg-[#0b4d33] text-white rounded-xl text-xs font-bold items-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive "Getting Started (3 Steps)" Checklist for New Users */}
      {(!isDismissedOnboarding && completedCount < 3) && (
        <div className="bg-gradient-to-br from-[#FAFCFA] via-[#F0F8F3] to-[#E8F5EE] border border-emerald-200/80 rounded-3xl p-5 shadow-xs relative space-y-3.5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0F6443] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                🚀
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Welcome to SpendWise! Set Up in 3 Steps
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Follow this quick checklist to personalize your finances
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-white border border-emerald-200 text-[#0F6443] text-xs font-bold shadow-2xs">
                {completedCount}/3 Done
              </span>
              <button
                onClick={handleDismissOnboarding}
                className="px-2 py-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white/80 transition flex items-center gap-1 text-[11px] font-semibold"
                title="Dismiss setup guide"
              >
                <span>Hide</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-emerald-950/10 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#0F6443] h-full transition-all duration-500 rounded-full"
              style={{ width: `${(completedCount / 3) * 100}%` }}
            />
          </div>

          {/* 3 Step Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            
            {/* Step 1: Add Income */}
            <div className={`p-3.5 rounded-2xl border transition ${hasIncome ? 'bg-white/95 border-emerald-300 shadow-2xs' : 'bg-white border-slate-200/90'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 1</span>
                {hasIncome ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900">Add Monthly Income</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 mb-3 leading-relaxed">
                Add your salary or side earnings to set your spending baseline.
              </p>
              <button
                onClick={() => onOpenAddIncome?.()}
                className={`w-full py-1.5 px-2.5 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                  hasIncome 
                    ? 'bg-emerald-50 text-[#0F6443] hover:bg-emerald-100' 
                    : 'bg-[#0F6443] text-white hover:bg-[#0a4830] shadow-xs'
                }`}
              >
                <Plus className="w-3 h-3" />
                <span>{hasIncome ? 'Update Income' : 'Add Income'}</span>
              </button>
            </div>

            {/* Step 2: Set Budgets */}
            <div className={`p-3.5 rounded-2xl border transition ${hasBudgets ? 'bg-white/95 border-emerald-300 shadow-2xs' : 'bg-white border-slate-200/90'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 2</span>
                {hasBudgets ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900">Set Category Budgets</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 mb-3 leading-relaxed">
                Review limits for Groceries, Rent, Dining, and Shopping.
              </p>
              <button
                onClick={() => onNavigateTab('budgets')}
                className="w-full py-1.5 px-2.5 rounded-xl text-[11px] font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-1"
              >
                <span>Review Limits</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Step 3: Record Expense */}
            <div className={`p-3.5 rounded-2xl border transition ${hasExpenses ? 'bg-white/95 border-emerald-300 shadow-2xs' : 'bg-white border-slate-200/90'}`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Step 3</span>
                {hasExpenses ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900">Log First Expense</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 mb-3 leading-relaxed">
                Spent on food, coffee, or a ride today? Record it now.
              </p>
              <button
                onClick={() => onOpenAddExpense()}
                className={`w-full py-1.5 px-2.5 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 ${
                  hasExpenses 
                    ? 'bg-emerald-50 text-[#0F6443] hover:bg-emerald-100' 
                    : 'bg-[#0F6443] text-white hover:bg-[#0a4830] shadow-xs'
                }`}
              >
                <Plus className="w-3 h-3" />
                <span>{hasExpenses ? 'Add Expense' : 'Log Expense'}</span>
              </button>
            </div>

          </div>

          {/* Dismiss Helper Footer */}
          <div className="flex items-center justify-between pt-1 border-t border-emerald-950/5 text-[11px] text-slate-500">
            <span>{completedCount === 3 ? '🎉 All setup complete!' : `${3 - completedCount} steps remaining`}</span>
            <button
              onClick={handleDismissOnboarding}
              className="text-slate-400 hover:text-slate-700 hover:underline transition font-medium"
            >
              Don't show this again
            </button>
          </div>
        </div>
      )}

      {/* 3. Forest Green Monthly Income Card matching Screen 1 */}
      <div className="p-6 rounded-3xl bg-[#0F6443] text-white shadow-md shadow-emerald-950/15 relative overflow-hidden flex items-center justify-between">
        {/* Subtle decorative glow */}
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <span className="text-xs font-semibold text-emerald-200/90 tracking-wide">
            Monthly Income
          </span>
          <div className="text-3xl sm:text-4xl font-black tracking-tight">
            {settings.currency_symbol}
            {totalMonthlyIncome.toLocaleString()}
          </div>
        </div>

        {/* Action Button & Graphic */}
        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={() => onOpenAddIncome?.()}
            className="px-3.5 py-2 bg-white/20 hover:bg-white/30 border border-white/25 rounded-xl text-xs font-bold text-white flex items-center gap-1.5 transition active:scale-95 backdrop-blur-xs shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Income</span>
          </button>
          <div className="hidden sm:flex items-end gap-1.5 h-10 px-2 py-1">
            <div className="w-2 h-4 bg-emerald-400/40 rounded-t-sm" />
            <div className="w-2 h-6 bg-emerald-400/60 rounded-t-sm" />
            <div className="w-2 h-8 bg-emerald-400/80 rounded-t-sm" />
            <div className="w-2 h-10 bg-emerald-300 rounded-t-sm shadow-xs" />
          </div>
        </div>
      </div>

      {/* 3. Three Stat Cards Row: Total Spent / Investments / Remaining */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Total Spent */}
        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <span className="w-4 h-4 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center font-bold text-xs">
              ↓
            </span>
            <span>Total Spent</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900">
            {settings.currency_symbol}
            {totalSpent.toLocaleString()}
          </div>
        </div>

        {/* Investments */}
        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <span className="w-4 h-4 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xs">
              💰
            </span>
            <span>Investments</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900">
            {settings.currency_symbol}
            {totalInvestments.toLocaleString()}
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="col-span-2 sm:col-span-1 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
              💼
            </span>
            <span>Remaining</span>
          </div>
          <div className="text-lg sm:text-xl font-black text-[#0F6443]">
            {settings.currency_symbol}
            {remainingBudget.toLocaleString()}
          </div>
        </div>
      </div>

      {/* 4. Budget Overview Card matching Screen 1 */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 tracking-tight">
            Budget Overview
          </h2>
          <button
            onClick={() => onNavigateTab('budgets')}
            className="text-xs font-bold text-[#0F6443] hover:underline flex items-center gap-0.5"
          >
            <span>See All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* List of categories with progress */}
        <div className="space-y-4">
          {topCategories.map((cs) => {
            const limit = Number(cs.limit) || 1;
            const spent = Number(cs.spent) || 0;
            const pct = Math.min(100, Math.round((spent / limit) * 100));

            // Color coding according to budget level
            let barColor = '#10B981'; // Green
            if (pct >= 100) barColor = '#EF4444'; // Red
            else if (pct >= 80) barColor = '#F59E0B'; // Orange
            else if (pct >= 50) barColor = '#3B82F6'; // Blue

            return (
              <div key={cs.category.id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                      style={{
                        backgroundColor: `${cs.category.color}18`,
                        color: cs.category.color,
                      }}
                    >
                      <CategoryIcon name={cs.category.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        {cs.category.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium">
                        {settings.currency_symbol}{spent.toLocaleString()} / {settings.currency_symbol}{limit.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <span className={`text-xs font-extrabold ${pct >= 100 ? 'text-rose-600' : 'text-slate-700'}`}>
                    {pct}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Recent Transactions Preview */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-900 tracking-tight">
            Recent Expenses
          </h2>
          <button
            onClick={() => onNavigateTab('expenses')}
            className="text-xs font-bold text-[#0F6443] hover:underline flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            No expenses recorded yet. Tap <span className="font-bold text-[#0F6443] cursor-pointer" onClick={() => onOpenAddExpense()}>+ Add Expense</span> to start!
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentExpenses.map((exp) => (
              <div key={exp.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                    <CreditCard className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{exp.description}</div>
                    <div className="text-[11px] text-slate-400">{exp.date} • {exp.payment_method}</div>
                  </div>
                </div>
                <div className="text-xs font-extrabold text-slate-900">
                  {settings.currency_symbol}{Number(exp.amount).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
