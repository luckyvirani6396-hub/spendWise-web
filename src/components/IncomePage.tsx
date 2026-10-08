import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, TrendingUp, Wallet, Home, ArrowUpRight, DollarSign, Calendar } from 'lucide-react';
import { AddIncomeModal } from './AddIncomeModal';

export const IncomePage: React.FC = () => {
  const { incomes, totalMonthlyIncome, settings, selectedMonth } = useFinance();
  const [activeFilter, setActiveFilter] = useState<'All' | 'Received' | 'Pending' | 'Recurring'>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  const filters = ['All', 'Received', 'Pending', 'Recurring'];

  const filtered = incomes.filter((i) => {
    if (activeFilter === 'Recurring') return i.is_recurring;
    return true;
  });

  const displayList = filtered;

  const colors = ['#10B981', '#8B5CF6', '#F59E0B', '#3B82F6'];

  return (
    <div className="space-y-4 max-w-3xl mx-auto pb-10">
      
      {/* Header matching Screen 5 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Income</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#0F6443] hover:bg-[#0b4d33] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      {/* Forest Green Monthly Income Banner matching Screen 5 */}
      <div className="p-6 rounded-3xl bg-[#0F6443] text-white shadow-md shadow-emerald-950/15 relative overflow-hidden flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-emerald-200/90 tracking-wide">
            Monthly Income
          </span>
          <div className="text-3xl sm:text-4xl font-black tracking-tight">
            {settings.currency_symbol}
            {totalMonthlyIncome.toLocaleString()}
          </div>
        </div>

        <div className="flex items-end gap-1.5 h-10 px-2 py-1">
          <div className="w-2 h-4 bg-emerald-400/40 rounded-t-sm" />
          <div className="w-2 h-6 bg-emerald-400/60 rounded-t-sm" />
          <div className="w-2 h-8 bg-emerald-400/80 rounded-t-sm" />
          <div className="w-2 h-10 bg-emerald-300 rounded-t-sm" />
        </div>
      </div>

      {/* Filter Pill Tabs matching Screen 5 */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filters.map((tab) => {
          const isActive = activeFilter === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-[#0F6443] text-white shadow-xs'
                  : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Income Stream Cards List or Empty State */}
      {displayList.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-[#0F6443] flex items-center justify-center">
            <Plus className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No Income Sources Added</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            You haven't added any income sources for {selectedMonth} yet. Add your salary or earnings to start tracking!
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#0F6443] hover:bg-[#0b4d33] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Income</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayList.map((item, idx) => {
            const color = colors[idx % colors.length];
            return (
              <div
                key={item.id}
                className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between transition hover:border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
                    style={{
                      backgroundColor: `${color}18`,
                      color: color,
                    }}
                  >
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">{item.name}</h3>
                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                      {item.is_recurring ? 'Recurring • 1st of month' : 'One-time payment'}
                    </div>
                  </div>
                </div>

                <div className="font-extrabold text-sm text-[#0F6443]">
                  +{settings.currency_symbol}{Number(item.amount).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full-screen Add Income Modal */}
      <AddIncomeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

    </div>
  );
};
