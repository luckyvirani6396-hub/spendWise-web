import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Moon, X, AlertTriangle, CheckCircle, Share2, Copy } from 'lucide-react';
import { format } from 'date-fns';

interface DailySummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailySummaryModal: React.FC<DailySummaryModalProps> = ({ isOpen, onClose }) => {
  const { 
    expenses, 
    categories, 
    categoryStatuses, 
    totalSpent, 
    remainingBudget, 
    settings 
  } = useFinance();

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todayExpenses = expenses.filter((e) => e.date === todayStr);
  const todayTotal = todayExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  // Group by category
  const catTotals: { [name: string]: number } = {};
  todayExpenses.forEach((exp) => {
    const cat = categories.find((c) => c.id === exp.category_id);
    const catName = cat ? cat.name : 'Other';
    catTotals[catName] = (catTotals[catName] || 0) + Number(exp.amount);
  });

  const categoryBreakdown = Object.entries(catTotals).map(([name, amount]) => ({
    name,
    amount,
  }));

  const warningCategories = categoryStatuses.filter((cs) => cs.percentUsed >= 70);

  const summaryText = 
    `🌙 Daily Expense Summary (${format(new Date(), 'dd MMMM yyyy')})\n\n` +
    `Today's spending: ${settings.currency_symbol}${todayTotal.toLocaleString()}\n\n` +
    (categoryBreakdown.length > 0 
      ? categoryBreakdown.map((b) => `• ${b.name} — ${settings.currency_symbol}${b.amount.toLocaleString()}`).join('\n')
      : 'No expenses recorded today.') +
    (warningCategories.length > 0 
      ? `\n\n⚠️ Warnings:\n` + warningCategories.map((w) => `• ${w.category.name}: ${w.percentUsed}% used`).join('\n')
      : '') +
    `\n\nMonthly Total: ${settings.currency_symbol}${totalSpent.toLocaleString()}` +
    `\nRemaining: ${settings.currency_symbol}${remainingBudget.toLocaleString()}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F4F8F5] flex flex-col sm:items-center sm:justify-center sm:p-4 sm:bg-slate-900/40 sm:backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full h-full sm:h-auto sm:max-w-md sm:rounded-[32px] shadow-2xl overflow-y-auto border-0 sm:border border-slate-100 flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900">10:00 PM Summary</h2>
              <p className="text-[10px] text-slate-400 font-medium">Daily Expense Digest & Reminder</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Today Total Card */}
          <div className="p-5 bg-gradient-to-tr from-[#0F6443] to-[#10B981] text-white rounded-2xl shadow-sm text-center">
            <span className="text-xs font-semibold text-emerald-100">Today's Total Spending</span>
            <div className="text-3xl font-black mt-1">
              {settings.currency_symbol}{todayTotal.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-200 mt-1 inline-block">
              {format(new Date(), 'dd MMMM yyyy')}
            </span>
          </div>

          {/* Breakdown by Category */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-800">Category Breakdown</span>
            {categoryBreakdown.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-2xl text-center text-xs text-slate-400">
                No expenses logged for today yet.
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-2xl divide-y divide-slate-100 text-xs">
                {categoryBreakdown.map((item) => (
                  <div key={item.name} className="py-2 flex items-center justify-between first:pt-0 last:pb-0">
                    <span className="font-medium text-slate-700">{item.name}</span>
                    <span className="font-bold text-slate-900">
                      {settings.currency_symbol}{item.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Warnings */}
          {warningCategories.length > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl space-y-1.5 text-xs text-amber-900">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Budget Warnings</span>
              </div>
              <ul className="space-y-1 text-[11px] text-amber-800/90 pl-5 list-disc">
                {warningCategories.map((w) => (
                  <li key={w.category.id}>
                    {w.category.name}: {w.percentUsed}% used of {settings.currency_symbol}{w.limit.toLocaleString()}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Copy / Share Button */}
          <button
            onClick={handleCopy}
            className="w-full py-3 bg-[#0F6443] hover:bg-[#0b4d33] text-white font-bold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Summary Text</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
