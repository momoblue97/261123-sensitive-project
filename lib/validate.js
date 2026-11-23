// 입력 문장 검증. 화면(public/js)도 같은 규칙을 쓴다.
import { MAX_TEXT_LENGTH } from './constants.js';

// 이모지처럼 2칸을 차지하는 문자도 1글자로 센다.
export function countCharacters(text) {
  return Array.from(text).length;
}

export function validateText(value) {
  if (typeof value !== 'string') {
    return { ok: false, code: 'INVALID_REQUEST' };
  }
  const text = value.trim();
  if (text.length === 0) {
    return { ok: false, code: 'EMPTY_TEXT' };
  }
  if (countCharacters(text) > MAX_TEXT_LENGTH) {
    return { ok: false, code: 'TEXT_TOO_LONG' };
  }
  return { ok: true, text };
}
