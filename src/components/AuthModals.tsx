import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { X, Mail, KeyRound, Lock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, FileText } from 'lucide-react';

// ============================================================================
// 1. FORGOT PASSWORD MODAL (EMAIL OTP VERIFICATION & PASSWORD RESET)
// ============================================================================

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
  onSuccess: (email: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  initialEmail = '',
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2>(1); // 1: Enter email, 2: Enter OTP & New Password
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setEmail(initialEmail);
      setStep(1);
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, initialEmail]);

  // Resend OTP countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!isOpen) return null;

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.forgotPassword(email.trim());
      setSuccess(res.message || `Verification code sent to ${email}`);
      setStep(2);
      setCountdown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!otp.trim() || otp.trim().length < 4) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword(email.trim(), otp.trim(), newPassword);
      onSuccess(email.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please verify your OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.forgotPassword(email.trim());
      setSuccess(`A new code was sent to ${email}`);
      setCountdown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F4F8F5] flex flex-col sm:items-center sm:justify-center sm:p-4 sm:bg-slate-900/50 sm:backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full h-full sm:h-auto sm:max-w-md sm:rounded-3xl p-6 sm:p-8 shadow-2xl border-0 sm:border border-slate-100 relative space-y-5 overflow-y-auto flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0F6443] flex items-center justify-center shadow-xs mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            {step === 1 ? 'Forgot Password?' : 'Enter Verification Code'}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {step === 1
              ? 'Enter your registered email address and we will send you a 6-digit OTP code to reset your password.'
              : `Enter the code sent to ${email} along with your new password.`}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-rose-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0F6443]" />
            <span>{success}</span>
          </div>
        )}

        {/* STEP 1: Email Form */}
        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0F6443] focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0F6443] hover:bg-[#0a4830] text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-950/15 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send OTP Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* STEP 2: OTP + New Password Form */
          <form onSubmit={handleResetPassword} className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  6-Digit OTP Code
                </label>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || loading}
                  className="text-[11px] font-bold text-[#0F6443] hover:underline disabled:text-slate-400"
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                </button>
              </div>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full text-center tracking-widest text-lg font-black py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#0F6443] focus:bg-white transition"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0F6443] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0F6443] focus:bg-white transition"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-3 bg-[#0F6443] hover:bg-[#0a4830] text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-950/15 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Reset Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// 2. TERMS OF SERVICE MODAL
// ============================================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#F4F8F5] flex flex-col sm:items-center sm:justify-center sm:p-4 sm:bg-slate-900/50 sm:backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full h-full sm:h-auto sm:max-w-lg sm:rounded-3xl p-6 sm:p-8 shadow-2xl border-0 sm:border border-slate-100 flex flex-col relative space-y-4 overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0F6443] flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Terms of Service</h2>
              <p className="text-[11px] text-slate-400 font-medium">Last updated: October 2026</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-3.5 pr-2 text-xs text-slate-600 leading-relaxed">
          <section className="space-y-1">
            <h3 className="font-bold text-slate-900 text-xs">1. Acceptance of Terms</h3>
            <p>
              By accessing or using SpendWise ("the Application"), you agree to be bound by these Terms of Service. If you do not agree to all terms, please discontinue use of the service.
            </p>
          </section>

          <section className="space-y-1">
            <h3 className="font-bold text-slate-900 text-xs">2. User Accounts & Security</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials, passwords, and verification codes. You agree to notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section className="space-y-1">
            <h3 className="font-bold text-slate-900 text-xs">3. Financial Data & Tracking</h3>
            <p>
              SpendWise is a personal budgeting and expense tracking tool designed for personal record keeping. While we provide tools for budgeting, budget alert notifications, and trends, we do not provide legal, tax, or investment advice.
            </p>
          </section>

          <section className="space-y-1">
            <h3 className="font-bold text-slate-900 text-xs">4. Permitted Use</h3>
            <p>
              You agree to use SpendWise only for lawful financial tracking purposes. You may not attempt to reverse engineer, disrupt the servers, or compromise the database infrastructure.
            </p>
          </section>

          <section className="space-y-1">
            <h3 className="font-bold text-slate-900 text-xs">5. Termination</h3>
            <p>
              We reserve the right to suspend or terminate accounts that violate our terms or engage in abusive activities without prior notice.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#0F6443] hover:bg-[#0a4830] text-white font-bold text-xs rounded-xl transition"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 3. PRIVACY POLICY MODAL
