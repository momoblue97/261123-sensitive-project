# 03. 기능 구현 지침 (화면 동작)

> **목적:** 버튼을 누르거나 글자를 입력했을 때 화면이 **무엇을, 어떤 순서로** 하는지 정의합니다.
> **대상 Phase:** Phase 4 (기능 연결)
> **관련 파일:** `public/js/constants.js`, `api.js`, `ui.js`, `header.js`, `main.js`
> **전제:** `docs/02` 6장의 `index.html` 이 완성되어 있음

---

## 1. 파일별 역할

| 파일 | 하는 일 | 하지 않는 일 |
|---|---|---|
| `constants.js` | 고정값·화면 문구 모음 (2장) | 로직 |
| `api.js` | `/api/analyze` 호출, 결과를 `{ ok, data }` / `{ ok:false, code }` 로 정리 (5장) | DOM 조작 |
| `ui.js` | id 로 요소 찾기, 그리기 함수 (4.2절) | 상태 판단, 서버 통신 |
| `header.js` | 헤더 흰색 전환, 모바일 메뉴 열기/닫기 (7장) | 분석 기능 |
| `main.js` | 진입점. 상태(`state`) 관리, 이벤트 연결, 순서 제어 (3·6장) | 직접 DOM 스타일 변경 |

- `index.html` 은 `<script type="module" src="/js/main.js">` 하나만 불러오고, 나머지는 `import` 로 연결합니다.
- 전역 변수 금지(`window.xxx = ...`), 라이브러리 금지.

---

## 2. 상수와 문구 — `public/js/constants.js` (글자 그대로 작성)

```js
// 화면에서 쓰는 고정값과 문구. 문구는 docs/03-frontend-behavior.md 의 표와 글자 그대로 같아야 한다.
// MAX_TEXT_LENGTH 는 서버(lib/constants.js)와 같은 값이어야 한다.
export const MAX_TEXT_LENGTH = 1000;
export const CLIENT_TIMEOUT_MS = 25000;
export const HEADER_SOLID_OFFSET = 80;
export const DESKTOP_MEDIA_QUERY = '(min-width: 1024px)';
export const API_ENDPOINT = '/api/analyze';
export const SENTIMENTS = ['positive', 'neutral', 'negative'];

export const SENTIMENT_LABELS = {
  positive: '긍정',
  neutral: '중립',
  negative: '부정',
};

export const BUTTON_LABELS = {
  idle: '분석하기',
  loading: '분석 중…',
};

export const MENU_LABELS = {
  open: '메뉴 열기',
  close: '메뉴 닫기',
};

export const STATUS_MESSAGES = {
  idle: '문장을 입력하고 분석하기를 누르면 결과가 여기에 표시됩니다.',
  loading: 'AI가 문장을 분석하고 있습니다…',
  error: '분석하지 못했습니다. 위쪽 입력 영역의 안내 메시지를 확인해 주세요.',
};

// 성공 문구: 긍정/중립/부정 모두 받침이 있어 '으로'를 쓴다.
export function successMessage(label) {
  return `분석이 완료되었습니다. 이 문장은 ‘${label}’으로 판정되었습니다.`;
}

export const ERROR_MESSAGES = {
  INVALID_REQUEST: '요청 형식이 올바르지 않습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.',
  EMPTY_TEXT: '분석할 문장을 입력해 주세요.',
  TEXT_TOO_LONG: '문장은 1,000자 이하로 입력해 주세요.',
  METHOD_NOT_ALLOWED: '허용되지 않은 요청 방식입니다.',
  AI_REFUSED: '이 문장은 분석할 수 없습니다. 다른 문장으로 시도해 주세요.',
  RATE_LIMITED: '요청이 많아 잠시 처리할 수 없습니다. 30초 후 다시 시도해 주세요.',
  SERVER_CONFIG_ERROR: '서버 설정에 문제가 있어 분석할 수 없습니다. 관리자에게 문의해 주세요.',
  INTERNAL_ERROR: '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  AI_UNAVAILABLE: 'AI 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해 주세요.',
  AI_INVALID_RESPONSE: '분석 결과를 해석하지 못했습니다. 다시 시도해 주세요.',
  AI_QUOTA_EXCEEDED: 'AI 사용 한도를 초과했습니다. 관리자에게 문의해 주세요.',
  AI_TIMEOUT: 'AI 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.',
  NETWORK_ERROR: '인터넷 연결을 확인한 뒤 다시 시도해 주세요.',
  CLIENT_TIMEOUT: '응답 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.',
};

export const EXAMPLE_TEXTS = {
  positive: '오랜만에 친구들과 여행을 다녀왔는데, 날씨도 좋고 음식도 맛있어서 정말 행복한 하루였어요.',
  negative: '주문한 지 2주가 지났는데 아직도 배송이 안 왔고, 고객센터는 전화도 받지 않아서 너무 화가 나요.',
  neutral: '내일 오전 10시에 3층 회의실에서 주간 회의가 진행될 예정입니다.',
};
```

