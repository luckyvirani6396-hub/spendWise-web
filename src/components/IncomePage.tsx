import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Plus, Home, Trash2, CheckCircle2, Clock, Check } from 'lucide-react';
import { format } from 'date-fns';
import { AddIncomeModal } from './AddIncomeModal';
import { IncomeSource } from '../types/finance';

export const IncomePage: React.FC = () => {
  const { incomes, totalMonthlyIncome, settings, selectedMonth, updateIncome, deleteIncome } = useFinance();
  const [activeFilter, setActiveFilter] = useState<'All' | 'Received' | 'Pending' | 'Recurring'>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filters: ('All' | 'Received' | 'Pending' | 'Recurring')[] = ['All', 'Received', 'Pending', 'Recurring'];

  const filtered = incomes.filter((i) => {
    if (activeFilter === 'Recurring') return i.is_recurring;
    if (activeFilter === 'Received') return (i.status || 'received') === 'received';
    if (activeFilter === 'Pending') return i.status === 'pending';
    return true;
  });

  const displayList = filtered;

  const totalReceived = incomes
    .filter((i) => (i.status || 'received') === 'received')
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const totalPending = incomes
    .filter((i) => i.status === 'pending')
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const counts = {
    All: incomes.length,
    Received: incomes.filter((i) => (i.status || 'received') === 'received').length,
    Pending: incomes.filter((i) => i.status === 'pending').length,
    Recurring: incomes.filter((i) => i.is_recurring).length,
  };

  const handleToggleStatus = async (item: IncomeSource) => {
    try {
      setUpdatingId(item.id);
      const nextStatus = item.status === 'pending' ? 'received' : 'pending';
      await updateIncome({ ...item, status: nextStatus });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this income record?')) {
      await deleteIncome(id);
    }
  };

  const colors = ['#10B981', '#8B5CF6', '#F59E0B', '#3B82F6'];

  const formatIncomeDate = (item: IncomeSource) => {
    if (item.date) {
      try {
        const d = new Date(item.date);
        return format(d, 'dd MMM yyyy');
      } catch {
        return item.date;
      }
    }
    return item.is_recurring ? 'Recurring • 1st of month' : 'One-time';
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto pb-10">
      
      {/* Header */}
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

      {/* Forest Green Monthly Income Banner */}
      <div className="p-6 rounded-3xl bg-[#0F6443] text-white shadow-md shadow-emerald-950/15 relative overflow-hidden space-y-3">
        <div className="flex items-center justify-between">
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

        {/* Received vs Pending Breakdown */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-emerald-700/40 text-xs">
          <div className="flex items-center gap-1.5 bg-emerald-800/60 px-3 py-1 rounded-xl text-emerald-100 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-300" />
            <span>Received: {settings.currency_symbol}{totalReceived.toLocaleString()}</span>
          </div>

          {totalPending > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-500/20 px-3 py-1 rounded-xl text-amber-200 font-semibold border border-amber-400/30">
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
              <span>Pending: {settings.currency_symbol}{totalPending.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Filter Pill Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filters.map((tab) => {
          const isActive = activeFilter === tab;
          const count = counts[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#0F6443] text-white shadow-xs'
                  : 'bg-white border border-slate-100 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{tab}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
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
          <h3 className="font-bold text-slate-800 text-sm">
            {activeFilter === 'All' ? 'No Income Sources Added' : `No ${activeFilter} Incomes`}
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {activeFilter === 'All'
              ? `You haven't added any income sources for ${selectedMonth} yet. Add your salary or earnings to start tracking!`
              : `There are currently no income entries categorized as ${activeFilter.toLowerCase()}.`}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#0F6443] hover:bg-[#0b4d33] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Income</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayList.map((item, idx) => {
            const color = colors[idx % colors.length];
            const isPending = item.status === 'pending';
            const isUpdating = updatingId === item.id;

            return (
              <div
                key={item.id}
                className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between transition hover:border-slate-200 gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
                    style={{
                      backgroundColor: `${color}18`,
                      color: color,
                    }}
                  >
                    <Home className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-xs text-slate-900 truncate">{item.name}</h3>
                      {/* Status Badge */}
                      {isPending ? (
                        <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Pending
                        </span>
                      ) : (
                        <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Received
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-400 font-medium mt-0.5 flex flex-wrap items-center gap-1.5">
                      <span>{formatIncomeDate(item)}</span>
                      {item.is_recurring && <span>• Recurring</span>}
                      {item.notes && <span className="text-slate-500">• {item.notes}</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div
                      className={`font-extrabold text-sm ${
                        isPending ? 'text-amber-600' : 'text-[#0F6443]'
                      }`}
                    >
                      +{settings.currency_symbol}
                      {Number(item.amount).toLocaleString()}
                    </div>
                    {isPending && (
                      <span className="text-[10px] text-amber-500 font-semibold block">Expected</span>
                    )}
                  </div>

                  {/* Mark as Received button for Pending income */}
                  {isPending && (
                    <button
                      onClick={() => handleToggleStatus(item)}
                      disabled={isUpdating}
                      title="Mark as Received"
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#0F6443] border border-emerald-200 rounded-xl text-[11px] font-bold transition flex items-center gap-1 active:scale-95"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Mark</span> Received
                    </button>
                  )}

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition"
                    title="Delete income"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
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

