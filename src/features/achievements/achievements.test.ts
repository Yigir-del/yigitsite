import { beforeEach, describe, expect, it } from 'vitest';
import {
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_MAP,
  ALL_ACHIEVEMENT_DEFINITIONS,
  GOLDEN_TROPHY_DEFINITION,
  REQUIRED_ACHIEVEMENT_DEFINITIONS,
  REQUIRED_ACHIEVEMENT_IDS,
  TOTAL_REQUIRED_ACHIEVEMENTS,
  isValidAchievementId,
} from './definitions';
import {
  ACHIEVEMENTS_SCHEMA_VERSION,
  clearAchievementToastQueue,
  getAchievementProgress,
  getAchievementState,
  getAchievementToastQueue,
  isAchievementUnlocked,
  parseStoredAchievements,
  recordCaveInscriptionDiscovered,
  recordCaveSecretSymbolDiscovered,
  recordDomainThemeInteraction,
  recordOyukEntered,
  recordOyukExited,
  resetAchievementsForTests,
  shiftAchievementToast,
  syncAchievementsFromStorage,
  unlockAchievement,
} from './achievementStore';
import { recordBeggarDonation, resetOyukStateForTests } from '../oyuk/oyukState';
import { PAGE_SEO } from '../../seo/config';

const memoryStore = new Map<string, string>();
if (typeof globalThis.localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem: (key: string) => memoryStore.get(key) ?? null,
      setItem: (key: string, val: string) => {
        memoryStore.set(key, String(val));
      },
      removeItem: (key: string) => {
        memoryStore.delete(key);
      },
      clear: () => {
        memoryStore.clear();
      },
    },
    configurable: true,
  });
}