> ⚠️ `ERROR_MESSAGES` 의 서버 코드 12개 문구는 `docs/04` 4.2절과 **완전히 같아야** 합니다. 마지막 2개(`NETWORK_ERROR`, `CLIENT_TIMEOUT`)는 브라우저에서만 생기는 코드입니다.

---

## 3. 상태 모델

```
            ┌──────────── 지우기 / 새 문장 분석하기 ─────────────┐
            ▼                                                  │
        [ idle ] ──분석 요청──▶ [ loading ] ──성공──▶ [ success ] ─┤
            ▲                      │                     │       │
            │                      └──실패──▶ [ error ] ──┤───────┘
            │                                     │      │
            └─────────── (다시 분석 요청 시 loading 으로) ┘
```

```js
// main.js 안에서만 사용
const state = {
  status: 'idle',   // 'idle' | 'loading' | 'success' | 'error'
  errorCode: null,  // 지금 화면에 보이는 오류 코드 (없으면 null)
};
```

- 화면 검증 오류(`EMPTY_TEXT`, `TEXT_TOO_LONG`)는 **`status` 를 바꾸지 않습니다**(서버 요청 전이므로). `errorCode` 만 바뀝니다.

---

## 4. DOM 요소와 그리기 함수

### 4.1 요소 id 표 (`docs/02` 6장 마크업 기준)
| id | 요소 | 쓰임 |
|---|---|---|
| `site-header` | 헤더 | 흰색 전환, 메뉴 열림 클래스 |
| `menu-button` | 햄버거 버튼 | 메뉴 열기/닫기 |
| `analyze-form` | 입력 폼 | `submit` 이벤트 |
| `text-input` | 입력창 | 값 읽기/쓰기, `aria-invalid`, `readOnly` |
| `char-counter` / `char-count` | 글자 수 표시 / 숫자 | 숫자·초과 표시 |
| `example-positive` / `example-negative` / `example-neutral` | 예시 칩 3개 | `data-example` 값으로 문장 선택 |
| `analyze-button` / `analyze-button-label` | 분석 버튼 / 버튼 글자 | 비활성·로딩 |
| `clear-button` | 지우기 | 초기화 |
| `analyze-error` / `analyze-error-message` | 오류 박스 / 문구 | 오류 표시 |
| `analyze` | Analyze 섹션 | 스크롤 목적지 |
| `result` | Result 섹션 | 스크롤 목적지 |
| `result-title` | RESULT 제목(`tabindex="-1"`) | 성공 후 포커스 |
| `result-status` | 결과 상태 문장 | 상태 문구 |
| `result-list` | 카드 목록 | `aria-busy` |
| `result-item-{s}` | 카드 칸 (`s` = positive / neutral / negative) | `.result-item--active` |
| `card-body-{s}` | 활성 카드 본문 | `hidden` |
| `card-confidence-{s}` | 신뢰도 숫자 | 텍스트 |
| `card-bar-{s}` | 신뢰도 막대 채움 | `style.width` |
| `card-reason-{s}` | 분석 이유 | 텍스트 |
| `again-button` | 새 문장 분석하기 | 초기화 + 스크롤 |

- `ui.js` 의 `getElements()` 가 이 표의 요소를 **모두** 찾아 하나의 객체(`el`)로 돌려줍니다. 하나라도 없으면 `#id 요소를 찾을 수 없습니다. index.html 의 id 를 확인하세요.` 오류를 던집니다.

