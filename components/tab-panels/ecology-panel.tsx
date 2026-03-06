'use client';

import { useLanguage } from '@/hooks/use-language';
import type { Ecology } from '@/lib/types';

const FIELDS: { key: keyof Ecology; en: string; es: string; full?: boolean }[] = [
  { key: 'habitat', en: 'Habitat', es: 'Habitat' },
  { key: 'diet', en: 'Diet', es: 'Dieta' },
  { key: 'size', en: 'Size', es: 'Tamano' },
  { key: 'lifespan', en: 'Lifespan', es: 'Vida' },
  { key: 'behavior', en: 'Behavior', es: 'Comportamiento', full: true },
];

export function EcologyPanel({ ecology }: { ecology: Ecology }) {
  const { t } = useLanguage();

  return (
    <div className="eco-grid">
      {FIELDS.map(
        (f) =>
          ecology[f.key] && (
            <div key={f.key} className={`eco-card ${f.full ? 'full-width' : ''}`}>
              <div className="eco-card-label">{t(f.en, f.es)}</div>
              <div className="eco-card-value">{ecology[f.key]}</div>
            </div>
          )
      )}
    </div>
  );
}
