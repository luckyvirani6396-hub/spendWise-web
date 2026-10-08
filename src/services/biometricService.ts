/**
 * Biometric & Financial Privacy Security Service
 * Supports Native WebAuthn Platform Authenticators (Android Fingerprint / Face ID)
 * with a secure 4-digit backup PIN.
 */

const STORAGE_KEYS = {
  BIOMETRIC_ENABLED: 'spendwise_biometric_enabled',
  BACKUP_PIN: 'spendwise_backup_pin',
  IS_LOCKED: 'spendwise_session_locked',
};

export const biometricService = {
  /**
   * Check if the device / browser supports biometric platform authenticators (Fingerprint, TouchID, FaceID)
   */
  async isBiometricAvailable(): Promise<boolean> {
    try {
      if (
        window.PublicKeyCredential &&
        typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
      ) {
        return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      }
      return false;
    } catch {
      return false;
    }
  },

  /**
   * Check if biometric lock is turned on by the user
   */
  isLockEnabled(): boolean {
    return localStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED) === 'true';
  },

  /**
   * Check if current session is locked
   */
  isSessionLocked(): boolean {
    if (!this.isLockEnabled()) return false;
    return sessionStorage.getItem(STORAGE_KEYS.IS_LOCKED) !== 'unlocked';
  },

  /**
   * Lock the current session
   */
  lockSession(): void {
    if (this.isLockEnabled()) {
      sessionStorage.removeItem(STORAGE_KEYS.IS_LOCKED);
    }
  },

  /**
   * Unlock the session
   */
  unlockSession(): void {
    sessionStorage.setItem(STORAGE_KEYS.IS_LOCKED, 'unlocked');
  },

  /**
   * Enable or disable biometric lock
   */
  setLockEnabled(enabled: boolean, backupPin?: string): void {
    localStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, enabled ? 'true' : 'false');
    if (backupPin) {
      localStorage.setItem(STORAGE_KEYS.BACKUP_PIN, backupPin);
    }
    if (!enabled) {
      sessionStorage.setItem(STORAGE_KEYS.IS_LOCKED, 'unlocked');
    }
  },

  /**
   * Get configured backup PIN
   */
  getBackupPin(): string | null {
    return localStorage.getItem(STORAGE_KEYS.BACKUP_PIN);
  },

  /**
   * Verify backup PIN
   */
  verifyPin(pin: string): boolean {
    const savedPin = this.getBackupPin();
    if (!savedPin) {
      // Default initial pin if none set
      return pin === '1234';
    }
    return savedPin === pin;
  },

  /**
   * Prompt biometric challenge using standard WebAuthn
   */
  async authenticateWithBiometrics(): Promise<boolean> {
    try {
      if (!window.PublicKeyCredential) {
        return false;
      }

      // Generate a random challenge buffer
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      // WebAuthn request configured for platform authenticator (fingerprint / face)
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: 'required',
          rpId: window.location.hostname || 'localhost',
          allowCredentials: [],
        },
      });

      if (credential) {
        this.unlockSession();
        return true;
      }
      return false;
    } catch (err: any) {
      // If user cancelled or device not configured, return false so fallback to PIN is presented
      console.warn('Biometric prompt feedback:', err.name || err.message);
      return false;
    }
  },
};
