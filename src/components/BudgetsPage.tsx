import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { ChevronLeft, ChevronRight, Plus, Target, Wallet } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

export const BudgetsPage: React.FC = () => {
  const { 
    categoryStatuses, 
    totalAllocatedBudget, 
    totalSpent, 
    selectedMonth, 
    setSelectedMonth, 
    settings 
  } = useFinance();

  const [activeFilter, setActiveFilter] = useState<string>('All');

  const groups = ['All', 'Family', 'Housing', 'Food', 'Travel', 'Bills', 'Personal'];

  const filtered = categoryStatuses.filter((item) => {
    if (activeFilter === 'All') return true;
    return item.category.group_name?.toLowerCase() === activeFilter.toLowerCase() ||
           item.category.name.toLowerCase().includes(activeFilter.toLowerCase());
  });

  const overallPct = totalAllocatedBudget > 0
    ? Math.min(100, Math.round((totalSpent / totalAllocatedBudget) * 100))
    : 0;

  return (
    <div className="space-y-4 max-w-3xl mx-auto pb-10">
      
      {/* Header matching Screen 4 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Budget</h1>
        <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-700 shadow-xs">
          <Wallet className="w-4 h-4 text-[#0F6443]" />
        </div>
      </div>

      {/* Month Switcher Row: < October 2026 > */}
      <div className="flex items-center justify-between px-3 py-2 bg-white rounded-2xl border border-slate-100 shadow-xs text-xs font-bold text-slate-800">
        <button
          onClick={() => {
            const [y, m] = selectedMonth.split('-').map(Number);
            const prev = new Date(y, m - 2, 1);
            setSelectedMonth(prev.toISOString().substring(0, 7));
          }}
          className="p-1 hover:text-[#0F6443] transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="font-extrabold text-sm">{selectedMonth}</span>
        <button
          onClick={() => {
            const [y, m] = selectedMonth.split('-').map(Number);
            const next = new Date(y, m, 1);
            setSelectedMonth(next.toISOString().substring(0, 7));
          }}
          className="p-1 hover:text-[#0F6443] transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Top Budget Summary Card matching Screen 4 */}
      <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-base font-black text-slate-900">
              {settings.currency_symbol}{totalAllocatedBudget.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-slate-400">Total Budget</div>
          </div>
          <div className="text-right">
            <div className="text-base font-black text-rose-600">
              {settings.currency_symbol}{totalSpent.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-slate-400">Total Spent</div>
          </div>
        </div>

        {/* Progress Bar & % Used label */}
        <div className="space-y-1.5">
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#10B981] rounded-full transition-all duration-500"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <div className="text-right text-[11px] font-bold text-slate-500">
            {overallPct}% used
          </div>
        </div>
      </div>

      {/* Filter Pill Tabs matching Screen 4 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {groups.map((group) => {
          const isActive = activeFilter === group;
          return (
            <button
              key={group}
              onClick={() => setActiveFilter(group)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-[#0F6443] text-white shadow-xs'
                  : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {group}
            </button>
          );
        })}
      </div>

      {/* Budget Categories List matching Screen 4 */}
      <div className="space-y-2.5">
        {filtered.map((cs) => {
          const limit = Number(cs.limit) || 1;
          const spent = Number(cs.spent) || 0;
          const pct = Math.min(100, Math.round((spent / limit) * 100));

          let barColor = '#10B981';
          if (pct >= 100) barColor = '#EF4444';
          else if (pct >= 80) barColor = '#F59E0B';
          else if (pct >= 50) barColor = '#3B82F6';

          return (
            <div
              key={cs.category.id}
              className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-2.5 transition hover:border-slate-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
                    style={{
                      backgroundColor: `${cs.category.color}18`,
                      color: cs.category.color,
                    }}
                  >
                    <CategoryIcon name={cs.category.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">{cs.category.name}</h3>
                    <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                      {settings.currency_symbol}{spent.toLocaleString()} / {settings.currency_symbol}{limit.toLocaleString()}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-xs font-black ${
                    pct >= 100 ? 'text-rose-600' : 'text-slate-700'
                  }`}
                >
                  {pct}%
                </span>
              </div>

              {/* Category Progress Bar */}
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
  );
};