// ============================================================================

export const PrivacyModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#F4F8F5] flex flex-col sm:items-center sm:justify-center sm:p-4 sm:bg-slate-900/50 sm:backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full h-full sm:h-auto sm:max-w-lg sm:rounded-3xl p-6 sm:p-8 shadow-2xl border-0 sm:border border-slate-100 flex flex-col relative space-y-4 overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#0F6443] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Privacy Policy</h2>
              <p className="text-[11px] text-slate-400 font-medium">Your data is confidential & protected</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto space-y-3.5 pr-2 text-xs text-slate-600 leading-relaxed">
          <section className="space-y-1">
            <h3 className="font-bold text-slate-900 text-xs">1. Information We Collect</h3>
            <p>
              We collect your name, email address or mobile number for account identification. We store your income entries, expenses, budgets, savings goals, and investment plans created within SpendWise.
            </p>
          </section>

          <section className="space-y-1">
            <h3 className="font-bold text-slate-900 text-xs">2. How We Store and Protect Your Data</h3>
            <p>
              All sensitive passwords are encrypted using industry-standard bcrypt hashing before saving to the database. All financial records are stored securely in dedicated cloud database tables with SSL encryption.
            </p>
          </section>

          <section className="space-y-1">
            <h3 className="font-bold text-slate-900 text-xs">3. We Never Sell Your Data</h3>
            <p>
              Your personal financial transactions belong to you. We do not sell, rent, or monetize your transaction data with advertisers or third-party brokers.
            </p>
          </section>

          <section className="space-y-1">
            <h3 className="font-bold text-slate-900 text-xs">4. Communications & OTPs</h3>
            <p>
              We only send emails for essential account operations such as one-time verification codes (OTPs) for password resets or critical security alerts.
            </p>
          </section>

          <section className="space-y-1">
            <h3 className="font-bold text-slate-900 text-xs">5. Data Ownership & Deletion</h3>
            <p>
              You maintain full ownership of your data and can add, modify, or delete your expense and income records at any time.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#0F6443] hover:bg-[#0a4830] text-white font-bold text-xs rounded-xl transition"
          >
            Close Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 4. REGISTER OTP MODAL (VERIFY EMAIL BEFORE CREATING ACCOUNT)
// ============================================================================

interface RegisterOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  name: string;
  onVerifyAndRegister: (otp: string) => Promise<void>;
  onResendOtp: () => Promise<void>;
}

export const RegisterOtpModal: React.FC<RegisterOtpModalProps> = ({
  isOpen,
  onClose,
  email,
  name,
  onVerifyAndRegister,
  onResendOtp,
}) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(60);

  useEffect(() => {
    if (isOpen) {
      setOtp('');
      setError(null);
      setSuccess(`A 6-digit verification code was sent to ${email}`);
      setCountdown(60);
    }
  }, [isOpen, email]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length < 4) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onVerifyAndRegister(otp.trim());
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending || loading) return;
    setResending(true);
    setError(null);
    try {
      await onResendOtp();
      setSuccess(`A new 6-digit code has been sent to ${email}`);
      setCountdown(60);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F4F8F5] flex flex-col sm:items-center sm:justify-center sm:p-4 sm:bg-slate-900/50 sm:backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white w-full h-full sm:h-auto sm:max-w-md sm:rounded-3xl p-6 sm:p-8 shadow-2xl border-0 sm:border border-slate-100 relative space-y-5 overflow-y-auto flex flex-col">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0F6443] flex items-center justify-center shadow-xs mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Verify Your Email
          </h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Hi <span className="font-semibold text-slate-700">{name || 'there'}</span>! We sent a 6-digit verification code to{' '}
            <span className="font-semibold text-[#0F6443]">{email}</span>. Please enter it below to complete your registration.
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs font-semibold text-rose-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#0F6443]" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                6-Digit Verification Code
              </label>
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0 || resending || loading}
                className="text-[11px] font-bold text-[#0F6443] hover:underline disabled:text-slate-400"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : (resending ? 'Sending...' : 'Resend Code')}
              </button>
            </div>
            <input
              type="text"
              required
              autoFocus
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full text-center tracking-widest text-2xl font-black py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-[#0F6443] focus:bg-white transition"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-1/3 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || otp.length < 4}
              className="w-2/3 py-3 bg-[#0F6443] hover:bg-[#0a4830] text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-950/15 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Verify & Create</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