describe('Rebalanced 9-Achievement System, Storage Migration & Golden Trophy (§9)', () => {
  beforeEach(() => {
    localStorage.clear();
    resetAchievementsForTests();
    resetOyukStateForTests();
  });

  it('1. defines EXACTLY 9 required achievements + 1 Golden Trophy with canonical Turkish copy', () => {
    expect(TOTAL_REQUIRED_ACHIEVEMENTS).toBe(9);
    expect(REQUIRED_ACHIEVEMENT_DEFINITIONS.length).toBe(9);
    expect(REQUIRED_ACHIEVEMENT_IDS.length).toBe(9);
    expect(ALL_ACHIEVEMENT_DEFINITIONS.length).toBe(10);

    expect(REQUIRED_ACHIEVEMENT_IDS).toEqual([
      'oyuk_entered',
      'five_inscriptions',
      'hidden_cave_symbol',
      'first_note',
      'music_rejected',
      'world_flip',
      'sudo_discovered',
      'wreath_offered',
      'not_found_discovered',
    ]);

    // Verify removed trivial achievements (and all_domains) are no longer valid achievement IDs
    const removedIds = [
      'first_arrival',
      'about_discovered',
      'projects_discovered',
      'notes_wall_discovered',
      'first_donation',
      'three_donations',
      'five_donations',
      'first_inscription',
      'oyuk_revisited',
      'pen_discovered',
      'music_discovered',
      'first_domain_switch',
      'all_domains',
      'meaning_42',
      'thoughts_discovered',
      'studio_discovered',
      'memorial_visited',
    ];
    for (const oldId of removedIds) {
      expect(isValidAchievementId(oldId)).toBe(false);
    }

    // Verify canonical 9th achievement "Yanlış Kapı" (not_found_discovered)
    expect(ACHIEVEMENT_MAP.not_found_discovered).toMatchObject({
      id: 'not_found_discovered',
      title: 'Yanlış Kapı',
      description: 'Yanlış yere geldin. Belki de gelmen gereken yer burasıydı.',
      requiredForCompletion: true,
    });

    const validCategories = new Set(ACHIEVEMENT_CATEGORIES.map((c) => c.key));
    for (const def of REQUIRED_ACHIEVEMENT_DEFINITIONS) {
      expect(def.requiredForCompletion).toBe(true);
      expect(def.title.trim().length).toBeGreaterThan(0);
      expect(def.description.trim().length).toBeGreaterThan(0);
      expect(validCategories.has(def.category)).toBe(true);
    }

    expect(GOLDEN_TROPHY_DEFINITION.id).toBe('golden_trophy');
    expect(GOLDEN_TROPHY_DEFINITION.requiredForCompletion).toBe(false);
    expect(GOLDEN_TROPHY_DEFINITION.title).toBe('Hiçliğin Kralı');
  });

  it('2. unlocks achievements idempotently, persists to localStorage, and queues notifications', () => {
    expect(isAchievementUnlocked('oyuk_entered')).toBe(false);
    expect(getAchievementProgress()).toEqual({
      unlockedCount: 0,
      totalRequired: 9,
      goldenTrophyAwarded: false,
    });

    const firstUnlock = unlockAchievement('oyuk_entered');
    expect(firstUnlock).toBe(true);
    expect(isAchievementUnlocked('oyuk_entered')).toBe(true);
    expect(getAchievementProgress().unlockedCount).toBe(1);
    expect(getAchievementToastQueue().length).toBe(1);
    expect(getAchievementToastQueue()[0]?.id).toBe('oyuk_entered');

    const firstTimestamp = getAchievementState().unlocked.oyuk_entered;
    expect(typeof firstTimestamp).toBe('number');

    // Duplicate unlock must be a no-op and must not queue another toast
    const duplicateUnlock = unlockAchievement('oyuk_entered');
    expect(duplicateUnlock).toBe(false);
    expect(getAchievementProgress().unlockedCount).toBe(1);
    expect(getAchievementToastQueue().length).toBe(1);
    expect(getAchievementState().unlocked.oyuk_entered).toBe(firstTimestamp);

    // Toasts can be dismissed or shifted
    shiftAchievementToast();
    expect(getAchievementToastQueue().length).toBe(0);

    // Second achievement can be unlocked and queued
    unlockAchievement('first_note');
    expect(getAchievementToastQueue().length).toBe(1);
    clearAchievementToastQueue();
    expect(getAchievementToastQueue().length).toBe(0);
  });

  it('3. migrates legacy 26-achievement localStorage data cleanly without losing valid progress (§9)', () => {
    const legacyRaw = JSON.stringify({
      version: 1,
      unlocked: {
        // Valid legacy achievements that mapped to current 9
        oyuk_entered: 1700000000000,
        five_inscriptions: { unlockedAt: 1700000002000 },
        first_note: 1700000003000,
        // Removed trivial achievements that should be stripped
        first_arrival: 1699999999000,
        five_donations: 1700000001000,
        first_domain_switch: 1700000004000,
        all_domains: 1700000005000,
        corrupt_nan: NaN,
      },
      seenDomains: ['Muryokusho', 'FukumaMizushi'],
      discoveredInscriptions: ['oyuk-01', 'oyuk-02'],
      oyukCompletedVisits: 3,
      goldenTrophyAwarded: true,
    });

    const migrated = parseStoredAchievements(legacyRaw);
    expect(migrated.version).toBe(ACHIEVEMENTS_SCHEMA_VERSION);

    // Only valid current required IDs are preserved
    expect(migrated.unlocked.oyuk_entered).toBe(1700000000000);
    expect(migrated.unlocked.five_inscriptions).toBe(1700000002000);
    expect(migrated.unlocked.first_note).toBe(1700000003000);

    // Stripped legacy IDs do not exist in parsed unlocked map
    expect(
      Object.prototype.hasOwnProperty.call(migrated.unlocked, 'first_arrival'),
    ).toBe(false);
    expect(
      Object.prototype.hasOwnProperty.call(migrated.unlocked, 'all_domains'),
    ).toBe(false);

    // Since only 3 of the 9 required IDs are unlocked, goldenTrophyAwarded is recalculated to false
    expect(migrated.goldenTrophyAwarded).toBe(false);
    expect(migrated.unlocked.golden_trophy).toBeUndefined();
    expect(migrated.discoveredInscriptions).toEqual(['oyuk-01', 'oyuk-02']);
  });

  it('4. supports silent unlocks for /miras wreath offering without celebratory toasts (§7.2 #9)', () => {
    clearAchievementToastQueue();
    expect(unlockAchievement('wreath_offered', { silent: true })).toBe(true);

    expect(isAchievementUnlocked('wreath_offered')).toBe(true);
    expect(getAchievementToastQueue().length).toBe(0);
  });

  it('5. keeps 5-coin beggar OYUK unlock intact without awarding removed donation achievements', () => {
    for (let i = 1; i <= 5; i++) {
      recordBeggarDonation({ returnPath: '/' });
    }
    expect(getAchievementProgress().unlockedCount).toBe(0);
  });

  it('6. tracks OYUK entry, 5 distinct cave inscriptions, and hidden cave symbol (§7.2 #1–#3)', () => {
    recordOyukEntered();
    expect(isAchievementUnlocked('oyuk_entered')).toBe(true);

    // Illuminating 1–4 inscriptions does not unlock five_inscriptions yet
    recordCaveInscriptionDiscovered('oyuk-01');
    recordCaveInscriptionDiscovered('oyuk-01'); // duplicate ignored
    expect(getAchievementState().discoveredInscriptions).toEqual(['oyuk-01']);
    expect(isAchievementUnlocked('five_inscriptions')).toBe(false);

    recordCaveInscriptionDiscovered('oyuk-02');
    recordCaveInscriptionDiscovered('oyuk-03');
    recordCaveInscriptionDiscovered('oyuk-04');
    expect(isAchievementUnlocked('five_inscriptions')).toBe(false);

    // 5th distinct inscription unlocks five_inscriptions
    recordCaveInscriptionDiscovered('oyuk-05');
    expect(isAchievementUnlocked('five_inscriptions')).toBe(true);

    // Hidden cave symbol
    recordCaveSecretSymbolDiscovered();
    expect(isAchievementUnlocked('hidden_cave_symbol')).toBe(true);

    recordOyukExited();
    expect(getAchievementState().oyukCompletedVisits).toBe(1);
  });

  it('7. safely handles retired theme switching without errors (§3 & §9)', () => {
    recordDomainThemeInteraction('Muryokusho', false);
    // all_domains is retired and cannot be unlocked
    expect(isValidAchievementId('all_domains')).toBe(false);
  });

  it('8. unlocks not_found_discovered ("Yanlış Kapı") idempotently and queues its toast once (Additional Update §2–§3)', () => {
    expect(isAchievementUnlocked('not_found_discovered')).toBe(false);

    const firstVisit = unlockAchievement('not_found_discovered');
    expect(firstVisit).toBe(true);
    expect(isAchievementUnlocked('not_found_discovered')).toBe(true);
    expect(getAchievementToastQueue().length).toBe(1);
    expect(getAchievementToastQueue()[0]?.definition.title).toBe('Yanlış Kapı');

    // Revisiting 404 does not duplicate unlock or toast
    const secondVisit = unlockAchievement('not_found_discovered');
    expect(secondVisit).toBe(false);
    expect(getAchievementToastQueue().length).toBe(1);
  });

  it('9. awards the ultimate Golden Trophy ("Hiçliğin Kralı") only when all 9 required achievements are unlocked (§9)', () => {
    const firstEight = REQUIRED_ACHIEVEMENT_IDS.slice(0, 8);
    const ninthRequiredId = REQUIRED_ACHIEVEMENT_IDS[8];

    for (const id of firstEight) {
      unlockAchievement(id, { silent: true });
    }

    expect(getAchievementProgress()).toEqual({
      unlockedCount: 8,
      totalRequired: 9,
      goldenTrophyAwarded: false,
    });
    expect(isAchievementUnlocked('golden_trophy')).toBe(false);

    // Direct unlock attempt before 9/9 is rejected
    expect(unlockAchievement('golden_trophy')).toBe(false);

    // Unlock the 9th required achievement ("not_found_discovered")
    unlockAchievement(ninthRequiredId);

    expect(getAchievementProgress()).toEqual({
      unlockedCount: 9,
      totalRequired: 9,
      goldenTrophyAwarded: true,
    });
    expect(isAchievementUnlocked('golden_trophy')).toBe(true);

    // Toast queue contains both the 9th achievement and the Golden Trophy reveal
    const queuedIds = getAchievementToastQueue().map((item) => item.id);
    expect(queuedIds).toContain(ninthRequiredId);
    expect(queuedIds).toContain('golden_trophy');

    // Syncing from storage preserves 9/9 Golden Trophy state
    syncAchievementsFromStorage();
    expect(getAchievementState().goldenTrophyAwarded).toBe(true);
    expect(getAchievementProgress().unlockedCount).toBe(9);
  });

  it('10. configures /basarimlar SEO metadata properly', () => {
    expect(PAGE_SEO.achievements.title).toBe('İzlerin');
    expect(PAGE_SEO.achievements.canonical).toBe(
      'https://yigitaltuntas.me/basarimlar',
    );
  });
});
