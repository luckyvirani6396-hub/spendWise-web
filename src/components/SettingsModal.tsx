import React, { useState, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { useAuth } from '../context/AuthContext';
import { dbService } from '../lib/db';
import { 
  Settings, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  RotateCcw, 
  X,
  ShieldCheck,
  Check,
  Bell,
  Mail,
  Send,
  Fingerprint,
  Lock,
  Shield,
  User
} from 'lucide-react';
import { biometricService } from '../services/biometricService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEditProfile?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onOpenEditProfile }) => {
  const { settings, updateSettings, resetToDefault, triggerDailyExpenseSummary } = useFinance();

  const [testingReminder, setTestingReminder] = useState(false);
  const [reminderStatus, setReminderStatus] = useState<string | null>(null);

  const [summaryTime, setSummaryTime] = useState(settings.daily_summary_time || '22:00');
  const [summaryEnabled, setSummaryEnabled] = useState(settings.daily_summary_enabled ?? true);
  const [currencySymbol, setCurrencySymbol] = useState(settings.currency_symbol || '₹');
  const [browserNotifications, setBrowserNotifications] = useState(settings.browser_notifications_enabled ?? true);

  // Biometrics & App Lock state
  const [biometricEnabled, setBiometricEnabled] = useState(biometricService.isLockEnabled());
  const [backupPin, setBackupPin] = useState(biometricService.getBackupPin() || '1234');
  const [biometricSupported, setBiometricSupported] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setSummaryTime(settings.daily_summary_time || '22:00');
      setSummaryEnabled(settings.daily_summary_enabled ?? true);
      setCurrencySymbol(settings.currency_symbol);
      setBrowserNotifications(settings.browser_notifications_enabled);
      setReminderStatus(null);

      setBiometricEnabled(biometricService.isLockEnabled());
      setBackupPin(biometricService.getBackupPin() || '1234');
      biometricService.isBiometricAvailable().then((avail) => setBiometricSupported(avail));
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleTestReminder = async () => {
    setTestingReminder(true);
    setReminderStatus(null);
    try {
      await triggerDailyExpenseSummary();
      setReminderStatus("10:00 PM reminder triggered! Notification bell updated & email dispatched.");
    } catch (err: any) {
      setReminderStatus("Failed to send reminder: " + (err.message || 'Unknown error'));
    } finally {
      setTestingReminder(false);
    }
  };

  const handleLockNow = () => {
    biometricService.lockSession();
    onClose();
    window.dispatchEvent(new CustomEvent('spendwise_lock_app'));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    biometricService.setLockEnabled(biometricEnabled, backupPin);

    await updateSettings({
      ...settings,
      daily_summary_time: summaryTime,
      daily_summary_enabled: summaryEnabled,
      currency_symbol: currencySymbol,
      browser_notifications_enabled: browserNotifications,
    });

    onClose();
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all data back to the default initial setup?')) {
      resetToDefault();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F4F8F5] flex flex-col sm:items-center sm:justify-center sm:p-4 sm:bg-black/60 sm:backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full h-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg bg-white sm:rounded-3xl shadow-2xl border-0 sm:border border-gray-100 overflow-hidden text-slate-800 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 bg-[#F9FAF9] border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F5EE] text-[#0F6443] flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">SpendWise Settings</h3>
              <p className="text-xs text-gray-500">Preferences, notifications and app security</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Daily Expense Summary Configuration */}
          <div className="p-4 bg-[#F8FAF8] border border-gray-100 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#0F6443]" />
                <h4 className="font-bold text-sm text-gray-900">10:00 PM Daily Expense Reminder & Summary</h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                Gmail + Push
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Every day at 10:00 PM, SpendWise sends a reminder notification to record today's expenses, tallies today's spending vs remaining budget, and sends an email report to your inbox.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Reminder Time (24h)
                </label>
                <input
                  type="time"
                  value={summaryTime}
                  onChange={(e) => setSummaryTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0F6443]/20 focus:border-[#0F6443] font-medium"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={summaryEnabled}
                    onChange={(e) => setSummaryEnabled(e.target.checked)}
                    className="w-4 h-4 text-[#0F6443] rounded border-gray-300 focus:ring-[#0F6443]"
                  />
                  <span className="text-xs text-gray-700 font-medium">Daily Reminder Alert</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={browserNotifications}
                  onChange={(e) => setBrowserNotifications(e.target.checked)}
                  className="w-4 h-4 text-[#0F6443] rounded border-gray-300 focus:ring-[#0F6443]"
                />
                <span className="text-xs text-gray-600 font-medium">Enable system/browser push</span>
              </label>

              <button
                type="button"
                onClick={handleTestReminder}
                disabled={testingReminder}
                className="px-3 py-1.5 bg-[#E8F5EE] hover:bg-[#d5eee0] text-[#0F6443] rounded-xl text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Send className={`w-3 h-3 ${testingReminder ? 'animate-spin' : ''}`} />
                <span>{testingReminder ? 'Sending...' : 'Test 10 PM Reminder Now'}</span>
              </button>
            </div>

            {reminderStatus && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{reminderStatus}</span>
              </div>
            )}
          </div>

          {/* Biometric & Privacy Lock Configuration */}
          <div className="p-4 bg-[#F8FAF8] border border-gray-100 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-[#0F6443]" />
                <h4 className="font-bold text-sm text-gray-900">Biometric & Fingerprint Security</h4>
              </div>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                biometricSupported ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
              }`}>
                <Shield className="w-3 h-3 text-[#0F6443]" />
                {biometricSupported ? 'Hardware Ready' : 'PIN Supported'}
              </span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Require Fingerprint, Face ID, or a secure 4-digit PIN whenever you open or resume SpendWise to keep your financial balances private.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={biometricEnabled}
                    onChange={(e) => setBiometricEnabled(e.target.checked)}
                    className="w-4 h-4 text-[#0F6443] rounded border-gray-300 focus:ring-[#0F6443]"
                  />
                  <span className="text-xs text-gray-700 font-medium">Enable Biometric App Lock</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Backup 4-Digit PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={backupPin}
                  onChange={(e) => setBackupPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="1234"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0F6443]/20 focus:border-[#0F6443] font-bold tracking-widest text-center"
                />
              </div>
            </div>

            {biometricEnabled && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-gray-500">App automatically locks when closed or switched.</span>
                <button
                  type="button"
                  onClick={handleLockNow}
                  className="px-3 py-1.5 bg-[#E8F5EE] hover:bg-[#d5eee0] text-[#0F6443] rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock App Now</span>
                </button>
              </div>
            )}
          </div>

          {/* Currency Preference & Maintenance */}
          <div className="p-4 bg-[#F8FAF8] border border-gray-100 rounded-2xl space-y-3">
            <h4 className="font-bold text-sm text-gray-900">Currency & Reset</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={(e) => setCurrencySymbol(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0F6443]/20 focus:border-[#0F6443] font-bold"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                {onOpenEditProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenEditProfile();
                    }}
                    className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-[#0F6443] border border-emerald-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Edit Profile & Account</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleResetData}
                  className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Demo Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#F9FAF9] border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400">SpendWise • Personal Finance</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveSettings}
              className="px-5 py-2 bg-[#0F6443] hover:bg-[#0B4D33] text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
