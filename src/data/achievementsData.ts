import { Achievement } from '../types/astronomy';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_light',
    title: 'First Light',
    description: 'Document your very first astronomical observation in the cosmic logbook.',
    iconName: 'Sparkles',
    xpReward: 100,
    category: 'observation',
    requirementCount: 1,
  },
  {
    id: 'solar_explorer',
    title: 'Solar System Pioneer',
    description: 'Inspect at least 5 different planets in the 3D Planet Explorer.',
    iconName: 'Globe',
    xpReward: 150,
    category: 'simulation',
    requirementCount: 5,
  },
  {
    id: 'star_mapper',
    title: 'Cartographer of the Heavens',
    description: 'Explore the Live Star Chart and identify 3 major constellations.',
    iconName: 'Compass',
    xpReward: 200,
    category: 'knowledge',
    requirementCount: 3,
  },
  {
    id: 'ar_skywatcher',
    title: 'Augmented Stargazer',
    description: 'Activate the AR Night Sky Camera mode to map constellations in real space.',
    iconName: 'Camera',
    xpReward: 250,
    category: 'explorer',
    requirementCount: 1,
  },
  {
    id: 'night_owl_bortle',
    title: 'Dark Sky Master',
    description: 'Log an observation session under pristine dark skies (Bortle 1, 2, or 3).',
    iconName: 'Moon',
    xpReward: 300,
    category: 'observation',
    requirementCount: 1,
  },
  {
    id: 'deep_sky_voyager',
    title: 'Deep Sky Voyager',
    description: 'Log 3 Messier or NGC deep sky objects (nebulae, star clusters, galaxies).',
    iconName: 'Telescope',
    xpReward: 350,
    category: 'observation',
    requirementCount: 3,
  },
  {
    id: 'relativity_scholar',
    title: 'Einsteinian Relativist',
    description: 'Simulate Black Hole time dilation and spacetime warping in the 3D Engine.',
    iconName: 'Atom',
    xpReward: 200,
    category: 'simulation',
    requirementCount: 1,
  },
  {
    id: 'orbital_architect',
    title: 'Keplerian Navigator',
    description: 'Calculate a Hohmann interplanetary orbital transfer between two planetary bodies.',
    iconName: 'Orbit',
    xpReward: 250,
    category: 'knowledge',
    requirementCount: 1,
  },
  {
    id: 'red_light_tactician',
    title: 'Rhodopsin Guardian',
    description: 'Engage Night Vision Red Mode to preserve your night-adapted human vision.',
    iconName: 'Eye',
    xpReward: 100,
    category: 'explorer',
    requirementCount: 1,
  },
  {
    id: 'community_beacon',
    title: 'Cosmic Chronicler',
    description: 'Generate and share an astronomical sighting card with fellow observers.',
    iconName: 'Share2',
    xpReward: 200,
    category: 'observation',
    requirementCount: 1,
  },
  {
    id: 'stellar_chronologist',
    title: 'H-R Diagram Master',
    description: 'Simulate stellar evolution tracks on the Hertzsprung-Russell engine.',
    iconName: 'Flame',
    xpReward: 250,
    category: 'simulation',
    requirementCount: 1,
  },
  {
    id: 'offline_navigator',
    title: 'Wilderness Astronomer',
    description: 'Download a star chart for remote off-grid observation in dark sky reserves.',
    iconName: 'Download',
    xpReward: 150,
    category: 'explorer',
    requirementCount: 1,
  }
];

export function getRankByXP(xp: number): { rank: string; level: number; nextLevelXP: number; progressPercent: number } {
  const levels = [
    { level: 1, minXP: 0, rank: 'Novice Stargazer' },
    { level: 2, minXP: 200, rank: 'Apprentice Observer' },
    { level: 3, minXP: 500, rank: 'Astro Cadet' },
    { level: 4, minXP: 900, rank: 'Planetary Specialist' },
    { level: 5, minXP: 1400, rank: 'Deep Sky Cartographer' },
    { level: 6, minXP: 2000, rank: 'Astrophysics Scholar' },
    { level: 7, minXP: 2700, rank: 'Master Astronomer' },
    { level: 8, minXP: 3500, rank: 'Astronaut Laureate' },
  ];

  let current = levels[0];
  let next = levels[1];

  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].minXP) {
      current = levels[i];
      next = levels[i + 1] || { level: current.level + 1, minXP: current.minXP + 1000, rank: 'Cosmic Luminary' };
      break;
    }
  }

  const range = next.minXP - current.minXP;
  const progressInLevel = xp - current.minXP;
  const progressPercent = Math.min(Math.round((progressInLevel / range) * 100), 100);

  return {
    rank: current.rank,
    level: current.level,
    nextLevelXP: next.minXP,
    progressPercent,
  };
}
