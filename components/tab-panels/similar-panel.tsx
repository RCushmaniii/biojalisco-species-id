import type { SimilarSpecies } from '@/lib/types';

export function SimilarPanel({ species }: { species: SimilarSpecies[] }) {
  return (
    <div className="similar-list">
      {species.map((s, i) => (
        <div key={i} className="similar-card">
          <div className="similar-name">{s.name}</div>
          <div className="similar-sci">{s.scientific_name}</div>
          <div className="similar-distinction">{s.distinction}</div>
        </div>
      ))}
    </div>
  );
}
