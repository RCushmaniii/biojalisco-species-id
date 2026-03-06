'use client';

import { useLanguage } from '@/hooks/use-language';

export function LoadingSpinner() {
  const { t } = useLanguage();

  return (
    <div className="loading active">
      <div className="spinner" />
      <p>{t('Analyzing...', 'Analizando...')}</p>
    </div>
  );
}
