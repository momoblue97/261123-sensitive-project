# 04. API 명세 — `POST /api/analyze`

> **목적:** 화면(브라우저)과 서버가 주고받는 **약속(계약)** 을 정의합니다. 화면 코드와 서버 코드는 이 문서만 보고 서로 맞춰집니다.
> **대상 Phase:** Phase 2 (백엔드), Phase 4 (화면이 호출할 때)
> **관련 파일:** `api/analyze.js`, `lib/constants.js`, `lib/errors.js`, `lib/validate.js`, `lib/analyze-handler.js`

> 💡 **쉽게 말해:** 화면은 "이 문장 분석해 줘"(요청)를 보내고, 서버는 "긍정이고 87% 확신해, 이유는 이래"(응답) 또는 "이런 문제가 있어"(오류)를 돌려줍니다. 그 편지의 **양식**을 정해 둔 것이 이 문서입니다.

---

## 1. 엔드포인트 요약

| 항목 | 값 |
|---|---|
| 주소 | `/api/analyze` (같은 사이트 안에서만 호출, CORS 미지원) |
| 메서드 | `POST` 만 허용 (그 외 → `405`) |
| 요청 형식 | `Content-Type: application/json` |
| 응답 형식 | `Content-Type: application/json; charset=utf-8`, `Cache-Control: no-store` |
| 인증 | 없음 (OpenAI 키는 서버 내부에서만 사용) |

---

## 2. 고정값 — `lib/constants.js` (글자 그대로 작성)

```js
// 서버에서 쓰는 고정값 모음. 값은 docs/04-api-spec.md 2장 표와 반드시 같아야 한다.
export const MAX_TEXT_LENGTH = 1000;
export const MAX_BODY_BYTES = 16384;
export const MAX_REASON_LENGTH = 300;
export const OPENAI_API_URL = 'https://api.openai.com/v1/responses';
export const DEFAULT_OPENAI_MODEL = 'gpt-6-luna';
export const OPENAI_TIMEOUT_MS = 20000;
export const OPENAI_MAX_OUTPUT_TOKENS = 1000;
export const OPENAI_REASONING_EFFORT = 'low';
export const MOCK_DELAY_MS = 800;
export const SENTIMENTS = ['positive', 'neutral', 'negative'];
export const SENTIMENT_LABELS = { positive: '긍정', neutral: '중립', negative: '부정' };
```

| 상수 | 값 | 의미 |
|---|---|---|
| `MAX_TEXT_LENGTH` | 1000 | 앞뒤 공백 제거 후 최대 글자 수 (이모지 = 1글자) |
| `MAX_BODY_BYTES` | 16384 | 요청 본문 최대 크기(16KB). 넘으면 `TEXT_TOO_LONG` |
| `MAX_REASON_LENGTH` | 300 | 분석 이유 최대 글자 수. 넘으면 300자 + `…` |
| `OPENAI_TIMEOUT_MS` | 20000 | OpenAI 응답 대기 한도(20초) |
| `OPENAI_MAX_OUTPUT_TOKENS` | 1000 | AI 출력 토큰 상한 (추론 토큰 포함) |
| `OPENAI_REASONING_EFFORT` | `'low'` | AI 추론 강도 (빠르고 저렴하게) |
| `MOCK_DELAY_MS` | 800 | 목 모드에서 로딩 화면을 볼 수 있도록 일부러 기다리는 시간 |

> 화면 쪽 `public/js/constants.js` 의 `MAX_TEXT_LENGTH` 도 **1000** 이어야 합니다.

---

## 3. 요청과 성공 응답

### 3.1 요청 본문
```json
{ "text": "오랜만에 친구들과 여행을 다녀왔는데 정말 행복했어요." }
```
| 필드 | 타입 | 규칙 |
|---|---|---|
| `text` | string | 필수. 앞뒤 공백 제거 후 1~1,000자. 다른 필드는 무시 |

### 3.2 성공 응답 — `200 OK`
```json
{
  "ok": true,
  "data": {
    "sentiment": "positive",
    "label": "긍정",
    "confidence": 92,
    "reason": "'정말 행복했어요'라는 표현에서 기쁨이 분명하게 드러나 긍정으로 판단했습니다."
  }
}
```
| 필드 | 타입 | 보장되는 값 |
|---|---|---|
| `ok` | boolean | 항상 `true` |
| `data.sentiment` | string | `"positive"` / `"neutral"` / `"negative"` 중 하나 |
| `data.label` | string | `"긍정"` / `"중립"` / `"부정"` (sentiment 와 1:1) |
| `data.confidence` | integer | 0 이상 100 이하 **정수** |
| `data.reason` | string | 비어 있지 않은 한국어 문장, 최대 300자(+`…`) |

---

## 4. 오류 응답

### 4.1 형식 (모든 오류 공통)
```json
{
  "ok": false,
  "error": {
    "code": "EMPTY_TEXT",
    "message": "분석할 문장을 입력해 주세요."
  }
}
```

