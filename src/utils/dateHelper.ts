import { Platform, ALL_PLATFORMS } from '../types';
import { PLATFORM_SPECS } from '../config/platforms';

export function getNextOptimalPostTime(platform: Platform, referenceTime = new Date()): Date {
  const spec = PLATFORM_SPECS[platform];
  const now = referenceTime.getTime();
  const minOffset = 30 * 60 * 1000; // minimum 30 minutes from now

  for (let dayOffset = 0; dayOffset < 8; dayOffset++) {
    const candidate = new Date(referenceTime);
    candidate.setDate(candidate.getDate() + dayOffset);

    // Skip weekends for LinkedIn
    if (platform === 'linkedin') {
      const dow = candidate.getDay();
      if (dow === 0 || dow === 6) continue;
    }

    for (const slot of spec.optimalPostTimes) {
      candidate.setHours(slot.hour, slot.minute, 0, 0);
      if (candidate.getTime() > now + minOffset) {
        return new Date(candidate);
      }
    }
  }

  // Fallback: next day at first optimal time
  const fallback = new Date(referenceTime);
  fallback.setDate(fallback.getDate() + 1);
  fallback.setHours(spec.optimalPostTimes[0].hour, spec.optimalPostTimes[0].minute, 0, 0);
  return fallback;
}

// Stagger platforms so they don't all post simultaneously
const STAGGER_MINUTES: Record<Platform, number> = {
  tiktok: 0,
  instagram: 15,
  facebook: 30,
  linkedin: 60,
  youtube: 120,
};

export function buildPostSchedule(
  platforms: Platform[],
  referenceTime = new Date()
): Record<Platform, Date> {
  const schedule: Partial<Record<Platform, Date>> = {};
  const baseTime = getNextOptimalPostTime('tiktok', referenceTime);

  for (const platform of platforms) {
    const optimal = getNextOptimalPostTime(platform, referenceTime);
    const staggered = new Date(optimal.getTime() + STAGGER_MINUTES[platform] * 60 * 1000);
    schedule[platform] = staggered;
  }

  return schedule as Record<Platform, Date>;
}
