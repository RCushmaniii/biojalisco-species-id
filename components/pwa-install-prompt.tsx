'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'biojalisco-pwa-dismiss';
const DISMISS_EXPIRY_DAYS = 14;

export function PWAInstallPrompt() {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [closing, setClosing] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Detect if already running as installed PWA
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    // Detect iOS
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Mac') && 'ontouchend' in document);
    setIsIOS(ios);

    // Check if user dismissed recently
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      if (Date.now() - dismissedAt < DISMISS_EXPIRY_DAYS * 24 * 60 * 60 * 1000) return;
      localStorage.removeItem(DISMISS_KEY);
    }

    // Android/Chrome: capture the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Show banner after brief delay (let user engage with content first)
    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setShowBanner(false);
      setClosing(false);
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    }, 300);
  }, []);

  // Don't show if already installed, or banner not ready
  if (isStandalone || !showBanner) return null;

  // Only show if we have a deferred prompt (Android) or it's iOS
  const canShow = deferredPrompt || isIOS;
  if (!canShow) return null;

  return (
    <div
      ref={bannerRef}
      className={`pwa-install-banner ${closing ? 'pwa-install-closing' : ''}`}
      role="complementary"
      aria-label={t('Install app', 'Instalar aplicación')}
    >
      <div className="pwa-install-content">
        <div className="pwa-install-icon">
          <img src="/images/icon-96x96.png" alt="BioJalisco" width={40} height={40} />
        </div>
        <div className="pwa-install-text">
          <strong>{t('Install BioJalisco', 'Instalar BioJalisco')}</strong>
          <span>
            {isIOS
              ? t(
                  'Tap the Share button, then "Add to Home Screen"',
                  'Toca el botón Compartir y luego "Agregar a Inicio"'
                )
              : t(
                  'Add to your home screen for quick access',
                  'Agrega a tu pantalla de inicio para acceso rápido'
                )}
          </span>
        </div>
        <div className="pwa-install-actions">
          {!isIOS && (
            <button className="pwa-install-btn" onClick={handleInstall}>
              {t('Install', 'Instalar')}
            </button>
          )}
          <button
            className="pwa-dismiss-btn"
            onClick={handleDismiss}
            aria-label={t('Dismiss', 'Cerrar')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {isIOS && (
        <div className="pwa-ios-hint">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
          <span>
            {t(
              'In Safari, tap the share icon at the bottom of your screen',
              'En Safari, toca el icono de compartir en la parte inferior de tu pantalla'
            )}
          </span>
        </div>
      )}
    </div>
  );
}
