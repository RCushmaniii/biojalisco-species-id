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
            rootBox: { width: '100%', maxWidth: '420px' },
            card: {
              backgroundColor: 'rgba(18,16,10,0.92)',
              border: '1px solid rgba(240,192,64,0.20)',
              borderRadius: '20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            },
            headerTitle: {
              color: '#EDE3C8',
              fontFamily: "'Playfair Display', serif",
            },
            headerSubtitle: { color: 'rgba(237,227,200,0.5)' },
            socialButtonsBlockButton: {
              backgroundColor: 'rgba(28,25,16,0.92)',
              border: '1px solid rgba(240,192,64,0.12)',
              color: '#EDE3C8',
              borderRadius: '12px',
            },
            socialButtonsBlockButtonText: { color: '#EDE3C8' },
            dividerLine: { backgroundColor: 'rgba(240,192,64,0.12)' },
            dividerText: { color: 'rgba(237,227,200,0.4)' },
            formFieldLabel: { color: 'rgba(237,227,200,0.65)' },
            formFieldInput: {
              backgroundColor: 'rgba(28,25,16,0.92)',
              border: '1px solid rgba(240,192,64,0.12)',
              color: '#EDE3C8',
              borderRadius: '12px',
            },
            formFieldInputShowPasswordButton: { color: 'rgba(237,227,200,0.5)' },
            formButtonPrimary: {
              backgroundColor: '#F0C040',
              color: '#0E0C08',
              fontWeight: '600',
              borderRadius: '12px',
              border: 'none',
            },
            footerAction: { color: 'rgba(237,227,200,0.4)' },
            footerActionLink: { color: '#F0C040' },
            identityPreview: {
              backgroundColor: 'rgba(28,25,16,0.92)',
              border: '1px solid rgba(240,192,64,0.12)',
              borderRadius: '12px',
            },
            identityPreviewText: { color: '#EDE3C8' },
            identityPreviewEditButton: { color: '#F0C040' },
            formFieldAction: { color: '#F0C040' },
            alternativeMethodsBlockButton: {
              backgroundColor: 'rgba(28,25,16,0.92)',
              border: '1px solid rgba(240,192,64,0.12)',
              color: '#EDE3C8',
              borderRadius: '12px',
            },
            otpCodeFieldInput: {
              backgroundColor: 'rgba(28,25,16,0.92)',
              border: '1px solid rgba(240,192,64,0.12)',
              color: '#EDE3C8',
            },
            alert: {
              backgroundColor: 'rgba(200,90,90,0.15)',
              border: '1px solid rgba(200,90,90,0.3)',
              color: '#EDE3C8',
              borderRadius: '12px',
            },
            alertText: { color: '#EDE3C8' },
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
