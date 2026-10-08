import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Wallet, 
  Sparkles, 
  PiggyBank, 
  AlertTriangle, 
  Edit3, 
  Trash2, 
  X, 
  Check, 
  Layers 
} from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';
import { Category, CategoryGroup } from '../types/finance';

const AVAILABLE_ICONS = [
  'Utensils', 'Home', 'Zap', 'Train', 'ShoppingBag', 
  'Wifi', 'Coffee', 'HeartHandshake', 'TrendingUp', 'CreditCard', 'Car', 'Film', 'Gift', 'Lightbulb'
];

const AVAILABLE_COLORS = [
  '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', 
  '#06B6D4', '#F43F5E', '#EF4444', '#059669', '#6366F1'
];

const GROUPS: CategoryGroup[] = ['Food', 'Housing', 'Bills', 'Travel', 'Personal', 'Financial'];

export const BudgetsPage: React.FC = () => {
  const { 
    categoryStatuses, 
    totalAllocatedBudget, 
    totalMonthlyIncome,
    totalSpent, 
    selectedMonth, 
    setSelectedMonth, 
    addCategory,
    updateCategory,
    deleteCategory,
    settings 
  } = useFinance();

  const [activeFilter, setActiveFilter] = useState<string>('All');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // New Category Form State
  const [name, setName] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [groupName, setGroupName] = useState<CategoryGroup>('Food');
  const [icon, setIcon] = useState('Utensils');
  const [color, setColor] = useState('#10B981');
  const [description, setDescription] = useState('');

  // Edit Category Form State
  const [editLimit, setEditLimit] = useState('');
  const [editName, setEditName] = useState('');
  const [editGroup, setEditGroup] = useState<CategoryGroup>('Food');

  const filterGroups = ['All', 'Food', 'Housing', 'Bills', 'Travel', 'Personal', 'Financial'];

  const filtered = categoryStatuses.filter((item) => {
    if (activeFilter === 'All') return true;
    return item.category.group_name?.toLowerCase() === activeFilter.toLowerCase() ||
           item.category.name.toLowerCase().includes(activeFilter.toLowerCase());
  });

  // Calculate Rest Money (Planned Savings)
  const restMoney = totalMonthlyIncome - totalAllocatedBudget;
  const allocPct = totalMonthlyIncome > 0
    ? Math.round((totalAllocatedBudget / totalMonthlyIncome) * 100)
    : 0;

  const overallSpentPct = totalAllocatedBudget > 0
    ? Math.min(100, Math.round((totalSpent / totalAllocatedBudget) * 100))
    : 0;

  const handleOpenAdd = () => {
    setName('');
    setMonthlyLimit('');
    setGroupName('Food');
    setIcon('Utensils');
    setColor('#10B981');
    setDescription('');
    setShowAddModal(true);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !monthlyLimit) return;
    await addCategory({
      name: name.trim(),
      monthly_limit: Number(monthlyLimit),
      group_name: groupName,
      icon,
      color,
      description: description.trim() || undefined,
      order_index: categoryStatuses.length + 1,
    });
    setShowAddModal(false);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditLimit(String(cat.monthly_limit));
    setEditGroup(cat.group_name || 'Food');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim() || !editLimit) return;
    await updateCategory({
      ...editingCategory,
      name: editName.trim(),
      monthly_limit: Number(editLimit),
      group_name: editGroup,
    });
    setEditingCategory(null);
  };

  const handleDeleteCategory = async (catId: string) => {
    if (confirm('Delete this budget category? Expenses under it will be preserved.')) {
      await deleteCategory(catId);
      setEditingCategory(null);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Category Budgets</h1>
          <p className="text-xs text-slate-500 font-medium">Set & manage monthly spend limits</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-2 bg-[#0F6443] hover:bg-[#0b4d33] text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Month Switcher Row */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-white rounded-2xl border border-slate-100 shadow-xs text-xs font-bold text-slate-800">
        <button
          onClick={() => {
            const [y, m] = selectedMonth.split('-').map(Number);
            const prev = new Date(y, m - 2, 1);
            setSelectedMonth(prev.toISOString().substring(0, 7));
          }}
          className="p-1 hover:text-[#0F6443] rounded-lg hover:bg-slate-50 transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-sm">{selectedMonth}</span>
        </div>
        <button
          onClick={() => {
            const [y, m] = selectedMonth.split('-').map(Number);
            const next = new Date(y, m, 1);
            setSelectedMonth(next.toISOString().substring(0, 7));
          }}
          className="p-1 hover:text-[#0F6443] rounded-lg hover:bg-slate-50 transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 1. COMPREHENSIVE BUDGET VS INCOME & REST SAVINGS CARD */}
      <div className="p-5 bg-gradient-to-br from-white via-[#FAFCFA] to-[#F0F8F3] rounded-3xl border border-emerald-100/90 shadow-sm space-y-4">
        
        {/* Top 3 Metric Blocks: Expand Limit / Total Income / Rest Savings */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Total Expand Limit */}
          <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Budget Limit</span>
            <div className="text-lg font-black text-slate-900 mt-0.5">
              {settings.currency_symbol}{totalAllocatedBudget.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
              Across {categoryStatuses.length} categories
            </div>
          </div>

          {/* Total Monthly Income */}
          <div className="p-3.5 bg-white rounded-2xl border border-slate-100 shadow-2xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Income</span>
            <div className="text-lg font-black text-[#0F6443] mt-0.5">
              {settings.currency_symbol}{totalMonthlyIncome.toLocaleString()}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 mt-0.5">
              {totalMonthlyIncome > 0 ? `${allocPct}% allocated to budgets` : 'No income added yet'}
            </div>
          </div>

          {/* Rest Money / Planned Savings */}
          <div className={`p-3.5 rounded-2xl border shadow-2xs ${
            restMoney > 0 
              ? 'bg-emerald-50/80 border-emerald-200 text-[#0F6443]' 
              : restMoney < 0 
              ? 'bg-rose-50/80 border-rose-200 text-rose-700' 
              : 'bg-white border-slate-100 text-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Rest Money (Savings)</span>
              <PiggyBank className="w-4 h-4" />
            </div>
            <div className="text-lg font-black mt-0.5">
              {settings.currency_symbol}{Math.abs(restMoney).toLocaleString()}
            </div>
            <div className="text-[11px] font-bold mt-0.5">
              {totalMonthlyIncome === 0 ? (
                'Add income to see savings'
              ) : restMoney > 0 ? (
                '💰 You are saving this!'
              ) : restMoney < 0 ? (
                '⚠️ Exceeds monthly income'
              ) : (
                '100% budgeted'
              )}
            </div>
          </div>

        </div>

        {/* Real Spending vs Total Budget Progress Bar */}
        <div className="p-3.5 bg-white rounded-2xl border border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span className="flex items-center gap-1.5 text-slate-500 font-semibold text-[11px]">
              Actual Spending Progress
            </span>
            <span>
              {settings.currency_symbol}{totalSpent.toLocaleString()} / {settings.currency_symbol}{totalAllocatedBudget.toLocaleString()} ({overallSpentPct}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallSpentPct >= 100 ? 'bg-rose-500' : overallSpentPct >= 80 ? 'bg-amber-500' : 'bg-[#10B981]'
              }`}
              style={{ width: `${overallSpentPct}%` }}
            />
          </div>
        </div>

      </div>

      {/* Filter Pill Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filterGroups.map((group) => {
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

      {/* Budget Categories List */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 mx-auto flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">No categories found</h3>
            <p className="text-xs text-slate-400 mt-1">Create your first custom category and set its monthly spend limit</p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#0F6443] text-white text-xs font-bold rounded-xl"
          >
            + Create Category
          </button>
        </div>
      ) : (
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
                onClick={() => handleOpenEdit(cs.category)}
                className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-2.5 transition hover:border-slate-300 active:scale-[0.99] cursor-pointer"
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
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-xs text-slate-900">{cs.category.name}</h3>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold">
                          {cs.category.group_name || 'General'}
                        </span>
                      </div>
                      <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                        Spent {settings.currency_symbol}{spent.toLocaleString()} • Limit {settings.currency_symbol}{limit.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black ${
                        pct >= 100 ? 'text-rose-600' : 'text-slate-700'
                      }`}
                    >
                      {pct}%
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEdit(cs.category);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                      title="Edit Category"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
      )}

      {/* 2. FULL-SCREEN / RESPONSIVE ADD CATEGORY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#F4F8F5] flex flex-col sm:items-center sm:justify-center sm:p-4 sm:bg-slate-900/40 sm:backdrop-blur-xs animate-in fade-in duration-150">
          <form onSubmit={handleCreateCategory} className="bg-white w-full h-full sm:h-auto sm:max-w-md sm:rounded-3xl p-6 shadow-2xl border-0 sm:border border-slate-100 space-y-4 overflow-y-auto flex flex-col justify-between sm:justify-start">
            <div className="space-y-4">
              
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 sm:border-0 sm:pb-0">
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">Add Custom Category</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Create category with custom spend limit</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Name */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gym & Fitness, Pet Care, Streaming"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0F6443] focus:outline-none"
                />
              </div>

              {/* Monthly Spend Limit */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Monthly Spend Limit ({settings.currency_symbol})
                </label>
                <input
                  type="number"
                  required
                  placeholder="3000"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0F6443] focus:outline-none"
                />
              </div>

              {/* Group */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Category Group</label>
                <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                  {GROUPS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGroupName(g)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition text-center truncate ${
                        groupName === g 
                          ? 'bg-[#0F6443] text-white shadow-2xs' 
                          : 'bg-slate-50 text-slate-700 border border-slate-100 hover:bg-slate-100'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Color Tag</label>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {AVAILABLE_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition flex items-center justify-center ${
                        color === c ? 'ring-2 ring-offset-2 ring-slate-800 scale-110' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Selection */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Select Icon</label>
                <div className="grid grid-cols-7 gap-2 mt-1.5">
                  {AVAILABLE_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={`p-2 rounded-xl flex items-center justify-center transition border ${
                        icon === ic 
                          ? 'border-[#0F6443] bg-emerald-50 text-[#0F6443]' 
                          : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <CategoryIcon name={ic} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Modal Actions */}
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
                Save Category
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. EDIT / DELETE CATEGORY MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-[#F4F8F5] flex flex-col sm:items-center sm:justify-center sm:p-4 sm:bg-slate-900/40 sm:backdrop-blur-xs animate-in fade-in duration-150">
          <form onSubmit={handleSaveEdit} className="bg-white w-full h-full sm:h-auto sm:max-w-md sm:rounded-3xl p-6 shadow-2xl border-0 sm:border border-slate-100 space-y-4 overflow-y-auto flex flex-col justify-between sm:justify-start">
            <div className="space-y-4">
              
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 sm:border-0 sm:pb-0">
                <div>
                  <h3 className="font-black text-slate-900 text-base sm:text-lg">Edit Category Limit</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Update spend limit or remove category</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Name */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Category Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0F6443] focus:outline-none"
                />
              </div>

              {/* Monthly Spend Limit */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Monthly Spend Limit ({settings.currency_symbol})
                </label>
                <input
                  type="number"
                  required
                  value={editLimit}
                  onChange={(e) => setEditLimit(e.target.value)}
                  className="w-full mt-1.5 px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0F6443] focus:outline-none font-black text-slate-900 text-lg"
                />
              </div>

              {/* Group */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Category Group</label>
                <div className="grid grid-cols-3 gap-1.5 mt-1.5">
                  {GROUPS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setEditGroup(g)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold transition text-center truncate ${
                        editGroup === g 
                          ? 'bg-[#0F6443] text-white shadow-2xs' 
                          : 'bg-slate-50 text-slate-700 border border-slate-100 hover:bg-slate-100'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Actions: Delete + Save */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => handleDeleteCategory(editingCategory.id)}
                className="px-3.5 py-2.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl transition font-bold flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2.5 text-xs text-slate-600 font-bold hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0F6443] hover:bg-[#0b4d33] text-white text-xs font-bold rounded-xl transition shadow-xs"
                >
                  Update Limit
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
