// POST /api/analyze 요청 처리 순서 (docs/04 5장)
import { DEFAULT_OPENAI_MODEL, MAX_BODY_BYTES, MOCK_DELAY_MS } from './constants.js';
import { AppError, errorResponse, jsonResponse } from './errors.js';
import { isMockEnabled, mockSentiment } from './mock.js';
import { requestSentiment } from './openai-client.js';
import { validateText } from './validate.js';

export async function handleAnalyze(request, options = {}) {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? fetch;
  const mockDelayMs = options.mockDelayMs ?? MOCK_DELAY_MS;

  try {
    // 1. POST 방식 확인
    if (request.method !== 'POST') {
      return errorResponse('METHOD_NOT_ALLOWED', { Allow: 'POST' });
    }

    // 2. Content-Length 헤더 검사
    const contentLength = request.headers.get('content-length');
    if (contentLength && Number(contentLength) > MAX_BODY_BYTES) {
      return errorResponse('TEXT_TOO_LONG');
    }

    // 3. 본문 크기 검사
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
      return errorResponse('TEXT_TOO_LONG');
    }

    // 4. JSON 파싱 검사
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return errorResponse('INVALID_REQUEST');
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return errorResponse('INVALID_REQUEST');
    }

    // 5. 입력 텍스트 검증
    const validation = validateText(body.text);
    if (!validation.ok) {
      return errorResponse(validation.code);
    }
    const text = validation.text;

    // 6. 목(Mock) 모드 여부 확인
    if (isMockEnabled(env)) {
      const data = await mockSentiment(text, mockDelayMs);
      return jsonResponse(200, { ok: true, data });
    }

    // 7. API 키 검사
    const apiKey = env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      console.error('[analyze] SERVER_CONFIG_ERROR missing_api_key');
      return errorResponse('SERVER_CONFIG_ERROR');
    }

    // 8. 모델 설정
    const model = env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL;

    // 9. OpenAI 호출
    const data = await requestSentiment({ text, apiKey, model, fetchImpl });

    // 10. 성공 응답
    return jsonResponse(200, { ok: true, data });
  } catch (error) {
    if (error instanceof AppError) {
      console.error(`[analyze] ${error.code} ${error.detail}`.trim());
      return errorResponse(error.code);
    }
    console.error('[analyze] INTERNAL_ERROR unexpected_exception');
    return errorResponse('INTERNAL_ERROR');
  }
}
