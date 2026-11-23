// lib/validate.js 테스트 (docs/07 2장 V-01 ~ V-07)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countCharacters, validateText } from '../lib/validate.js';

test('V-01 정상 문장은 앞뒤 공백을 제거해 통과', () => {
  assert.deepEqual(validateText('  좋아요  '), { ok: true, text: '좋아요' });
});

test('V-02 빈 문자열은 EMPTY_TEXT', () => {
  assert.deepEqual(validateText(''), { ok: false, code: 'EMPTY_TEXT' });
});

test('V-03 공백·줄바꿈만 있으면 EMPTY_TEXT', () => {
  assert.deepEqual(validateText('   \n\t  '), { ok: false, code: 'EMPTY_TEXT' });
});

test('V-04 정확히 1,000자는 통과', () => {
  assert.equal(validateText('가'.repeat(1000)).ok, true);
});

test('V-05 1,001자는 TEXT_TOO_LONG', () => {
  assert.deepEqual(validateText('가'.repeat(1001)), { ok: false, code: 'TEXT_TOO_LONG' });
});

test('V-06 문자열이 아니면 INVALID_REQUEST', () => {
  for (const value of [undefined, null, 123, ['a'], { text: 'a' }]) {
    assert.deepEqual(validateText(value), { ok: false, code: 'INVALID_REQUEST' });
  }
});

test('V-07 이모지는 1글자로 센다', () => {
  assert.equal(countCharacters('😀👍'), 2);
  assert.equal(validateText('😀'.repeat(1000)).ok, true);
});
