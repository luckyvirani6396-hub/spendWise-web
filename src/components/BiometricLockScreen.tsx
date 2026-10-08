import React, { useState, useEffect } from 'react';
import { biometricService } from '../services/biometricService';
import { Fingerprint, Lock, ShieldCheck, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';

interface BiometricLockScreenProps {
  onUnlocked: () => void;
}

export const BiometricLockScreen: React.FC<BiometricLockScreenProps> = ({ onUnlocked }) => {
  const [usePinMode, setUsePinMode] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Auto-attempt biometrics on mount
  useEffect(() => {
    handleBiometricPrompt();
  }, []);

  const handleBiometricPrompt = async () => {
    setIsAuthenticating(true);
    setError(null);
    try {
      const success = await biometricService.authenticateWithBiometrics();
      if (success) {
        onUnlocked();
      } else {
        setError('Biometric prompt dismissed or unconfigured. Use your PIN below.');
        setUsePinMode(true);
      }
    } catch {
      setError('Biometric verification failed. Please enter your PIN.');
      setUsePinMode(true);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handlePinInput = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(null);

      if (nextPin.length === 4) {
        // Automatically check when 4 digits reached
        setTimeout(() => {
          if (biometricService.verifyPin(nextPin)) {
            biometricService.unlockSession();
            onUnlocked();
          } else {
            setError('Incorrect PIN. Please try again.');
            setPin('');
          }
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#F4F8F5] flex flex-col items-center justify-between p-6 select-none animate-in fade-in duration-200">
      {/* Top Brand Header */}
      <div className="w-full flex items-center justify-between max-w-sm pt-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-[#0F6443] flex items-center justify-center text-white font-bold shadow-md shadow-[#0F6443]/20">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-gray-900 tracking-tight">SpendWise</h1>
            <p className="text-[10px] text-gray-500 font-medium">Vault Protected</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
          <Lock className="w-3 h-3 text-[#0F6443]" />
          <span>Locked</span>
        </div>
      </div>

      {/* Center Biometrics / PIN Module */}
      <div className="w-full max-w-sm flex flex-col items-center justify-center my-auto py-6">
        {!usePinMode ? (
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Glowing biometric radar ring */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-32 h-32 rounded-full bg-emerald-200/50 animate-ping opacity-30" />
              <div className="absolute w-28 h-28 rounded-full bg-emerald-100 animate-pulse" />
              <button
                type="button"
                onClick={handleBiometricPrompt}
                disabled={isAuthenticating}
                className="relative z-10 w-24 h-24 rounded-3xl bg-[#0F6443] hover:bg-[#0B4D33] text-white flex items-center justify-center shadow-xl shadow-[#0F6443]/25 active:scale-95 transition"
              >
                <Fingerprint className={`w-12 h-12 text-emerald-300 ${isAuthenticating ? 'animate-pulse' : ''}`} />
              </button>
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-gray-900">Unlock SpendWise</h2>
              <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                Touch your fingerprint sensor or verify with Face ID to access your financial records.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2.5 w-full">
              <button
                type="button"
                onClick={handleBiometricPrompt}
                disabled={isAuthenticating}
                className="w-full py-3 bg-[#0F6443] hover:bg-[#0B4D33] text-white rounded-2xl text-xs font-bold transition shadow-sm active:scale-98"
              >
                {isAuthenticating ? 'Scanning...' : 'Verify Fingerprint / Face ID'}
              </button>

              <button
                type="button"
                onClick={() => setUsePinMode(true)}
                className="w-full py-2.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-gray-400" />
                <span>Use 4-digit PIN instead</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center space-y-5 animate-in fade-in duration-150">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-gray-900">Enter Backup PIN</h2>
              <p className="text-xs text-gray-500">Enter your 4-digit security PIN to unlock</p>
            </div>

            {/* PIN Dots */}
            <div className="flex items-center gap-4 py-2">
              {[0, 1, 2, 3].map((index) => {
                const filled = pin.length > index;
                return (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full transition-all duration-200 ${
                      filled
                        ? 'bg-[#0F6443] scale-110 shadow-sm shadow-[#0F6443]/30'
                        : 'border-2 border-gray-300 bg-transparent'
                    }`}
                  />
                );
              })}
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  onClick={() => handlePinInput(digit)}
                  className="h-14 rounded-2xl bg-white hover:bg-emerald-50 text-gray-800 font-bold text-lg shadow-xs border border-gray-100 flex items-center justify-center active:scale-95 transition"
                >
                  {digit}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setUsePinMode(false)}
                className="h-14 rounded-2xl bg-white/70 hover:bg-emerald-50 text-gray-500 font-medium text-xs flex flex-col items-center justify-center active:scale-95 transition border border-gray-100"
              >
                <Fingerprint className="w-5 h-5 text-[#0F6443]" />
                <span className="text-[10px] mt-0.5">Biometric</span>
              </button>
              <button
                type="button"
                onClick={() => handlePinInput('0')}
                className="h-14 rounded-2xl bg-white hover:bg-emerald-50 text-gray-800 font-bold text-lg shadow-xs border border-gray-100 flex items-center justify-center active:scale-95 transition"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="h-14 rounded-2xl bg-white/70 hover:bg-rose-50 text-gray-500 font-bold text-xs flex items-center justify-center active:scale-95 transition border border-gray-100"
              >
                ⌫
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="text-center text-[11px] text-gray-400">
        Secured with End-to-End Local Biometric Encryption
      </div>
    </div>
  );
};
