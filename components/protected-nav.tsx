'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { NavBrand } from '@/components/nav-brand';
import { NavLinks, NavLinksDrawer } from '@/components/nav-links';
import { ClerkUserButton } from '@/components/clerk-user-button';
import { LanguageToggle } from '@/components/language-toggle';
import { ThemeToggle } from '@/components/theme-toggle';

export function ProtectedNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    closeDrawer();
  }, [pathname, closeDrawer]);

  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

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
      <div className="toolbar-toggles">
        <ThemeToggle />
        <LanguageToggle />
      </div>
      <nav className="nav-bar nav-bar-wide">
        <NavBrand />
        <div className="nav-links nav-links-desktop">
          <NavLinks />
          <ClerkUserButton />
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

      <div
        className={`nav-drawer-backdrop ${drawerOpen ? 'open' : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

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
        <NavLinksDrawer onClose={closeDrawer} />
        <div className="nav-drawer-footer">
          <ClerkUserButton />
        </div>
        <div className="nav-drawer-toggles">
          <ThemeToggle />
          <LanguageToggle />
        </div>
      </div>
    </>
  );
}
