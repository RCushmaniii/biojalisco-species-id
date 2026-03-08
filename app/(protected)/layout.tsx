import { ProtectedNav } from '@/components/protected-nav';
import { SiteFooter } from '@/components/site-footer';

export const dynamic = 'force-dynamic';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ProtectedNav />
      {children}
      <SiteFooter />
    </>
  );
}
