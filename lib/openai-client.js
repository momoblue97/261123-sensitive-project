// OpenAI Responses API 호출과 응답 해석. 외부 패키지 없이 내장 fetch 만 사용한다.
import {
  MAX_REASON_LENGTH,
  OPENAI_API_URL,
  OPENAI_MAX_OUTPUT_TOKENS,
  OPENAI_REASONING_EFFORT,
  OPENAI_TIMEOUT_MS,
  SENTIMENTS,
  SENTIMENT_LABELS,
} from './constants.js';
import { AppError } from './errors.js';
import { RESPONSE_SCHEMA, SYSTEM_PROMPT, buildUserMessage } from './prompt.js';

export function buildRequestBody(text, model) {
  return {
    model,
    instructions: SYSTEM_PROMPT,
    input: [{ role: 'user', content: buildUserMessage(text) }],
    reasoning: { effort: OPENAI_REASONING_EFFORT },
    max_output_tokens: OPENAI_MAX_OUTPUT_TOKENS,
    store: false,
    text: {
      format: {
        type: 'json_schema',
        name: 'sentiment_result',
        strict: true,
        schema: RESPONSE_SCHEMA,
      },
    },
  };
}

// OpenAI 의 HTTP 상태를 우리 오류 코드로 바꾼다 (docs/05 6장 표).
export function mapOpenAIError(status, openaiErrorCode) {
  if (status === 429) {
    return openaiErrorCode === 'insufficient_quota' ? 'AI_QUOTA_EXCEEDED' : 'RATE_LIMITED';
  }
  if ([400, 401, 403, 404, 422].includes(status)) {
    return 'SERVER_CONFIG_ERROR';
  }
  if (status === 408) {
    return 'AI_TIMEOUT';
  }
  return 'AI_UNAVAILABLE';
}

function isTimeoutError(error) {
  return error?.name === 'TimeoutError' || error?.name === 'AbortError';
}

export async function requestSentiment({ text, apiKey, model, fetchImpl = fetch, timeoutMs = OPENAI_TIMEOUT_MS }) {
  let response;
  try {
    response = await fetchImpl(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildRequestBody(text, model)),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    throw new AppError(isTimeoutError(error) ? 'AI_TIMEOUT' : 'AI_UNAVAILABLE', 'fetch_failed');
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new AppError(mapOpenAIError(response.status, errorBody?.error?.code), `openai_status_${response.status}`);
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new AppError(isTimeoutError(error) ? 'AI_TIMEOUT' : 'AI_INVALID_RESPONSE', 'body_read_failed');
  }
  return parseOpenAIResponse(data);
}

// Responses API 응답(JSON)에서 결과 문자열을 꺼내 검증한다 (docs/05 5장 알고리즘).
export function parseOpenAIResponse(data) {
  if (!data || typeof data !== 'object') {
    throw new AppError('AI_INVALID_RESPONSE', 'not_object');
  }
  if (data.status !== 'completed') {
    throw new AppError('AI_INVALID_RESPONSE', `status_${data.status}_${data.incomplete_details?.reason ?? 'none'}`);
  }
  const outputItems = Array.isArray(data.output) ? data.output : [];
  const message = outputItems.find((item) => item?.type === 'message');
  const parts = Array.isArray(message?.content) ? message.content : [];
  if (parts.some((part) => part?.type === 'refusal')) {
    throw new AppError('AI_REFUSED');
  }
  const textPart = parts.find((part) => part?.type === 'output_text' && typeof part.text === 'string');
  if (!textPart) {
    throw new AppError('AI_INVALID_RESPONSE', 'no_output_text');
  }
  let parsed;
  try {
    parsed = JSON.parse(textPart.text);
  } catch {
    throw new AppError('AI_INVALID_RESPONSE', 'json_parse_failed');
  }
  return normalizeResult(parsed);
}

// 스키마를 통과했더라도 서버에서 한 번 더 확인한다. 통과한 값만 화면으로 간다.
export function normalizeResult(parsed) {
  const { sentiment, confidence, reason } = parsed ?? {};
  if (!SENTIMENTS.includes(sentiment)) {
    throw new AppError('AI_INVALID_RESPONSE', 'bad_sentiment');
  }
  if (typeof confidence !== 'number' || !Number.isFinite(confidence)) {
    throw new AppError('AI_INVALID_RESPONSE', 'bad_confidence');
  }
  const roundedConfidence = Math.round(confidence);
  if (roundedConfidence < 0 || roundedConfidence > 100) {
    throw new AppError('AI_INVALID_RESPONSE', 'confidence_out_of_range');
  }
  if (typeof reason !== 'string' || reason.trim() === '') {
    throw new AppError('AI_INVALID_RESPONSE', 'bad_reason');
  }
  const reasonChars = Array.from(reason.trim());
  const finalReason = reasonChars.length > MAX_REASON_LENGTH
    ? `${reasonChars.slice(0, MAX_REASON_LENGTH).join('')}…`
    : reasonChars.join('');
  return {
    sentiment,
    label: SENTIMENT_LABELS[sentiment],
    confidence: roundedConfidence,
    reason: finalReason,
  };
}
