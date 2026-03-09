'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { NavBrand } from '@/components/nav-brand';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';
import { useLanguage } from '@/hooks/use-language';

const SHARED_LINKS = [
  { href: '/observations', en: 'Observations', es: 'Observaciones' },
  { href: '/faq', en: 'FAQ', es: 'FAQ' },
] as const;

export function PublicNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  let isSignedIn = false;
  try {
    const auth = useAuth();
    isSignedIn = !!auth.isSignedIn;
  } catch {
    // Clerk not configured — treat as signed out
  }

  const authLink = isSignedIn
    ? { href: '/dashboard', en: 'Dashboard', es: 'Panel' }
    : { href: '/sign-in', en: 'Sign In', es: 'Iniciar Sesion' };

  const navLinks = [...SHARED_LINKS, authLink];
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // Close drawer on route change
  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  // Close on Escape
  useEffect(() => {
    if (!drawerOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [drawerOpen, closeDrawer]);

  return (
    <>
      <nav className="nav-bar nav-bar-wide">
        <NavBrand />
        <div className="nav-links nav-links-desktop">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link ${pathname === link.href ? 'active' : ''}`}
            >
              {t(link.en, link.es)}
            </Link>
          ))}
          <div className="nav-toggles">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
        <button
          className="hamburger-btn"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          aria-expanded={drawerOpen}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </nav>

      {/* Mobile drawer backdrop */}
      <div
        className={`nav-drawer-backdrop ${drawerOpen ? 'open' : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <div className={`nav-drawer ${drawerOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Navigation menu">
        <div className="nav-drawer-header">
          <NavBrand />
          <button className="nav-drawer-close" onClick={closeDrawer} aria-label="Close menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="nav-drawer-links">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-drawer-link ${pathname === link.href ? 'active' : ''}`}
              onClick={closeDrawer}
            >
              {t(link.en, link.es)}
            </Link>
          ))}
        </div>
        <div className="nav-drawer-toggles">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>
    </>
  );
}
