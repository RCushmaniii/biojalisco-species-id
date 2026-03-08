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
            colorBackground: '#ffffff',
            colorText: '#1a1a1a',
            colorTextSecondary: '#666666',
            colorInputBackground: '#f5f5f5',
            colorInputText: '#1a1a1a',
            colorPrimary: '#e7b633',
            colorDanger: '#c44040',
            borderRadius: '12px',
            fontFamily: "'DM Sans', sans-serif",
          },
          elements: {
            rootBox: { width: '100%', maxWidth: '420px' },
            card: {
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              color: '#1a1a1a',
            },
            cardBox: {
              backgroundColor: '#ffffff',
            },
            header: {
              color: '#1a1a1a',
            },
            headerTitle: {
              fontFamily: "'Playfair Display', serif",
            },
            socialButtonsBlockButton: {
              backgroundColor: '#f5f5f5',
              border: '1px solid #e0e0e0',
              color: '#1a1a1a',
            },
            socialButtonsBlockButtonText: { color: '#1a1a1a' },
            socialButtonsIconButton: {
              backgroundColor: '#f5f5f5',
              border: '1px solid #e0e0e0',
            },
            dividerLine: { backgroundColor: '#e0e0e0' },
            dividerText: { color: '#999999' },
            formFieldLabel: { color: '#333333' },
            formFieldInput: {
              backgroundColor: '#f5f5f5',
              border: '1px solid #e0e0e0',
              color: '#1a1a1a',
            },
            formButtonPrimary: {
              backgroundColor: '#e7b633',
              color: '#0E0C08',
              fontWeight: '600',
              border: 'none',
            },
            footer: {
              backgroundColor: '#ffffff',
            },
            footerAction: { color: '#666666' },
            footerActionLink: { color: '#e7b633' },
            formFieldAction: { color: '#e7b633' },
            identityPreviewEditButton: { color: '#e7b633' },
            badge: {
              backgroundColor: '#f0f0f0',
              color: '#666666',
            },
            main: {
              backgroundColor: '#ffffff',
            },
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
