import { beforeEach, describe, expect, it } from 'vitest';
import {
  ALMS_KEY,
  OYUK_INTRO_SEEN_KEY,
  OYUK_UNLOCKED_KEY,
  advanceCinematicPhase,
  finishCinematicArrival,
  getOyukState,
  isCinematicActive,
  readAlms,
  readOyukUnlocked,
  recordBeggarDonation,
  recordLastPointer,
  resetCinematicToIdle,
  resetOyukStateForTests,
  setOyukReturnPath,
  syncOyukFromStorage,
  writeAlms,
} from './oyukState';
import { OYUK_DEEPER_SECRET, OYUK_INSCRIPTIONS } from './oyukStory';
import { OYUK_OPENING_LINE, OYUK_THRESHOLD_LINE } from './OyukDirector';
import { PAGE_SEO } from '../../seo/config';

// Ensure a standard Storage implementation is available in Node test environments
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

describe('OYUK donation & unlock state machine (§4 & §20.1)', () => {
  beforeEach(() => {
    memoryStore.clear();
    resetOyukStateForTests();
  });

  it('1 & 2. donations 1 through 4 increment counter normally and do not unlock OYUK', () => {
    for (let i = 1; i <= 4; i++) {
      const res = recordBeggarDonation({ returnPath: '/' });
      expect(res.accepted).toBe(true);
      expect(res.alms).toBe(i);
      expect(res.triggeredCinematic).toBe(false);
      expect(res.unlocked).toBe(false);
      expect(readAlms()).toBe(i);
      expect(readOyukUnlocked()).toBe(false);
      expect(getOyukState().phase).toBe('idle');
    }
  });

  it('3, 4, 5 & 6. 5th donation increments counter, unlocks OYUK, persists storage, and starts invitation phase', () => {
    for (let i = 1; i <= 4; i++) {
      recordBeggarDonation({ returnPath: '/' });
    }

    const fifth = recordBeggarDonation({
      originRect: { left: 240, top: 180, width: 54, height: 70 },
      returnPath: '/projeler',
    });

    expect(fifth.accepted).toBe(true);
    expect(fifth.alms).toBe(5);
    expect(fifth.triggeredCinematic).toBe(true);
    expect(fifth.unlocked).toBe(true);
    expect(fifth.alreadyUnlockedBefore).toBe(false);

    // Storage keys preserved & persisted
    expect(localStorage.getItem(ALMS_KEY)).toBe('5');
    expect(localStorage.getItem(OYUK_UNLOCKED_KEY)).toBe('1');
    expect(localStorage.getItem(OYUK_INTRO_SEEN_KEY)).toBe('1');

    const snap = getOyukState();
    expect(snap.phase).toBe('invitation');
    expect(snap.originRect).toEqual({ left: 240, top: 180, width: 54, height: 70 });
    expect(snap.returnPath).toBe('/projeler');
  });

  it('7 & 8. existing user with >= 5 donations does not auto-launch on reload, but unlocks on next deliberate click', () => {
    // Simulate returning visitor who had 9 donations before OYUK existed
    writeAlms(9);
    syncOyukFromStorage();

    expect(getOyukState().alms).toBe(9);
    expect(getOyukState().unlocked).toBe(false);
    expect(getOyukState().phase).toBe('idle'); // No automatic launch on reload!

    // Next intentional click unlocks OYUK and increments 9 -> 10
    const nextClick = recordBeggarDonation({ returnPath: '/hakkimda' });
    expect(nextClick.accepted).toBe(true);
    expect(nextClick.alms).toBe(10);
    expect(nextClick.triggeredCinematic).toBe(true);
    expect(nextClick.unlocked).toBe(true);
    expect(getOyukState().phase).toBe('invitation');
  });

  it('9. rapid repeated clicks during active cinematic are rejected and never trigger duplicate cinematics', () => {
    resetOyukStateForTests({ alms: 4 });

    const fifth = recordBeggarDonation({ returnPath: '/' });
    expect(fifth.triggeredCinematic).toBe(true);
    expect(getOyukState().alms).toBe(5);

    // Rapid clicks while cinematic is in 'invitation'
    const rapid1 = recordBeggarDonation({ returnPath: '/' });
    const rapid2 = recordBeggarDonation({ returnPath: '/' });
    expect(rapid1.accepted).toBe(false);
    expect(rapid1.triggeredCinematic).toBe(false);
    expect(rapid2.accepted).toBe(false);
    expect(getOyukState().alms).toBe(5);

    // Once cinematic finishes and resets to idle, subsequent donations work normally without re-triggering cinematic
    resetCinematicToIdle();
    const sixth = recordBeggarDonation({ returnPath: '/' });
    expect(sixth.accepted).toBe(true);
    expect(sixth.alms).toBe(6);
    expect(sixth.triggeredCinematic).toBe(false);
    expect(sixth.alreadyUnlockedBefore).toBe(true);
  });

  it('10. drag-end gesture does not accidentally count as an intended donation', () => {
    resetOyukStateForTests({ alms: 4 });

    const dragged = recordBeggarDonation({ isDragging: true, returnPath: '/' });
    expect(dragged.accepted).toBe(false);
    expect(dragged.alms).toBe(4);
    expect(dragged.triggeredCinematic).toBe(false);
    expect(readOyukUnlocked()).toBe(false);
  });

  it('transitions cleanly through cinematic phases and tracks pointer / return path', () => {
    resetOyukStateForTests({ alms: 4 });
    recordLastPointer(320, 410);
    recordBeggarDonation({ returnPath: '/iletisim' });

    expect(isCinematicActive(getOyukState().phase)).toBe(true);
    advanceCinematicPhase('focus');
    expect(getOyukState().phase).toBe('focus');
    advanceCinematicPhase('escort');
    expect(getOyukState().phase).toBe('escort');
    advanceCinematicPhase('threshold');
    expect(getOyukState().phase).toBe('threshold');
    advanceCinematicPhase('entering');
    expect(getOyukState().phase).toBe('entering');
    finishCinematicArrival();
    expect(getOyukState().phase).toBe('arrived');
    expect(isCinematicActive(getOyukState().phase)).toBe(false);

    resetCinematicToIdle();
    expect(getOyukState().phase).toBe('idle');
    expect(getOyukState().lastPointer).toEqual({ x: 320, y: 410 });

    setOyukReturnPath('/projeler');
    expect(getOyukState().returnPath).toBe('/projeler');
    setOyukReturnPath('/oyuk'); // must not overwrite with /oyuk
    expect(getOyukState().returnPath).toBe('/projeler');
  });

  it('validates canonical dialogue, SEO config, and spatial cave inscriptions (§5, §13, §18)', () => {
    expect(OYUK_OPENING_LINE).toBe(
      'Beş oldu kral. Cömertliğin başımıza iş açacak... Gel, sana bir yer göstereceğim.',
    );
    expect(OYUK_THRESHOLD_LINE).toBe(
      'Benden bir şey bekleme kral. Buradan sonrasını kendin bulacaksın.',
    );
    expect(PAGE_SEO.oyuk.title).toBe('Oyuk');
    expect(OYUK_INSCRIPTIONS.length).toBe(22);

    const kinds = new Set(OYUK_INSCRIPTIONS.map((i) => i.kind));
    expect(kinds.has('whisper')).toBe(true);
    expect(kinds.has('engraving')).toBe(true);
    expect(kinds.has('trace')).toBe(true);

    for (const item of OYUK_INSCRIPTIONS) {
      expect(item.x).toBeGreaterThanOrEqual(8);
      expect(item.x).toBeLessThanOrEqual(86);
      expect(item.y).toBeGreaterThanOrEqual(8);
      expect(item.y).toBeLessThanOrEqual(92);
    }

    expect(OYUK_DEEPER_SECRET.revealedText).toContain('beşinci sadaka');
  });
});
