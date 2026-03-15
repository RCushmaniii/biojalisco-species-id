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
          padding: '48px',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://biojalisco-species-id.vercel.app/images/logo.webp"
          alt=""
          width={220}
          height={220}
          style={{
            marginBottom: 36,
            filter: 'invert(1) sepia(1) saturate(3) hue-rotate(10deg) brightness(0.95)',
          }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            fontSize: 128,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          <span style={{ color: '#F0C040', fontStyle: 'italic', fontWeight: 700 }}>Bio</span>
          <span style={{ color: '#EDE3C8', fontWeight: 700 }}>Jalisco</span>
        </div>
        <div
          style={{
            fontSize: 36,
            color: 'rgba(237,227,200,0.45)',
            fontWeight: 400,
            letterSpacing: '0.15em',
            textTransform: 'uppercase' as const,
            marginTop: 16,
          }}
        >
          Species Identifier
        </div>
      </div>
    ),
    { ...size }
  );
}
