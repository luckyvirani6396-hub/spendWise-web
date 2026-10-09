import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { IncomeSource } from '../types/finance';
import { X, Wallet, Calendar, Plus, Check, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  incomeToEdit?: IncomeSource | null;
}

const COMMON_SOURCES = [
  'Monthly Salary',
  'Freelance / Side Gig',
  'Business Profit',
  'Investments / Dividend',
  'Rental Income',
  'Bonus / Incentive',
  'Pocket Money / Allowance',
];

export const AddIncomeModal: React.FC<AddIncomeModalProps> = ({ isOpen, onClose, incomeToEdit }) => {
  const { addIncome, updateIncome, settings, selectedMonth } = useFinance();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [status, setStatus] = useState<'received' | 'pending'>('received');
  const [isRecurring, setIsRecurring] = useState(true);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (incomeToEdit) {
        setName(incomeToEdit.name);
        setAmount(incomeToEdit.amount.toString());
        setDate(incomeToEdit.date || format(new Date(), 'yyyy-MM-dd'));
        setStatus(incomeToEdit.status || 'received');
        setIsRecurring(incomeToEdit.is_recurring);
        setNotes(incomeToEdit.notes || '');
        setError(null);
      } else {
        setName('');
        setAmount('');
        const today = format(new Date(), 'yyyy-MM-dd');
        setDate(today);
        setStatus('received');
        setIsRecurring(true);
        setNotes('');
        setError(null);
      }
    }
  }, [isOpen, incomeToEdit]);

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    const today = format(new Date(), 'yyyy-MM-dd');
    if (newDate > today) {
      setStatus('pending');
    } else {
      setStatus('received');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide an income source name');
      return;
    }
    const numAmount = Number(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const monthStr = date.substring(0, 7) || selectedMonth;
      if (incomeToEdit) {
        await updateIncome({
          ...incomeToEdit,
          name: name.trim(),
          amount: numAmount,
          is_recurring: isRecurring,
          status,
          date,
          month: monthStr,
          notes: notes.trim() || undefined,
        });
      } else {
        await addIncome({
          name: name.trim(),
          amount: numAmount,
          is_recurring: isRecurring,
          status,
          date,
          month: monthStr,
          notes: notes.trim() || undefined,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save income source');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F4F8F5] flex flex-col sm:items-center sm:justify-center sm:p-4 sm:bg-slate-900/50 sm:backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full h-full sm:h-auto sm:max-w-md sm:rounded-3xl p-6 sm:p-7 shadow-2xl border-0 sm:border border-slate-100 relative space-y-5 overflow-y-auto flex flex-col">
        
        {/* Header with Back/Close Button */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 sm:border-0 sm:pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#0F6443] flex items-center justify-center shadow-xs shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {incomeToEdit ? 'Edit Income' : 'Add Income Source'}
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {incomeToEdit ? 'Update income amount, status or details' : 'Record salary, freelance, or other earnings'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-rose-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Amount Input */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Income Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-[#0F6443]">
                {settings.currency_symbol}
              </span>
              <input
                type="number"
                step="any"
                required
                autoFocus
                placeholder="50,000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xl font-black text-slate-900 focus:outline-none focus:border-[#0F6443] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Quick Source Suggestions */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Source Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Monthly Salary, Freelance Work"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0F6443] focus:bg-white transition"
            />
            {/* Suggestion Pills */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {COMMON_SOURCES.map((source) => (
                <button
                  type="button"
                  key={source}
                  onClick={() => setName(source)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition border ${
                    name === source
                      ? 'bg-[#E8F5EE] border-[#0F6443] text-[#0F6443]'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {source}
                </button>
              ))}
            </div>
          </div>

          {/* Date Picker */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Income Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                required
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0F6443] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Status Selector: Received vs Pending */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Income Status
              </label>
              {date > format(new Date(), 'yyyy-MM-dd') && (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-600" />
                  Auto-set to Pending (Future date)
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('received')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition ${
                  status === 'received'
                    ? 'bg-[#E8F5EE] border-[#0F6443] text-[#0F6443] shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className={`w-4 h-4 ${status === 'received' ? 'text-[#0F6443]' : 'text-slate-400'}`} />
                <span>Received</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('pending')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition ${
                  status === 'pending'
                    ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Clock className={`w-4 h-4 ${status === 'pending' ? 'text-amber-600' : 'text-slate-400'}`} />
                <span>Pending</span>
              </button>
            </div>
          </div>

          {/* Notes (Optional) */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Expected by 25th, Client invoice #102"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0F6443] focus:bg-white transition"
            />
          </div>

          {/* Recurring Toggle */}
          <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 rounded text-[#0F6443] accent-[#0F6443]"
            />
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800">Repeats Every Month</p>
              <p className="text-[10px] text-slate-500">Automatically adds this income each new month</p>
            </div>
          </label>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-1/3 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 py-3 bg-[#0F6443] hover:bg-[#0a4830] text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-950/15 flex items-center justify-center gap-1.5 transition active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{incomeToEdit ? 'Save Changes' : 'Save Income'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
