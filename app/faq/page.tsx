'use client';

import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { PublicNav } from '@/components/public-nav';
import { SiteFooter } from '@/components/site-footer';

interface FAQItem {
  en: { q: string; a: string };
  es: { q: string; a: string };
}

const FAQ_ITEMS: FAQItem[] = [
  {
    en: {
      q: 'What is BioJalisco?',
      a: 'BioJalisco is a field research tool that identifies vertebrate species from photos using AI, then verifies each identification against three scientific databases: GBIF for global taxonomy and IUCN conservation status, iNaturalist for regional species context, and EncicloVida (CONABIO) for Mexico-specific data like NOM-059 protection status and endemic classification.',
    },
    es: {
      q: 'Que es BioJalisco?',
      a: 'BioJalisco es una herramienta de investigacion de campo que identifica especies de vertebrados a partir de fotos usando IA, y luego verifica cada identificacion contra tres bases de datos cientificas: GBIF para taxonomia global y estado de conservacion UICN, iNaturalist para contexto regional de especies, y EncicloVida (CONABIO) para datos especificos de Mexico como estatus de proteccion NOM-059 y clasificacion endemica.',
    },
  },
  {
    en: {
      q: 'What animals can BioJalisco identify?',
      a: 'BioJalisco is designed to identify vertebrate animals: mammals, birds, reptiles, and amphibians. The system works best with clear, well-lit photographs showing the full body of the animal. It is not currently designed for invertebrates, plants, or fungi.',
    },
    es: {
      q: 'Que animales puede identificar BioJalisco?',
      a: 'BioJalisco esta disenado para identificar animales vertebrados: mamiferos, aves, reptiles y anfibios. El sistema funciona mejor con fotografias claras y bien iluminadas que muestren el cuerpo completo del animal. Actualmente no esta disenado para invertebrados, plantas u hongos.',
    },
  },
  {
    en: {
      q: 'How accurate are the identifications?',
      a: 'Each identification includes a confidence score. The AI provides an initial identification which is then cross-referenced against GBIF taxonomy, iNaturalist regional data, and CONABIO databases. High-confidence identifications (80%+) are generally reliable, but we recommend expert verification for research-critical observations, especially for visually similar species.',
    },
    es: {
      q: 'Que tan precisas son las identificaciones?',
      a: 'Cada identificacion incluye un puntaje de confianza. La IA proporciona una identificacion inicial que luego se cruza con la taxonomia de GBIF, datos regionales de iNaturalist y bases de datos de CONABIO. Las identificaciones de alta confianza (80%+) son generalmente confiables, pero recomendamos verificacion experta para observaciones criticas de investigacion, especialmente para especies visualmente similares.',
    },
  },
  {
    en: {
      q: 'What data is collected with each observation?',
      a: 'Each observation generates over 30 structured data fields including: species identification (common and scientific names in English and Spanish), full taxonomic classification, ecological information (habitat, diet, size, behavior), geographic data (native range, presence in Jalisco/Mexico, invasive status), IUCN conservation status and population trends, NOM-059 protection status, endemic classification, and GPS coordinates if location services are enabled.',
    },
    es: {
      q: 'Que datos se recopilan con cada observacion?',
      a: 'Cada observacion genera mas de 30 campos de datos estructurados incluyendo: identificacion de especies (nombres comunes y cientificos en ingles y espanol), clasificacion taxonomica completa, informacion ecologica (habitat, dieta, tamano, comportamiento), datos geograficos (rango nativo, presencia en Jalisco/Mexico, estatus invasivo), estado de conservacion UICN y tendencias poblacionales, estatus de proteccion NOM-059, clasificacion endemica, y coordenadas GPS si los servicios de ubicacion estan habilitados.',
    },
  },
  {
    en: {
      q: 'Who can access my observations?',
      a: 'BioJalisco is a community science platform. All observations are visible on the public Community Observations page so that researchers and the broader community can benefit from shared biodiversity data. Your observations are associated with your authenticated account, and only you can manage or delete them from your personal dashboard. No personal account information is displayed publicly — only species data, photos, and identification details.',
    },
    es: {
      q: 'Quien puede acceder a mis observaciones?',
      a: 'BioJalisco es una plataforma de ciencia comunitaria. Todas las observaciones son visibles en la pagina publica de Observaciones de la Comunidad para que investigadores y la comunidad en general puedan beneficiarse de datos compartidos de biodiversidad. Tus observaciones estan asociadas con tu cuenta autenticada, y solo tu puedes gestionarlas o eliminarlas desde tu panel personal. No se muestra informacion personal de la cuenta publicamente — solo datos de especies, fotos y detalles de identificacion.',
    },
  },
  {
    en: {
      q: 'What is NOM-059-SEMARNAT?',
      a: 'NOM-059-SEMARNAT is the official Mexican standard that lists species at risk of extinction. It classifies species into categories: Probably Extinct in the Wild (E), Endangered (P), Threatened (A), and Subject to Special Protection (Pr). BioJalisco retrieves this status from CONABIO\'s EncicloVida database for every identified species found in Mexico.',
    },
    es: {
      q: 'Que es NOM-059-SEMARNAT?',
      a: 'NOM-059-SEMARNAT es la norma oficial mexicana que lista las especies en riesgo de extincion. Clasifica las especies en categorias: Probablemente Extinta en el Medio Silvestre (E), En Peligro de Extincion (P), Amenazada (A) y Sujeta a Proteccion Especial (Pr). BioJalisco obtiene este estatus de la base de datos EncicloVida de CONABIO para cada especie identificada encontrada en Mexico.',
    },
  },
  {
    en: {
      q: 'Who is behind BioJalisco?',
      a: 'BioJalisco is developed by CushLabs AI Services and supported by Dr. Veronica Rosas, a tenured ecology professor and campus leader at CUCBA, University of Guadalajara. The platform combines professional software engineering with active field research in vertebrate biodiversity across western Mexico. Student researchers from UdeG\'s conservation biology program contribute to field observations and data validation.',
    },
    es: {
      q: 'Quien esta detras de BioJalisco?',
      a: 'BioJalisco es desarrollado por CushLabs AI Services y respaldado por la Dra. Veronica Rosas, profesora titular de ecologia y lider del campus CUCBA de la Universidad de Guadalajara. La plataforma combina ingenieria de software profesional con investigacion de campo activa en biodiversidad de vertebrados en el occidente de Mexico. Estudiantes investigadores del programa de biologia de la conservacion de UdeG contribuyen a las observaciones de campo y la validacion de datos.',
    },
  },
  {
    en: {
      q: 'How can I get access?',
      a: 'BioJalisco is currently invite-only during the initial research phase. If you are a researcher, student, or conservation professional interested in participating, contact us at info@cushlabs.ai.',
    },
    es: {
      q: 'Como puedo obtener acceso?',
      a: 'BioJalisco actualmente es solo por invitacion durante la fase inicial de investigacion. Si eres investigador, estudiante o profesional de conservacion interesado en participar, contactanos en info@cushlabs.ai.',
    },
  },
  {
    en: {
      q: 'Does BioJalisco work offline?',
      a: 'Not currently. Species identification requires an active internet connection to process images through the AI pipeline and verify results against external databases. Offline support for remote fieldwork is planned for a future release.',
    },
    es: {
      q: 'BioJalisco funciona sin conexion?',
      a: 'Actualmente no. La identificacion de especies requiere una conexion a internet activa para procesar imagenes a traves del pipeline de IA y verificar resultados contra bases de datos externas. El soporte sin conexion para trabajo de campo remoto esta planeado para una version futura.',
    },
  },
  {
    en: {
      q: 'What are the long-term goals?',
      a: 'BioJalisco aims to grow from a field identification tool into a regional biodiversity intelligence network. The goals include building a citizen science community, generating structured ecological data to inform conservation policy in Jalisco, and eventually contributing to national-level biodiversity monitoring in Mexico. Phase 2 will add species dashboards, geographic heatmaps, and conservation monitoring views. Phase 3 will introduce collaborative research networks and data contribution pipelines to global databases.',
    },
    es: {
      q: 'Cuales son los objetivos a largo plazo?',
      a: 'BioJalisco busca crecer de una herramienta de identificacion de campo a una red regional de inteligencia de biodiversidad. Los objetivos incluyen construir una comunidad de ciencia ciudadana, generar datos ecologicos estructurados para informar politicas de conservacion en Jalisco, y eventualmente contribuir al monitoreo de biodiversidad a nivel nacional en Mexico. La Fase 2 agregara tableros de especies, mapas de calor geograficos y vistas de monitoreo de conservacion. La Fase 3 introducira redes de investigacion colaborativa y pipelines de contribucion de datos a bases de datos globales.',
    },
  },
];

