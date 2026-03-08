import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'BioJalisco Species Identifier';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0E0C08',
          fontFamily: 'serif',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://biojalisco-species-id.vercel.app/images/logo.png"
          alt=""
          width={120}
          height={120}
          style={{ marginBottom: 24, filter: 'invert(1) sepia(1) saturate(3) hue-rotate(10deg) brightness(0.95)' }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 0,
            fontSize: 72,
            letterSpacing: '-0.02em',
          }}
        >
          <span style={{ color: '#F0C040', fontStyle: 'italic', fontWeight: 700 }}>Bio</span>
          <span style={{ color: '#EDE3C8', fontWeight: 700 }}>Jalisco</span>
        </div>
        <div
          style={{
            fontSize: 28,
            color: 'rgba(237,227,200,0.5)',
            fontWeight: 300,
            letterSpacing: '0.1em',
            textTransform: 'uppercase' as const,
            marginTop: 8,
          }}
        >
          Species Identifier
        </div>
        <div
          style={{
            fontSize: 20,
            color: 'rgba(237,227,200,0.35)',
            fontWeight: 300,
            marginTop: 32,
            maxWidth: 700,
            textAlign: 'center' as const,
            lineHeight: 1.5,
          }}
        >
          AI-powered species identification verified against GBIF, iNaturalist, and CONABIO
        </div>
      </div>
    ),
    { ...size }
  );
}
