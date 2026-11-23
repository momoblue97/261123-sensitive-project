# 01. 프로젝트 생성 지침

> **목적:** 빈 폴더에서 시작해 "로컬에서 실행되는 프로젝트 골격"을 만드는 방법을 정의합니다.
> **대상 Phase:** Phase 1 (골격)
> **이 문서가 끝나면:** `npm run dev` 로 개발 서버가 켜지고, 브라우저에서 빈 페이지와 API 응답을 확인할 수 있습니다.

---

## 1. 준비물 (사용자가 직접 준비)

| 준비물 | 용도 | 확인 방법 |
|---|---|---|
| Node.js **22.9 이상** (nodejs.org 의 LTS 버전 권장) | 개발 서버·테스트 실행 | 터미널에 `node -v` → `v22.9.0` 이상 |
| Antigravity IDE | AI 에이전트로 코드 작성 | — |
| OpenAI 계정 + API 키 | 실제 감성 분석 | platform.openai.com → API keys |
| GitHub 계정 | 코드 저장, Vercel 연결 | github.com 로그인 |
| Vercel 계정 | 배포 | vercel.com 로그인 (GitHub 계정으로 가입 가능) |

> 💡 **쉽게 말해:** Node.js 는 "자바스크립트를 내 컴퓨터에서 실행해 주는 프로그램"입니다. 설치 후 터미널을 **새로 열어야** `node -v` 가 동작합니다.
>
> ⚠️ OpenAI API 는 **사용한 만큼 요금**이 나옵니다. OpenAI 대시보드의 Billing 메뉴에서 결제 수단과 사용 한도(예산 알림)를 먼저 설정해 두세요. 키가 없어도 목(Mock) 모드로 화면 전체를 테스트할 수 있습니다.

---

## 2. 최종 폴더 구조 (이 구조와 정확히 일치해야 함)

```
moodwave/
├── AGENTS.md                  ← AI 작업 규칙 (수정 금지)
├── PRD.md                     ← 제품 요구사항 (수정 금지)
├── README.md                  ← 실행 방법 요약 (Phase 6 에서 작성, 7장)
├── docs/                      ← 세부 구현 문서 (수정 금지)
│   ├── 01-project-setup.md
│   ├── 02-ui-guide.md
│   ├── 03-frontend-behavior.md
│   ├── 04-api-spec.md
│   ├── 05-openai-integration.md
│   ├── 06-deployment.md
│   ├── 07-testing-qa.md
│   └── reference/             ← 디자인 레퍼런스 캡처 (참고용, 배포 안 됨)
│
├── public/                    ← 🌐 브라우저로 전달되는 파일 (API 키 절대 금지)
│   ├── index.html             ← 화면 전체 마크업 (한 페이지)
│   ├── favicon.svg            ← 브라우저 탭 아이콘
│   ├── css/
│   │   ├── fonts.css          ← Pretendard @font-face (사용자 제공 원본 그대로)
│   │   └── style.css          ← 전체 스타일
│   └── js/
│       ├── main.js            ← 진입점: 상태 관리 + 이벤트 연결
│       ├── api.js             ← 서버 통신 (/api/analyze 호출)
│       ├── ui.js              ← 화면 그리기 함수
│       ├── header.js          ← 헤더 스크롤 효과 + 모바일 메뉴
│       └── constants.js       ← 화면용 상수·문구
│
├── api/                       ← ☁️ Vercel 서버리스 함수 (이 폴더의 파일 = API 주소)
│   └── analyze.js             ← POST /api/analyze 진입점
│
├── lib/                       ← 🔒 서버 전용 로직 (브라우저로 전달되지 않음)
│   ├── constants.js           ← 서버 상수
│   ├── errors.js              ← 오류 코드 + JSON 응답 도우미
│   ├── validate.js            ← 입력 검증
│   ├── prompt.js              ← OpenAI 프롬프트 + JSON 스키마
│   ├── openai-client.js       ← OpenAI 호출 + 응답 해석
│   ├── mock.js                ← 목(Mock) 모드
│   └── analyze-handler.js     ← API 처리 순서 (검증 → 분석 → 응답)
│
├── scripts/
│   └── dev-server.js          ← 로컬 개발 서버 (배포에는 쓰이지 않음)
│
├── tests/                     ← 자동 테스트 (node --test)
│   ├── validate.test.js
│   ├── openai-client.test.js
│   └── analyze-handler.test.js
│
├── .env.example               ← 환경 변수 견본 (Git 에 올림)
├── .env                       ← 실제 비밀 값 (사용자가 직접 생성, Git 에 안 올림)
├── .gitignore
├── package.json
└── vercel.json
```

