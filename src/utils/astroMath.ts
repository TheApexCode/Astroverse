/**
 * Astronomical and Astrophysical Math Utility Engines
 */

// Astronomical constants
export const CONSTANTS = {
  G: 6.6743e-11, // Gravitational constant (m^3 kg^-1 s^-2)
  C: 299792458, // Speed of light (m/s)
  AU_IN_METERS: 149597870700,
  AU_IN_KM: 149597870.7,
  SOLAR_MASS: 1.989e30, // kg
  SOLAR_RADIUS: 696340, // km
  EARTH_MASS: 5.972e24, // kg
  EARTH_RADIUS: 6371, // km
  HUBBLE_CONSTANT: 70.0, // km/s / Mpc
  LY_IN_KM: 9.461e12,
  PARSEC_IN_LY: 3.26156,
};

/**
 * Calculates Moon Phase and Illumination Percentage for any given date
 */
export function getMoonPhase(date: Date = new Date()): {
  phase: number; // 0 to 1 (0 = New, 0.25 = First Quarter, 0.5 = Full, 0.75 = Last Quarter)
  phaseName: string;
  illumination: number; // 0 to 100%
  ageDays: number;
} {
  // Known reference new moon: January 11, 2024, 11:57 UTC (approx timestamp 1704974220000)
  const refNewMoon = 1704974220000;
  const synodicMonthMs = 29.530588853 * 24 * 60 * 60 * 1000;
  const diff = date.getTime() - refNewMoon;
  const cycles = (diff % synodicMonthMs) / synodicMonthMs;
  const phase = (cycles + 1) % 1; // Normalized 0..1
  const ageDays = phase * 29.530588853;
  // Illumination calculation (cosine approximation)
  const illumination = Math.round((1 - Math.cos(phase * 2 * Math.PI)) / 2 * 100);

  let phaseName = 'New Moon';
  if (phase < 0.03 || phase >= 0.97) phaseName = 'New Moon';
  else if (phase < 0.22) phaseName = 'Waxing Crescent';
  else if (phase < 0.28) phaseName = 'First Quarter';
  else if (phase < 0.47) phaseName = 'Waxing Gibbous';
  else if (phase < 0.53) phaseName = 'Full Moon';
  else if (phase < 0.72) phaseName = 'Waning Gibbous';
  else if (phase < 0.78) phaseName = 'Last Quarter';
  else phaseName = 'Waning Crescent';

  return { phase, phaseName, illumination, ageDays: Number(ageDays.toFixed(1)) };
}

/**
 * Telescope Optics calculations
 */
export interface TelescopeOpticsResult {
  magnification: number;
  focalRatio: number;
  dawesLimitArcsec: number; // Resolving power in arcseconds
  rayleighLimitArcsec: number;
  exitPupilMm: number;
  lightGatheringVsEye: number;
  maxUsefulMagnification: number;
  trueFieldOfViewDeg: number;
}

export function calculateTelescopeOptics(
  apertureMm: number,
  telescopeFocalLengthMm: number,
  eyepieceFocalLengthMm: number,
  eyepieceApparentFOVDeg: number = 52
): TelescopeOpticsResult {
  const magnification = telescopeFocalLengthMm / eyepieceFocalLengthMm;
  const focalRatio = telescopeFocalLengthMm / apertureMm;
  const dawesLimitArcsec = 116 / apertureMm;
  const rayleighLimitArcsec = 138 / apertureMm;
  const exitPupilMm = apertureMm / magnification;
  const humanEyePupilMm = 7.0; // dark-adapted pupil
  const lightGatheringVsEye = Math.pow(apertureMm / humanEyePupilMm, 2);
  const maxUsefulMagnification = 2 * apertureMm;
  const trueFieldOfViewDeg = eyepieceApparentFOVDeg / magnification;

  return {
    magnification: Math.round(magnification * 10) / 10,
    focalRatio: Math.round(focalRatio * 10) / 10,
    dawesLimitArcsec: Math.round(dawesLimitArcsec * 100) / 100,
    rayleighLimitArcsec: Math.round(rayleighLimitArcsec * 100) / 100,
    exitPupilMm: Math.round(exitPupilMm * 10) / 10,
    lightGatheringVsEye: Math.round(lightGatheringVsEye),
    maxUsefulMagnification: Math.round(maxUsefulMagnification),
    trueFieldOfViewDeg: Math.round(trueFieldOfViewDeg * 100) / 100,
  };
}

/**
 * Orbital Mechanics & Kepler's 3rd Law
 */
export function calculateOrbitalMechanics(
  semiMajorAxisAU: number,
  centralMassSolarMasses: number = 1.0,
  orbitingMassEarthMasses: number = 1.0
) {
  // P^2 = a^3 / M
  const periodYears = Math.sqrt(Math.pow(semiMajorAxisAU, 3) / centralMassSolarMasses);
  const periodDays = periodYears * 365.256;
  const distanceKm = semiMajorAxisAU * CONSTANTS.AU_IN_KM;
  const circumferenceKm = 2 * Math.PI * distanceKm;
  const meanOrbitalVelocityKmS = circumferenceKm / (periodDays * 86400);

  // Escape velocity from central body at this orbital distance
  const centralMassKg = centralMassSolarMasses * CONSTANTS.SOLAR_MASS;
  const radiusM = semiMajorAxisAU * CONSTANTS.AU_IN_METERS;
  const escapeVelocityKmS = Math.sqrt((2 * CONSTANTS.G * centralMassKg) / radiusM) / 1000;

  return {
    periodYears: Number(periodYears.toFixed(3)),
    periodDays: Number(periodDays.toFixed(1)),
    meanOrbitalVelocityKmS: Number(meanOrbitalVelocityKmS.toFixed(2)),
    escapeVelocityKmS: Number(escapeVelocityKmS.toFixed(2)),
  };
}

