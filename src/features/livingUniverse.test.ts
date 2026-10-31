import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  BEGGAR_MEMORY_OYUK_LINES,
  getWorldMemoryState,
  MEMORY_LINE_COOLDOWN_MS,
  recordWorldMemoryAnomaly,
  recordWorldMemoryEncounter,
  recordWorldMemoryMoonSecret,
  recordWorldMemoryNoteStar,
  recordWorldMemoryOyukEntered,
  recordWorldMemoryOyukExited,
  resetWorldMemoryForTests,
  SAGE_MEMORY_COSMIC_LINES,
  SAGE_MEMORY_OYUK_LINES,
  selectContextualMemoryLine,
  syncWorldMemoryFromStorage,
  WORLD_MEMORY_STORAGE_KEY,
} from './worldMemory/worldMemoryStore';
import {
  cancelActiveEncounter,
  checkAndTriggerEncounter,
  computeActorDistance,
  ENCOUNTER_COOLDOWN_MS,
  ENCOUNTER_EXCHANGES,
  ENCOUNTER_RADIUS_PX,
  isEncounterActive,
  registerEncounterActor,
  resetEncounterManagerForTests,
} from './characterEncounters/encounterManager';
import {
  cancelLunarHold,
  completeLunarHold,
  getLunarSecretSnapshot,
  resetLunarSecretForTests,
  startLunarHold,
  triggerLunarClick,
  updateLunarHoldProgress,
} from './lunarSecret/lunarSecretStore';
import {
  activateCurrentAnomaly,
  getAnomalySnapshot,
  resetAnomalyStoreForTests,
  trySpawnAnomaly,
} from './anomalies/anomalyStore';
import {
  getNoteStarsSnapshot,
  isValidServerNoteId,
  MY_NOTE_STARS_STORAGE_KEY,
  pruneDeletedOwnedNotes,
  recordOwnedNoteSaved,
  removeOwnedNoteId,
  resetNoteStarsForTests,
  selectOwnedStar,
  syncNoteStarsFromStorage,
} from './noteStars/noteStarsStore';
import {
  hashOwnedStarPos,
  hashOwnedStarScreenRatio,
  hashStarPos,
} from '../utils/noteTraces';
import {
  deleteNoteById,
  fetchNotes,
  resetNotesStoreForTests,
  submitNote,
} from '../utils/notesStore';
import {
  resetAmbientSlotForTests,
} from '../utils/ambientSlot';
import {
  commitPendingOyukCinematic,
  finishCinematicArrival,
  getOyukState,
  isCinematicActive,
  OYUK_UNLOCKED_KEY,
  readAlms,
  recordBeggarDonation,
  resetCinematicToIdle,
  resetOyukStateForTests,
  startOyukExit,
} from './oyuk/oyukState';
import {
  ACHIEVEMENT_DEFINITIONS,
  TOTAL_REQUIRED_ACHIEVEMENTS,
} from './achievements/definitions';
import {
  getAchievementState,
  resetAchievementsForTests,
} from './achievements/achievementStore';

// Ensure standard Storage implementation in Node test environment
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

