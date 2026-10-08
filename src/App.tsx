import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { MobileLoginScreen } from './components/MobileLoginScreen';
import { Dashboard } from './components/Dashboard';
import { ExpensesPage } from './components/ExpensesPage';
import { IncomePage } from './components/IncomePage';
import { BudgetsPage } from './components/BudgetsPage';
import { InvestmentsPage } from './components/InvestmentsPage';
import { SavingsGoalsPage } from './components/SavingsGoalsPage';
import { ReportsPage } from './components/ReportsPage';
import { AddExpenseModal } from './components/AddExpenseModal';
import { AddIncomeModal } from './components/AddIncomeModal';
import { HowItWorksModal } from './components/HowItWorksModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { DailySummaryModal } from './components/DailySummaryModal';
import { SettingsModal } from './components/SettingsModal';
import { BiometricLockScreen } from './components/BiometricLockScreen';
import { mobileService } from './services/mobileService';
import { biometricService } from './services/biometricService';
import { 
  Home, 
  ReceiptText, 
  Wallet, 
  PieChart, 
  TrendingUp, 
  PiggyBank, 
  BarChart3, 
  Settings as SettingsIcon, 
  Bell, 
  Moon, 
  Plus, 
  Database, 
  Calendar, 
  LogOut, 
  User as UserIcon, 
  ChevronDown, 
  Menu, 
  X, 
  Sparkles, 
  ArrowRightLeft 
} from 'lucide-react';

export type NavTab = 'dashboard' | 'expenses' | 'budgets' | 'income' | 'investments' | 'savings' | 'reports';