/**
 * Hohmann Transfer Orbit Calculator
 * Transfers between two circular coplanar orbits around a central body (e.g., Earth to Mars around the Sun)
 */
export function calculateHohmannTransfer(r1_AU: number, r2_AU: number, centralMassSolarMasses: number = 1.0) {
  const r1_m = r1_AU * CONSTANTS.AU_IN_METERS;
  const r2_m = r2_AU * CONSTANTS.AU_IN_METERS;
  const mu = CONSTANTS.G * (centralMassSolarMasses * CONSTANTS.SOLAR_MASS);

  // Initial circular velocity at orbit 1
  const v1_circ = Math.sqrt(mu / r1_m);
  // Velocity on transfer ellipse at periapsis
  const a_trans = (r1_m + r2_m) / 2;
  const v_trans1 = Math.sqrt(mu * (2 / r1_m - 1 / a_trans));
  // Delta v1 needed to inject into transfer orbit
  const deltaV1_mps = Math.abs(v_trans1 - v1_circ);

  // Circular velocity at orbit 2
  const v2_circ = Math.sqrt(mu / r2_m);
  // Velocity on transfer ellipse at apoapsis
  const v_trans2 = Math.sqrt(mu * (2 / r2_m - 1 / a_trans));
  // Delta v2 needed to circularize at orbit 2
  const deltaV2_mps = Math.abs(v2_circ - v_trans2);

  const totalDeltaV_kmS = (deltaV1_mps + deltaV2_mps) / 1000;
  // Transfer duration is half the orbital period of the transfer ellipse
  const t_trans_seconds = Math.PI * Math.sqrt(Math.pow(a_trans, 3) / mu);
  const transferDays = t_trans_seconds / 86400;

  return {
    deltaV1_kmS: Number((deltaV1_mps / 1000).toFixed(2)),
    deltaV2_kmS: Number((deltaV2_mps / 1000).toFixed(2)),
    totalDeltaV_kmS: Number(totalDeltaV_kmS.toFixed(2)),
    transferDays: Number(transferDays.toFixed(1)),
    transferMonths: Number((transferDays / 30.4375).toFixed(1)),
  };
}

/**
 * Special and General Relativity: Time Dilation & Gravitational Redshift
 */
export function calculateRelativity(
  velocityFractionOfC: number, // 0 to 0.9999
  blackHoleMassSolarMasses: number = 10,
  distanceFromEventHorizonMeters: number = 50000
) {
  const beta = Math.min(Math.max(velocityFractionOfC, 0), 0.99999);
  // Lorentz factor
  const gamma = 1 / Math.sqrt(1 - beta * beta);
  // Time dilation factor for high velocity: 1 second on moving ship = gamma seconds on Earth
  const velocityDilationRatio = gamma;

  // Schwarzschild radius: r_s = 2GM / c^2
  const m_kg = blackHoleMassSolarMasses * CONSTANTS.SOLAR_MASS;
  const rs_m = (2 * CONSTANTS.G * m_kg) / (CONSTANTS.C * CONSTANTS.C);
  const r_m = rs_m + Math.max(distanceFromEventHorizonMeters, 1);

  // Gravitational time dilation: sqrt(1 - rs / r)
  const factor = Math.max(0.00001, 1 - rs_m / r_m);
  const gravDilationRatio = 1 / Math.sqrt(factor);

  return {
    gamma: Number(gamma.toFixed(4)),
    velocityDilationRatio: Number(velocityDilationRatio.toFixed(3)),
    schwarzschildRadiusKm: Number((rs_m / 1000).toFixed(2)),
    gravitationalDilationRatio: Number(gravDilationRatio.toFixed(3)),
  };
}

/**
 * Calculates Alt/Az from RA/Dec for a given observer latitude, longitude, and date
 */
export function raDecToAltAz(
  raHours: number,
  decDeg: number,
  latDeg: number,
  lonDeg: number,
  date: Date = new Date()
): { altitudeDeg: number; azimuthDeg: number; isVisible: boolean } {
  const d = (date.getTime() - Date.UTC(2000, 0, 1, 12, 0, 0)) / 86400000;
  const utHours = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  // Local Sidereal Time
  let gmst = 18.697374558 + 24.06570982441908 * d;
  gmst = ((gmst % 24) + 24) % 24;
  let lst = gmst + lonDeg / 15.0;
  lst = ((lst % 24) + 24) % 24;

  const haHours = lst - raHours;
  const haDeg = haHours * 15.0;

  const latRad = (latDeg * Math.PI) / 180;
  const decRad = (decDeg * Math.PI) / 180;
  const haRad = (haDeg * Math.PI) / 180;

  const sinAlt = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
  const altRad = Math.asin(sinAlt);
  const altDeg = (altRad * 180) / Math.PI;

  const cosAz = (Math.sin(decRad) - Math.sin(latRad) * sinAlt) / (Math.cos(latRad) * Math.cos(altRad));
  let azRad = Math.acos(Math.min(Math.max(cosAz, -1), 1));
  if (Math.sin(haRad) > 0) {
    azRad = 2 * Math.PI - azRad;
  }
  const azDeg = (azRad * 180) / Math.PI;

  return {
    altitudeDeg: Number(altDeg.toFixed(1)),
    azimuthDeg: Number(azDeg.toFixed(1)),
    isVisible: altDeg > 0,
  };
}