### 4.2 오류 코드 표 (이 12개만 존재 — 새 코드 추가 금지)

| code | HTTP | 언제 발생하나 | message (글자 그대로) |
|---|---|---|---|
| `INVALID_REQUEST` | 400 | 본문이 JSON 이 아님 / JSON 객체가 아님 / `text` 가 문자열이 아님 | 요청 형식이 올바르지 않습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요. |
| `EMPTY_TEXT` | 400 | 앞뒤 공백 제거 후 0자 | 분석할 문장을 입력해 주세요. |
| `TEXT_TOO_LONG` | 400 | 1,000자 초과 또는 본문 16KB 초과 | 문장은 1,000자 이하로 입력해 주세요. |
| `METHOD_NOT_ALLOWED` | 405 | POST 가 아닌 요청 (`Allow: POST` 헤더 포함) | 허용되지 않은 요청 방식입니다. |
| `AI_REFUSED` | 422 | AI 가 안전 정책상 답변을 거부 | 이 문장은 분석할 수 없습니다. 다른 문장으로 시도해 주세요. |
| `RATE_LIMITED` | 429 | OpenAI 가 429(요청 과다)를 돌려줌 | 요청이 많아 잠시 처리할 수 없습니다. 30초 후 다시 시도해 주세요. |
| `SERVER_CONFIG_ERROR` | 500 | API 키 없음 / OpenAI 가 400·401·403·404·422 를 돌려줌(키·모델·옵션 설정 문제) | 서버 설정에 문제가 있어 분석할 수 없습니다. 관리자에게 문의해 주세요. |
| `INTERNAL_ERROR` | 500 | 위 어느 것에도 해당하지 않는 예상 못 한 오류 | 알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. |
| `AI_UNAVAILABLE` | 502 | OpenAI 연결 실패, OpenAI 5xx | AI 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해 주세요. |
| `AI_INVALID_RESPONSE` | 502 | AI 응답이 미완성(incomplete)이거나 형식·값이 규칙에 맞지 않음 | 분석 결과를 해석하지 못했습니다. 다시 시도해 주세요. |
| `AI_QUOTA_EXCEEDED` | 503 | OpenAI 429 + 오류 코드 `insufficient_quota`(크레딧·한도 소진) | AI 사용 한도를 초과했습니다. 관리자에게 문의해 주세요. |
| `AI_TIMEOUT` | 504 | OpenAI 가 20초 안에 응답하지 않음 | AI 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요. |

### 4.3 `lib/errors.js` (글자 그대로 작성)
```js
// 오류 코드 정의와 JSON 응답 생성 도우미. 오류 코드는 docs/04-api-spec.md 4장 표만 사용한다.
export const ERRORS = {
  INVALID_REQUEST: { status: 400, message: '요청 형식이 올바르지 않습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.' },
  EMPTY_TEXT: { status: 400, message: '분석할 문장을 입력해 주세요.' },
  TEXT_TOO_LONG: { status: 400, message: '문장은 1,000자 이하로 입력해 주세요.' },
  METHOD_NOT_ALLOWED: { status: 405, message: '허용되지 않은 요청 방식입니다.' },
  AI_REFUSED: { status: 422, message: '이 문장은 분석할 수 없습니다. 다른 문장으로 시도해 주세요.' },
  RATE_LIMITED: { status: 429, message: '요청이 많아 잠시 처리할 수 없습니다. 30초 후 다시 시도해 주세요.' },
  SERVER_CONFIG_ERROR: { status: 500, message: '서버 설정에 문제가 있어 분석할 수 없습니다. 관리자에게 문의해 주세요.' },
  INTERNAL_ERROR: { status: 500, message: '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' },
  AI_UNAVAILABLE: { status: 502, message: 'AI 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해 주세요.' },
  AI_INVALID_RESPONSE: { status: 502, message: '분석 결과를 해석하지 못했습니다. 다시 시도해 주세요.' },
  AI_QUOTA_EXCEEDED: { status: 503, message: 'AI 사용 한도를 초과했습니다. 관리자에게 문의해 주세요.' },
  AI_TIMEOUT: { status: 504, message: 'AI 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.' },
};

// 처리 중 "예상한 실패"를 표현한다. detail 에는 상태 숫자 같은 비민감 정보만 담는다.
export class AppError extends Error {
  constructor(code, detail = '') {
    super(code);
    this.name = 'AppError';
    this.code = code;
    this.detail = detail;
  }
}

export function jsonResponse(status, body, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  });
}

export function errorResponse(code, extraHeaders = {}) {
  const finalCode = ERRORS[code] ? code : 'INTERNAL_ERROR';
  const { status, message } = ERRORS[finalCode];
  return jsonResponse(status, { ok: false, error: { code: finalCode, message } }, extraHeaders);
}
```

---

## 5. 서버 처리 순서 — `lib/analyze-handler.js`

