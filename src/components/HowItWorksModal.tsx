import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  Wallet, 
  CreditCard, 
  PieChart, 
  BarChart3, 
  Moon, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  ArrowRightLeft
} from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddIncome?: () => void;
  onOpenAddExpense?: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  onOpenAddIncome,
  onOpenAddExpense,
}) => {
  const [activeSlide, setActiveSlide] = useState<number>(0);

  if (!isOpen) return null;

  const slides = [
    {
      id: 'income',
      title: '1. Where to Add & Change Income',
      subtitle: 'Set your monthly baseline earnings',
      icon: Wallet,
      color: 'bg-emerald-50 text-[#0F6443]',
      summary: 'Your Monthly Income represents your spending pool for the month.',
      points: [
        {
          label: 'Where it shows',
          desc: 'On your Home Dashboard in the big Forest Green "Monthly Income" card, and in the dedicated Income tab.',
        },
        {
          label: 'How to add or change',
          desc: 'Tap "+ Add Income" directly on the green card or visit the Income tab to add salary, freelance gigs, or business income.',
        },
        {
          label: 'Recurring salary',
          desc: 'Check "Repeats Every Month" so your salary carries over automatically each month without retyping.',
        },
      ],
      action: {
        label: '+ Add Income Now',
        onClick: () => {
          onClose();
          onOpenAddIncome?.();
        },
      },
    },
    {
      id: 'expenses',
      title: '2. Where to Add & View Expenses',
      subtitle: 'Log spending in 5 seconds and view history',
      icon: ArrowRightLeft,
      color: 'bg-rose-50 text-rose-600',
      summary: 'Record every purchase so you always know where your money went.',
      points: [
        {
          label: 'How to add an expense',
          desc: 'Tap the green (+) floating button in the bottom bar or "Add Expense" at the top of any screen.',
        },
        {
          label: 'Where expenses show',
          desc: 'All purchases appear in the "Transactions" tab. You can filter by category, search by note, or delete entries.',
        },
        {
          label: 'Payment methods',
          desc: 'Tag expenses with UPI, Debit Card, Credit Card, or Cash to track your payment channels.',
        },
      ],
      action: {
        label: '+ Record First Expense',
        onClick: () => {
          onClose();
          onOpenAddExpense?.();
        },
      },
    },
    {
      id: 'budgets',
      title: '3. How Category Budgets & Alerts Work',
      subtitle: 'Prevent overspending before it happens',
      icon: PieChart,
      color: 'bg-amber-50 text-amber-600',
      summary: 'Set maximum monthly limits for Groceries, Rent, Dining, and Shopping.',
      points: [
        {
          label: 'Where to set limits',
          desc: 'Head to the "Budget" tab. Tap any category to edit its monthly spending target.',
        },
        {
          label: '80% Warning Alert',
          desc: 'When spending reaches 80% of a category limit, SpendWise alerts you so you can slow down.',
        },
        {
          label: '100% Exceeded Alert',
          desc: 'If a category is exceeded, it turns red and sends a budget alert notification to your bell icon.',
        },
      ],
    },
    {
      id: 'insights',
      title: '4. Nightly Review & Reports',
      subtitle: 'Build lasting financial discipline',
      icon: BarChart3,
      color: 'bg-blue-50 text-blue-600',
      summary: 'Understand your financial habits with charts and daily summaries.',
      points: [
        {
          label: '9:30 PM Daily Summary',
          desc: 'Tap the Moon icon in the menu to see a 10-second wrap-up of what you spent today.',
        },
        {
          label: 'Reports & Analytics',
          desc: 'Visit the "Reports" tab to see category pie charts, day-by-day trends, and investment balances.',
        },
        {
          label: 'Remaining Balance',
          desc: 'Your dashboard calculates: [Income - Expenses - Investments = Remaining] in real time.',
        },
      ],
    },
  ];

  const current = slides[activeSlide];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 bg-[#F4F8F5] flex flex-col sm:items-center sm:justify-center sm:p-4 sm:bg-slate-900/50 sm:backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full h-full sm:h-auto sm:max-w-lg sm:rounded-3xl p-6 sm:p-8 shadow-2xl border-0 sm:border border-slate-100 relative flex flex-col space-y-5 overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 sm:border-0 sm:pb-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-[#0F6443] flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">How SpendWise Works</h2>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Quick 1-minute visual guide for new users</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Navigation Tabs */}
        <div className="grid grid-cols-4 p-1 bg-slate-100 rounded-xl gap-1">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActiveSlide(idx)}
              className={`py-1.5 text-[11px] font-bold rounded-lg transition text-center truncate ${
                activeSlide === idx
                  ? 'bg-white text-[#0F6443] shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Step {idx + 1}
            </button>
          ))}
        </div>

        {/* Slide Body */}
        <div className="space-y-4 min-h-[220px]">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${current.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">{current.title}</h3>
              <p className="text-xs text-slate-500 font-medium">{current.subtitle}</p>
            </div>
          </div>

          <p className="text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            {current.summary}
          </p>

          <div className="space-y-2.5">
            {current.points.map((pt, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-[#0F6443] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">{pt.label}: </span>
                  <span className="text-slate-600">{pt.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action & Carousel Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  activeSlide === idx ? 'w-6 bg-[#0F6443]' : 'w-1.5 bg-slate-200'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {activeSlide < slides.length - 1 ? (
              <button
                onClick={() => setActiveSlide(activeSlide + 1)}
                className="px-4 py-2 bg-[#0F6443] hover:bg-[#0a4830] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2 bg-[#0F6443] hover:bg-[#0a4830] text-white font-bold text-xs rounded-xl transition"
              >
                Got It! Let's Start
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
