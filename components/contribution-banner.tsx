'use client';

import { useLanguage } from '@/hooks/use-language';

interface ContributionBannerProps {
  totalObservations: number;
  latestSpecies: string | null;
}

export function ContributionBanner({ totalObservations, latestSpecies }: ContributionBannerProps) {
  const { t } = useLanguage();

  const getMessage = () => {
    if (totalObservations === 1) {
      return t(
        'Your first observation is in the database. Every identification strengthens the biodiversity record for Jalisco.',
        'Tu primera observacion esta en la base de datos. Cada identificacion fortalece el registro de biodiversidad de Jalisco.'
      );
    }
    if (totalObservations < 5) {
      return t(
        `You've recorded ${totalObservations} observations. Keep exploring — each one contributes to conservation research.`,
        `Has registrado ${totalObservations} observaciones. Sigue explorando — cada una contribuye a la investigacion de conservacion.`
      );
    }
    if (totalObservations < 20) {
      return t(
        `${totalObservations} observations and growing. Your fieldwork is building a valuable species record for western Mexico.`,
        `${totalObservations} observaciones y creciendo. Tu trabajo de campo esta construyendo un valioso registro de especies para el occidente de Mexico.`
      );
    }
    return t(
      `${totalObservations} observations documented. You're making a real contribution to Jalisco's biodiversity research.`,
      `${totalObservations} observaciones documentadas. Estas haciendo una contribucion real a la investigacion de biodiversidad de Jalisco.`
    );
  };

  return (
    <div className="contribution-banner">
      <div className="contribution-message">{getMessage()}</div>
      {latestSpecies && (
        <div className="contribution-latest">
          {t('Latest: ', 'Mas reciente: ')}
          <span className="contribution-species">{latestSpecies}</span>
        </div>
      )}
    </div>
  );
}
