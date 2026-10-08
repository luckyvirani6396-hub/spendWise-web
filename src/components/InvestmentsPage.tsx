import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { TrendingUp, Plus } from 'lucide-react';
import { format, subMonths } from 'date-fns';

export const InvestmentsPage: React.FC = () => {
  const { categories, expenses, addExpense, settings, selectedMonth } = useFinance();
  const [showAddModal, setShowAddModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');

  // Find SIP/Investment category
  const sipCategory = categories.find(
    (c) => c.name.toLowerCase().includes('sip') || c.name.toLowerCase().includes('investment')
  ) || categories[0];

  // Real investment expenses from database
  const investmentExpenses = sipCategory
    ? expenses.filter((e) => e.category_id === sipCategory.id)
    : [];

  const thisMonthInvestments = investmentExpenses
    .filter((e) => e.date.startsWith(selectedMonth))
    .reduce((sum, e) => sum + Number(e.amount), 0);

  const totalInvestedAllTime = investmentExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  // Past 6 months dynamic trend
  const past6Months = Array.from({ length: 6 }).map((_, idx) => {
    const d = subMonths(new Date(), 5 - idx);
    const monthKey = format(d, 'yyyy-MM');
    const monthLabel = format(d, 'MMM');
    const mSpent = investmentExpenses
      .filter((e) => e.date.startsWith(monthKey))
      .reduce((sum, e) => sum + Number(e.amount), 0);
    return {
      month: monthLabel,
      amount: mSpent,
      active: monthKey === selectedMonth,
    };
  });

  const maxAmount = Math.max(...past6Months.map((m) => m.amount), 1);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount || !sipCategory) return;
    await addExpense({
      category_id: sipCategory.id,
      amount: Number(amount),
      date: format(new Date(), 'yyyy-MM-dd'),
      time: format(new Date(), 'HH:mm'),
      description: name.trim(),
      payment_method: 'Bank Transfer',
      notes: 'Investment',
    });
    setName('');
    setAmount('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Investments</h1>
          <p className="text-xs text-slate-500 font-medium">Grow your wealth with regular SIPs & funds</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#0F6443] hover:bg-[#0b4d33] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add</span>
        </button>
      </div>

      {/* Monthly SIP Card */}
      <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-400">Monthly SIP / Investments</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {settings.currency_symbol}{thisMonthInvestments.toLocaleString()}
          </div>
        </div>
        <div className="flex items-end gap-1.5 h-12">
          <div className="w-2.5 h-6 bg-purple-200 rounded-t-sm" />
          <div className="w-2.5 h-8 bg-purple-300 rounded-t-sm" />
          <div className="w-2.5 h-10 bg-purple-400 rounded-t-sm" />
          <div className="w-2.5 h-12 bg-purple-600 rounded-t-sm" />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400">Total Invested</div>
          <div className="text-xl font-black text-slate-900 mt-1">
            {settings.currency_symbol}{totalInvestedAllTime.toLocaleString()}
          </div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400">This Month</div>
          <div className="text-xl font-black text-slate-900 mt-1 text-[#0F6443]">
            {settings.currency_symbol}{thisMonthInvestments.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Monthly Bar Chart Card */}
      <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800">Monthly Investment Trend</span>
          <span className="text-[11px] font-bold text-[#0F6443]">Last 6 Months</span>
        </div>

        <div className="h-44 pt-6 flex items-end justify-between px-2">
          {past6Months.map((item) => {
            const heightPct = item.amount > 0 ? Math.max(15, Math.round((item.amount / maxAmount) * 100)) : 6;
            return (
              <div key={item.month} className="flex flex-col items-center gap-2 flex-1 relative">
                {item.amount > 0 && (
                  <span className="absolute -top-7 px-1.5 py-0.5 bg-slate-900 text-white text-[9px] font-bold rounded shadow-sm">
                    {settings.currency_symbol}{item.amount.toLocaleString()}
                  </span>
                )}
                <div className="w-6 sm:w-8 bg-slate-100 rounded-t-lg h-32 flex items-end overflow-hidden">
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      item.active ? 'bg-[#0F6443]' : 'bg-emerald-500/70 hover:bg-emerald-600'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className={`text-[10px] font-bold ${item.active ? 'text-[#0F6443]' : 'text-slate-400'}`}>
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Investments List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800">Recent Investments</h3>
          <span className="text-[11px] font-semibold text-slate-400">History</span>
        </div>

        {investmentExpenses.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">No Investments Recorded</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Start building wealth. Record your SIPs, Mutual Funds, or Gold investments!
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-[#0F6443] hover:bg-[#0b4d33] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Investment</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {investmentExpenses.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between transition hover:border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{item.description}</div>
                    <div className="text-[11px] text-slate-400">{item.date} • {item.payment_method}</div>
                  </div>
                </div>
                <div className="font-extrabold text-sm text-slate-900">
                  {settings.currency_symbol}{Number(item.amount).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#F4F8F5] flex flex-col sm:items-center sm:justify-center sm:p-4 sm:bg-slate-900/40 sm:backdrop-blur-xs animate-in fade-in duration-150">
          <form onSubmit={handleAdd} className="bg-white w-full h-full sm:h-auto sm:max-w-md sm:rounded-3xl p-6 shadow-2xl border-0 sm:border border-slate-100 space-y-4 overflow-y-auto flex flex-col justify-between sm:justify-start">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 sm:border-0 sm:pb-0">
                <h3 className="font-black text-slate-900 text-base sm:text-lg">Add Investment</h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Plan / Scheme Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nifty 50 Index Fund SIP"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0F6443] focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Amount ({settings.currency_symbol})</label>
                <input
                  type="number"
                  required
                  placeholder="5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0F6443] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2.5 text-xs text-slate-600 font-bold hover:bg-gray-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0F6443] hover:bg-[#0b4d33] text-white text-xs font-bold rounded-xl transition shadow-xs"
              >
                Save Investment
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