> 💡 **왜 `public/`, `api/`, `lib/` 를 나누나요?**
> Vercel 은 `public/` 안의 파일만 인터넷에 그대로 공개하고, `api/` 안의 파일은 서버 함수로 실행합니다. `lib/` 는 서버 함수가 불러 쓰는 부품이라 공개되지 않습니다. 그래서 **API 키를 다루는 코드는 반드시 `api/` 또는 `lib/` 에만** 있어야 합니다.

### 2.1 파일을 만드는 순서 (Phase 별)
| Phase | 만들 파일 |
|---|---|
| 1 | `package.json`, `.gitignore`, `.env.example`, `vercel.json`, `scripts/dev-server.js`, `api/analyze.js`, `lib/constants.js`, `lib/errors.js`, `lib/analyze-handler.js`(405 만 돌려주는 임시 버전), `public/index.html`(임시: 제목만), `public/css/fonts.css` |
| 2 | `lib/` 나머지 전부, `lib/analyze-handler.js` 완성, `tests/` 3개 |
| 3 | `public/index.html` 완성, `public/css/style.css`, `public/favicon.svg` |
| 4 | `public/js/` 5개 |
| 6 | `README.md` |

---

## 3. 설정 파일 (글자 그대로 작성)

### 3.1 `package.json`
```json
{
  "name": "moodwave",
  "version": "1.0.0",
  "private": true,
  "description": "AI 감성 분석 웹 서비스 MOODWAVE",
  "type": "module",
  "engines": {
    "node": "24.x"
  },
  "scripts": {
    "dev": "node --env-file-if-exists=.env scripts/dev-server.js",
    "test": "node --test"
  }
}
```

| 항목 | 뜻 |
|---|---|
| `"type": "module"` | `import` / `export` 문법(ES Modules)을 쓴다는 표시 |
| `"engines"` | Vercel 이 Node.js **24.x** 로 서버 함수를 실행하도록 고정 (로컬은 22.9 이상이면 됨) |
| `"dev"` | `.env` 가 있으면 읽어서 개발 서버 실행 (`--env-file-if-exists` 는 Node.js 22.9+ 기능) |
| `"test"` | Node.js 내장 테스트 러너로 `tests/*.test.js` 를 자동으로 찾아 실행 |
| `dependencies` 없음 | **외부 패키지 0개** (C-04). 이 항목을 추가하지 않는다 |
| `build` 스크립트 없음 | 빌드 과정이 없으므로 **추가하지 않는다** (추가하면 Vercel 이 실행하려고 함) |

### 3.2 `.gitignore`
```gitignore
# 비밀 정보 — 절대 Git 에 올리지 않는다
.env
.env.*
!.env.example

# 자동 생성 폴더
node_modules/
.vercel/

# 운영체제·로그 파일
.DS_Store
Thumbs.db
*.log
```

### 3.3 `.env.example`
```bash
# ─────────────────────────────────────────────────────────────
# 이 파일을 복사해 같은 폴더에 ".env" 라는 이름으로 저장한 뒤 값을 채우세요.
# .env 파일은 절대 Git 에 올리지 마세요 (.gitignore 에 이미 등록되어 있음).
# ─────────────────────────────────────────────────────────────

# OpenAI API 키 (https://platform.openai.com/api-keys 에서 발급)
OPENAI_API_KEY=

# 사용할 OpenAI 모델 (비워 두면 gpt-6-luna)
OPENAI_MODEL=

# true 로 바꾸면 OpenAI 를 부르지 않고 가짜 결과를 돌려줍니다 (로컬 테스트용, 운영 배포에서는 무시됨)
MOCK_AI=false

# 로컬 개발 서버 포트 (비워 두면 3000)
PORT=
```

| 변수 | 필수 | 기본값 | 설명 |
|---|---|---|---|
| `OPENAI_API_KEY` | 실제 분석 시 필수 | 없음 | 없으면 API 가 `SERVER_CONFIG_ERROR` 를 돌려줌 |
| `OPENAI_MODEL` | 선택 | `gpt-6-luna` | 빈 값이면 기본값 사용 (`docs/05` 3장) |
| `MOCK_AI` | 선택 | `false` | 정확히 `true` 일 때만 켜짐. Vercel 운영 배포에서는 항상 꺼짐 |
| `PORT` | 선택 | `3000` | 로컬 개발 서버 포트. 빈 값이면 3000 |

