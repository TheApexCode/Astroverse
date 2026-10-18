import { ObservationLog, StargazerProfile } from '../types/astronomy';

const STORAGE_KEYS = {
  PROFILE: 'astroverse_profile_v1',
  LOGS: 'astroverse_logs_v1',
  COMMUNITY_SIGHTINGS: 'astroverse_community_sightings_v1',
  STAR_CHARTS_OFFLINE: 'astroverse_cached_charts_v1',
  LAST_SYNC: 'astroverse_last_cloud_sync',
};

const DEFAULT_PROFILE: StargazerProfile = {
  username: 'CosmicExplorer',
  rankTitle: 'Novice Stargazer',
  xp: 150,
  level: 1,
  unlockedAchievementIds: ['first_light'],
  favoriteObjectIds: ['saturn', 'm31_andromeda', 'betelgeuse', 'orion', 'jwst'],
  lastSyncTimestamp: new Date().toISOString(),
  bortleLocationPref: 4,
  notificationsEnabled: false,
  nightVisionActive: false,
};

const SEED_LOGS: ObservationLog[] = [
  {
    id: 'log-seed-1',
    timestamp: '2026-10-14T21:30:00Z',
    targetName: 'Saturn & Titan',
    targetCategory: 'planet',
    constellation: 'Aquarius',
    equipment: 'Dobsonian (6"-8")',
    bortleScale: 4,
    seeingCondition: 'Very Good (4/5)',
    transparency: 'High',
    notes: 'Incredible clarity tonight. Cassini division was distinctly razor-sharp at 180x magnification! Moon Titan visible as a golden pinpoint roughly 4 ring diameters away.',
    rating: 5,
    locationName: 'Pine Mountain Dark Sky Site',
    sharedToCommunity: true,
    authorName: 'AstroNova',
    likes: 19,
  },
  {
    id: 'log-seed-2',
    timestamp: '2026-10-10T23:15:00Z',
    targetName: 'Andromeda Galaxy (M31)',
    targetCategory: 'dso',
    constellation: 'Andromeda',
    equipment: 'Binoculars (10x50)',
    bortleScale: 2,
    seeingCondition: 'Pristine (5/5)',
    transparency: 'Crystal Clear',
    notes: 'Observed under rural dark skies. The bright galactic nucleus was unmistakable, and the elliptical disk extended across almost 3 degrees of sky. Distinct dark dust lane glimpsed on northwestern edge.',
    rating: 5,
    locationName: 'Atacama Plateau Sanctuary',
    sharedToCommunity: true,
    authorName: 'CelestiaSeeker',
    likes: 34,
  },
  {
    id: 'log-seed-3',
    timestamp: '2026-09-28T22:00:00Z',
    targetName: 'Orion Nebula (M42)',
    targetCategory: 'dso',
    constellation: 'Orion',
    equipment: 'SCT / Cassegrain (8"+)',
    bortleScale: 3,
    seeingCondition: 'Good (3/5)',
    transparency: 'High',
    notes: 'Trapezium cluster stars A, B, C, D easily resolved. E and F stars intermittently visible during fleeting moments of steady atmospheric seeing. Gossamer wings of gas glowed with a delicate emerald-cyan tinge.',
    rating: 5,
    locationName: 'Joshua Tree Dark Sky Camp',
    sharedToCommunity: true,
    authorName: 'GalacticLens',
    likes: 27,
  }
];

export function loadProfile(): StargazerProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch (err) {
    console.warn('Failed to load profile from localStorage', err);
  }
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: StargazerProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.warn('Failed to save profile', err);
  }
}

export function loadLogs(): ObservationLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load logs', err);
  }
  return SEED_LOGS;
}

export function saveLogs(logs: ObservationLog[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  } catch (err) {
    console.warn('Failed to save logs', err);
  }
}

export function addLogEntry(entry: Omit<ObservationLog, 'id' | 'timestamp'>): ObservationLog {
  const currentLogs = loadLogs();
  const newLog: ObservationLog = {
    ...entry,
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
  };
  const updated = [newLog, ...currentLogs];
  saveLogs(updated);

  // If shared to community, add to community sightings
  if (entry.sharedToCommunity) {
    addCommunitySighting(newLog);
  }

  return newLog;
}

export function loadCommunitySightings(): ObservationLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMMUNITY_SIGHTINGS);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load community sightings', err);
  }
  return SEED_LOGS;
}

export function addCommunitySighting(log: ObservationLog): void {
  const sightings = loadCommunitySightings();
  const exists = sightings.find(s => s.id === log.id);
  if (!exists) {
    localStorage.setItem(STORAGE_KEYS.COMMUNITY_SIGHTINGS, JSON.stringify([log, ...sightings]));
  }
}

export function likeCommunitySighting(id: string): ObservationLog[] {
  const sightings = loadCommunitySightings();
  const updated = sightings.map(s => {
    if (s.id === id) {
      return { ...s, likes: (s.likes || 0) + 1 };
    }
    return s;
  });
  localStorage.setItem(STORAGE_KEYS.COMMUNITY_SIGHTINGS, JSON.stringify(updated));
  return updated;
}

/**
 * Cloud Synchronization & Backup Engine
 */
export interface CloudSyncPayload {
  version: string;
  app: 'Astroverse';
  timestamp: string;
  profile: StargazerProfile;
  logs: ObservationLog[];
}

export function exportCloudBackupJSON(): string {
  const payload: CloudSyncPayload = {
    version: '1.0',
    app: 'Astroverse',
    timestamp: new Date().toISOString(),
    profile: loadProfile(),
    logs: loadLogs(),
  };
  return JSON.stringify(payload, null, 2);
}

export function importCloudBackupJSON(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString) as CloudSyncPayload;
    if (data.app !== 'Astroverse' || !data.profile || !Array.isArray(data.logs)) {
      throw new Error('Invalid Astroverse backup format');
    }
    saveProfile({ ...data.profile, lastSyncTimestamp: new Date().toISOString() });
    saveLogs(data.logs);
    return true;
  } catch (err) {
    console.error('Import failed', err);
    return false;
  }
}

export function simulateCloudSync(): Promise<{ success: boolean; timestamp: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const now = new Date().toISOString();
      const profile = loadProfile();
      profile.lastSyncTimestamp = now;
      saveProfile(profile);
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now);
      resolve({ success: true, timestamp: now });
    }, 900);
  });
}
