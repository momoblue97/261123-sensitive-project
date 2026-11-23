// lib/openai-client.js 테스트 (docs/07 2장 P-01 ~ P-12)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildRequestBody, mapOpenAIError, parseOpenAIResponse } from '../lib/openai-client.js';
import { AppError } from '../lib/errors.js';

// Responses API 성공 응답 모양을 흉내 낸 가짜 데이터
function fakeResponse(resultObject, overrides = {}) {
  return {
    status: 'completed',
    output: [
      { type: 'reasoning', summary: [] },
      { type: 'message', role: 'assistant', content: [{ type: 'output_text', text: JSON.stringify(resultObject) }] },
    ],
    ...overrides,
  };
}

function assertAppError(fn, code) {
  assert.throws(fn, (error) => error instanceof AppError && error.code === code);
}

test('P-01 정상 응답 → label 이 붙은 결과', () => {
  const result = parseOpenAIResponse(fakeResponse({ sentiment: 'positive', confidence: 87, reason: '좋다는 표현이 있습니다.' }));
  assert.deepEqual(result, { sentiment: 'positive', label: '긍정', confidence: 87, reason: '좋다는 표현이 있습니다.' });
});

test('P-02 neutral / negative 라벨', () => {
  assert.equal(parseOpenAIResponse(fakeResponse({ sentiment: 'neutral', confidence: 50, reason: 'a' })).label, '중립');
  assert.equal(parseOpenAIResponse(fakeResponse({ sentiment: 'negative', confidence: 50, reason: 'a' })).label, '부정');
});

test('P-03 refusal → AI_REFUSED', () => {
  const data = { status: 'completed', output: [{ type: 'message', content: [{ type: 'refusal', refusal: 'no' }] }] };
  assertAppError(() => parseOpenAIResponse(data), 'AI_REFUSED');
});

test('P-04 status incomplete → AI_INVALID_RESPONSE', () => {
  const data = fakeResponse({ sentiment: 'positive', confidence: 80, reason: 'a' }, { status: 'incomplete', incomplete_details: { reason: 'max_output_tokens' } });
  assertAppError(() => parseOpenAIResponse(data), 'AI_INVALID_RESPONSE');
});

test('P-05 JSON 이 아닌 텍스트 → AI_INVALID_RESPONSE', () => {
  const data = { status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: '긍정입니다' }] }] };
  assertAppError(() => parseOpenAIResponse(data), 'AI_INVALID_RESPONSE');
});

test('P-06 허용되지 않은 sentiment → AI_INVALID_RESPONSE', () => {
  assertAppError(() => parseOpenAIResponse(fakeResponse({ sentiment: 'happy', confidence: 80, reason: 'a' })), 'AI_INVALID_RESPONSE');
});

test('P-07 confidence 범위 밖 → AI_INVALID_RESPONSE', () => {
  assertAppError(() => parseOpenAIResponse(fakeResponse({ sentiment: 'positive', confidence: 101, reason: 'a' })), 'AI_INVALID_RESPONSE');
  assertAppError(() => parseOpenAIResponse(fakeResponse({ sentiment: 'positive', confidence: -1, reason: 'a' })), 'AI_INVALID_RESPONSE');
  assertAppError(() => parseOpenAIResponse(fakeResponse({ sentiment: 'positive', confidence: '80', reason: 'a' })), 'AI_INVALID_RESPONSE');
});

test('P-08 소수 confidence 는 반올림', () => {
  assert.equal(parseOpenAIResponse(fakeResponse({ sentiment: 'positive', confidence: 86.6, reason: 'a' })).confidence, 87);
});

test('P-09 빈 reason → AI_INVALID_RESPONSE', () => {
  assertAppError(() => parseOpenAIResponse(fakeResponse({ sentiment: 'positive', confidence: 80, reason: '   ' })), 'AI_INVALID_RESPONSE');
});

test('P-10 300자 넘는 reason 은 300자 + … 로 자름', () => {
  const result = parseOpenAIResponse(fakeResponse({ sentiment: 'positive', confidence: 80, reason: '가'.repeat(350) }));
  assert.equal(Array.from(result.reason).length, 301);
  assert.ok(result.reason.endsWith('…'));
});

test('P-11 OpenAI 상태 코드 → 우리 오류 코드', () => {
  assert.equal(mapOpenAIError(401), 'SERVER_CONFIG_ERROR');
  assert.equal(mapOpenAIError(404), 'SERVER_CONFIG_ERROR');
  assert.equal(mapOpenAIError(400), 'SERVER_CONFIG_ERROR');
  assert.equal(mapOpenAIError(429, 'insufficient_quota'), 'AI_QUOTA_EXCEEDED');
  assert.equal(mapOpenAIError(429, 'rate_limit_exceeded'), 'RATE_LIMITED');
  assert.equal(mapOpenAIError(500), 'AI_UNAVAILABLE');
  assert.equal(mapOpenAIError(503), 'AI_UNAVAILABLE');
});

test('P-12 요청 본문에 store:false 와 strict 스키마가 들어 있다', () => {
  const body = buildRequestBody('좋아요', 'gpt-6-luna');
  assert.equal(body.model, 'gpt-6-luna');
  assert.equal(body.store, false);
  assert.equal(body.text.format.type, 'json_schema');
  assert.equal(body.text.format.strict, true);
  assert.deepEqual(body.text.format.schema.required, ['sentiment', 'confidence', 'reason']);
  assert.ok(body.input[0].content.includes(JSON.stringify('좋아요')));
});
