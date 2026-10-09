import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { Search, Plus, Trash2, Pencil } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';
import { Expense, IncomeSource } from '../types/finance';
import { AddExpenseModal } from './AddExpenseModal';
import { AddIncomeModal } from './AddIncomeModal';

interface ExpensesPageProps {
  onOpenAddExpense: (categoryId?: string) => void;
}

type TransactionFilter = 'All' | 'Income' | 'Expenses' | 'Investments';

export const ExpensesPage: React.FC<ExpensesPageProps> = ({ onOpenAddExpense }) => {
  const { expenses, incomes, categories, deleteExpense, deleteIncome, settings } = useFinance();
  const [activeFilter, setActiveFilter] = useState<TransactionFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingIncome, setEditingIncome] = useState<IncomeSource | null>(null);

  interface TransactionItem {
    id: string;
    title: string;
    categoryName: string;
    categoryIcon: string;
    categoryColor: string;
    amount: number;
    date: string;
    time: string;
    type: 'expense' | 'income' | 'investment';
    raw: any;
  }

  // Build unified transaction list
  const expenseItems: TransactionItem[] = expenses.map((e) => {
    const cat = categories.find((c) => c.id === e.category_id);
    const isSIP = cat?.name.toLowerCase().includes('sip') || cat?.name.toLowerCase().includes('investment');
    return {
      id: e.id,
      title: e.description,
      categoryName: cat?.name || 'General',
      categoryIcon: cat?.icon || 'Tag',
      categoryColor: cat?.color || '#0F6443',
      amount: Number(e.amount),
      date: e.date,
      time: e.time || '12:00 PM',
      type: isSIP ? 'investment' : 'expense',
      raw: e,
    };
  });

  const incomeItems: TransactionItem[] = incomes.map((i) => ({
    id: i.id,
    title: i.name,
    categoryName: 'Income',
    categoryIcon: 'TrendingUp',
    categoryColor: '#10B981',
    amount: Number(i.amount),
    date: i.date || `${i.month}-01`,
    time: '10:00 AM',
    type: 'income',
    raw: i,
  }));

  let combined: TransactionItem[] = [...expenseItems];
  if (activeFilter === 'Income') {
    combined = incomeItems;
  } else if (activeFilter === 'Investments') {
    combined = expenseItems.filter((item) => item.type === 'investment');
  } else if (activeFilter === 'Expenses') {
    combined = expenseItems.filter((item) => item.type === 'expense');
  }

  // Filter by search query
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    combined = combined.filter(
      (item) => item.title.toLowerCase().includes(q) || item.categoryName.toLowerCase().includes(q)
    );
  }

  // Group by Date string
  const groupedByDate: { [dateStr: string]: typeof combined } = {};
  combined.forEach((item) => {
    if (!groupedByDate[item.date]) {
      groupedByDate[item.date] = [];
    }
    groupedByDate[item.date].push(item);
  });

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  const handleEdit = (item: TransactionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type === 'income') {
      setEditingIncome(item.raw);
    } else {
      setEditingExpense(item.raw);
    }
  };

  const handleDelete = (item: TransactionItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${item.title}"?`)) {
      if (item.type === 'income') {
        deleteIncome(item.id);
      } else {
        deleteExpense(item.id);
      }
    }
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto pb-10">
      
      {/* Header matching Screen 3 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Transactions</h1>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="w-9 h-9 rounded-xl bg-white border border-slate-100 shadow-xs flex items-center justify-center text-slate-600 hover:text-slate-900 transition"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenAddExpense()}
            className="w-9 h-9 rounded-xl bg-[#0F6443] text-white flex items-center justify-center shadow-sm hover:bg-[#0b4d33] transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Collapsible Search Input */}
      {showSearch && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:border-[#0F6443]"
          />
        </div>
      )}

      {/* Filter Pill Tabs matching Screen 3: All, Income, Expenses, Investments */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(['All', 'Income', 'Expenses', 'Investments'] as TransactionFilter[]).map((tab) => {
          const isActive = activeFilter === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
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

      {/* Transactions List Grouped by Date */}
      {sortedDates.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 text-slate-400 text-xs">
          No transactions found for this filter.
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((dateStr) => {
            const items = groupedByDate[dateStr];
            const dayTotal = items.reduce((sum, i) => sum + (i.type !== 'income' ? i.amount : 0), 0);
            
            // Format friendly date
            const today = new Date().toISOString().split('T')[0];
            let label = dateStr;
            if (dateStr === today) {
              label = `Today, ${dateStr}`;
            }

            return (
              <div key={dateStr} className="space-y-2">
                {/* Date Header + Day Total Badge */}
                <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-500">
                  <span>{label}</span>
                  {dayTotal > 0 && (
                    <span className="text-[#0F6443] font-black">
                      {settings.currency_symbol}{dayTotal.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Items in this date */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      onClick={(e) => handleEdit(item, e)}
                      className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs"
                          style={{
                            backgroundColor: `${item.categoryColor}18`,
                            color: item.categoryColor,
                          }}
                        >
                          <CategoryIcon name={item.categoryIcon} className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">{item.title}</div>
                          <div className="text-[11px] text-slate-400 font-medium truncate">
                            {item.categoryName} • {item.time}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <div className="text-right">
                          <span
                            className={`text-xs font-black ${
                              item.type === 'income' ? 'text-emerald-700' : 'text-slate-900'
                            }`}
                          >
                            {item.type === 'income' ? '+' : ''}
                            {settings.currency_symbol}
                            {item.amount.toLocaleString()}
                          </span>
                        </div>

                        {/* Edit Button */}
                        <button
                          onClick={(e) => handleEdit(item, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#0F6443] hover:bg-emerald-50 transition active:scale-95"
                          title="Edit transaction"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={(e) => handleDelete(item, e)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition active:scale-95"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Expense Modal */}
      {editingExpense && (
        <AddExpenseModal
          isOpen={!!editingExpense}
          onClose={() => setEditingExpense(null)}
          expenseToEdit={editingExpense}
        />
      )}

      {/* Edit Income Modal */}
      {editingIncome && (
        <AddIncomeModal
          isOpen={!!editingIncome}
          onClose={() => setEditingIncome(null)}
          incomeToEdit={editingIncome}
        />
      )}

    </div>
  );
};

