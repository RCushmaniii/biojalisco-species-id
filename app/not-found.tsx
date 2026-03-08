import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="legal-page">
      <div className="legal-content" style={{ textAlign: 'center', paddingTop: '4rem', paddingBottom: '4rem' }}>
        <h1 style={{ fontSize: 'var(--text-hero)', marginBottom: '0.5rem' }}>404</h1>
        <p style={{ fontSize: 'var(--text-xl)', color: 'var(--cream-75)', fontWeight: 300, marginBottom: '0.5rem' }}>
          Page not found
        </p>
        <p style={{ fontSize: 'var(--text-base)', color: 'var(--cream-50)', fontWeight: 300, marginBottom: '2rem', maxWidth: '420px', margin: '0 auto 2rem' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Try heading back to the home page.
        </p>
        <Link href="/" className="btn btn-primary" style={{ display: 'inline-flex', padding: '0.85rem 2rem', fontSize: 'var(--text-base)' }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