### 4.2 `ui.js` 가 내보내는 함수
| 함수 | 하는 일 (정확히) |
|---|---|
| `getElements()` | 4.1 표의 요소 객체 반환. `cards[s] = { item, body, confidence, bar, reason }` |
| `renderCounter(el, count, isOver)` | 숫자를 `count.toLocaleString('ko-KR')`(예: `1,005`)로 표시, `isOver` 면 `char-counter--over` 클래스 추가/아니면 제거 |
| `showError(el, code)` | 문구 = `ERROR_MESSAGES[code]`(없으면 `INTERNAL_ERROR` 문구)를 **`textContent`** 로 넣고 박스 `hidden = false`. `code` 가 `EMPTY_TEXT`/`TEXT_TOO_LONG` 이면 입력창 `aria-invalid="true"`, 그 외에는 `aria-invalid` 제거 |
| `hideError(el)` | 박스 `hidden = true`, 문구 비우기, 입력창 `aria-invalid` 제거 |
| `setBusy(el, isBusy)` | 분석 버튼 `disabled`·`.button--loading`·글자(`BUTTON_LABELS`), 입력창 `readOnly`, 지우기·새 문장·예시 칩 `disabled`, 목록 `aria-busy="true"/"false"` 를 한꺼번에 설정 |
| `renderStatus(el, message)` | 상태 문장 `textContent` 교체 |
| `resetCards(el)` | 3장 모두 `.result-item--active` 제거, 본문 `hidden`, 숫자 `0`, 막대 `0%`, 이유 빈칸 |
| `renderResult(el, result)` | `resetCards` → 해당 카드 활성 + 본문 표시 + 숫자·이유 `textContent` → **두 번의 `requestAnimationFrame` 뒤** 막대 너비 `${confidence}%` (0에서 늘어나는 효과) → 상태 문장 `successMessage(SENTIMENT_LABELS[sentiment])` |

> 🔒 서버에서 온 글자(이유·문구)는 **반드시 `textContent`** 로 넣습니다. `innerHTML` 금지(AGENTS.md 3.3).

---

## 5. 서버 통신 — `public/js/api.js` (글자 그대로 작성)

```js
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
```

| 상황 | 돌려주는 값 |
|---|---|
| 200 + `ok: true` + 값이 올바름 | `{ ok: true, data }` |
| 200 + 값이 이상함 (sentiment 3종 아님 등) | `{ ok: false, code: 'AI_INVALID_RESPONSE' }` |
| 오류 JSON + 아는 코드 | `{ ok: false, code }` |
| 25초 초과 | `{ ok: false, code: 'CLIENT_TIMEOUT' }` |
| 인터넷 끊김 등 연결 실패 | `{ ok: false, code: 'NETWORK_ERROR' }` |
| JSON 이 아닌 응답 + 504 | `{ ok: false, code: 'AI_TIMEOUT' }` |
| 그 밖 | `{ ok: false, code: 'INTERNAL_ERROR' }` |

---

## 6. 동작 순서 — `main.js`

### 6.1 이벤트 표
| 이벤트 | 대상 | 동작 |
|---|---|---|
| 페이지 로드 | — | `el = getElements()` → `initHeader(el)` → `syncInputState()` → 아래 이벤트 연결 |
| `submit` | `#analyze-form` | `event.preventDefault()` → `analyze()` |
| `input` | `#text-input` | `handleInput()` (6.3) |
| `keydown` | `#text-input` | `event.isComposing` 이면 **무시**(한글 조합 중). `Enter` + (`ctrlKey` 또는 `metaKey`) 면 `preventDefault()` → `analyze()` |
| `click` | 예시 칩 | 입력창 값 = `EXAMPLE_TEXTS[button.dataset.example]`(기존 내용 대체) → `clearError()` → `syncInputState()` → 입력창 포커스. **자동 분석 안 함** |
| `click` | `#clear-button` | `resetAll()` → 입력창 포커스 |
| `click` | `#again-button` | `resetAll()` → `#analyze` 로 `scrollIntoView({ block: 'start' })` → 입력창 `focus({ preventScroll: true })` |

### 6.2 `syncInputState()` — 글자 수와 버튼 맞추기
1. `count = Array.from(입력창 값).length` (**앞뒤 공백 포함 원문** 기준)
2. `isOver = count > MAX_TEXT_LENGTH`
3. `renderCounter(el, count, isOver)`
4. 분석 버튼 `disabled = (state.status === 'loading') || isOver`
5. `isOver` 반환

### 6.3 `handleInput()` — 입력할 때마다
1. `isOver = syncInputState()`
2. `isOver` 이면 `setError('TEXT_TOO_LONG')`
3. 아니고, 지금 오류가 `EMPTY_TEXT` 또는 `TEXT_TOO_LONG` 이면 `clearError()`
4. 서버 오류(그 외 코드)는 입력해도 **그대로 둔다**(다음 분석·지우기·예시 선택 시 사라짐)

