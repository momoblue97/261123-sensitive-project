# AGENTS.md — AI 코딩 에이전트 작업 규칙

> 이 파일은 Antigravity 등 AI 코딩 에이전트가 이 저장소에서 작업할 때 **가장 먼저 읽고 항상 지키는 규칙**입니다.
> 사람(비전공자)도 읽을 수 있도록 중요한 규칙에는 **이유**를 함께 적었습니다.

---

## 1. 프로젝트 요약

- **무엇:** 문장을 입력하면 긍정 / 부정 / 중립 + 신뢰도(%) + 분석 이유를 보여 주는 한 페이지 웹 서비스 **MOODWAVE**
- **기술:** HTML · CSS · 순수 JavaScript / Node.js(Vercel 서버리스 함수) / OpenAI REST API / Vercel 배포
- **원칙:** 문서에 적힌 것만, 적힌 그대로 만든다. 모르면 멈추고 묻는다.

---

## 2. 문서 읽는 순서 (작업 시작 전 필수)

| 순서 | 문서 | 언제 읽나 |
|---|---|---|
| 1 | `AGENTS.md` (이 파일) | 항상 |
| 2 | `PRD.md` | 항상 — 무엇을 만들고 **무엇을 만들지 않는지** |
| 3 | `docs/01-project-setup.md` | Phase 1 — 폴더 구조, 설정 파일, 개발 서버 |
| 4 | `docs/04-api-spec.md` | Phase 2 — 서버 API 계약(요청·응답·오류 코드) |
| 5 | `docs/05-openai-integration.md` | Phase 2 — 프롬프트, JSON 스키마, OpenAI 호출, 목 모드 |
| 6 | `docs/02-ui-guide.md` | Phase 3 — 디자인 토큰, 마크업, 섹션별 스타일 |
| 7 | `docs/03-frontend-behavior.md` | Phase 4 — 화면 동작, 상태, 오류 문구 |
| 8 | `docs/07-testing-qa.md` | Phase 5 — 자동 테스트, 수동 검증 체크리스트 |
| 9 | `docs/06-deployment.md` | Phase 6 — Vercel 배포 안내 |

**문서 우선순위 (충돌 시)**
1. 작업 방식·금지 사항 → `AGENTS.md` 가 최우선
2. 제품 동작·범위 → `PRD.md`
3. 세부 값(색상, 크기, 문구, 코드 계약) → 해당 `docs/` 문서
4. 위 규칙으로도 해결되지 않는 충돌을 발견하면 **어느 쪽도 고르지 말고 멈춘 뒤 사용자에게 질문**한다.

---

## 3. 절대 규칙

### 3.1 추측 금지
- 문서에 없는 기능, 문구, 색상, 애니메이션, 라이브러리, 파일을 **추가하지 않는다.**
- 문서가 모호하거나 서로 다르면 구현을 멈추고 아래 형식으로 질문한다.
  ```
  [확인 요청]
  - 문서 위치: docs/02-ui-guide.md 5.3절
  - 모호한 점: 모바일에서 예시 버튼이 한 줄에 들어가지 않을 때의 처리 방법이 없음
  - 선택지: (A) 줄바꿈 허용  (B) 가로 스크롤
  - 제 추천: (A) — 이유: 가로 스크롤 금지(NFR-05)와 충돌하지 않음
  ```
- "있으면 좋을 것 같은" 개선 아이디어는 구현하지 말고 Phase 보고서의 **제안** 칸에만 적는다.

### 3.2 기술 스택 고정
| 허용 | 금지 |
|---|---|
| HTML5, CSS3(CSS 변수), JavaScript ES2022 + ES Modules | React, Vue, Svelte, Next.js, Express 등 모든 프레임워크 |
| Node.js 22.9+ 내장 모듈(`node:http`, `node:fs`, `node:test` 등) | jQuery, Lodash, Axios 등 모든 외부 라이브러리 |
| 내장 `fetch`, `AbortSignal.timeout` | `npm install <패키지>` (dependencies · devDependencies 모두 0개 유지) |
| Vercel Functions(`api/` 폴더, Web 표준 `fetch` 핸들러) | TypeScript, Vite·Webpack 등 빌드 도구, Sass |
| OpenAI REST API `POST /v1/responses` | OpenAI SDK(`openai` npm), Chat Completions API |
| 인라인 SVG 아이콘 | 아이콘 폰트, 아이콘 라이브러리, 이미지 파일, CDN 스크립트 |
| Pretendard 웹폰트(`public/css/fonts.css`) | 그 밖의 모든 웹폰트(Google Fonts 등) |

> **이유:** 외부 패키지가 없으면 설치 오류·보안 취약점·버전 충돌이 생기지 않고, 비전공자도 구조를 이해하기 쉽습니다.

