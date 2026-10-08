import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const { 
    selectedMonth, 
    setSelectedMonth, 
    totalSpent, 
    expenses, 
    incomes, 
    settings, 
    categoryStatuses 
  } = useFinance();
  const [activeTab, setActiveTab] = useState<'Overview' | 'Category'>('Overview');

  // Dynamic weekly distribution from real incomes and expenses
  const currentMonthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));
  const currentMonthIncomes = incomes.filter((i) => i.month === selectedMonth);

  const getWeekIndex = (dateStr: string) => {
    const day = parseInt(dateStr.slice(8, 10), 10) || 1;
    if (day <= 7) return 0;
    if (day <= 14) return 1;
    if (day <= 21) return 2;
    return 3;
  };

  const weeklyData = [
    { name: 'Week 1', income: 0, expenses: 0 },
    { name: 'Week 2', income: 0, expenses: 0 },
    { name: 'Week 3', income: 0, expenses: 0 },
    { name: 'Week 4', income: 0, expenses: 0 },
  ];

  currentMonthIncomes.forEach((inc) => {
    const idx = inc.date ? getWeekIndex(inc.date) : 0;
    weeklyData[idx].income += Number(inc.amount);
  });

  currentMonthExpenses.forEach((exp) => {
    const idx = getWeekIndex(exp.date);
    weeklyData[idx].expenses += Number(exp.amount);
  });

  // Dynamic Category breakdown for donut chart (only categories with spent > 0)
  const categoryColors = ['#10B981', '#06B6D4', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6'];

  const pieData = categoryStatuses
    .filter((cs) => cs.spent > 0)
    .map((cs, idx) => ({
      name: cs.category.name,
      value: cs.spent,
      color: cs.category.color || categoryColors[idx % categoryColors.length],
    }));

  const totalSum = pieData.reduce((acc, cur) => acc + cur.value, 0);

  return (
    <div className="space-y-4 max-w-3xl mx-auto pb-10">
      
      {/* Header matching Screen 8 */}
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reports</h1>

      {/* Month Switcher Row */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white rounded-2xl border border-slate-100 shadow-xs text-xs font-bold text-slate-800">
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

      {/* Segmented Control: Overview vs Category matching Screen 8 */}
      <div className="grid grid-cols-2 p-1 bg-white border border-slate-100 rounded-2xl shadow-xs">
        <button
          onClick={() => setActiveTab('Overview')}
          className={`py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'Overview'
              ? 'bg-[#E6F4EA] text-[#0F6443] shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('Category')}
          className={`py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'Category'
              ? 'bg-[#E6F4EA] text-[#0F6443] shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Category
        </button>
      </div>

      {/* Income vs Expenses Chart Card */}
      <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold text-slate-800">Income vs Expenses</h2>
          <div className="flex items-center gap-3 text-[11px] font-bold">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#10B981] inline-block" />
              Income
            </span>
            <span className="flex items-center gap-1.5 text-rose-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#EF4444] inline-block" />
              Expenses
            </span>
          </div>
        </div>

        <div className="h-52 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} barGap={4}>
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
              />
              <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense by Category Donut Chart Card matching Screen 8 */}
      <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h2 className="text-xs font-extrabold text-slate-800">Expense by Category</h2>

        {pieData.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No expenses recorded for {selectedMonth} yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Donut Chart with Centered Total */}
            <div className="sm:col-span-6 relative h-48 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Centered label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-sm font-black text-slate-900">
                  {settings.currency_symbol}{totalSpent.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Total Spent</span>
              </div>
            </div>

            {/* Legend percentage list matching Screen 8 */}
            <div className="sm:col-span-6 space-y-2">
              {pieData.map((item) => {
                const pct = totalSum > 0 ? Math.round((item.value / totalSum) * 100) : 0;
                return (
                  <div key={item.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-slate-700">{item.name}</span>
                    </div>
                    <span className="font-extrabold text-slate-800">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
