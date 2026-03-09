'use client';

import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';
import { PublicNav } from '@/components/public-nav';
import { SiteFooter } from '@/components/site-footer';
import { CameraIcon } from '@/components/icons';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <>
      <PublicNav />

      <div className="not-found-page">
        <div className="not-found-code">404</div>
        <h1 className="not-found-heading">
          {t('Page Not Found', 'Pagina No Encontrada')}
        </h1>
        <p className="not-found-message">
          {t(
            'The page you\'re looking for doesn\'t exist or has been moved.',
            'La pagina que buscas no existe o ha sido movida.'
          )}
        </p>

        <div className="not-found-links">
          <Link href="/" className="btn btn-primary">
            {t('Back to Home', 'Volver al Inicio')}
          </Link>
          <Link href="/identify" className="btn">
            <CameraIcon />
            {t('Identify a Species', 'Identificar una Especie')}
          </Link>
        </div>

        <div className="not-found-suggestions">
          <p className="not-found-suggestions-label">
            {t('Or try one of these:', 'O prueba una de estas:')}
          </p>
          <div className="not-found-suggestion-links">
            <Link href="/observations">{t('Community Observations', 'Observaciones de la Comunidad')}</Link>
            <Link href="/species-guide">{t('Protected Species Guide', 'Guia de Especies Protegidas')}</Link>
            <Link href="/faq">{t('Frequently Asked Questions', 'Preguntas Frecuentes')}</Link>
          </div>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
