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
          variables: {
            colorPrimary: '#e7b633',
            colorTextOnPrimaryButton: '#0E0C08',
            borderRadius: '12px',
            fontFamily: "'DM Sans', sans-serif",
          },
          elements: {
            rootBox: { width: '100%', maxWidth: '420px' },
            card: {
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            },
            headerTitle: {
              fontFamily: "'Playfair Display', serif",
            },
            formButtonPrimary: {
              backgroundColor: '#e7b633',
              color: '#0E0C08',
              fontWeight: '600',
              border: 'none',
            },
            footerActionLink: { color: '#e7b633' },
            formFieldAction: { color: '#e7b633' },
            identityPreviewEditButton: { color: '#e7b633' },
          },
          layout: {
            socialButtonsPlacement: 'top',
            showOptionalFields: false,
          },
        }}
      />
    </div>
  );
}
