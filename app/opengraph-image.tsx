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
          background: '#FFFFFF',
          fontFamily: 'serif',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://biojalisco-species-id.vercel.app/images/logo.webp"
          alt=""
          width={340}
          height={340}
          style={{ marginBottom: 32 }}
        />
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            fontSize: 120,
            letterSpacing: '-0.02em',
            lineHeight: 1,
          }}
        >
          <span style={{ color: '#C49A20', fontStyle: 'italic', fontWeight: 700 }}>Bio</span>
          <span style={{ color: '#1a1810', fontWeight: 700 }}>Jalisco</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
