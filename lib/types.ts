export interface Identification {
  common_name: string;
  nombre_comun: string;
  scientific_name: string;
  breed: string | null;
}

export interface Taxonomy {
  kingdom: string;
  phylum: string;
  class: string;
  order: string;
  family: string;
  genus: string;
  species: string;
}

export interface Ecology {
  habitat: string;
  diet: string;
  size: string;
  lifespan: string;
  behavior: string;
}

export interface Geography {
  native_range: string;
  found_in_jalisco: boolean;
  found_in_mexico: boolean;
  invasive: boolean;
}

export interface Conservation {
  iucn_status: string;
  population_trend: string;
  threats: string;
}

export interface SimilarSpecies {
  name: string;
  scientific_name: string;
  distinction: string;
}

export interface IdentifySuccessResponse {
  identification: Identification;
  confidence: number;
  taxonomy: Taxonomy;
  ecology: Ecology;
  geography: Geography;
  conservation: Conservation;
  similar_species: SimilarSpecies[];
  description: string;
  descripcion: string;
  fun_fact: string;
}

export interface IdentifyErrorResponse {
  error: string;
  suggestion?: string;
}

export type IdentifyResponse = IdentifySuccessResponse | IdentifyErrorResponse;

export interface Observation {
  id: string;
  userId: string;
  imageUrl: string;
  imageBlobPathname: string | null;
  latitude: number | null;
  longitude: number | null;
  commonName: string | null;
  nombreComun: string | null;
  scientificName: string | null;
  breed: string | null;
  confidence: number | null;
  taxonomy: Taxonomy | null;
  ecology: Ecology | null;
  geography: Geography | null;
  conservation: Conservation | null;
  similarSpecies: SimilarSpecies[] | null;
  description: string | null;
  descripcion: string | null;
  funFact: string | null;
  error: string | null;
  suggestion: string | null;
  identifiedAt: Date | null;
  createdAt: Date;
}