### 3.3 보안
- `OPENAI_API_KEY` 는 **서버 코드(`api/`, `lib/`)에서 `process.env` 로만** 읽는다.
- `public/` 폴더(브라우저로 전달되는 파일)에는 API 키, `sk-` 로 시작하는 문자열, `process.env` 를 **절대 쓰지 않는다.**
- `.env` 파일은 에이전트가 **만들거나 수정하거나 읽어서 출력하지 않는다.** 사용자가 직접 만든다. 에이전트는 `.env.example` 만 작성한다.
- 사용자가 입력한 문장, API 키, OpenAI 응답 원문을 `console.log` 등으로 **기록하지 않는다.** (오류 코드와 상태 숫자만 기록)
- AI 결과·오류 문구를 화면에 넣을 때 `innerHTML`, `insertAdjacentHTML`, `outerHTML` 을 쓰지 않고 **`textContent`** 를 쓴다.
- 정적 SVG 마크업은 `index.html` 에 직접 작성한다(자바스크립트로 문자열 HTML 을 만들지 않는다).

> **이유:** API 키가 노출되면 다른 사람이 사용자의 요금으로 AI를 쓸 수 있습니다. `innerHTML` 은 악성 코드 실행(XSS)의 통로가 됩니다.

### 3.4 범위
- `PRD.md` **4.2 제외 목록**의 항목은 어떤 형태로도 구현하지 않는다.
- 레퍼런스(NETSPA)의 로고·문구·사진·아이콘을 복제하지 않는다. **레이아웃, 색감, 카드·버튼 형태만** 참고한다.
- `docs/reference/` 의 이미지는 참고용이다. `public/` 으로 복사하거나 화면에 쓰지 않는다.

### 3.5 파일 규칙
- 폴더·파일 구조는 `docs/01-project-setup.md` 2장과 **정확히 일치**해야 한다. 목록에 없는 파일·폴더를 만들지 않는다.
- `AGENTS.md`, `PRD.md`, `docs/` 문서는 사용자가 명시적으로 요청하지 않는 한 **수정하지 않는다.**
- 모든 텍스트 파일은 **UTF-8**(BOM 없음), 줄바꿈 LF 로 저장한다.

### 3.6 실행·비용·외부 작업
- 실제 OpenAI 호출은 사용자가 "`.env` 에 API 키를 넣었다"고 **알려 준 뒤에만** 한다. 그 전에는 `MOCK_AI=true` 로 검증한다.
- 실제 OpenAI 호출 검증은 **한 Phase 당 최대 5회**까지만 한다(비용 절약).
- `git push`, `vercel deploy` 등 외부로 내보내는 명령, 저장소·계정 생성은 **사용자의 명시적 허락 없이 실행하지 않는다.**
- 파일 삭제가 필요하면 먼저 사용자에게 목록을 보여 주고 허락을 받는다.
- `npm run dev` 는 끝나지 않는 명령이다. **백그라운드로 실행**하고, 검증이 끝나면 종료한다(`Ctrl + C`).
- 사용자는 **Windows** 환경일 수 있다. 명령 예시는 PowerShell 과 macOS/Linux 를 함께 제공하고, 경로 구분자에 의존하는 코드를 쓰지 않는다(`node:path` 사용).

---

## 4. 작업 순서 (Phase 별 체크포인트)

각 Phase 가 끝나면 **7장 형식으로 보고**하고 **사용자의 확인을 받은 뒤** 다음 Phase 로 넘어간다.

| Phase | 할 일 | 참고 문서 | 끝났다는 증거 |
|---|---|---|---|
| 0. 준비 | 문서 전체 읽기, `node -v` 로 22.9 이상인지 확인 | 전체 | 버전 출력, 모호한 점 목록(없으면 "없음") |
| 1. 골격 | 폴더·설정 파일·개발 서버·빈 API 생성 | 01 | `npm run dev` 실행 → `http://localhost:3000` 접속 시 빈 페이지, `GET /api/analyze` 가 `405` JSON |
| 2. 백엔드 | 검증·오류·프롬프트·OpenAI 호출·목 모드 구현, 자동 테스트 작성 | 04, 05, 07 | `npm test` 전부 통과, `docs/07` 3장의 curl 확인 결과 |
| 3. UI | `index.html` 마크업, `style.css` 전체 스타일 (동작 없이 정적 상태) | 02 | 360 / 768 / 1280px 스크린샷, 모든 섹션 표시 |
| 4. 기능 연결 | `public/js/` 구현 — 입력, 검증, API 호출, 상태 렌더링, 메뉴 | 03 | 목 모드에서 로딩·긍정·중립·부정·오류 상태 스크린샷 |
| 5. 검증 | 자동 테스트 + 수동 QA 체크리스트 전 항목 | 07 | 체크리스트 결과표(통과/실패/사유) |
| 6. 배포 안내 | 사용자가 따라 할 수 있도록 배포 단계 안내, 배포 후 확인 | 06 | 사용자가 알려 준 배포 URL 에서 스모크 테스트 결과 |

---

## 5. 코딩 규칙

