'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/hooks/use-language';
import { CameraIcon } from './icons';

const PIPELINE_STEPS = [
  {
    number: '1',
    en: { title: 'Snap a Photo', desc: 'Use your camera or upload an image of any vertebrate animal.' },
    es: { title: 'Toma una Foto', desc: 'Usa tu camara o sube una imagen de cualquier animal vertebrado.' },
  },
  {
    number: '2',
    en: { title: 'AI Identifies', desc: 'GPT-4o Vision analyzes the image with regional species context from iNaturalist.' },
    es: { title: 'La IA Identifica', desc: 'GPT-4o Vision analiza la imagen con contexto regional de especies de iNaturalist.' },
  },
  {
    number: '3',
    en: { title: 'Science Verifies', desc: 'GBIF confirms taxonomy and IUCN conservation status from authoritative databases.' },
    es: { title: 'La Ciencia Verifica', desc: 'GBIF confirma la taxonomia y el estado de conservacion UICN de bases de datos autorizadas.' },
  },
  {
    number: '4',
    en: { title: 'Mexico Enriches', desc: 'EncicloVida adds endemic status, NOM-059 protection, and indigenous language names from CONABIO.' },
    es: { title: 'Mexico Enriquece', desc: 'EncicloVida agrega estatus endemico, proteccion NOM-059 y nombres en lenguas indigenas de CONABIO.' },
  },
];

export function OnboardingSection() {
  const { lang, t } = useLanguage();

  return (
    <div className="onboarding">
      <div className="onboarding-header">
        <Image
          src="/images/tropical-bird.png"
          alt="Motmot — Jalisco's iconic tropical bird"
          width={140}
          height={180}
          className="hero-bird"
          priority
        />
        <h1>
          <span className="accent">Bio</span>Jalisco
        </h1>
        <p className="onboarding-tagline">
          {t('Species Identifier', 'Identificador de Especies')}
        </p>
      </div>

      <div className="onboarding-section">
        <h2>{t('What is BioJalisco?', 'Que es BioJalisco?')}</h2>
        <p>
          {t(
            'A field research tool that identifies vertebrate species from photos using AI, then verifies the results against global and Mexican biodiversity databases. Built for conservation biologists working in Jalisco, Mexico.',
            'Una herramienta de investigacion de campo que identifica especies de vertebrados a partir de fotos usando IA, y luego verifica los resultados contra bases de datos de biodiversidad globales y mexicanas. Construida para biologos de conservacion que trabajan en Jalisco, Mexico.'
          )}
        </p>
      </div>

      <div className="onboarding-section">
        <h2>{t('How It Works', 'Como Funciona')}</h2>
        <div className="onboarding-pipeline">
          {PIPELINE_STEPS.map((step) => {
            const content = lang === 'es' ? step.es : step.en;
            return (
              <div key={step.number} className="onboarding-step">
                <div className="onboarding-step-number">{step.number}</div>
                <div className="onboarding-step-content">
                  <div className="onboarding-step-title">{content.title}</div>
                  <div className="onboarding-step-desc">{content.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="onboarding-section">
        <h2>{t('Our Goals', 'Nuestros Objetivos')}</h2>
        <ul className="onboarding-goals">
          <li>
            {t(
              'Document the vertebrate species of Jalisco through verified field observations',
              'Documentar las especies de vertebrados de Jalisco a traves de observaciones de campo verificadas'
            )}
          </li>
          <li>
            {t(
              'Support conservation research with structured, geotagged biodiversity data',
              'Apoyar la investigacion de conservacion con datos de biodiversidad estructurados y geoetiquetados'
            )}
          </li>
          <li>
            {t(
              'Build a shared observation record that grows with every identification',
              'Construir un registro de observaciones compartido que crece con cada identificacion'
            )}
          </li>
        </ul>
      </div>

      <div className="onboarding-cta">
        <Link href="/identify" className="btn btn-primary hero-btn">
          <CameraIcon />
          {t('Start Identifying', 'Comenzar a Identificar')}
        </Link>
      </div>
    </div>
  );
}