describe('MURYOKUSHO — THE LIVING UNIVERSE (§4–§18)', () => {
  beforeEach(() => {
    memoryStore.clear();
    localStorage.clear();
    resetOyukStateForTests();
    resetWorldMemoryForTests();
    resetEncounterManagerForTests();
    resetLunarSecretForTests();
    resetAnomalyStoreForTests();
    resetAmbientSlotForTests();
    resetNoteStarsForTests();
    resetNotesStoreForTests();
    resetAchievementsForTests();
    vi.restoreAllMocks();
  });

  describe('1. The Universe Remembers — World Memory Store (§4 & §18.1)', () => {
    it('persists discoveries in localStorage and recovers gracefully from corrupt storage', () => {
      expect(getWorldMemoryState().hasReturnedFromOyuk).toBe(false);

      recordWorldMemoryOyukEntered(1000);
      recordWorldMemoryOyukExited(2000);
      recordWorldMemoryMoonSecret(3000);
      recordWorldMemoryAnomaly(4000);
      recordWorldMemoryEncounter(5000);
      recordWorldMemoryNoteStar(6000);

      const snap = getWorldMemoryState();
      expect(snap.hasEnteredOyuk).toBe(true);
      expect(snap.hasReturnedFromOyuk).toBe(true);
      expect(snap.hasDiscoveredMoonSecret).toBe(true);
      expect(snap.hasDiscoveredAnomaly).toBe(true);
      expect(snap.hasExperiencedEncounter).toBe(true);
      expect(snap.hasDiscoveredNoteStar).toBe(true);

      const raw = localStorage.getItem(WORLD_MEMORY_STORAGE_KEY);
      expect(raw).toBeTruthy();

      // Corrupt storage recovery
      localStorage.setItem(WORLD_MEMORY_STORAGE_KEY, '{corrupt-json');
      const recovered = syncWorldMemoryFromStorage();
      expect(recovered.hasEnteredOyuk).toBe(false);
      expect(recovered.hasReturnedFromOyuk).toBe(false);
    });

    it('keeps yigit_oyuk_unlocked authoritative for OYUK memory', () => {
      localStorage.setItem(OYUK_UNLOCKED_KEY, '1');
      const synced = syncWorldMemoryFromStorage();
      expect(synced.hasEnteredOyuk).toBe(true);
    });

    it('selects memory-aware contextual lines for Beggar and Sage while enforcing cooldowns', () => {
      // Before any discovery, no memory line is selected
      expect(selectContextualMemoryLine('beggar', { now: 10_000, forceRoll: 0 })).toBeNull();
      expect(selectContextualMemoryLine('sage', { now: 10_000, forceRoll: 0 })).toBeNull();

      // After returning from OYUK, pendingAcknowledgement triggers a memory line on first check
      recordWorldMemoryOyukExited(12_000);
      const beggarLine = selectContextualMemoryLine('beggar', {
        now: 15_000,
        forceRoll: 0.95, // Even with high roll, pendingAcknowledgement guarantees one-shot delivery
      });
      expect(beggarLine).toBeTruthy();
      expect(BEGGAR_MEMORY_OYUK_LINES).toContain(beggarLine);

      // Immediate second call is blocked by MEMORY_LINE_COOLDOWN_MS
      const blockedByCooldown = selectContextualMemoryLine('beggar', {
        now: 15_000 + 5_000,
        forceRoll: 0.01,
      });
      expect(blockedByCooldown).toBeNull();

      // After cooldown expires, low forceRoll selects another non-repeating memory line
      const afterCooldown = selectContextualMemoryLine('beggar', {
        now: 15_000 + MEMORY_LINE_COOLDOWN_MS + 100,
        forceRoll: 0.05,
      });
      expect(afterCooldown).toBeTruthy();
      expect(afterCooldown).not.toBe(beggarLine);

      // Sage cosmic memory line after Moon secret
      recordWorldMemoryMoonSecret(60_000);
      const sageCosmic = selectContextualMemoryLine('sage', {
        now: 120_000,
        forceRoll: 0.9,
      });
      expect(sageCosmic).toBeTruthy();
      expect([
        ...SAGE_MEMORY_OYUK_LINES,
        ...Object.values(SAGE_MEMORY_COSMIC_LINES),
      ]).toContain(sageCosmic);
    });
  });

  describe('2. Beggar & Sage Physical Encounters (§5 & §18.2)', () => {
    it('triggers canonical 3-step exchange only when deliberately dragged within proximity', () => {
      vi.useFakeTimers();

      const beggarLines: string[] = [];
      const sageLines: string[] = [];
      let beggarHeld = false;
      let sageHeld = false;
      let beggarResumed = false;
      let sageResumed = false;

      let beggarPos = { x: 200, y: 200 };
      const sagePos = { x: 500, y: 200 };

      registerEncounterActor('beggar', {
        getCenter: () => beggarPos,
        isReady: () => true,
        hold: () => {
          beggarHeld = true;
        },
        sayLine: (text) => {
          beggarLines.push(text);
        },
        clearSpeech: () => {},
        resume: () => {
          beggarResumed = true;
        },
      });

      registerEncounterActor('sage', {
        getCenter: () => sagePos,
        isReady: () => true,
        hold: () => {
          sageHeld = true;
        },
        sayLine: (text) => {
          sageLines.push(text);
        },
        clearSpeech: () => {},
        resume: () => {
          sageResumed = true;
        },
      });

      // 1. Out of range drag does not trigger
      const farRes = checkAndTriggerEncounter('beggar', {
        wasDragged: true,
        now: 10_000,
      });
      expect(farRes.triggered).toBe(false);
      expect(farRes.reason).toBe('out_of_range');

      // 2. Move within range (distance = 80px <= 145px), but automatic flight (wasDragged: false) MUST NOT trigger!
      beggarPos = { x: 420, y: 200 };
      expect(computeActorDistance(beggarPos, sagePos)).toBeLessThanOrEqual(
        ENCOUNTER_RADIUS_PX,
      );
      const autoFlyby = checkAndTriggerEncounter('beggar', {
        wasDragged: false,
        now: 10_000,
      });
      expect(autoFlyby.triggered).toBe(false);
      expect(autoFlyby.reason).toBe('not_dragged');

      // 3. Deliberate drag within range triggers encounter!
      const triggered = checkAndTriggerEncounter('beggar', {
        wasDragged: true,
        now: 10_000,
        stepIntervalMs: 500,
      });
      expect(triggered.triggered).toBe(true);
      expect(isEncounterActive()).toBe(true);
      expect(beggarHeld).toBe(true);
      expect(sageHeld).toBe(true);

      // Step 1: Beggar speaks immediately
      expect(beggarLines).toEqual([ENCOUNTER_EXCHANGES[0][0].text]);
      expect(beggarLines[0]).toBe('Kral beni bunun yanına niye getirdin?');

      // Step 2: Sage replies at +500ms
      vi.advanceTimersByTime(500);
      expect(sageLines).toEqual([ENCOUNTER_EXCHANGES[0][1].text]);
      expect(sageLines[0]).toBe('Demek sonunda bilgeliğe geldin.');

      // Step 3: Beggar replies at +1000ms
      vi.advanceTimersByTime(500);
      expect(beggarLines[1]).toBe('Yanlışlıkla geldim.');

      // Completion: both actors resume flight and donation count is untouched
      vi.advanceTimersByTime(800);
      expect(isEncounterActive()).toBe(false);
      expect(beggarResumed).toBe(true);
      expect(sageResumed).toBe(true);
      expect(readAlms()).toBe(0);
      expect(getWorldMemoryState().hasExperiencedEncounter).toBe(true);

      // 4. Cooldown blocks immediate re-trigger
      const duringCooldown = checkAndTriggerEncounter('sage', {
        wasDragged: true,
        now: 10_000 + ENCOUNTER_COOLDOWN_MS - 1000,
      });
      expect(duringCooldown.triggered).toBe(false);
      expect(duringCooldown.reason).toBe('cooldown');

      vi.useRealTimers();
    });

    it('suppresses or cancels encounters when OYUK 5th-donation cinematic is active', () => {
      resetOyukStateForTests({ alms: 4 });
      recordBeggarDonation({ returnPath: '/' }); // 5th donation -> 'invitation' phase

      registerEncounterActor('beggar', {
        getCenter: () => ({ x: 300, y: 200 }),
        isReady: () => true,
        hold: () => {},
        sayLine: () => {},
        clearSpeech: () => {},
        resume: () => {},
      });
      registerEncounterActor('sage', {
        getCenter: () => ({ x: 320, y: 200 }),
        isReady: () => true,
        hold: () => {},
        sayLine: () => {},
        clearSpeech: () => {},
        resume: () => {},
      });

      const res = checkAndTriggerEncounter('beggar', {
        wasDragged: true,
        now: 50_000,
      });
      expect(res.triggered).toBe(false);
      expect(res.reason).toBe('cinematic_active');

      cancelActiveEncounter();
      expect(isEncounterActive()).toBe(false);
    });
  });

  describe('3. Atmospheric Scenery Moon (§4)', () => {
    it('ensures the Moon is a non-interactive scenic backdrop and clicks/holds do nothing (§4)', () => {
      // Clicks are inert
      expect(triggerLunarClick()).toBe(0);
      expect(getLunarSecretSnapshot().clickCount).toBe(0);
      expect(getLunarSecretSnapshot().secretRevealed).toBe(false);

      // Holds are inert
      startLunarHold();
      updateLunarHoldProgress(0.5);
      expect(getLunarSecretSnapshot().secretRevealed).toBe(false);
      cancelLunarHold();
      expect(getLunarSecretSnapshot().secretRevealed).toBe(false);
    });
  });

  describe('4. Reality Anomalies Disabled (§2)', () => {
    it('ensures reality anomalies are completely disabled and never spawn background fractures (§2)', () => {
      const res = trySpawnAnomaly({ pathname: '/', now: 100_000 });
      expect(res.spawned).toBe(false);
      expect(getAnomalySnapshot().current).toBeNull();
    });
  });

  describe('5. My Note, My Star (§8 & §18.5)', () => {
    it('persists only server-confirmed note IDs, rejects optimistic/failed notes, and prunes deleted notes', async () => {
      // 1. Optimistic IDs are rejected
      expect(isValidServerNoteId('optimistic-12345')).toBe(false);
      expect(recordOwnedNoteSaved({ id: 'optimistic-12345' })).toBe(false);
      expect(getNoteStarsSnapshot().ownedNoteIds).toEqual([]);

      // 2. Failed POST /api/notes does not store an owned star
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Sunucu hatası' }),
        }),
      );
      const failedRes = await submitNote({
        text: 'Başarısız not denemesi',
        author: 'Gizemli Yabancı',
      });
      expect(failedRes.ok).toBe(false);
      expect(getNoteStarsSnapshot().ownedNoteIds).toEqual([]);

      // 3. Successful POST /api/notes stores the server-returned ID and starts star-birth feedback
      const serverSavedNote = {
        id: 'srv-note-901',
        text: 'Geceye bıraktığım yıldız notu.',
        author: 'Gizemli Yabancı',
        isAdmin: false,
        x: 0,
        y: 0,
        rotation: 0,
        date: '31/10/2026',
        created_at: '2026-10-31T00:00:00.000Z',
      };
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => serverSavedNote,
        }),
      );

      const okRes = await submitNote({
        text: serverSavedNote.text,
        author: serverSavedNote.author,
      });
      expect(okRes.ok).toBe(true);
      expect(getNoteStarsSnapshot().ownedNoteIds).toEqual(['srv-note-901']);
      expect(getNoteStarsSnapshot().activeStarBirth?.noteId).toBe('srv-note-901');
      expect(localStorage.getItem(MY_NOTE_STARS_STORAGE_KEY)).toContain('srv-note-901');

      // 4. Another visitor's note with the SAME author name ("Gizemli Yabancı") is NOT treated as owned!
      const otherVisitorNote = {
        ...serverSavedNote,
        id: 'srv-note-other-999',
        text: 'Başka bir ziyaretçinin notu.',
      };
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => [serverSavedNote, otherVisitorNote],
        }),
      );
      await fetchNotes(true);
      expect(getNoteStarsSnapshot().ownedNoteIds).toEqual(['srv-note-901']);
      expect(getNoteStarsSnapshot().ownedNoteIds).not.toContain('srv-note-other-999');

      // 5. Selecting the visitor's star opens it and records world memory
      selectOwnedStar('srv-note-other-999'); // Not owned -> ignored
      expect(getNoteStarsSnapshot().selectedStarNoteId).toBeNull();

      selectOwnedStar('srv-note-901'); // Owned -> selected!
      expect(getNoteStarsSnapshot().selectedStarNoteId).toBe('srv-note-901');
      expect(getWorldMemoryState().hasDiscoveredNoteStar).toBe(true);

      // 6. Deleting the note removes its owned star and closes the reveal card
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValueOnce({
          ok: true,
          status: 200,
        }),
      );
      const deleted = await deleteNoteById('srv-note-901');
      expect(deleted).toBe(true);
      expect(getNoteStarsSnapshot().ownedNoteIds).toEqual([]);
      expect(getNoteStarsSnapshot().selectedStarNoteId).toBeNull();
    });

    it('prunes stale owned note IDs when they no longer exist on the server and computes deterministic visible coordinates', () => {
      recordOwnedNoteSaved({ id: 'note-keep-1' });
      recordOwnedNoteSaved({ id: 'note-deleted-on-server-2' });
      selectOwnedStar('note-deleted-on-server-2');

      pruneDeletedOwnedNotes([{ id: 'note-keep-1' }, { id: 'public-note-3' }]);
      expect(getNoteStarsSnapshot().ownedNoteIds).toEqual(['note-keep-1']);
      expect(getNoteStarsSnapshot().selectedStarNoteId).toBeNull();
      expect(syncNoteStarsFromStorage().ownedNoteIds).toEqual(['note-keep-1']);

      // Deterministic coordinate checks
      const posA = hashStarPos('note-keep-1');
      const posB = hashStarPos('note-keep-1');
      expect(posA).toEqual(posB);

      const ownedPosA = hashOwnedStarPos('note-keep-1');
      const ownedPosB = hashOwnedStarPos('note-keep-1');
      expect(ownedPosA).toEqual(ownedPosB);
      // Owned star is always in front of camera (z in [-11.2, -8.4])
      expect(ownedPosA[2]).toBeLessThan(-8);
      expect(ownedPosA[2]).toBeGreaterThan(-12);

      const ratio = hashOwnedStarScreenRatio('note-keep-1');
      expect(ratio.u).toBeGreaterThanOrEqual(0.16);
      expect(ratio.u).toBeLessThanOrEqual(0.82);
      expect(ratio.v).toBeGreaterThanOrEqual(0.18);
      expect(ratio.v).toBeLessThanOrEqual(0.68);

      removeOwnedNoteId('note-keep-1');
      expect(getNoteStarsSnapshot().ownedNoteIds).toEqual([]);
    });
  });

  describe('6. OYUK Entry & Smooth Exit Preservation + Achievement Catalog Integrity (§10–§14 & §18.6)', () => {
    it('unlocks OYUK on 5th coin impact and transitions smoothly through exiting -> arrived -> idle', () => {
      for (let i = 1; i <= 4; i++) {
        recordBeggarDonation({ returnPath: '/projeler' });
      }
      const fifth = recordBeggarDonation({
        returnPath: '/projeler',
        deferCinematicStart: true,
      });
      expect(fifth.triggeredCinematic).toBe(true);
      expect(getOyukState().pendingCinematic).toBe(true);

      expect(commitPendingOyukCinematic()).toBe(true);
      expect(getOyukState().unlocked).toBe(true);
      expect(getOyukState().phase).toBe('invitation');

      // Smooth exit transition from cave back to /projeler
      startOyukExit('/projeler');
      expect(getOyukState().phase).toBe('exiting');
      expect(getOyukState().returnPath).toBe('/projeler');
      expect(isCinematicActive(getOyukState().phase)).toBe(true);

      finishCinematicArrival();
      expect(getOyukState().phase).toBe('arrived');
      resetCinematicToIdle();
      expect(getOyukState().phase).toBe('idle');
    });

    it('never expands or falsely triggers the 9-achievement catalog when living-universe interactions occur (§14)', () => {
      expect(TOTAL_REQUIRED_ACHIEVEMENTS).toBe(9);
      expect(ACHIEVEMENT_DEFINITIONS.length).toBe(10); // 9 required + golden_trophy

      // Trigger all new living-universe systems
      recordWorldMemoryMoonSecret();
      recordWorldMemoryAnomaly();
      recordWorldMemoryEncounter();
      recordWorldMemoryNoteStar();
      completeLunarHold();
      trySpawnAnomaly({ pathname: '/', now: 100_000 });
      activateCurrentAnomaly();
      recordOwnedNoteSaved({ id: 'srv-star-1' });
      selectOwnedStar('srv-star-1');

      // None of the new ambient discoveries falsely unlock any of the 10 achievements
      expect(Object.keys(getAchievementState().unlocked)).toEqual([]);
    });
  });
});