const AppContent: React.FC = () => {
  const { user, logout, isNeonConnected } = useAuth();
  const { 
    selectedMonth, 
    setSelectedMonth, 
    unreadAlertsCount, 
    loading 
  } = useFinance();

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  
  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isAddChoiceOpen, setIsAddChoiceOpen] = useState(false);
  const [preselectedCategoryId, setPreselectedCategoryId] = useState<string | undefined>(undefined);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isDailySummaryOpen, setIsDailySummaryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // Biometric & App Lock state
  const [isSessionLocked, setIsSessionLocked] = useState(() => biometricService.isSessionLocked());

  useEffect(() => {
    const handleLockEvent = () => setIsSessionLocked(true);
    window.addEventListener('spendwise_lock_app', handleLockEvent);
    return () => window.removeEventListener('spendwise_lock_app', handleLockEvent);
  }, []);

  // Hardware Back Button Handler
  const backHandlerRef = useRef<() => boolean>(() => false);

  backHandlerRef.current = () => {
    // If biometric lock screen is active, don't navigate
    if (isSessionLocked) return false;

    // 1. Close open choice popovers or menus
    if (isAddChoiceOpen) {
      setIsAddChoiceOpen(false);
      return true;
    }
    if (isProfileMenuOpen) {
      setIsProfileMenuOpen(false);
      return true;
    }

    // 2. Close open dialog modals
    if (isAddExpenseOpen) {
      setIsAddExpenseOpen(false);
      return true;
    }
    if (isAddIncomeOpen) {
      setIsAddIncomeOpen(false);
      return true;
    }
    if (isHowItWorksOpen) {
      setIsHowItWorksOpen(false);
      return true;
    }
    if (isDailySummaryOpen) {
      setIsDailySummaryOpen(false);
      return true;
    }
    if (isSettingsOpen) {
      setIsSettingsOpen(false);
      return true;
    }
    if (isNotificationOpen) {
      setIsNotificationOpen(false);
      return true;
    }

    // 3. Switch back to home dashboard if on another tab
    if (activeTab !== 'dashboard') {
      setActiveTab('dashboard');
      return true;
    }

    // 4. Return false to allow native exit
    return false;
  };

  // Initialize native mobile plugins
  useEffect(() => {
    mobileService.initMobileApp({
      onBack: () => backHandlerRef.current(),
      onLockTriggered: () => setIsSessionLocked(true),
    });
  }, []);

  const handleOpenAddExpense = (catId?: string) => {
    setPreselectedCategoryId(catId);
    setIsAddExpenseOpen(true);
  };

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'expenses', label: 'Transactions', icon: ArrowRightLeft },
    { id: 'budgets', label: 'Budget', icon: PieChart },
    { id: 'income', label: 'Income', icon: Wallet },
    { id: 'investments', label: 'Investments', icon: TrendingUp },
    { id: 'savings', label: 'Savings Goals', icon: PiggyBank },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F8F5] flex items-center justify-center text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#0F6443] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-gray-600">Loading SpendWise...</span>
        </div>
      </div>
    );
  }

  // Format month for display
  const formatMonthTitle = (monthStr: string) => {
    try {
      const [year, month] = monthStr.split('-');
      const d = new Date(parseInt(year), parseInt(month) - 1, 1);
      return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return monthStr;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F8F5] text-slate-800 flex flex-col font-sans selection:bg-[#E8F5EE] selection:text-[#0F6443]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#E8F5EE] flex items-center justify-center text-[#0F6443] shadow-xs shrink-0">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A9.49 9.49 0 0 1 12 20c7 0 11-8 11-8s-2.5 0-6-4zm-5 10c-1.87 0-3.52-.75-4.73-1.95C9.72 13.07 13.12 10.5 17 9.87c-1.5 5.5-4.14 8.13-5 8.13z"/>
                </svg>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900">
                  Spend<span className="text-[#0F6443]">Wise</span>
                </span>
                <span className="hidden md:inline-flex px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#E8F5EE] text-[#0F6443]">
                  Pro
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links (Clean, Centered Segmented Tabs) */}
            <nav className="hidden lg:flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60 shadow-2xs">
              {navItems.slice(0, 4).map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as NavTab)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                      isActive
                        ? 'bg-white text-[#0F6443] shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* More Dropdown for secondary tabs */}
              <div className="relative group">
                <button
                  type="button"
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                    ['investments', 'savings', 'reports'].includes(activeTab)
                      ? 'bg-white text-[#0F6443] shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span>More</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>
                <div className="absolute left-0 mt-1.5 w-44 bg-white border border-slate-100 rounded-2xl shadow-xl py-1.5 hidden group-hover:block hover:block z-50 animate-in fade-in">
                  {navItems.slice(4).map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as NavTab)}
                        className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center gap-2.5 transition ${
                          isActive
                            ? 'bg-[#E8F5EE] text-[#0F6443] font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-[#0F6443]" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Profile Button on desktop */}
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  isProfileMenuOpen
                    ? 'bg-white text-[#0F6443] shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-[#E8F5EE] text-[#0F6443] flex items-center justify-center text-[10px] font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-3 h-3" />}
                </div>
                <span>Profile</span>
              </button>
            </nav>

            {/* Right Side Quick Controls */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              
              {/* Month Picker Pill */}
              <div className="relative flex items-center gap-1 px-2.5 py-1.5 bg-[#F4F8F5] hover:bg-[#E8F5EE] border border-slate-200/80 rounded-xl transition cursor-pointer">
                <Calendar className="w-3.5 h-3.5 text-[#0F6443] shrink-0" />
                <span className="text-slate-800 font-bold text-[11px] sm:text-xs pointer-events-none select-none">
                  {formatMonthTitle(selectedMonth)}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 pointer-events-none" />
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                />
              </div>

              {/* Notification Bell */}
              <button
                onClick={() => setIsNotificationOpen(true)}
                className="relative p-2 text-slate-600 hover:text-[#0F6443] hover:bg-slate-100 rounded-xl transition"
                title="Notifications & Alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadAlertsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              {/* Desktop Quick Actions: "+ Income" & "+ Add Expense" */}
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => setIsAddIncomeOpen(true)}
                  className="px-3 py-2 bg-[#E8F5EE] hover:bg-[#d8efe2] text-[#0F6443] rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
                  title="Add Income Source"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>+ Income</span>
                </button>

                <button
                  onClick={() => handleOpenAddExpense()}
                  className="px-3.5 py-2 bg-[#0F6443] hover:bg-[#0B4D33] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-[#0F6443]/20 transition transform active:scale-95 shrink-0"
                  title="Record an Expense"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Expense</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* Main Page Body (with pb-28 on mobile for bottom bar clearance) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-28 lg:pb-8">
        {activeTab === 'dashboard' && (
          <Dashboard 
            onOpenAddExpense={handleOpenAddExpense} 
            onOpenAddIncome={() => setIsAddIncomeOpen(true)}
            onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
            onNavigateTab={(tab) => setActiveTab(tab as NavTab)}
            onTriggerDailySummary={() => setIsDailySummaryOpen(true)}
          />
        )}
        {activeTab === 'expenses' && (
          <ExpensesPage onOpenAddExpense={handleOpenAddExpense} />
        )}
        {activeTab === 'budgets' && <BudgetsPage />}
        {activeTab === 'income' && <IncomePage />}
        {activeTab === 'investments' && <InvestmentsPage />}
        {activeTab === 'savings' && <SavingsGoalsPage />}
        {activeTab === 'reports' && <ReportsPage />}
      </main>

      {/* Mobile Bottom Navigation Bar (Matching SpendWise mobile screens) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-100 px-3 py-2 shadow-lg">
        <div className="flex items-center justify-between relative max-w-md mx-auto">
          {/* Home Tab */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-1 flex flex-col items-center gap-0.5 transition ${
              activeTab === 'dashboard' ? 'text-[#0F6443] font-bold' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px]">Home</span>
          </button>

          {/* Transactions Tab */}
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 py-1 flex flex-col items-center gap-0.5 transition ${
              activeTab === 'expenses' ? 'text-[#0F6443] font-bold' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <ArrowRightLeft className="w-5 h-5" />
            <span className="text-[10px]">Transactions</span>
          </button>

          {/* Center Floating Plus (+) Button with Dual Action (Income vs Expense) */}
          <div className="flex-1 flex justify-center -mt-6 relative">
            {isAddChoiceOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs" 
                  onClick={() => setIsAddChoiceOpen(false)} 
                />
                <div className="absolute bottom-16 flex flex-col items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <button
                    onClick={() => {
                      setIsAddChoiceOpen(false);
                      setIsAddIncomeOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-white border border-emerald-200 text-[#0F6443] font-bold text-xs shadow-xl flex items-center gap-2 whitespace-nowrap active:scale-95 transition"
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <Wallet className="w-3.5 h-3.5" />
                    </div>
                    <span>Add Income</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsAddChoiceOpen(false);
                      handleOpenAddExpense();
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-[#0F6443] text-white font-bold text-xs shadow-xl flex items-center gap-2 whitespace-nowrap active:scale-95 transition"
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-800 flex items-center justify-center">
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                    </div>
                    <span>Add Expense</span>
                  </button>
                </div>
              </>
            )}

            <button
              onClick={() => setIsAddChoiceOpen(!isAddChoiceOpen)}
              className={`w-12 h-12 bg-[#0F6443] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#0F6443]/30 active:scale-95 transition border-4 border-[#F4F8F5] ${
                isAddChoiceOpen ? 'rotate-45' : ''
              }`}
              title="Add Transaction"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Budget Tab */}
          <button
            onClick={() => setActiveTab('budgets')}
            className={`flex-1 py-1 flex flex-col items-center gap-0.5 transition ${
              activeTab === 'budgets' ? 'text-[#0F6443] font-bold' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <PieChart className="w-5 h-5" />
            <span className="text-[10px]">Budget</span>
          </button>

          {/* Profile Tab (Replaces More in bottom bar) */}
          <button
            onClick={() => setIsProfileMenuOpen(true)}
            className={`flex-1 py-1 flex flex-col items-center gap-0.5 transition ${
              isProfileMenuOpen || ['income', 'investments', 'savings', 'reports'].includes(activeTab) 
                ? 'text-[#0F6443] font-bold' 
                : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
              isProfileMenuOpen || ['income', 'investments', 'savings', 'reports'].includes(activeTab)
                ? 'bg-[#E8F5EE] text-[#0F6443] ring-2 ring-[#0F6443]'
                : 'bg-gray-100 text-gray-500'
            }`}>
              {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
            </div>
            <span className="text-[10px]">Profile</span>
          </button>
        </div>
      </nav>

      {/* Profile & Features Bottom Sheet Modal */}
      {isProfileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in"
          onClick={() => setIsProfileMenuOpen(false)}
        >
          <div 
            className="bg-white rounded-t-3xl p-5 shadow-2xl border-t border-gray-100 space-y-4 max-h-[85vh] overflow-y-auto max-w-lg mx-auto w-full animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Sheet Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="font-bold text-gray-900 text-base">Account & Features</span>
              <button 
                onClick={() => setIsProfileMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Info Card (Above all sections) */}
            <div className="p-4 bg-[#F8FAF8] border border-gray-100 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-[#0F6443] text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-[#0F6443]/20 shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-gray-900 truncate">{user?.name || 'SpendWise User'}</h3>
                  <p className="text-xs text-gray-500 font-medium truncate">{user?.email || user?.mobile || 'Personal Account'}</p>
                </div>
              </div>
            </div>

            {/* Financial Sections Grid (Income, Investment, Savings Goal, Reports) */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 px-1">
                Financial Modules
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {/* Income */}
                <button
                  onClick={() => {
                    setActiveTab('income');
                    setIsProfileMenuOpen(false);
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition active:scale-98 ${
                    activeTab === 'income'
                      ? 'border-[#0F6443] bg-[#E8F5EE] text-[#0F6443]'
                      : 'border-gray-100 bg-[#F9FAF9] hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[#0F6443] shrink-0 shadow-2xs">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">Income</p>
                    <p className="text-[10px] text-gray-500 truncate">Salary & inflow</p>
                  </div>
                </button>

                {/* Investments */}
                <button
                  onClick={() => {
                    setActiveTab('investments');
                    setIsProfileMenuOpen(false);
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition active:scale-98 ${
                    activeTab === 'investments'
                      ? 'border-[#0F6443] bg-[#E8F5EE] text-[#0F6443]'
                      : 'border-gray-100 bg-[#F9FAF9] hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[#0F6443] shrink-0 shadow-2xs">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">Investments</p>
                    <p className="text-[10px] text-gray-500 truncate">SIP & stocks</p>
                  </div>
                </button>

                {/* Savings Goals */}
                <button
                  onClick={() => {
                    setActiveTab('savings');
                    setIsProfileMenuOpen(false);
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition active:scale-98 ${
                    activeTab === 'savings'
                      ? 'border-[#0F6443] bg-[#E8F5EE] text-[#0F6443]'
                      : 'border-gray-100 bg-[#F9FAF9] hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[#0F6443] shrink-0 shadow-2xs">
                    <PiggyBank className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">Savings Goals</p>
                    <p className="text-[10px] text-gray-500 truncate">Target milestones</p>
                  </div>
                </button>

                {/* Reports */}
                <button
                  onClick={() => {
                    setActiveTab('reports');
                    setIsProfileMenuOpen(false);
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition active:scale-98 ${
                    activeTab === 'reports'
                      ? 'border-[#0F6443] bg-[#E8F5EE] text-[#0F6443]'
                      : 'border-gray-100 bg-[#F9FAF9] hover:bg-gray-50 text-gray-800'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-[#0F6443] shrink-0 shadow-2xs">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold truncate">Reports</p>
                    <p className="text-[10px] text-gray-500 truncate">Analytics & charts</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Actions (Guide, 10 PM Summary, Settings, Logout) - Single daily review entry! */}
            <div className="space-y-2 pt-1 border-t border-gray-100">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1 px-1">
                Preferences & Tools
              </p>

              {/* 10:00 PM Daily Expense Summary (Single entry!) */}
              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  setIsDailySummaryOpen(true);
                }}
                className="w-full p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2.5">
                  <Moon className="w-4 h-4 text-amber-500" />
                  <span>10:00 PM Daily Summary & Reminder</span>
                </span>
                <span className="text-[11px] text-gray-400 font-medium">View</span>
              </button>

              {/* How SpendWise Works */}
              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  setIsHowItWorksOpen(true);
                }}
                className="w-full p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0F6443] text-xs font-bold flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#0F6443]" />
                  <span>How SpendWise Works (Guide)</span>
                </span>
                <span className="text-[11px] text-emerald-700">Open</span>
              </button>

              {/* Settings & Preferences */}
              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  setIsSettingsOpen(true);
                }}
                className="w-full p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2.5">
                  <SettingsIcon className="w-4 h-4 text-gray-600" />
                  <span>Settings & Preferences</span>
                </span>
                <span className="text-[11px] text-gray-400 font-medium">Edit</span>
              </button>

              {/* Logout */}
              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  logout();
                }}
                className="w-full p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold flex items-center justify-between transition"
              >
                <span className="flex items-center gap-2.5">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals & Drawers */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        preselectedCategoryId={preselectedCategoryId}
      />

      <AddIncomeModal
        isOpen={isAddIncomeOpen}
        onClose={() => setIsAddIncomeOpen(false)}
      />

      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        onOpenAddIncome={() => setIsAddIncomeOpen(true)}
        onOpenAddExpense={() => handleOpenAddExpense()}
      />

      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        onOpenSummaryModal={() => {
          setIsNotificationOpen(false);
          setIsDailySummaryOpen(true);
        }}
      />

      <DailySummaryModal
        isOpen={isDailySummaryOpen}
        onClose={() => setIsDailySummaryOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {isSessionLocked && (
        <BiometricLockScreen onUnlocked={() => setIsSessionLocked(false)} />
      )}
    </div>
  );
};

export const Root: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F4F8F5] flex items-center justify-center text-slate-800">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#0F6443] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-500 font-medium">Checking session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <MobileLoginScreen />;
  }

  return (
    <FinanceProvider>
      <AppContent />
    </FinanceProvider>
  );
};

export function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}

export default App;
