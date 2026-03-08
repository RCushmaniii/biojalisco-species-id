'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/hooks/use-language';

interface Testimonial {
  en: { quote: string; name: string; role: string; location: string };
  es: { quote: string; name: string; role: string; location: string };
}

const TESTIMONIALS: Testimonial[] = [
  {
    en: {
      quote: 'BioJalisco transformed our field research. Students can now identify species in real time and cross-reference four scientific databases instantly — what used to take hours of lab work happens in seconds.',
      name: 'Dr. Veronica Rosas',
      role: 'Conservation Biology Professor, Universidad de Guadalajara',
      location: 'Guadalajara, Jalisco',
    },
    es: {
      quote: 'BioJalisco transformo nuestra investigacion de campo. Los estudiantes ahora pueden identificar especies en tiempo real y consultar cuatro bases de datos cientificas al instante — lo que antes tomaba horas de trabajo de laboratorio ahora sucede en segundos.',
      name: 'Dra. Veronica Rosas',
      role: 'Profesora de Biologia de la Conservacion, Universidad de Guadalajara',
      location: 'Guadalajara, Jalisco',
    },
  },
  {
    en: {
      quote: 'Having NOM-059 protection status and endemic classification right in the field changes everything. We can prioritize survey areas based on threatened species presence without waiting for database lookups back at camp.',
      name: 'Miguel Angel Torres',
      role: 'Graduate Research Assistant, CUCBA',
      location: 'Sierra de Manantlan, Jalisco',
    },
    es: {
      quote: 'Tener el estatus de proteccion NOM-059 y la clasificacion endemica directamente en campo lo cambia todo. Podemos priorizar areas de muestreo basandonos en la presencia de especies amenazadas sin esperar consultas en el campamento.',
      name: 'Miguel Angel Torres',
      role: 'Asistente de Investigacion, CUCBA',
      location: 'Sierra de Manantlan, Jalisco',
    },
  },
  {
    en: {
      quote: 'The four-API pipeline gives us confidence no single source of data can mislead us. AI identifies, GBIF verifies, and CONABIO contextualizes for Mexico — that layered approach is exactly what field science needs.',
      name: 'Dr. Luis Hernandez',
      role: 'Vertebrate Ecologist, CONABIO Collaborator',
      location: 'Mexico City, Mexico',
    },
    es: {
      quote: 'El pipeline de cuatro APIs nos da confianza de que ninguna fuente de datos puede engañarnos. La IA identifica, GBIF verifica, y CONABIO contextualiza para Mexico — ese enfoque en capas es exactamente lo que la ciencia de campo necesita.',
      name: 'Dr. Luis Hernandez',
      role: 'Ecologo de Vertebrados, Colaborador CONABIO',
      location: 'Ciudad de Mexico, Mexico',
    },
  },
  {
    en: {
      quote: 'I photograph birds every weekend across Jalisco. BioJalisco not only tells me what I found — it tells me if the species is endemic, protected, and even gives me the Nahuatl name. It makes every outing feel like a contribution to science.',
      name: 'Ana Garcia Mendoza',
      role: 'Citizen Scientist & Birder',
      location: 'Lago de Chapala, Jalisco',
    },
    es: {
      quote: 'Fotografio aves cada fin de semana por todo Jalisco. BioJalisco no solo me dice que encontre — me dice si la especie es endemica, protegida, e incluso me da el nombre en nahuatl. Hace que cada salida se sienta como una contribucion a la ciencia.',
      name: 'Ana Garcia Mendoza',
      role: 'Cientifica Ciudadana y Observadora de Aves',
      location: 'Lago de Chapala, Jalisco',
    },
  },
];

const AUTO_ADVANCE_MS = 7000;

export function TestimonialCarousel() {
  const { lang, t } = useLanguage();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setActive((i) => (i + 1) % TESTIMONIALS.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [paused, next]);

  return (
    <div
      className="testimonial-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <h2>{t('Voices from the Field', 'Voces desde el Campo')}</h2>

      <div className="testimonial-stack">
        {TESTIMONIALS.map((testimonial, i) => {
          const content = lang === 'es' ? testimonial.es : testimonial.en;
          return (
            <div
              key={i}
              className={`testimonial-slide ${i === active ? 'active' : ''}`}
            >
              <blockquote className="testimonial-quote">
                &ldquo;{content.quote}&rdquo;
              </blockquote>

              <div className="testimonial-attribution">
                <div className="testimonial-avatar">
                  {content.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <div className="testimonial-meta">
                  <span className="testimonial-name">{content.name}</span>
                  <span className="testimonial-role">{content.role}</span>
                  <span className="testimonial-location">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {content.location}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="testimonial-dots">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            className={`testimonial-dot ${i === active ? 'active' : ''}`}
            onClick={() => setActive(i)}
            aria-label={`Testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
