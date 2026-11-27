export type AppTab =
  | 'explore'
  | 'categories'
  | 'apod'
  | 'favourites'
  | 'daily-facts';

export type CategoryId =
  | 'planets'
  | 'stars'
  | 'galaxies'
  | 'nebulae'
  | 'black-holes'
  | 'moons'
  | 'asteroids-comets'
  | 'space-missions';

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  shortLabel: string;
  description: string;
  coverImageUrl: string;
  coverCredit: string;
}

export interface CelestialObject {
  id: string;
  name: string;
  designation: string;
  category: CategoryId;
  tagline: string;
  overview: string;
  history: string;
  distanceFromEarth: string;
  sizeOrDiameter: string;
  temperature: string;
  age: string;
  discovery: string;
  composition: string;
  facts: string[];
  imageUrl: string;
  nasaId: string;
  imageCredit: string;
  nasaSearchQuery: string;
  isLiveNasaResult?: boolean;
  dateCreated?: string;
}

export interface ApodData {
  title: string;
  date: string;
  explanation: string;
  url: string;
  hdurl: string;
  thumbnail_url?: string;
  media_type: 'image' | 'video';
  copyright: string;
  source: string;
}

export interface NasaMediaItem {
  nasaId: string;
  title: string;
  description: string;
  thumbUrl: string;
  imageUrl: string;
  credit: string;
  center: string;
  dateCreated: string;
  keywords: string[];
}

export interface SpaceFact {
  id: string;
  topic: string;
  fact: string;
  detail: string;
  source: string;
}
