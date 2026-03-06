import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="sign-in-page">
      <h1>
        <span className="accent">Bio</span>Jalisco
      </h1>
      <p className="subtitle">Species Identifier</p>
      <SignIn
        appearance={{
          elements: {
            rootBox: { width: '100%', maxWidth: '400px' },
            card: {
              backgroundColor: 'var(--dark-surface)',
              border: '1px solid var(--gold-dim)',
              borderRadius: 'var(--radius)',
            },
            headerTitle: { color: 'var(--cream)' },
            headerSubtitle: { color: 'var(--cream-50)' },
            socialButtonsBlockButton: {
              backgroundColor: 'var(--dark-elevated)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--cream-75)',
            },
            formFieldLabel: { color: 'var(--cream-75)' },
            formFieldInput: {
              backgroundColor: 'var(--dark-elevated)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'var(--cream)',
            },
            formButtonPrimary: {
              backgroundColor: 'var(--gold)',
              color: 'var(--dark)',
            },
            footerActionLink: { color: 'var(--gold)' },
          },
        }}
      />
    </div>
  );
}