### 5.1 공통
- 들여쓰기 **공백 2칸**, 문장 끝 **세미콜론**, 문자열은 **작은따옴표**(`'`), 템플릿이 필요할 때만 백틱
- `const` 우선, 재할당이 필요할 때만 `let`, **`var` 금지**
- ES Modules(`import` / `export`) — `package.json` 에 `"type": "module"`
- 이름 규칙: 변수·함수 `camelCase`, 상수 `UPPER_SNAKE_CASE`, 파일 `kebab-case.js`, CSS 클래스 `block__element--modifier`
- 숫자·문구를 코드 곳곳에 직접 쓰지 않는다 → 상수 파일(`lib/constants.js`, `public/js/constants.js`)에 모은다. 값은 `docs/04` 2장 표와 **같아야** 한다.
- 화면 문구는 `docs/02`, `docs/03` 에 적힌 **글자 그대로** 사용한다(띄어쓰기·문장부호 포함).
- 비동기 처리는 `async` / `await` + `try` / `catch`
- 주석은 **한국어**로, "무엇을"보다 **"왜"** 를 설명한다. 각 파일 맨 위에 파일 역할을 1~2줄로 적는다.
- 함수 하나는 한 가지 일만 한다. 한 함수가 40줄을 넘으면 나눈다.

### 5.2 서버(`api/`, `lib/`, `scripts/`)
- 오류는 `docs/04` 4장의 **오류 코드만** 사용한다. 새 오류 코드를 만들지 않는다.
- 모든 응답은 `Content-Type: application/json; charset=utf-8`, `Cache-Control: no-store`
- `lib/` 의 함수는 테스트하기 쉽도록 환경 변수와 `fetch` 를 **인자로 받을 수 있게** 만든다(`docs/04` 5장).

### 5.3 화면(`public/`)
- CSS 색·크기는 `docs/02` 2장의 **CSS 변수**로만 사용한다(변수 밖에 색상 코드 직접 작성 금지).
- `!important` 금지. **예외 2곳만 허용:** `[hidden] { display: none !important; }` 와 `docs/02` 의 `prefers-reduced-motion` 블록.
- 인라인 `style` 속성 금지(단, 신뢰도 막대 너비는 JS 로 `style.width` 설정 허용).
- DOM 요소는 `docs/03` 4.1절에 정의된 **id** 로만 찾는다.
- 접근성 속성(`aria-*`, `role`, `label`)은 `docs/02` 마크업에 적힌 그대로 유지한다.

---

## 6. 완료 정의 (작업 단위)

어떤 작업이든 아래를 **모두** 만족해야 "완료"라고 보고한다.
- [ ] 관련 문서의 "완료 기준" 항목 전부 충족
- [ ] `npm test` 통과 (Phase 2 이후)
- [ ] 브라우저 콘솔에 오류·경고 0건
- [ ] 3장 절대 규칙 위반 0건 (특히 외부 패키지 0개, `public/` 에 키 없음)
- [ ] 직접 실행해서 확인한 증거(명령 출력, 스크린샷)를 보고에 첨부

---

## 7. 보고 형식

```
## Phase N 보고 — (Phase 이름)
### 한 일
- 만든/수정한 파일: public/index.html, ...
### 확인 결과 (증거)
- npm test: 24개 통과 / 0개 실패
- 스크린샷: (첨부)
### 문서와 다르게 한 부분
- 없음  (있다면: 위치 · 이유 · 사용자 승인 여부)
### 확인 요청 / 막힌 점
- 없음
### 제안 (구현하지 않음)
- 없음
```

---

## 8. 막혔을 때

- 같은 오류를 **2번 고쳐도** 해결되지 않으면 더 시도하지 말고 멈춘 뒤, 오류 메시지 원문·시도한 방법·추정 원인을 보고한다.
- OpenAI 가 `400` 을 돌려주면(예: 모델이 특정 옵션을 지원하지 않음) 옵션을 임의로 바꾸지 말고 오류 본문의 `error.message` 를 보고한다.
- 레퍼런스 이미지와 `docs/02` 수치가 다르게 보이면 **`docs/02` 수치를 따른다.**

---

## 9. 자주 하는 실수 (하지 말 것)

| 하지 말 것 | 올바른 방법 |
|---|---|
| 브라우저 JS 에서 `https://api.openai.com` 직접 호출 | 브라우저 → `/api/analyze` → 서버가 OpenAI 호출 |
| `npm install openai`, `npm install express` | 내장 `fetch`, 내장 `node:http` 사용 |
| `resultEl.innerHTML = data.reason` | `resultEl.textContent = data.reason` |
| 레퍼런스 사진을 내려받아 배경으로 사용 | `docs/02` 의 CSS 그라데이션 사용 |
| 오류를 `alert()` 창으로 표시 | `docs/02` 의 오류 박스(`#analyze-error`)에 표시 |
| 결과를 `localStorage` 에 저장 | 저장하지 않음(PRD 4.2) |
| 서버 오류 원문(`error.message`)을 그대로 화면에 출력 | `docs/03` 문구 표의 한국어 문구 출력 |
| 실패 시 자동으로 다시 요청 | 재시도 없음 — 사용자가 다시 누름 |
| `MOCK_AI` 를 운영에서도 동작하게 둠 | `VERCEL_ENV === 'production'` 이면 무조건 꺼짐 |
| 테스트를 통과시키려고 테스트 기대값을 수정 | 구현을 문서에 맞게 고침 |
