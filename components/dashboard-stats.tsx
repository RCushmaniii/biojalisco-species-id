'use client';

import { useLanguage } from '@/hooks/use-language';

interface DashboardStatsProps {
  totalObservations: number;
  uniqueSpecies: number;
  conservationNotable: number;
}

export function DashboardStats({ totalObservations, uniqueSpecies, conservationNotable }: DashboardStatsProps) {
  const { t } = useLanguage();

  return (
    <div className="dashboard-stats">
      <div className="stat-card">
        <div className="stat-number">{totalObservations}</div>
        <div className="stat-label">{t('Observations', 'Observaciones')}</div>
        <div className="stat-detail">{t('Total identifications recorded', 'Identificaciones totales registradas')}</div>
      </div>
      <div className="stat-card">
        <div className="stat-number">{uniqueSpecies}</div>
        <div className="stat-label">{t('Species', 'Especies')}</div>
        <div className="stat-detail">{t('Unique species identified', 'Especies unicas identificadas')}</div>
      </div>
      <div className="stat-card">
        <div className="stat-number">{conservationNotable}</div>
        <div className="stat-label">{t('Conservation', 'Conservacion')}</div>
        <div className="stat-detail">{t('Notable conservation status', 'Estado de conservacion notable')}</div>
      </div>
    </div>
  );
}
