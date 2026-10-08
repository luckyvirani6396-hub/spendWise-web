import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { PaymentMethod } from '../types/finance';
import { ArrowLeft, Calendar, Clock, CreditCard, ChevronDown, Check, Utensils, Train, User, FileText } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';
import { format } from 'date-fns';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCategoryId?: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Cash',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Other',
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  preselectedCategoryId,
}) => {
  const { categories, addExpense, settings } = useFinance();

  const [amount, setAmount] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState<string>(format(new Date(), 'HH:mm'));
  const [description, setDescription] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (preselectedCategoryId) {
        setCategoryId(preselectedCategoryId);
      } else if (categories.length > 0 && !categoryId) {
        setCategoryId(categories[0].id);
      }
      setDate(format(new Date(), 'yyyy-MM-dd'));
      setTime(format(new Date(), 'HH:mm'));
      setAmount('');
      setDescription('');
      setError(null);
    }
  }, [isOpen, preselectedCategoryId, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!categoryId) {
      setError('Please select a category');
      return;
    }

    setSubmitting(true);
    try {
      const selectedCat = categories.find((c) => c.id === categoryId);
      await addExpense({
        category_id: categoryId,
        description: description.trim() || selectedCat?.name || 'Expense',
        amount: Number(amount),
        date: date,
        time: time,
        payment_method: paymentMethod,
        notes: '',
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record expense');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickCategory = (nameSearch: string) => {
    const found = categories.find((c) => c.name.toLowerCase().includes(nameSearch.toLowerCase()));
    if (found) {
      setCategoryId(found.id);
      if (!description) setDescription(found.name);
    }
  };

  const selectedCategory = categories.find((c) => c.id === categoryId);

  return (
    <div className="fixed inset-0 z-50 bg-[#F4F8F5] flex flex-col sm:items-center sm:justify-center sm:p-4 sm:bg-slate-900/40 sm:backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-md sm:rounded-[32px] shadow-2xl overflow-hidden border-0 sm:border border-slate-100 flex flex-col">
        
        {/* Header matching Screen 2 */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-50">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="font-extrabold text-base text-slate-900">Add Expense</h2>
          <div className="w-9" /> {/* Spacer */}
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          
          {/* Centered Large Amount Display matching Screen 2 */}
          <div className="py-4 px-6 bg-slate-50 rounded-2xl flex flex-col items-center justify-center border border-slate-100/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Amount
            </span>
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-400">
                {settings.currency_symbol}
              </span>
              <input
                type="number"
                step="any"
                required
                autoFocus
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-44 text-3xl sm:text-4xl font-black text-slate-900 bg-transparent text-center focus:outline-none placeholder:text-slate-300"
              />
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Category
            </label>
            <div className="relative">
              <div className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-800">
                <div className="flex items-center gap-2.5">
                  {selectedCategory && (
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-xs"
                      style={{
                        backgroundColor: `${selectedCategory.color}15`,
                        color: selectedCategory.color,
                      }}
                    >
                      <CategoryIcon name={selectedCategory.icon} className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <span>{selectedCategory ? selectedCategory.name : 'Select Category'}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Date
              </label>
              <div className="relative flex items-center">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0F6443]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Time
              </label>
              <div className="relative flex items-center">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5" />
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0F6443]"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Payment Method
            </label>
            <div className="relative">
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full pl-10 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0F6443] appearance-none cursor-pointer"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Description
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="e.g. Lunch, Grocery, Metro, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#0F6443]"
              />
            </div>
          </div>

          {/* Big Forest Green Add Expense Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-[#0F6443] hover:bg-[#0b4d33] text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-950/15 transition active:scale-98 disabled:opacity-50"
          >
            {submitting ? 'Recording...' : 'Add Expense'}
          </button>

          {/* Quick Categories Section matching Screen 2 */}
          <div className="pt-2 border-t border-slate-100">
            <span className="block text-xs font-bold text-slate-800 mb-2">
              Quick Categories
            </span>
            <div className="grid grid-cols-4 gap-2 text-center">
              <button
                type="button"
                onClick={() => handleQuickCategory('Food')}
                className="p-2.5 rounded-2xl bg-blue-50/70 hover:bg-blue-100 border border-blue-100 flex flex-col items-center gap-1 transition"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Utensils className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-700">Food</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickCategory('Travel')}
                className="p-2.5 rounded-2xl bg-purple-50/70 hover:bg-purple-100 border border-purple-100 flex flex-col items-center gap-1 transition"
              >
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Train className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-700">Travel</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickCategory('Personal')}
                className="p-2.5 rounded-2xl bg-rose-50/70 hover:bg-rose-100 border border-rose-100 flex flex-col items-center gap-1 transition"
              >
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-700">Personal</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickCategory('Bills')}
                className="p-2.5 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100 border border-indigo-100 flex flex-col items-center gap-1 transition"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-700">Bills</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};
