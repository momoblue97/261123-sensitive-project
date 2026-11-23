// lib/analyze-handler.js 테스트 — 실제 OpenAI 를 부르지 않고 가짜 fetch 를 넣어 확인 (docs/07 2장 H-01 ~ H-14)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleAnalyze } from '../lib/analyze-handler.js';

const ENV = { OPENAI_API_KEY: 'test-key' };

function postRequest(body, headers = {}) {
  return new Request('http://localhost/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

// OpenAI 가 status/json 을 돌려준 것처럼 흉내 내는 가짜 fetch
function fakeFetch(status, json) {
  const calls = [];
  const impl = async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify(json), { status, headers: { 'Content-Type': 'application/json' } });
  };
  impl.calls = calls;
  return impl;
}

const OK_OPENAI = {
  status: 'completed',
  output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify({ sentiment: 'negative', confidence: 91, reason: "'화가 나요'라는 표현에서 분노가 드러납니다." }) }] }],
};

async function call(request, options) {
  const response = await handleAnalyze(request, options);
  return { status: response.status, headers: response.headers, body: await response.json() };
}

test('H-01 정상 요청 → 200 + 결과', async () => {
  const fetchImpl = fakeFetch(200, OK_OPENAI);
  const { status, body, headers } = await call(postRequest({ text: '너무 화가 나요' }), { env: ENV, fetchImpl });
  assert.equal(status, 200);
  assert.deepEqual(body, { ok: true, data: { sentiment: 'negative', label: '부정', confidence: 91, reason: "'화가 나요'라는 표현에서 분노가 드러납니다." } });
  assert.equal(headers.get('cache-control'), 'no-store');
  assert.equal(fetchImpl.calls.length, 1);
  assert.equal(fetchImpl.calls[0].init.headers.Authorization, 'Bearer test-key');
});

test('H-02 GET → 405 METHOD_NOT_ALLOWED + Allow 헤더', async () => {
  const { status, body, headers } = await call(new Request('http://localhost/api/analyze'), { env: ENV });
  assert.equal(status, 405);
  assert.equal(body.error.code, 'METHOD_NOT_ALLOWED');
  assert.equal(headers.get('allow'), 'POST');
});

test('H-03 JSON 이 아닌 본문 → 400 INVALID_REQUEST', async () => {
  const { status, body } = await call(postRequest('not json'), { env: ENV });
  assert.equal(status, 400);
  assert.equal(body.error.code, 'INVALID_REQUEST');
});

test('H-04 text 가 없음 → 400 INVALID_REQUEST', async () => {
  const { status, body } = await call(postRequest({ message: 'hi' }), { env: ENV });
  assert.equal(status, 400);
  assert.equal(body.error.code, 'INVALID_REQUEST');
});

test('H-05 공백만 → 400 EMPTY_TEXT, OpenAI 호출 없음', async () => {
  const fetchImpl = fakeFetch(200, OK_OPENAI);
  const { status, body } = await call(postRequest({ text: '   ' }), { env: ENV, fetchImpl });
  assert.equal(status, 400);
  assert.equal(body.error.code, 'EMPTY_TEXT');
  assert.equal(body.error.message, '분석할 문장을 입력해 주세요.');
  assert.equal(fetchImpl.calls.length, 0);
});

test('H-06 1,001자 → 400 TEXT_TOO_LONG', async () => {
  const { status, body } = await call(postRequest({ text: '가'.repeat(1001) }), { env: ENV });
  assert.equal(status, 400);
  assert.equal(body.error.code, 'TEXT_TOO_LONG');
});

test('H-07 본문 16KB 초과 → 400 TEXT_TOO_LONG', async () => {
  const longBody = JSON.stringify({ text: 'a', padding: 'x'.repeat(17000) });
  const { status, body } = await call(postRequest(longBody), { env: ENV });
  assert.equal(status, 400);
  assert.equal(body.error.code, 'TEXT_TOO_LONG');
});

test('H-08 키 없음 → 500 SERVER_CONFIG_ERROR', async () => {
  const { status, body } = await call(postRequest({ text: '좋아요' }), { env: {} });
  assert.equal(status, 500);
  assert.equal(body.error.code, 'SERVER_CONFIG_ERROR');
});

test('H-09 OpenAI 401 → 500 SERVER_CONFIG_ERROR', async () => {
  const fetchImpl = fakeFetch(401, { error: { message: 'invalid key' } });
  const { status, body } = await call(postRequest({ text: '좋아요' }), { env: ENV, fetchImpl });
  assert.equal(status, 500);
  assert.equal(body.error.code, 'SERVER_CONFIG_ERROR');
});

test('H-10 OpenAI 429 quota / rate limit', async () => {
  const quotaFetch = fakeFetch(429, { error: { code: 'insufficient_quota' } });
  const r1 = await call(postRequest({ text: '좋아요' }), { env: ENV, fetchImpl: quotaFetch });
  assert.equal(r1.status, 503);
  assert.equal(r1.body.error.code, 'AI_QUOTA_EXCEEDED');

  const rateFetch = fakeFetch(429, { error: { code: 'rate_limit_exceeded' } });
  const r2 = await call(postRequest({ text: '좋아요' }), { env: ENV, fetchImpl: rateFetch });
  assert.equal(r2.status, 429);
  assert.equal(r2.body.error.code, 'RATE_LIMITED');
});

test('H-11 OpenAI 500 → 502 AI_UNAVAILABLE', async () => {
  const fetchImpl = fakeFetch(500, { error: { message: 'server error' } });
  const { status, body } = await call(postRequest({ text: '좋아요' }), { env: ENV, fetchImpl });
  assert.equal(status, 502);
  assert.equal(body.error.code, 'AI_UNAVAILABLE');
});

test('H-12 시간 초과 → 504 AI_TIMEOUT', async () => {
  const slowFetch = async () => {
    const error = new Error('timeout');
    error.name = 'TimeoutError';
    throw error;
  };
  const { status, body } = await call(postRequest({ text: '좋아요' }), { env: ENV, fetchImpl: slowFetch });
  assert.equal(status, 504);
  assert.equal(body.error.code, 'AI_TIMEOUT');
});

test('H-13 목 모드 → positive/neutral 결과 및 오류 흉내', async () => {
  const r1 = await call(postRequest({ text: '정말 행복해요' }), { env: { MOCK_AI: 'true' }, mockDelayMs: 0 });
  assert.equal(r1.status, 200);
  assert.equal(r1.body.data.sentiment, 'positive');
  assert.ok(r1.body.data.reason.startsWith('[테스트 모드]'));

  const r2 = await call(postRequest({ text: '오늘 날씨가 맑네요' }), { env: { MOCK_AI: 'true' }, mockDelayMs: 0 });
  assert.equal(r2.status, 200);
  assert.equal(r2.body.data.sentiment, 'neutral');

  const r3 = await call(postRequest({ text: '[timeout] 문장' }), { env: { MOCK_AI: 'true' }, mockDelayMs: 0 });
  assert.equal(r3.status, 504);
  assert.equal(r3.body.error.code, 'AI_TIMEOUT');
});

test('H-14 목 모드 + VERCEL_ENV=production → 목 모드 무시(키 없음 오류)', async () => {
  const { status, body } = await call(postRequest({ text: '정말 행복해요' }), {
    env: { MOCK_AI: 'true', VERCEL_ENV: 'production' },
    mockDelayMs: 0,
  });
  assert.equal(status, 500);
  assert.equal(body.error.code, 'SERVER_CONFIG_ERROR');
});