> 💡 **사용자가 할 일 (`.env` 만들기):** Antigravity 왼쪽 파일 목록에서 프로젝트 폴더를 오른쪽 클릭 → **New File** → 이름을 `.env` 로 입력 → `.env.example` 내용을 붙여 넣고 `OPENAI_API_KEY=` 뒤에 키를 붙입니다.
> Windows 메모장으로 만들면 `.env.txt` 가 되기 쉬우니 IDE 에서 만드는 것을 권장합니다.
>
> 🤖 **에이전트 규칙:** `.env` 는 만들지도, 읽어서 출력하지도 않는다 (AGENTS.md 3.3).

### 3.4 `vercel.json`
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": null,
  "outputDirectory": "public",
  "functions": {
    "api/analyze.js": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

| 항목 | 뜻 |
|---|---|
| `"framework": null` | 프레임워크 없는 프로젝트("Other")로 배포 |
| `"outputDirectory": "public"` | `public/` 폴더만 인터넷에 공개 |
| `"maxDuration": 30` | 서버 함수 최대 실행 시간 30초 (OpenAI 대기 한도 20초 + 여유) |
| `headers` | 기본 보안 헤더 3종 |

---

## 4. 로컬 개발 서버 — `scripts/dev-server.js` (글자 그대로 작성)

> 💡 **왜 직접 만드나요?** Vercel 의 로컬 실행 도구(`vercel dev`)는 로그인과 프로젝트 연결이 필요합니다. 이 작은 서버는 외부 패키지 없이 `npm run dev` 한 줄로 **화면(public/)과 API(api/analyze.js)를 Vercel 과 같은 방식**으로 실행합니다. 배포에는 쓰이지 않습니다.

```js
// 로컬 개발 전용 서버 (배포에는 쓰이지 않음).
// 1) public/ 폴더의 정적 파일을 보여 주고  2) /api/analyze 요청을 Vercel 과 같은 방식(api/analyze.js)으로 처리한다.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import analyzeFunction from '../api/analyze.js';

const PUBLIC_DIR = fileURLToPath(new URL('../public/', import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const API_ROUTES = {
  '/api/analyze': analyzeFunction,
};

// Node.js 요청(req)을 Web 표준 Request 로 바꿔 Vercel 함수와 같은 형태로 호출한다.
async function handleApi(req, res, apiFunction) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') {
      headers.set(key, value);
    }
  }
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const request = new Request(`http://localhost:${PORT}${req.url}`, {
    method: req.method,
    headers,
    body: hasBody ? Buffer.concat(chunks) : undefined,
  });
  const response = await apiFunction.fetch(request);
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(Buffer.from(await response.arrayBuffer()));
}

async function serveStatic(pathname, res) {
  const relativePath = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
  const filePath = normalize(join(PUBLIC_DIR, relativePath));
  // public/ 바깥 파일(예: /../.env)은 절대 보여 주지 않는다.
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }
  try {
    const data = await readFile(filePath);
    const contentType = MIME_TYPES[extname(filePath)] ?? 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-store' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  }
}

const server = createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, `http://localhost:${PORT}`);
    const decodedPath = decodeURIComponent(pathname);
    if (API_ROUTES[decodedPath]) {
      await handleApi(req, res, API_ROUTES[decodedPath]);
      return;
    }
    if (decodedPath.startsWith('/api/')) {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: false, error: { code: 'INVALID_REQUEST', message: '존재하지 않는 API 입니다.' } }));
      return;
    }
    await serveStatic(decodedPath, res);
  } catch (error) {
    console.error('[dev-server] 요청 처리 실패:', error?.name ?? 'UnknownError');
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`MOODWAVE 개발 서버 실행 중 → http://localhost:${PORT}`);
  console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '설정됨' : '없음 (MOCK_AI=true 로 테스트하거나 .env 에 키를 넣으세요)'}`);
  console.log(`MOCK_AI: ${process.env.MOCK_AI === 'true' ? '켜짐 (가짜 결과)' : '꺼짐 (실제 OpenAI 호출)'}`);
  console.log('종료하려면 Ctrl + C');
});
```

**동작 규칙**
| 요청 | 처리 |
|---|---|
| `/api/analyze` (모든 메서드) | `api/analyze.js` 의 `fetch(request)` 호출 — Vercel 과 동일 |
| `/api/` 로 시작하는 다른 주소 | `404` JSON |
| `/` | `public/index.html` |
| 그 밖의 주소 | `public/` 안의 같은 경로 파일, 없으면 `404` |
| `public/` 바깥으로 나가는 경로 (`/../.env` 등) | 절대 제공하지 않음 (`403` 또는 `404`) |

---

## 5. API 진입점 — `api/analyze.js` (글자 그대로 작성)

