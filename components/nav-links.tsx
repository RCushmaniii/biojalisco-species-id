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
        href="/"
        className={`nav-link ${pathname === '/' ? 'active' : ''}`}
      >
        {t('Dashboard', 'Inicio')}
      </Link>
      <Link
        href="/identify"
        className={`nav-link ${pathname === '/identify' ? 'active' : ''}`}
      >
        {t('Identify', 'Identificar')}
      </Link>
    </>
  );
}
