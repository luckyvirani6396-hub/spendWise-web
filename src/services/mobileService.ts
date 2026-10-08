import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { biometricService } from './biometricService';

export interface MobileBackHandlerConfig {
  onBack: () => boolean; // returns true if consumed, false if can exit
  onLockTriggered?: () => void;
}

export const mobileService = {
  /**
   * Initializes native mobile plugins:
   * 1. Status bar mint coloring (#F4F8F5) with dark icons for high legibility
   * 2. Android hardware/gesture back button routing
   * 3. App resume background listener for biometric security lock
   */
  async initMobileApp(config: MobileBackHandlerConfig) {
    if (Capacitor.isNativePlatform()) {
      // 1. Android Status Bar Styling
      try {
        await StatusBar.setStyle({ style: Style.Light });
        await StatusBar.setBackgroundColor({ color: '#F4F8F5' });
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch (err) {
        console.warn('StatusBar configuration notice:', err);
      }

      // 2. Android Hardware Back Button
      try {
        await App.removeAllListeners();
        
        await App.addListener('backButton', ({ canGoBack }) => {
          // Check if web layer consumed the back button (e.g. closed a modal or switched tabs)
          const consumed = config.onBack();
          if (!consumed) {
            // If already on Home tab with no modals open, exit app
            App.exitApp();
          }
        });

        // 3. App State Change (Auto-lock when returning from background)
        await App.addListener('appStateChange', ({ isActive }) => {
          if (!isActive) {
            // App went to background
            if (biometricService.isLockEnabled()) {
              biometricService.lockSession();
            }
          } else {
            // App resumed
            if (biometricService.isSessionLocked() && config.onLockTriggered) {
              config.onLockTriggered();
            }
          }
        });
      } catch (err) {
        console.warn('App back button listener error:', err);
      }
    }
  },

  /**
   * Directly exit the app if needed
   */
  async exitApp() {
    if (Capacitor.isNativePlatform()) {
      await App.exitApp();
    }
  },
};
