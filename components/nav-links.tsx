'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';

function ReviewLink({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  const { t } = useLanguage();
  const [isReviewer, setIsReviewer] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Check if user has reviewer role by trying the review API
    fetch('/api/review?count=true')
      .then(res => {
        if (res.ok) return res.json();
        return null;
      })
      .then(data => {
        if (data && typeof data.count === 'number') {
          setIsReviewer(true);
          setPendingCount(data.count);
        }
      })
      .catch(() => {});
  }, []);

  if (!isReviewer) return null;

  const linkClass = onClose ? 'nav-drawer-link' : 'nav-link';
  const activeClass = pathname === '/review' ? 'active' : '';

  return (
    <Link
      href="/review"
      className={`${linkClass} ${activeClass}`}
      onClick={onClose}
    >
      {t('Review', 'Revisar')}
      {pendingCount > 0 && (
        <span className="review-badge">{pendingCount}</span>
      )}
    </Link>
  );
}

export function NavLinks() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <>
      <Link
        href="/dashboard"
        className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`}
      >
        {t('Dashboard', 'Panel')}
      </Link>
      <Link
        href="/identify"
        className={`nav-link ${pathname === '/identify' ? 'active' : ''}`}
      >
        {t('Identify', 'Identificar')}
      </Link>
      <Link
        href="/observations"
        className={`nav-link ${pathname === '/observations' ? 'active' : ''}`}
      >
        {t('Observations', 'Observaciones')}
      </Link>
      <Link
        href="/faq"
        className={`nav-link ${pathname === '/faq' ? 'active' : ''}`}
      >
        FAQ
      </Link>
      <ReviewLink pathname={pathname} />
    </>
  );
}

const PROTECTED_LINKS = [
  { href: '/dashboard', en: 'Dashboard', es: 'Panel' },
  { href: '/identify', en: 'Identify', es: 'Identificar' },
  { href: '/observations', en: 'Observations', es: 'Observaciones' },
  { href: '/faq', en: 'FAQ', es: 'FAQ' },
] as const;

export function NavLinksDrawer({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <div className="nav-drawer-links">
      {PROTECTED_LINKS.map(link => (
        <Link
          key={link.href}
          href={link.href}
          className={`nav-drawer-link ${pathname === link.href ? 'active' : ''}`}
          onClick={onClose}
        >
          {t(link.en, link.es)}
        </Link>
      ))}
      <ReviewLink pathname={pathname} onClose={onClose} />
    </div>
  );
}
