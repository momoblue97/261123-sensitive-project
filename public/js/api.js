// 서버(/api/analyze)와 통신한다. 어떤 경우에도 예외를 던지지 않고 결과 객체를 돌려준다.
import { API_ENDPOINT, CLIENT_TIMEOUT_MS, ERROR_MESSAGES, SENTIMENTS } from './constants.js';

function isTimeoutError(error) {
  return error?.name === 'TimeoutError' || error?.name === 'AbortError';
}

// 서버가 약속한 모양(docs/04 3장)인지 한 번 더 확인한다.
function isValidResult(data) {
  return Boolean(data)
    && SENTIMENTS.includes(data.sentiment)
    && Number.isInteger(data.confidence)
    && data.confidence >= 0
    && data.confidence <= 100
    && typeof data.reason === 'string';
}

/**
 * @param {string} text 앞뒤 공백을 제거한 문장
 * @returns {Promise<{ok: true, data: object} | {ok: false, code: string}>}
 */
export async function requestAnalysis(text) {
  let response;
  try {
    response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: AbortSignal.timeout(CLIENT_TIMEOUT_MS),
    });
  } catch (error) {
    return { ok: false, code: isTimeoutError(error) ? 'CLIENT_TIMEOUT' : 'NETWORK_ERROR' };
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    if (isTimeoutError(error)) {
      return { ok: false, code: 'CLIENT_TIMEOUT' };
    }
  }

  if (response.ok && payload?.ok === true) {
    return isValidResult(payload.data) ? { ok: true, data: payload.data } : { ok: false, code: 'AI_INVALID_RESPONSE' };
  }
  const code = payload?.error?.code;
  if (typeof code === 'string' && ERROR_MESSAGES[code]) {
    return { ok: false, code };
  }
  // JSON 이 아닌 오류 페이지(예: Vercel 의 504 시간 초과 화면)
  return { ok: false, code: response.status === 504 ? 'AI_TIMEOUT' : 'INTERNAL_ERROR' };
}