export default function FAQPage() {
  const { lang, t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <PublicNav />

      <div className="faq-page">
        <div className="faq-header">
          <h1>
            {t('Frequently Asked Questions', 'Preguntas Frecuentes')}
          </h1>
          <p>
            {t(
              'Everything you need to know about BioJalisco and how it supports biodiversity research in western Mexico.',
              'Todo lo que necesitas saber sobre BioJalisco y como apoya la investigacion de biodiversidad en el occidente de Mexico.'
            )}
          </p>
        </div>

        <div className="faq-list">
          {FAQ_ITEMS.map((item, i) => {
            const content = lang === 'es' ? item.es : item.en;
            const isOpen = openIndex === i;
            return (
              <div key={i} className={`faq-item ${isOpen ? 'open' : ''}`}>
                <button
                  className="faq-question"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span>{content.q}</span>
                  <span className="faq-chevron">{isOpen ? '\u2212' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="faq-answer">
                    <p>{content.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="faq-contact">
          <h2>{t('Still have questions?', 'Aun tienes preguntas?')}</h2>
          <p>
            {t(
              'Reach out to us at ',
              'Contactanos en '
            )}
            <a href="mailto:info@cushlabs.ai">info@cushlabs.ai</a>
          </p>
        </div>
      </div>

      <SiteFooter />
    </>
  );
}
