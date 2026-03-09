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

export interface GBIFData {
  taxonomy: Taxonomy | null;
  iucnStatus: string | null;
  iucnCategory: string | null;
  distributions: string[];
  establishmentMeans: string | null;
  vernacularNames: { en: string | null; es: string | null };
  gbifUrl: string | null;
  matchConfidence: number;
}

export interface EncicloVidaData {
  speciesId: number;
  commonNameEs: string | null;
  allCommonNames: string[];
  distributionTypes: string[];
  characteristics: string[];
  nom059Status: string | null;
  photoUrl: string | null;
  wikipediaSummary: string | null;
  geodataSources: string[];
  enciclovidaUrl: string;
}

export interface IdentifySuccessResponse {
  identification: Identification;
  confidence: number;
  taxonomy: Taxonomy;
  ecology: Ecology;
  geography: Geography;
  conservation: Conservation;
  similar_species: SimilarSpecies[];
  image_orientation: 'landscape' | 'portrait';
  description: string;
  descripcion: string;
  fun_fact: string;
  gbif?: GBIFData | null;
  enciclovida?: EncicloVidaData | null;
}

export interface IdentifyErrorResponse {
  error: string;
  suggestion?: string;
}

export type IdentifyResponse = IdentifySuccessResponse | IdentifyErrorResponse;

export type GpsSource = 'exif' | 'browser' | 'user' | null;

export interface ImageMetadata {
  dateTaken: string | null;
  cameraMake: string | null;
  cameraModel: string | null;
}

export interface LocationInfo {
  city: string | null;
  municipality: string | null;
  region: string | null;
  state: string | null;
  country: string | null;
  countryCode: string | null;
  postcode: string | null;
  displayName: string;
}

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
  imageOrientation: 'landscape' | 'portrait' | null;
  featured: boolean | null;
  description: string | null;
  descripcion: string | null;
  funFact: string | null;
  error: string | null;
  suggestion: string | null;
  locationInfo: LocationInfo | null;
  imageMetadata: ImageMetadata | null;
  gpsSource: GpsSource;
  identifiedAt: Date | null;
  createdAt: Date;
}
