'use client';

import { useEffect, useState } from 'react';
import { useInstallPrompt, useOnlineStatus, useServiceWorker } from '@/lib/hooks/usePWA';
import { X, Download, RefreshCw, Wifi, WifiOff } from 'lucide-react';

export function PWAInstallPrompt() {
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed
    const wasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (wasDismissed) {
      setDismissed(true);
      return;
    }

    // Show prompt after a delay if can install
    if (canInstall && !isInstalled) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 10000); // Show after 10 seconds

      return () => clearTimeout(timer);
    }
  }, [canInstall, isInstalled]);

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt || dismissed || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-2xl border border-gray-200 p-6 z-50 animate-slide-up">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Download className="w-6 h-6 text-blue-600" />
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">Install ABR Insights</h3>
          <p className="text-sm text-gray-600 mb-4">
            Get faster access and work offline by installing our app
          </p>

          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Not Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PWAUpdateNotification() {
  const { isUpdateAvailable, updateServiceWorker } = useServiceWorker();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (isUpdateAvailable) {
      setShowNotification(true);
    }
  }, [isUpdateAvailable]);

  if (!showNotification) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-blue-600 text-white rounded-lg shadow-2xl p-4 z-50 animate-slide-down">
      <div className="flex items-start gap-3">
        <RefreshCw className="w-5 h-5 flex-shrink-0 mt-0.5" />
        
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Update Available</h3>
          <p className="text-sm text-blue-100 mb-3">
            A new version is ready to install
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={() => {
                updateServiceWorker();
                setShowNotification(false);
              }}
              className="bg-white text-blue-600 text-sm font-medium py-1.5 px-3 rounded hover:bg-blue-50 transition-colors"
            >
              Update Now
            </button>
            <button
              onClick={() => setShowNotification(false)}
              className="text-white text-sm font-medium py-1.5 px-3 rounded hover:bg-blue-700 transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function OnlineStatusIndicator() {
  const isOnline = useOnlineStatus();
  const [showIndicator, setShowIndicator] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setShowIndicator(true);
    } else if (wasOffline) {
      // Show "back online" message briefly
      setShowIndicator(true);
      const timer = setTimeout(() => {
        setShowIndicator(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (!showIndicator) return null;

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2 ${
        isOnline
          ? 'bg-green-600 text-white'
          : 'bg-yellow-600 text-white'
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-4 h-4" />
          <span className="text-sm font-medium">Back Online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">You&apos;re Offline</span>
        </>
      )}
    </div>
  );
}

export function PWAProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <PWAInstallPrompt />
      <PWAUpdateNotification />
      <OnlineStatusIndicator />
    </>
  );
}
