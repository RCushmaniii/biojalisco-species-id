import Link from 'next/link';
import type { Observation } from '@/lib/types';

function confColor(conf: number | null): string {
  if (!conf) return 'var(--cream-50)';
  if (conf >= 80) return 'var(--green)';
  if (conf >= 50) return 'var(--orange)';
  return 'var(--red)';
}

export function ObservationCard({ observation }: { observation: Observation }) {
  const date = new Date(observation.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link href={`/observations/${observation.id}`} className="observation-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={observation.imageUrl}
        alt={observation.commonName || 'Observation'}
        className="observation-thumb"
      />
      <div className="observation-info">
        <div className="observation-name">
          {observation.commonName || observation.error || 'Unknown'}
        </div>
        {observation.scientificName && (
          <div className="observation-sci">{observation.scientificName}</div>
        )}
        <div className="observation-date">{date}</div>
      </div>
      {observation.confidence !== null && (
        <div
          className="observation-conf"
          style={{ color: confColor(observation.confidence) }}
        >
          {observation.confidence}%
        </div>
      )}
    </Link>
  );
}
