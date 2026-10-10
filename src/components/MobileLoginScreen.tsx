import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  BarChart3, 
  PieChart, 
  Target, 
  Bell, 
  TrendingUp, 
  Database,
  Check,
  ShieldCheck
} from 'lucide-react';
import { ForgotPasswordModal, TermsModal, PrivacyModal, RegisterOtpModal } from './AuthModals';
import { api } from '../lib/api';

export const MobileLoginScreen: React.FC = () => {
  const { login, register, isNeonConnected } = useAuth();
  
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState(''); // Email or Mobile
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Interactive Modals State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showRegisterOtpModal, setShowRegisterOtpModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!identifier.trim()) {
      setError('Please enter your email or mobile number');
      return;
    }

    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    if (isRegisterMode) {
      if (!name.trim()) {
        setError('Please enter your full name');
        return;
      }
      if (confirmPassword && confirmPassword !== password) {
        setError('Passwords do not match');
        return;
      }

      // If user registers with an email, send OTP first and verify
      if (identifier.includes('@')) {
        setLoading(true);
        try {
          await api.sendRegisterOtp(identifier.trim(), name.trim());
          setShowRegisterOtpModal(true);
        } catch (err: any) {
          setError(err.message || 'Failed to send verification code. Please check your email.');
        } finally {
          setLoading(false);
        }
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegisterMode) {
        await register(name.trim(), identifier.trim(), password);
        setSuccessMsg('Account created successfully!');
      } else {
        await login(identifier.trim(), password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials or server connection.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#F2F9F5] via-[#EAF5EF] to-[#D5EDE0] flex flex-col font-sans selection:bg-[#E8F5EE] selection:text-[#0F6443] text-slate-800">
      
      {/* ========================================================= */}
      {/* DESKTOP / LAPTOP LAYOUT (Visible on lg: screens and up)   */}
      {/* ========================================================= */}
      <div className="hidden lg:flex min-h-screen w-full flex-row">
        
        {/* Left Side: Brand Showcase & Hero */}
        <div className="w-[58%] xl:w-[60%] relative flex flex-col justify-between p-10 xl:p-14 overflow-hidden bg-gradient-to-br from-[#FAFCFA] via-[#F0F8F3] to-[#E3F4EB]">
          {/* Background Decorative Mint Blobs */}
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-emerald-200/40 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[300px] bg-teal-200/30 rounded-full blur-[90px] pointer-events-none -ml-20 -mb-20" />

          {/* Top Logo */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#0F6443] flex items-center justify-center shadow-md text-white">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A9.49 9.49 0 0 1 12 20c7 0 11-8 11-8s-2.5 0-6-4zm-5 10c-1.87 0-3.52-.75-4.73-1.95C9.72 13.07 13.12 10.5 17 9.87c-1.5 5.5-4.14 8.13-5 8.13z"/>
                </svg>
              </div>
              <div>
                <span className="font-extrabold text-2xl tracking-tight text-slate-900">
                  Spend<span className="text-[#0F6443]">Wise</span>
                </span>
                <p className="text-[11px] font-medium text-slate-500 tracking-wider">
                  Track · Plan · Save · Grow
                </p>
              </div>
            </div>

            {/* Security Indicator Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0F6443]" />
              <span>Bank-Grade Security</span>
            </div>
          </div>

          {/* Center Content: Headline & Illustration */}
          <div className="relative z-10 grid grid-cols-12 gap-8 my-auto py-6 items-center">
            
            {/* Left Col: Headline & Features */}
            <div className="col-span-7 space-y-6">
              <div className="space-y-3">
                <h1 className="text-4xl xl:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                  Take Control <br />
                  of <span className="text-[#0F6443]">Your Money</span>
                </h1>
                <p className="text-slate-600 text-sm xl:text-base leading-relaxed max-w-md font-medium">
                  Track your income, manage expenses, set budgets and build a better financial future — all in one place.
                </p>
              </div>

              {/* 5 Feature Badges matching Design */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#E6F7EF] flex items-center justify-center shrink-0 shadow-sm text-[#10B981]">
                    <BarChart3 className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Track Income & Expenses</h4>
                    <p className="text-xs text-slate-500">Know where your money goes</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#FCE8F0] flex items-center justify-center shrink-0 shadow-sm text-[#F43F5E]">
                    <PieChart className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Set Monthly Budgets</h4>
                    <p className="text-xs text-slate-500">Stay within your limits</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#EBF2FE] flex items-center justify-center shrink-0 shadow-sm text-[#2563EB]">
                    <Target className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Plan Savings & Investments</h4>
                    <p className="text-xs text-slate-500">Build your future</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#FEF6E6] flex items-center justify-center shrink-0 shadow-sm text-[#F59E0B]">
                    <Bell className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Get Smart Alerts</h4>
                    <p className="text-xs text-slate-500">Be notified before you exceed limits</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0 shadow-sm text-purple-600">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">View Reports & Insights</h4>
                    <p className="text-xs text-slate-500">Make better financial decisions</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Col: Fintech Dashboard Artwork Image */}
            <div className="col-span-5 flex justify-center items-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-emerald-200/50 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition duration-500" />
                <img 
                  src="/hero-dashboard.png" 
                  alt="SpendWise Fintech Dashboard with Rupee Coins" 
                  className="relative z-10 w-full max-w-[320px] h-auto object-contain drop-shadow-xl transform group-hover:scale-105 transition duration-500"
                />
              </div>
            </div>
          </div>

          {/* Bottom Illustration & Tagline */}
          <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-emerald-900/10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span>Small Steps, Big Goals</span>
            </div>
            <span>SpendWise Pro • Encrypted & Secure</span>
          </div>
        </div>

        {/* Right Side: Auth Card matching Design */}
        <div className="w-[42%] xl:w-[40%] bg-white flex flex-col justify-center items-center p-8 xl:p-14 shadow-xl border-l border-slate-100 relative">
          <div className="w-full max-w-sm space-y-5">
            
            {/* Segmented Control Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#F1F5F2] rounded-2xl">
              <button
                type="button"
                onClick={() => { setIsRegisterMode(false); setError(null); }}
                className={`py-2.5 rounded-xl text-xs font-bold transition ${
                  !isRegisterMode
                    ? 'bg-[#E8F5EE] text-[#0F6443] shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsRegisterMode(true); setError(null); }}
                className={`py-2.5 rounded-xl text-xs font-bold transition ${
                  isRegisterMode
                    ? 'bg-[#E8F5EE] text-[#0F6443] shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error or Success Notice */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
                {successMsg}
              </div>
            )}

            {/* Main Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Full Name (when Registering) */}
              {isRegisterMode && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-[#0F6443] focus:ring-2 focus:ring-[#0F6443]/15 transition placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}

              {/* Email / Mobile Input */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="you@example.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-[#0F6443] focus:ring-2 focus:ring-[#0F6443]/15 transition placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-[#0F6443] focus:ring-2 focus:ring-[#0F6443]/15 transition placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (when Registering) */}
              {isRegisterMode && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-[#0F6443] focus:ring-2 focus:ring-[#0F6443]/15 transition placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0F6443] accent-[#0F6443] cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="font-semibold text-[#0F6443] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Primary Action Button matching Image */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#0F6443] hover:bg-[#0a4830] text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/15 flex items-center justify-center gap-2 transition transform active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isRegisterMode ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Terms Footer */}
            <p className="text-[11px] text-slate-400 text-center leading-relaxed">
              By signing in, you agree to our{' '}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="font-semibold text-[#0F6443] underline hover:text-[#0b4d33]"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="font-semibold text-[#0F6443] underline hover:text-[#0b4d33]"
              >
                Privacy Policy
              </button>.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MOBILE SCREEN LAYOUT (Pixel-Perfect Match of User's Image)*/}
      {/* ========================================================= */}
      <div className="lg:hidden flex flex-col min-h-screen w-full relative bg-gradient-to-b from-[#F2F9F5] via-[#EAF5EF] to-[#D5EDE0] overflow-x-hidden pt-[max(env(safe-area-inset-top),1rem)]">
        
        {/* SpendWise Brand Header Row: Logo + Brand Name */}
        <div className="px-6 pt-3 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0F6443] flex items-center justify-center text-white shadow-sm">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A9.49 9.49 0 0 1 12 20c7 0 11-8 11-8s-2.5 0-6-4zm-5 10c-1.87 0-3.52-.75-4.73-1.95C9.72 13.07 13.12 10.5 17 9.87c-1.5 5.5-4.14 8.13-5 8.13z"/>
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                Spend<span className="text-[#0F6443]">Wise</span>
              </span>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">
                Track · Plan · Save · Grow
              </p>
            </div>
          </div>
        </div>

        {/* Headline + Artwork Image Row (Side-by-Side matching Image) */}
        <div className="relative px-6 pt-4 flex items-start justify-between overflow-hidden">
          {/* Left Text Column */}
          <div className="w-[58%] z-10 pt-1 space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Take Control <br />
              of <span className="text-[#0F6443]">Your Money</span>
            </h1>
            <p className="text-slate-600 text-xs leading-relaxed font-medium">
              Track your income, manage expenses, set budgets and build a better financial future.
            </p>
          </div>

          {/* Right Artwork Illustration: Modern Fintech Dashboard with Rupee Coins */}
          <div className="w-[42%] -mr-2 -mt-3 flex justify-end relative">
            <div className="absolute inset-0 bg-emerald-200/50 rounded-full blur-xl scale-110 pointer-events-none" />
            <img 
              src="/hero-dashboard.png" 
              alt="SpendWise Fintech Dashboard with Rupee Coins" 
              className="relative z-10 w-full max-w-[170px] h-auto object-contain drop-shadow-md"
            />
          </div>
        </div>

        {/* 4 Feature Circles Row matching User's Image */}
        <div className="px-6 pt-4 pb-2 grid grid-cols-4 gap-2 text-center">
          {/* 1. Track Expenses */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-full bg-[#E6F7EF] flex items-center justify-center text-[#10B981] shadow-2xs">
              <BarChart3 className="w-5 h-5 fill-current" />
            </div>
            <span className="text-[10px] font-bold text-slate-800 leading-tight">Track<br/>Expenses</span>
          </div>

          {/* 2. Set Budgets */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-full bg-[#FCE8F0] flex items-center justify-center text-[#F43F5E] shadow-2xs">
              <PieChart className="w-5 h-5 fill-current" />
            </div>
            <span className="text-[10px] font-bold text-slate-800 leading-tight">Set<br/>Budgets</span>
          </div>

          {/* 3. Plan Savings */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-full bg-[#EBF2FE] flex items-center justify-center text-[#2563EB] shadow-2xs">
              <Target className="w-5 h-5 fill-current" />
            </div>
            <span className="text-[10px] font-bold text-slate-800 leading-tight">Plan<br/>Savings</span>
          </div>

          {/* 4. Get Smart Alerts */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-full bg-[#FEF6E6] flex items-center justify-center text-[#F59E0B] shadow-2xs">
              <Bell className="w-5 h-5 fill-current" />
            </div>
            <span className="text-[10px] font-bold text-slate-800 leading-tight">Get<br/>Smart Alerts</span>
          </div>
        </div>

        {/* Floating White Auth Card Container */}
        <div className="mt-auto px-4 pb-6 pt-1">
          <div className="bg-white rounded-[32px] p-6 shadow-2xl border border-white/80 space-y-4">
            
            {/* Segmented Control Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#F1F5F2] rounded-2xl">
              <button
                type="button"
                onClick={() => { setIsRegisterMode(false); setError(null); }}
                className={`py-2.5 rounded-xl text-xs font-bold transition ${
                  !isRegisterMode
                    ? 'bg-[#E8F5EE] text-[#0F6443] shadow-xs'
                    : 'text-slate-500 font-semibold'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsRegisterMode(true); setError(null); }}
                className={`py-2.5 rounded-xl text-xs font-bold transition ${
                  isRegisterMode
                    ? 'bg-[#E8F5EE] text-[#0F6443] shadow-xs'
                    : 'text-slate-500 font-semibold'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error or Success Notice */}
            {error && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}
            {successMsg && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
                {successMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Full Name (if registering) */}
              {isRegisterMode && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#0F6443] focus:ring-1 focus:ring-[#0F6443]"
                    />
                  </div>
                </div>
              )}

              {/* Email / Mobile */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="you@example.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#0F6443] focus:ring-1 focus:ring-[#0F6443]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#0F6443] focus:ring-1 focus:ring-[#0F6443]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (when registering) */}
              {isRegisterMode && (
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#0F6443] focus:ring-1 focus:ring-[#0F6443]"
                    />
                  </div>
                </div>
              )}

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0F6443] accent-[#0F6443]"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="font-bold text-[#0F6443] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Primary Sign In Button: Sign In → */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#0F6443] hover:bg-[#0a4830] text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/15 flex items-center justify-center gap-2 transition active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{isRegisterMode ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Terms Footer */}
            <p className="text-[11px] text-slate-400 text-center leading-relaxed pt-1">
              By signing in, you agree to our{' '}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="font-semibold text-[#0F6443] underline hover:text-[#0b4d33]"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="font-semibold text-[#0F6443] underline hover:text-[#0b4d33]"
              >
                Privacy Policy
              </button>.
            </p>
          </div>
        </div>

        {/* Bottom Decorative Wave */}
        <div className="w-full pointer-events-none mt-auto">
          <svg className="w-full h-8 text-[#A8D8BF]/40 fill-current" viewBox="0 0 375 32" preserveAspectRatio="none">
            <path d="M0,16 C90,32 180,0 270,16 C315,24 350,28 375,32 L375,32 L0,32 Z" />
          </svg>
        </div>
      </div>

      {/* Interactive Modals */}
      <ForgotPasswordModal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        initialEmail={identifier.includes('@') ? identifier : ''}
        onSuccess={(resetEmail) => {
          setSuccessMsg('Password has been reset successfully! Please sign in with your new password.');
          setIdentifier(resetEmail);
          setIsRegisterMode(false);
        }}
      />

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />

      <PrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

      <RegisterOtpModal
        isOpen={showRegisterOtpModal}
        onClose={() => setShowRegisterOtpModal(false)}
        email={identifier.trim()}
        name={name.trim()}
        onVerifyAndRegister={async (otp) => {
          await register(name.trim(), identifier.trim(), password, otp);
          setShowRegisterOtpModal(false);
          setSuccessMsg('Account created successfully! Welcome to SpendWise.');
        }}
        onResendOtp={async () => {
          await api.sendRegisterOtp(identifier.trim(), name.trim());
        }}
      />

    </div>
  );
};

export default MobileLoginScreen;
