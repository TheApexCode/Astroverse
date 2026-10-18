export type CelestialCategory = 'planet' | 'moon' | 'star' | 'constellation' | 'dso' | 'exoplanet' | 'spacecraft';

export interface CelestialObject {
  id: string;
  name: string;
  category: CelestialCategory;
  subtitle: string;
  apparentMagnitude: number; // visual brightness (lower is brighter, e.g. Sun -26.74, Sirius -1.46)
  distanceLightYears?: number; // in light years
  distanceAU?: number; // in astronomical units (for solar system)
  constellation?: string;
  spectralType?: string; // e.g. G2V, M1-2Ia-ab, A1V
  mass?: string;
  radius?: string;
  orbitalPeriod?: string;
  surfaceTemperature?: string;
  atmosphere?: string;
  rightAscension?: string; // RA
  declination?: string; // Dec
  bortleVisibilityMin: number; // minimum Bortle class needed to see (1 = dark sky, 9 = city)
  description: string;
  keyFacts: string[];
  mythologyOrHistory?: string;
  colorHex: string;
  threeTextureType?: 'sun' | 'mercury' | 'venus' | 'earth' | 'moon' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'pluto' | 'star' | 'nebula' | 'galaxy';
}

export interface Constellation {
  id: string;
  name: string;
  latinName: string;
  abbreviation: string;
  family: string;
  brightestStar: string;
  areaSqDeg: number;
  season: 'Spring' | 'Summer' | 'Autumn' | 'Winter' | 'Circumpolar';
  rightAscensionRange: string;
  declinationRange: string;
  mythology: string;
  starsCount: number;
  majorStars: { name: string; ra: number; dec: number; mag: number; color: string }[];
  lines: [number, number][]; // pairs of indices into majorStars
}

export interface CelestialEvent {
  id: string;
  title: string;
  type: 'meteor_shower' | 'eclipse' | 'planetary_alignment' | 'conjunction' | 'opposition' | 'equinox_solstice' | 'iss_pass';
  date: string;
  peakTimeUTC: string;
  visibilityRegion: string;
  expectedZHR?: number; // Zenithal Hourly Rate for meteor showers
  description: string;
  viewingTip: string;
  coordinates?: string;
  bortleRecommended: number;
}

export interface ObservationLog {
  id: string;
  timestamp: string;
  targetName: string;
  targetCategory: CelestialCategory;
  constellation?: string;
  equipment: 'Naked Eye' | 'Binoculars (7x50)' | 'Binoculars (10x50)' | 'Small Refractor (<90mm)' | 'Dobsonian (6"-8")' | 'SCT / Cassegrain (8"+)' | 'Astrograph / Smart Scope';
  bortleScale: number; // 1-9
  seeingCondition: 'Poor (1/5)' | 'Fair (2/5)' | 'Good (3/5)' | 'Very Good (4/5)' | 'Pristine (5/5)';
  transparency: 'Low' | 'Moderate' | 'High' | 'Crystal Clear';
  notes: string;
  rating: number; // 1-5
  locationName: string;
  imageUrl?: string;
  sharedToCommunity?: boolean;
  authorName?: string;
  likes?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  xpReward: number;
  category: 'observation' | 'simulation' | 'knowledge' | 'explorer';
  requirementCount: number;
  unlockedAt?: string;
}

export interface StargazerProfile {
  username: string;
  rankTitle: string;
  xp: number;
  level: number;
  unlockedAchievementIds: string[];
  favoriteObjectIds: string[];
  lastSyncTimestamp: string;
  bortleLocationPref: number;
  notificationsEnabled: boolean;
  nightVisionActive: boolean;
}
