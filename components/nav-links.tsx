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
        {t('Dashboard', 'Inicio')}
      </Link>
      <Link
        href="/identify"
        className={`nav-link ${pathname === '/identify' ? 'active' : ''}`}
      >
        {t('Identify', 'Identificar')}
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
