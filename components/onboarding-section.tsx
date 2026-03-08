'use client';

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
    en: { title: 'AI Identifies', desc: 'Advanced vision AI analyzes the image with regional species context from iNaturalist.' },
    es: { title: 'La IA Identifica', desc: 'IA de vision avanzada analiza la imagen con contexto regional de especies de iNaturalist.' },
  },
  {
    number: '3',
    en: { title: 'Science Verifies', desc: 'GBIF confirms taxonomy and IUCN conservation status from authoritative global databases.' },
    es: { title: 'La Ciencia Verifica', desc: 'GBIF confirma la taxonomia y el estado de conservacion UICN de bases de datos globales autorizadas.' },
  },
  {
    number: '4',
    en: { title: 'Mexico Enriches', desc: 'EncicloVida adds endemic status, NOM-059 protection, and indigenous language names from CONABIO.' },
    es: { title: 'Mexico Enriquece', desc: 'EncicloVida agrega estatus endemico, proteccion NOM-059 y nombres en lenguas indigenas de CONABIO.' },
  },
];

const GOALS = [
  {
    en: {
      title: 'Document Jalisco\'s Biodiversity',
      desc: 'Build a verified, geotagged record of every vertebrate species in the region through structured field observations that meet research-grade standards.',
    },
    es: {
      title: 'Documentar la Biodiversidad de Jalisco',
      desc: 'Construir un registro verificado y geoetiquetado de cada especie de vertebrado en la region a traves de observaciones de campo estructuradas que cumplan estandares de investigacion.',
    },
  },
  {
    en: {
      title: 'Grow a Citizen Science Community',
      desc: 'Unite students, researchers, hikers, birders, and nature enthusiasts into an active network of contributors who collectively monitor ecosystems across western Mexico.',
    },
    es: {
      title: 'Crecer una Comunidad de Ciencia Ciudadana',
      desc: 'Unir estudiantes, investigadores, excursionistas, observadores de aves y entusiastas de la naturaleza en una red activa de contribuidores que monitorean ecosistemas en el occidente de Mexico.',
    },
  },
  {
    en: {
      title: 'Inform Conservation Policy',
      desc: 'Generate the ecological evidence needed to influence regional conservation decisions in Jalisco — and eventually contribute to national-level biodiversity policy in Mexico.',
    },
    es: {
      title: 'Informar Politicas de Conservacion',
      desc: 'Generar la evidencia ecologica necesaria para influir en las decisiones de conservacion regionales en Jalisco — y eventualmente contribuir a politicas de biodiversidad a nivel nacional en Mexico.',
    },
  },
  {
    en: {
      title: 'Bridge Science and Community',
      desc: 'Make professional biodiversity research accessible to everyone. Every observation feeds directly into scientific datasets used by conservation biologists.',
    },
    es: {
      title: 'Conectar la Ciencia con la Comunidad',
      desc: 'Hacer la investigacion profesional de biodiversidad accesible para todos. Cada observacion alimenta directamente conjuntos de datos cientificos utilizados por biologos de conservacion.',
    },
  },
];

export function OnboardingSection() {
  const { lang, t } = useLanguage();

  return (
    <div className="onboarding">
      <div className="onboarding-header">
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
        <h2>{t('Our Mission', 'Nuestra Mision')}</h2>
        <div className="onboarding-goals-grid">
          {GOALS.map((goal, i) => {
            const content = lang === 'es' ? goal.es : goal.en;
            return (
              <div key={i} className="goal-card">
                <h3 className="goal-title">{content.title}</h3>
                <p className="goal-desc">{content.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="onboarding-section onboarding-academic">
        <h2>{t('Academic Foundation', 'Base Academica')}</h2>
        <p>
          {t(
            'BioJalisco is supported by Dr. Veronica Rosas, a tenured ecology professor and campus leader at CUCBA, University of Guadalajara. Her research in vertebrate biodiversity across western Mexico provides the scientific foundation for this platform. Student researchers from her conservation biology program contribute directly to field observations and data validation.',
            'BioJalisco cuenta con el respaldo de la Dra. Veronica Rosas, profesora titular de ecologia y lider del campus CUCBA de la Universidad de Guadalajara. Su investigacion en biodiversidad de vertebrados en el occidente de Mexico proporciona la base cientifica de esta plataforma. Estudiantes investigadores de su programa de biologia de la conservacion contribuyen directamente a las observaciones de campo y la validacion de datos.'
          )}
        </p>
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