`setError(code)` = `state.errorCode = code` + `showError(el, code)` / `clearError()` = `state.errorCode = null` + `hideError(el)`

### 6.4 `analyze()` — 분석 요청 (순서 고정)
| 순서 | 동작 |
|---|---|
| 1 | `state.status === 'loading'` 이면 아무것도 하지 않고 끝 (중복 요청 방지) |
| 2 | 원문 글자 수 > 1000 → `setError('TEXT_TOO_LONG')`, 입력창 포커스, 끝 |
| 3 | `text = 원문.trim()` 이 빈 문자열 → `setError('EMPTY_TEXT')`, 입력창 포커스, 끝 (**서버 요청 없음**) |
| 4 | `clearError()` → `state.status = 'loading'` → `resetCards(el)` → `renderStatus(el, STATUS_MESSAGES.loading)` → `setBusy(el, true)` |
| 5 | `response = await requestAnalysis(text)` |
| 6 | `setBusy(el, false)` |
| 7a | **성공:** `state.status = 'success'` → `renderResult(el, response.data)` → `#result-title` 에 `focus({ preventScroll: true })` → `#result` 로 `scrollIntoView({ block: 'start' })` |
| 7b | **실패:** `state.status = 'error'` → `renderStatus(el, STATUS_MESSAGES.error)` → `setError(response.code)` → 입력창 포커스 (입력 내용은 **지우지 않음**) |
| 8 | `syncInputState()` (버튼 활성 상태 재계산) |

- 스크롤의 부드러움은 CSS(`scroll-behavior: smooth`)가 담당합니다. JS 에서 `behavior: 'smooth'` 를 지정하지 않습니다(움직임 줄이기 설정을 자동으로 따르게 하기 위함).
- 자동 재시도 없음. 타이머로 다시 요청하지 않습니다.

### 6.5 `resetAll()` — 초기화
1. 입력창 값 `''`
2. `clearError()`
3. `state.status = 'idle'`
4. `resetCards(el)`
5. `renderStatus(el, STATUS_MESSAGES.idle)`
6. `syncInputState()`

---

## 7. 헤더 — `public/js/header.js`

`initHeader(el)` 하나만 내보냅니다.

| 기능 | 정확한 동작 |
|---|---|
| 흰색 전환 | 로드 시 1번 + `scroll` 이벤트(`{ passive: true }`)마다: `window.scrollY > HEADER_SOLID_OFFSET`(80) 이면 `site-header--solid` 추가, 아니면 제거 |
| 메뉴 열기/닫기 | 햄버거 클릭 시 토글. 열림 = 헤더에 `site-header--menu-open` + 버튼 `aria-expanded="true"` + `aria-label="메뉴 닫기"`, 닫힘은 반대(`"false"`, `"메뉴 열기"`) |
| 링크 누르면 닫기 | 헤더 안의 `<a>`(로고 포함) 클릭 시 닫기 |
| Esc 로 닫기 | 메뉴가 열려 있을 때 `Escape` → 닫고 햄버거 버튼에 포커스 |
| 화면이 커지면 닫기 | `matchMedia(DESKTOP_MEDIA_QUERY)` 의 `change` 에서 `matches` 가 true 면 닫기 |

---

## 8. 하지 않는 것 (구현 금지)
- 결과·입력 내용 저장(`localStorage` 등), URL 에 문장 넣기
- `alert()`, `confirm()`, `prompt()`
- 입력하는 동안 자동 분석(디바운스 분석)
- 스크롤 위치에 따른 메뉴 강조(scrollspy), 등장 애니메이션
- 결과 복사·공유 버튼

---

## 9. 완료 기준 (Phase 4)
- [ ] 2장·5장 코드가 글자 그대로 있다
- [ ] 4.2·6·7장의 함수와 순서를 지킨다
- [ ] `MOCK_AI=true` 로 `docs/07` 4장 수동 QA 의 화면 항목이 모두 통과한다
- [ ] 브라우저 콘솔에 JS 오류가 없다 (의도적으로 오류를 일으킨 테스트의 `Failed to load resource` 한 줄은 정상, `docs/07` 4장 참고)
- [ ] `public/js/` 에 `innerHTML`, `insertAdjacentHTML`, `outerHTML`, `localStorage`, `alert(` 이 없다
