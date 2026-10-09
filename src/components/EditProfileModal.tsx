import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';
import { X, User, Mail, Phone, Lock, Trash2, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateProfile, deleteAccount } = useAuth();
  const { settings, updateSettings } = useFinance();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('₹');

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setMobile(user.mobile || '');
      setCurrencySymbol(user.currency_symbol || settings.currency_symbol || '₹');
      setNewPassword('');
      setError(null);
      setSuccess(null);
      setShowDeleteConfirm(false);
    }
  }, [isOpen, user, settings]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim() || undefined,
        mobile: mobile.trim() || undefined,
        password: newPassword.trim() ? newPassword.trim() : undefined,
        currency_symbol: currencySymbol,
      });

      if (currencySymbol !== settings.currency_symbol) {
        await updateSettings({
          ...settings,
          currency_symbol: currencySymbol,
        });
      }

      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setError(null);
    try {
      const res = await deleteAccount();
      alert(`Your account has been deactivated and scheduled for permanent deletion in 30 days.\n\nAll your data will be automatically purged from the database after 30 days.\n\nIf you log back in within 30 days, your account will be restored.`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to delete account');
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F4F8F5] flex flex-col sm:items-center sm:justify-center sm:p-4 sm:bg-slate-900/50 sm:backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full h-full sm:h-auto sm:max-w-lg sm:rounded-3xl p-6 sm:p-7 shadow-2xl border-0 sm:border border-slate-100 relative space-y-6 overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 sm:border-0 sm:pb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#0F6443] flex items-center justify-center font-black shadow-xs shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Edit Profile & Account</h2>
              <p className="text-[11px] text-slate-500 font-medium">Update your details or manage account deletion</p>
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
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-rose-600 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Profile Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          
          {/* Full Name */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0F6443] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0F6443] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Mobile Number */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Mobile Number (Optional)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0F6443] focus:bg-white transition"
              />
            </div>
          </div>

          {/* New Password (Optional) */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Change Password (Leave blank to keep unchanged)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 6 characters)"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0F6443] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Currency Symbol */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Preferred Currency Symbol
            </label>
            <div className="flex gap-2">
              {['₹', '$', '€', '£', 'AED'].map((cur) => (
                <button
                  type="button"
                  key={cur}
                  onClick={() => setCurrencySymbol(cur)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                    currencySymbol === cur
                      ? 'bg-[#E8F5EE] border-[#0F6443] text-[#0F6443]'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-[#0F6443] hover:bg-[#0a4830] text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-950/15 flex items-center justify-center gap-1.5 transition active:scale-98 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Save Profile Changes</span>
            )}
          </button>
        </form>

        {/* Danger Zone: Delete Account */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Danger Zone</span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-rose-900">Delete Account & Auto-Purge</h4>
              <p className="text-[11px] text-rose-700/90 mt-1 leading-relaxed">
                When you delete your account, your data is scheduled for <strong>permanent auto-deletion after 30 days</strong>. If you log back in within 30 days, your account will be automatically restored.
              </p>
            </div>

            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-white border border-rose-200 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account (30 Days Auto-Delete)</span>
              </button>
            ) : (
              <div className="space-y-2.5 pt-1">
                <p className="text-[11px] font-bold text-rose-800">
                  ⚠️ Are you sure you want to schedule your account for deletion?
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="w-1/2 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="w-1/2 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50"
                  >
                    {deleting ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span>Yes, Delete</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