`handleAnalyze(request, options)` 는 **반드시 아래 순서**로 처리합니다. 어떤 경우에도 예외를 밖으로 던지지 않고 `Response` 를 돌려줍니다.

| 단계 | 확인 | 실패 시 |
|---|---|---|
| 1 | `request.method === 'POST'` | `405 METHOD_NOT_ALLOWED` + 헤더 `Allow: POST` |
| 2 | `Content-Length` 헤더 값이 16384 초과? | `400 TEXT_TOO_LONG` |
| 3 | 본문을 `request.text()` 로 읽고 UTF-8 바이트 수가 16384 초과? | `400 TEXT_TOO_LONG` |
| 4 | `JSON.parse` 성공 + 결과가 배열이 아닌 객체 | `400 INVALID_REQUEST` |
| 5 | `validateText(body.text)` 통과 (6장) | `400` `INVALID_REQUEST` / `EMPTY_TEXT` / `TEXT_TOO_LONG` |
| 6 | 목 모드인가? `isMockEnabled(env)` → 예: `mockSentiment(text, mockDelayMs)` | 목 모드의 오류 흉내 (`docs/05` 7장) |
| 7 | (목 모드 아님) `env.OPENAI_API_KEY` 를 `trim()` 한 값이 비어 있음? | `500 SERVER_CONFIG_ERROR` |
| 8 | 모델 = `env.OPENAI_MODEL` 을 `trim()` 한 값, 비어 있으면 `DEFAULT_OPENAI_MODEL` | — |
| 9 | `requestSentiment({ text, apiKey, model, fetchImpl })` 호출 (`docs/05`) | `docs/05` 6장 표의 오류 |
| 10 | 성공 → `200 { ok: true, data }` | — |
| 예외 | `AppError` 이면 `errorResponse(error.code)`, 그 밖의 예외는 `INTERNAL_ERROR` | — |

**함수 형태 (테스트에서 가짜 값을 넣을 수 있도록 고정)**
```js
/**
 * @param {Request} request  Web 표준 Request
 * @param {{ env?: object, fetchImpl?: Function, mockDelayMs?: number }} [options]
 *   env 기본값 process.env / fetchImpl 기본값 전역 fetch / mockDelayMs 기본값 MOCK_DELAY_MS
 * @returns {Promise<Response>}
 */
export async function handleAnalyze(request, options = {}) { /* 위 표의 순서 */ }
```

**로그 규칙**
- 실패 시 `console.error('[analyze] <오류코드> <detail>')` 한 줄만 남긴다. 예: `[analyze] RATE_LIMITED openai_status_429`
- `detail` 에는 **상태 숫자·짧은 영문 사유만** 넣는다. 입력 문장, API 키, OpenAI 응답 원문은 절대 넣지 않는다.
- 400번대 입력 검증 실패(단계 5)는 로그를 남기지 않는다.

---

## 6. 입력 검증 — `lib/validate.js` (글자 그대로 작성)

```js
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
```

| 입력 | 결과 |
|---|---|
| `'  좋아요  '` | `{ ok: true, text: '좋아요' }` |
| `''`, `'   '`, `'\n\t'` | `{ ok: false, code: 'EMPTY_TEXT' }` |
| `'가'` × 1000 | 통과 |
| `'가'` × 1001 | `{ ok: false, code: 'TEXT_TOO_LONG' }` |
| `undefined`, `null`, `123`, 배열, 객체 | `{ ok: false, code: 'INVALID_REQUEST' }` |
| `'😀'` × 1000 | 통과 (이모지 1개 = 1글자) |

---

## 7. 호출 예시 (로컬 서버 실행 중일 때)

**macOS / Linux / Git Bash**
```bash
curl -s -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"오늘 정말 행복해요"}'
```

**Windows PowerShell** (한글이 깨지지 않도록 UTF-8 바이트로 보냄)
```powershell
$body = [System.Text.Encoding]::UTF8.GetBytes('{"text":"오늘 정말 행복해요"}')
Invoke-RestMethod -Uri "http://localhost:3000/api/analyze" -Method Post -ContentType "application/json; charset=utf-8" -Body $body
```
> PowerShell 의 `Invoke-RestMethod` 는 오류 응답(400 등)일 때 빨간 예외를 표시합니다. 정상입니다. 오류 응답 확인은 `npm test`(자동 테스트)로 합니다.

---

## 8. 완료 기준 (Phase 2 — 서버 계약 부분)
- [ ] 2장·4.3장·6장 코드가 글자 그대로 작성되어 있다
- [ ] `handleAnalyze` 가 5장 순서와 함수 형태를 지킨다
- [ ] `docs/07` 2장의 H-01 ~ H-14 테스트가 모두 통과한다
- [ ] 응답 헤더에 `Content-Type: application/json; charset=utf-8`, `Cache-Control: no-store` 가 있다
- [ ] 로그에 입력 문장·API 키가 나오지 않는다 (테스트 실행 출력으로 확인)
