/**
 * The hit fields the site keeps itself (spec E47): the visitor id, the session
 * and the hit counters come from the site's own record, clock and random
 * source, never from the request the Google library wrote.
 */
import {
  EVENT_NAMES,
  OWN_CLIENT_ID,
  SESSION_IDLE_MS,
  mintClientId,
  nextOwnHit,
  ownCampaignValue,
  ownNumber,
  ownParamValue,
  readOwnState,
} from '@/lib/analytics-gate';

const T0 = 1_794_803_162_000;
const fixed = (value: number) => () => value;

describe('the visitor id the site mints (spec E47)', () => {
  it('[AC-E47c] is nine random digits and the first visit\'s second', () => {
    expect(mintClientId(T0, fixed(0))).toBe('100000000.1794803162');
    expect(mintClientId(T0, fixed(0.999999999))).toBe('999999999.1794803162');
    expect(mintClientId(T0, fixed(0.5))).toMatch(OWN_CLIENT_ID);
  });

  it.each([
    ['a draw of one', 1],
    ['a negative draw', -0.1],
    ['a draw that is not a number', Number.NaN],
  ])('[AC-E47c] refuses %s from the random source', (_label, draw) => {
    expect(mintClientId(T0, fixed(draw))).toBeNull();
  });
});

describe('the site\'s own record (spec E47)', () => {
  const first = nextOwnHit(null, T0, fixed(0.25), true);
  const record = first!.state;

  it('[AC-E47c] a first hit mints a visitor and starts a session', () => {
    expect(first!.fields).toEqual({
      cid: '325000000.1794803162',
      sid: '1794803162',
      sct: '1',
      seg: '0',
      _s: '1',
      _fv: '1',
      _ss: '1',
      _nsi: '1',
    });
  });

  it('[AC-E47c] a later hit keeps the visitor and session, counts the hit and the time since the last', () => {
    const next = nextOwnHit(record, T0 + 4_000, fixed(0.9), false);
    expect(next!.fields).toEqual({ cid: record.cid, sid: '1794803162', sct: '1', seg: '0', _s: '2', _et: '4000' });
  });

  it('[AC-E47c] the session is engaged after ten seconds or a second page view', () => {
    expect(nextOwnHit(record, T0 + 10_000, fixed(0), false)!.fields.seg).toBe('1');
    expect(nextOwnHit(record, T0 + 1_000, fixed(0), true)!.fields.seg).toBe('1');
  });

  it('[AC-E47c] half an hour without a hit starts a new session for the same visitor', () => {
    const later = T0 + SESSION_IDLE_MS + 1;
    expect(nextOwnHit(record, later, fixed(0), true)!.fields).toEqual({
      cid: record.cid,
      sid: String(Math.floor(later / 1000)),
      sct: '2',
      seg: '0',
      _s: '1',
      _ss: '1',
      _nsi: '1',
    });
  });

  it('[AC-E47c] a clock that went back starts a new session rather than a negative time', () => {
    const fields = nextOwnHit(record, T0 - 5_000, fixed(0), false)!.fields;
    expect(fields._ss).toBe('1');
    expect(fields._et).toBeUndefined();
  });

  it('[AC-E47c] the record it writes reads back as itself', () => {
    expect(readOwnState(JSON.stringify(record))).toEqual(record);
  });

  it.each([
    ['a token as the visitor id', { cid: 'prooftoken7731abcdef' }],
    ['a claim number as the visitor id', { cid: '123456789' }],
    ['a visitor id with a leading zero', { cid: '012345678.1794803162' }],
    ['a session count of zero', { sct: 0 }],
    ['a session that starts after its last hit', { startAt: T0 + 1, lastAt: T0 }],
    ['a session id that is not its start', { sid: 1_794_803_100 }],
    ['a fractional hit count', { hits: 1.5 }],
    ['an extra key', { note: 'proofrecord7731' }],
    ['a time in text', { lastAt: String(T0) }],
  ])('[AC-E47c] a stored record with %s is not this site\'s and starts a new visitor', (_label, change) => {
    expect(readOwnState(JSON.stringify({ ...record, ...change }))).toBeNull();
  });

  it.each([['not JSON', '{nope'], ['a list', '[]'], ['nothing', null], ['too long', `"${'x'.repeat(500)}"`]])(
    '[AC-E47c] a stored value that is %s starts a new visitor',
    (_label, text) => {
      expect(readOwnState(text)).toBeNull();
    },
  );

  it('[AC-E47c] a clock outside the years a session id can name sends nothing', () => {
    expect(nextOwnHit(null, 5, fixed(0.5), true)).toBeNull();
  });
});

describe('the closed lists (spec E47)', () => {
  it('[AC-E47a] an event name off the list is not on it, whatever its shape', () => {
    expect(EVENT_NAMES.has('page_view')).toBe(true);
    expect(EVENT_NAMES.has('prooftoken7731abcdef')).toBe(false);
    expect(EVENT_NAMES.has('form_start')).toBe(false);
  });

  it('[AC-E47a] text values: listed as written, others "other", unknown names nothing', () => {
    expect(ownParamValue('claim_type', 'flood')).toBe('flood');
    expect(ownParamValue('claim_type', 'prooftoken7731abcdef')).toBe('other');
    expect(ownParamValue('claim_type', 'other')).toBe('other');
    expect(ownParamValue('step_number', '2')).toBeNull();
    expect(ownParamValue('claim_id', 'CLM-1')).toBeNull();
  });

  it('[AC-E47a] numbers: in range only, cents only on value', () => {
    expect(ownNumber('scroll_depth', 90)).toBe(90);
    expect(ownNumber('scroll_depth', 101)).toBeNull();
    expect(ownNumber('value', 2750)).toBe(2750);
    expect(ownNumber('value', 27.5)).toBe(27.5);
    expect(ownNumber('value', 27.505)).toBeNull();
    expect(ownNumber('step_number', 2.5)).toBeNull();
    expect(ownNumber('claim_type', 1)).toBeNull();
  });

  it('[AC-E47a] campaign values: listed as written, others "other", empty nothing', () => {
    expect(ownCampaignValue('utm_source', 'google')).toBe('google');
    expect(ownCampaignValue('utm_campaign', 'jane-smith')).toBe('other');
    expect(ownCampaignValue('utm_medium', '')).toBeNull();
    expect(ownCampaignValue('utm_term', 'x')).toBeNull();
  });
});
