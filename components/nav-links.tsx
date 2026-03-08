'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';

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
    </div>
  );
}
