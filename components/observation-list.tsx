import { ObservationCard } from './observation-card';
import type { Observation } from '@/lib/types';

export function ObservationList({ observations }: { observations: Observation[] }) {
  return (
    <div className="observation-grid">
      {observations.map((obs) => (
        <ObservationCard key={obs.id} observation={obs} />
      ))}
    </div>
  );
}
