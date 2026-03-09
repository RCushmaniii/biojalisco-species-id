'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/hooks/use-language';

export function SiteFooter() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="footer-logo">
            <Image src="/images/logo.webp" alt="" width={28} height={18} className="footer-brand-icon" />
            <span className="accent">Bio</span>Jalisco
          </div>
          <p className="footer-tagline">
            {t(
              'AI-powered species identification for Jalisco biodiversity research',
              'Identificacion de especies con IA para la investigacion de biodiversidad de Jalisco'
            )}
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-column">
            <h4>{t('Project', 'Proyecto')}</h4>
            <a href="https://github.com/RCushmaniii/biojalisco-species-id" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://cushlabs.ai" target="_blank" rel="noopener noreferrer">CushLabs AI</a>
          </div>
          <div className="footer-column">
            <h4>{t('Data Sources', 'Fuentes de Datos')}</h4>
            <a href="https://www.gbif.org" target="_blank" rel="noopener noreferrer">GBIF</a>
            <a href="https://www.inaturalist.org" target="_blank" rel="noopener noreferrer">iNaturalist</a>
            <a href="https://enciclovida.mx" target="_blank" rel="noopener noreferrer">EncicloVida</a>
          </div>
          <div className="footer-column">
            <h4>{t('Partners', 'Socios')}</h4>
            <a href="https://www.udg.mx" target="_blank" rel="noopener noreferrer">Universidad de Guadalajara</a>
            <a href="https://www.conabio.gob.mx" target="_blank" rel="noopener noreferrer">CONABIO</a>
          </div>
          <div className="footer-column">
            <h4>{t('Legal', 'Legal')}</h4>
            <Link href="/terms">{t('Terms of Use', 'Terminos de Uso')}</Link>
            <Link href="/privacy">{t('Privacy Policy', 'Politica de Privacidad')}</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>&copy; {year} BioJalisco &middot; <a href="https://cushlabs.ai">CushLabs AI Services</a></span>
      </div>
    </footer>
  );
}
