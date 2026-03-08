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
            colorBackground: 'rgba(18,16,10,0.95)',
            colorInputBackground: 'rgba(28,25,16,0.95)',
            colorText: '#EDE3C8',
            colorTextSecondary: 'rgba(237,227,200,0.5)',
            colorTextOnPrimaryButton: '#0E0C08',
            colorPrimary: '#e7b633',
            colorDanger: '#c86060',
            colorInputText: '#EDE3C8',
            borderRadius: '12px',
            fontFamily: "'DM Sans', sans-serif",
          },
          elements: {
            rootBox: { width: '100%', maxWidth: '420px' },
            card: {
              backgroundColor: 'rgba(18,16,10,0.95)',
              border: '1px solid rgba(231,182,51,0.20)',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            },
            headerTitle: {
              color: '#EDE3C8',
              fontFamily: "'Playfair Display', serif",
            },
            headerSubtitle: { color: 'rgba(237,227,200,0.5)' },
            socialButtonsBlockButton: {
              backgroundColor: 'rgba(28,25,16,0.95)',
              border: '1px solid rgba(231,182,51,0.15)',
              color: '#EDE3C8',
            },
            socialButtonsBlockButtonText: { color: '#EDE3C8' },
            socialButtonsProviderIcon: { filter: 'brightness(1.2)' },
            dividerLine: { backgroundColor: 'rgba(231,182,51,0.15)' },
            dividerText: { color: 'rgba(237,227,200,0.4)' },
            formFieldLabel: { color: 'rgba(237,227,200,0.65)' },
            formFieldInput: {
              backgroundColor: 'rgba(28,25,16,0.95)',
              border: '1px solid rgba(231,182,51,0.15)',
              color: '#EDE3C8',
            },
            formFieldInputShowPasswordButton: { color: 'rgba(237,227,200,0.5)' },
            formFieldAction: { color: '#e7b633' },
            formButtonPrimary: {
              backgroundColor: '#e7b633',
              color: '#0E0C08',
              fontWeight: '600',
              border: 'none',
            },
            footer: {
              backgroundColor: 'rgba(18,16,10,0.95)',
              borderTop: '1px solid rgba(231,182,51,0.10)',
            },
            footerAction: { color: 'rgba(237,227,200,0.4)' },
            footerActionLink: { color: '#e7b633' },
            footerPages: { backgroundColor: 'transparent' },
            footerPagesLink: { color: 'rgba(237,227,200,0.4)' },
            badge: {
              backgroundColor: 'rgba(231,182,51,0.15)',
              color: '#e7b633',
            },
            identityPreview: {
              backgroundColor: 'rgba(28,25,16,0.95)',
              border: '1px solid rgba(231,182,51,0.15)',
            },
            identityPreviewText: { color: '#EDE3C8' },
            identityPreviewEditButton: { color: '#e7b633' },
            alternativeMethodsBlockButton: {
              backgroundColor: 'rgba(28,25,16,0.95)',
              border: '1px solid rgba(231,182,51,0.15)',
              color: '#EDE3C8',
            },
            otpCodeFieldInput: {
              backgroundColor: 'rgba(28,25,16,0.95)',
              border: '1px solid rgba(231,182,51,0.15)',
              color: '#EDE3C8',
            },
            alert: {
              backgroundColor: 'rgba(200,90,90,0.15)',
              border: '1px solid rgba(200,90,90,0.3)',
              color: '#EDE3C8',
            },
            alertText: { color: '#EDE3C8' },
            // Force dark on internal Clerk elements that default to white
            cardBox: { backgroundColor: 'transparent' },
            main: { backgroundColor: 'transparent' },
            socialButtonsBlockButtonArrow: { color: '#EDE3C8' },
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