```js
// Vercel 서버리스 함수 진입점: POST /api/analyze
// 실제 처리는 lib/analyze-handler.js 에 있다 (로컬 개발 서버와 테스트가 같은 코드를 쓰도록).
import { handleAnalyze } from '../lib/analyze-handler.js';

export default {
  fetch(request) {
    return handleAnalyze(request);
  },
};
```

> Vercel 은 `api/` 폴더의 각 파일을 하나의 서버 함수로 만듭니다. `export default { fetch(request) { ... } }` 는 Vercel 이 권장하는 **Web 표준 핸들러** 형식으로, 표준 `Request` 를 받아 표준 `Response` 를 돌려줍니다. 실제 처리 순서는 `lib/analyze-handler.js` 에 있습니다(`docs/04` 5장).

**Phase 1 임시 버전 `lib/analyze-handler.js`** — Phase 2 에서 완성본으로 교체합니다.
```js
// Phase 1 임시 버전: 골격 확인용. Phase 2 에서 docs/04 5장 순서대로 완성한다.
import { errorResponse } from './errors.js';

export async function handleAnalyze(request) {
  if (request.method !== 'POST') {
    return errorResponse('METHOD_NOT_ALLOWED', { Allow: 'POST' });
  }
  return errorResponse('INTERNAL_ERROR');
}
```
(`lib/constants.js`, `lib/errors.js` 는 `docs/04` 2장·4장의 코드를 Phase 1 에서 미리 작성합니다.)

**Phase 1 임시 `public/index.html`**
```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MOODWAVE — AI 감성 분석</title>
  <link rel="stylesheet" href="/css/fonts.css">
</head>
<body>
  <h1 style="font-family: 'Pretendard', sans-serif;">MOODWAVE 준비 중</h1>
</body>
</html>
```
(이 임시 파일에만 인라인 style 을 허용합니다. Phase 3 에서 `docs/02` 6장의 완성본으로 교체합니다.)

**`public/css/fonts.css`** — 사용자가 제공한 `@font-face` 선언 원본을 한 글자도 바꾸지 않고 저장합니다. 전체 내용은 `docs/02` 3.1절에 있습니다.

---

## 6. 실행·확인 방법

### 6.1 명령어
| 하고 싶은 일 | 명령 | 결과 |
|---|---|---|
| 개발 서버 켜기 | `npm run dev` | `MOODWAVE 개발 서버 실행 중 → http://localhost:3000` 출력 |
| 개발 서버 끄기 | 터미널에서 `Ctrl + C` | 종료 |
| 자동 테스트 | `npm test` | 마지막에 `# pass N` / `# fail 0` |

> `npm install` 은 필요 없습니다(설치할 패키지가 없음).

### 6.2 Phase 1 완료 기준
- [ ] 2장 폴더 구조 중 Phase 1 파일이 모두 존재한다 (2.1절)
- [ ] `package.json` 에 `dependencies` / `devDependencies` 가 없다
- [ ] `npm run dev` 실행 시 오류 없이 위 안내 문구 4줄이 출력된다
- [ ] 브라우저에서 `http://localhost:3000` 접속 시 "MOODWAVE 준비 중" 이 Pretendard 글꼴로 보인다
- [ ] 브라우저에서 `http://localhost:3000/api/analyze` 접속(GET) 시 아래 JSON 이 보인다
  ```json
  {"ok":false,"error":{"code":"METHOD_NOT_ALLOWED","message":"허용되지 않은 요청 방식입니다."}}
  ```
- [ ] `http://localhost:3000/../.env` 같은 주소로 `.env` 내용이 보이지 않는다
- [ ] `.env` 를 만들지 않은 상태에서도 서버가 켜진다

---

## 7. `README.md` (Phase 6 에서 작성)

아래 내용으로 작성합니다(제목·순서 고정, 문장은 다듬어도 됨).
```markdown
# MOODWAVE — AI 감성 분석

문장을 입력하면 AI가 긍정·부정·중립을 판정하고 신뢰도와 이유를 알려 주는 웹 서비스입니다.

## 실행 방법
1. Node.js 22.9 이상 설치
2. `.env.example` 을 복사해 `.env` 를 만들고 `OPENAI_API_KEY` 입력 (키 없이 테스트하려면 `MOCK_AI=true`)
3. `npm run dev` → http://localhost:3000

## 테스트
`npm test`

## 배포
docs/06-deployment.md 참고

## 문서
- 제품 요구사항: PRD.md
- AI 작업 규칙: AGENTS.md
- 세부 구현: docs/
```
