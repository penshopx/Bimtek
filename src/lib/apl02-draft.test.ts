import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  EMPTY_APL02_FORM, hasApl02Answers, parseApl02Draft, serializeApl02Draft,
} from './apl02-draft';

const form = {
  step: 2,
  selectedId: 'B001',
  namaAsesi: 'Asesi Uji',
  pendidikan: 'S1 / Sarjana',
  pengalaman: '8 tahun',
  units: Array.from({ length: 8 }, (_, i) => ({
    kode: `U${i}`, nama: `Unit ${i}`, elemen: ['Elemen pertama'],
    pengalaman: i === 7 ? '' : `Pengalaman ${i}\nBaris kedua — bukti proyek`,
  })),
};

describe('FR.APL.02 draft persistence', () => {
  it('round-trips all profile fields and partially answered units', () => {
    assert.deepEqual(parseApl02Draft(serializeApl02Draft(form), ['B001']), form);
  });

  it('preserves every keystroke including whitespace and empty answers', () => {
    for (const answer of ['a', 'ab', 'ab\n', 'ab\n ', '']) {
      const next = { ...form, units: [{ ...form.units[0], pengalaman: answer }] };
      assert.equal(parseApl02Draft(serializeApl02Draft(next), ['B001']).units[0].pengalaman, answer);
    }
  });

  it('resumes generated drafts at the editable experience step', () => {
    assert.equal(parseApl02Draft(serializeApl02Draft({ ...form, step: 3 }), ['B001']).step, 2);
  });

  it('supports an incomplete first step and does not save untouched forms', () => {
    const partial = { ...EMPTY_APL02_FORM, namaAsesi: 'A' };
    assert.deepEqual(parseApl02Draft(serializeApl02Draft(partial), ['B001']), partial);
    assert.equal(hasApl02Answers(EMPTY_APL02_FORM), false);
    assert.equal(hasApl02Answers(partial), true);
  });

  it('rejects malformed, obsolete, and inconsistent drafts', () => {
    for (const raw of [
      '{', 'null', '{}',
      JSON.stringify({ ...form, version: 2 }),
      JSON.stringify({ ...form, version: 1, selectedId: 'unknown' }),
      JSON.stringify({ ...form, version: 1, units: [] }),
      JSON.stringify({ ...form, version: 1, units: [{ ...form.units[0], pengalaman: null }] }),
      JSON.stringify({ ...form, version: 1, units: [{ ...form.units[0], elemen: [null] }] }),
    ]) {
      assert.throws(() => parseApl02Draft(raw, ['B001']));
    }
  });
});
