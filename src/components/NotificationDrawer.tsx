import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { 
  X, 
  Moon, 
  Bell, 
  AlertCircle, 
  TrendingUp, 
  Calendar, 
  Check, 
  Trash2,
  ChevronRight
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSummaryModal?: () => void;
}

type NotificationFilter = 'All' | 'Budget' | 'Summary' | 'System';

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onOpenSummaryModal,
}) => {
  const { alerts, markAlertAsRead, clearAllAlerts } = useFinance();
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>('All');

  if (!isOpen) return null;

  // Preset notifications if alerts are empty to match Screen 9
  const displayNotifications = alerts.length > 0 ? alerts : [
    {
      id: 'n1',
      title: 'Daily Expense Summary',
      message: "Today's spending: ₹1,240",
      created_at: '7 Oct 2026, 9:30 PM',
      type: 'summary',
      icon: 'moon',
      color: '#8B5CF6',
      bgColor: '#EDE9FE',
    },
    {
      id: 'n2',
      title: 'Food budget warning',
      message: 'You have used 74% of your ₹2,500 food budget.',
      created_at: '7 Oct 2026, 6:15 PM',
      type: 'budget',
      icon: 'bell',
      color: '#F59E0B',
      bgColor: '#FEF3C7',
    },
    {
      id: 'n3',
      title: 'Rent budget exceeded',
      message: 'You have exceeded your ₹5,000 rent budget.',
      created_at: '5 Oct 2026, 10:20 AM',
      type: 'budget',
      icon: 'alert',
      color: '#EF4444',
      bgColor: '#FEE2E2',
    },
    {
      id: 'n4',
      title: 'SIP Investment added',
      message: '₹6,000 added to SIP.',
      created_at: '5 Oct 2026, 9:00 AM',
      type: 'system',
      icon: 'trending',
      color: '#6366F1',
      bgColor: '#E0E7FF',
    },
    {
      id: 'n5',
      title: 'New month budget created',
      message: 'October 2026 budget is ready.',
      created_at: '1 Oct 2026, 8:00 AM',
      type: 'system',
      icon: 'calendar',
      color: '#10B981',
      bgColor: '#E6F4EA',
    },
  ];

  const filtered = displayNotifications.filter((n: any) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Budget') return n.type === 'budget' || n.type === 'warning' || n.type === 'critical' || n.type === 'exceeded';
    if (activeFilter === 'Summary') return n.type === 'summary' || n.type === 'daily_summary';
    if (activeFilter === 'System') return n.type === 'system';
    return true;
  });

  const renderIcon = (item: any) => {
    if (item.type === 'daily_summary' || item.icon === 'moon') {
      return <Moon className="w-5 h-5 text-purple-600" />;
    }
    if (item.type === 'exceeded' || item.icon === 'alert') {
      return <AlertCircle className="w-5 h-5 text-rose-600" />;
    }
    if (item.icon === 'trending') {
      return <TrendingUp className="w-5 h-5 text-indigo-600" />;
    }
    if (item.icon === 'calendar') {
      return <Calendar className="w-5 h-5 text-emerald-600" />;
    }
    return <Bell className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col p-6 space-y-4 overflow-hidden">
        
        {/* Header matching Screen 9 */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Notifications</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={() => clearAllAlerts()}
              className="p-2 text-slate-400 hover:text-rose-600 transition"
              title="Clear all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 hover:text-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pill Tabs matching Screen 9 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {(['All', 'Budget', 'Summary', 'System'] as NotificationFilter[]).map((tab) => {
            const isActive = activeFilter === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-[#0F6443] text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Notifications List matching Screen 9 */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filtered.map((item: any) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.type === 'daily_summary' || item.icon === 'moon') {
                  onClose();
                  onOpenSummaryModal?.();
                }
              }}
              className="p-3.5 bg-white border border-slate-100 hover:border-slate-200 rounded-2xl shadow-xs flex items-start gap-3 transition cursor-pointer"
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 shadow-2xs">
                {renderIcon(item)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-xs text-slate-900">{item.title}</div>
                <div className="text-[11px] text-slate-600 font-medium mt-0.5 leading-snug">
                  {item.message}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-1">
                  {item.created_at}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
