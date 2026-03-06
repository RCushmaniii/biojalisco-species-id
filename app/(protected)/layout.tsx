import { UserButton } from '@clerk/nextjs';
import { NavLinks } from '@/components/nav-links';
import { LanguageToggle } from '@/components/language-toggle';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LanguageToggle />
      <nav className="nav-bar">
        <a href="/" className="nav-brand">
          <span className="accent">Bio</span>Jalisco
        </a>
        <div className="nav-links">
          <NavLinks />
          <UserButton
            appearance={{
              elements: {
                avatarBox: { width: '28px', height: '28px' },
              },
            }}
          />
        </div>
      </nav>
      {children}
      <div className="footer">
        Powered by GPT-4o Vision &middot; <a href="https://cushlabs.ai">CushLabs AI</a>
      </div>
    </>
  );
}
