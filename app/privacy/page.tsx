import Link from 'next/link';
import { NavBrand } from '@/components/nav-brand';
import { SiteFooter } from '@/components/site-footer';

export const metadata = {
  title: 'Privacy Policy — BioJalisco',
  description: 'Privacy policy for the BioJalisco Species Identifier platform.',
};

export default function PrivacyPage() {
  return (
    <>
      <nav className="nav-bar nav-bar-wide">
        <NavBrand />
        <div className="nav-links">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/faq" className="nav-link">FAQ</Link>
        </div>
      </nav>

      <div className="legal-page">
        <div className="legal-content">
          <h1>Privacy Policy</h1>
          <p className="legal-effective">Effective: March 8, 2026</p>

          <p>
            This policy describes how BioJalisco Species Identifier (&ldquo;the Platform&rdquo;),
            operated by CushLabs AI Services, collects, uses, and protects your information.
          </p>

          <h2>1. Information We Collect</h2>

          <h3>Account Information</h3>
          <p>
            When you sign in via Clerk, we receive your user ID and authentication status. We do not
            store passwords -- authentication is handled entirely by Clerk. See{' '}
            <a href="https://clerk.com/privacy" target="_blank" rel="noopener noreferrer" className="gbif-link">
              Clerk&apos;s privacy policy
            </a>{' '}
            for details on their data handling.
          </p>

          <h3>Observation Data</h3>
          <p>When you identify a species, the following data is collected and stored:</p>
          <ul>
            <li><strong>Photos</strong> -- Compressed and stored in Vercel Blob storage</li>
            <li><strong>GPS coordinates</strong> -- Latitude and longitude from your device (when you grant location permission)</li>
            <li><strong>Identification results</strong> -- Species name, taxonomy, ecology, conservation status, and other structured data returned by the pipeline</li>
            <li><strong>Timestamps</strong> -- When the observation was created</li>
          </ul>

          <h3>Automatically Collected</h3>
          <p>
            Standard web server logs (IP address, browser type, request timestamps) are collected
            by our hosting provider (Vercel) for security and performance monitoring.
          </p>

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li><strong>Species identification</strong> -- Photos and GPS coordinates are sent to OpenAI (GPT-4o) for analysis and to iNaturalist for regional species context</li>
            <li><strong>Data enrichment</strong> -- Scientific names are sent to GBIF and EncicloVida (CONABIO) for taxonomy verification and conservation data</li>
            <li><strong>Observation storage</strong> -- Your data is stored so you can review past identifications</li>
            <li><strong>Platform improvement</strong> -- Anonymized, aggregated usage data may be used to improve identification accuracy</li>
          </ul>

          <h2>3. Third-Party Data Sharing</h2>
          <p>Your data is shared with the following services as part of the identification pipeline:</p>

          <table className="legal-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Data Shared</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>OpenAI</td>
                <td>Photo, GPS coordinates</td>
                <td>AI species identification</td>
              </tr>
              <tr>
                <td>iNaturalist</td>
                <td>GPS coordinates</td>
                <td>Regional species context</td>
              </tr>
              <tr>
                <td>GBIF</td>
                <td>Scientific name</td>
                <td>Taxonomy verification</td>
              </tr>
              <tr>
                <td>EncicloVida (CONABIO)</td>
                <td>Scientific name</td>
                <td>Mexico-specific conservation data</td>
              </tr>
              <tr>
                <td>Clerk</td>
                <td>Authentication tokens</td>
                <td>User authentication</td>
              </tr>
              <tr>
                <td>Vercel</td>
                <td>Application data, server logs</td>
                <td>Hosting and storage</td>
              </tr>
            </tbody>
          </table>

          <p>We do not sell your data to third parties. We do not use your data for advertising.</p>

          <h2>4. Data Storage and Security</h2>
          <ul>
            <li>Observation data is stored in Neon Postgres (encrypted at rest)</li>
            <li>Photos are stored in Vercel Blob storage</li>
            <li>All API keys are server-side only and never exposed to the client</li>
            <li>All connections use HTTPS</li>
            <li>Access to observations is scoped to the authenticated user who created them</li>
          </ul>

          <h2>5. Data Retention</h2>
          <p>
            Your observation data is retained for as long as your account is active. You can delete
            individual observations at any time through the Platform. When an observation is deleted,
            the associated image is also removed from storage.
          </p>

          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access</strong> -- View all your stored observations through the dashboard</li>
            <li><strong>Delete</strong> -- Remove any observation and its associated image</li>
            <li><strong>Location control</strong> -- Deny GPS permission; identification still works without it</li>
            <li><strong>Account deletion</strong> -- Contact us to request full account and data deletion</li>
          </ul>

          <h2>7. GPS and Location Data</h2>
          <p>
            Location access is requested via your browser&apos;s Geolocation API. You can deny this
            permission at any time. GPS data is used solely to improve identification accuracy via
            regional species filtering. Location data is stored only as part of observation records
            you explicitly create.
          </p>

          <h2>8. Cookies and Local Storage</h2>
          <p>
            The Platform uses minimal client-side storage: a language preference and theme preference
            in localStorage. Clerk may use cookies for session management. We do not use tracking
            cookies or analytics platforms.
          </p>

          <h2>9. Children</h2>
          <p>
            The Platform is not directed at children under 13. We do not knowingly collect information
            from children under 13.
          </p>

          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this policy as the Platform evolves. Material changes will be communicated
            to registered users. Continued use after changes constitutes acceptance.
          </p>

          <h2>11. Contact</h2>
          <p>
            For privacy questions or data requests, contact us at{' '}
            <a href="mailto:info@cushlabs.ai" className="gbif-link">info@cushlabs.ai</a>.
          </p>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
