# 06. Vercel 배포 지침

> **목적:** 완성된 프로젝트를 인터넷 주소로 공개하는 방법을 정의합니다.
> **대상 Phase:** Phase 6
> **누가 하나요?** 계정 로그인·저장소 생성·배포 버튼은 **사용자**가 직접 합니다. 에이전트는 안내하고, 사용자가 허락한 명령만 실행합니다(AGENTS.md 3.6).

> 💡 **쉽게 말해:** GitHub 는 코드를 보관하는 "인터넷 창고", Vercel 은 그 창고의 코드를 가져와 웹사이트로 띄워 주는 "호스팅 서비스"입니다. 둘을 연결해 두면 GitHub 에 코드를 올릴 때마다 사이트가 자동으로 새로 배포됩니다.

---

## 1. 배포 전 점검 (에이전트가 확인 후 결과 보고)

- [ ] `npm test` → 실패 0
- [ ] `docs/07` 수동 QA 전 항목 통과
- [ ] `.gitignore` 에 `.env` 가 있다 → `.env` 가 Git 에 올라가지 않음
- [ ] `public/` 에서 비밀 정보 검색 결과 0건
  - macOS / Linux: `grep -rnE "sk-|OPENAI_API_KEY|process\.env" public/`
  - Windows PowerShell: `Get-ChildItem -Recurse public | Select-String -Pattern 'sk-','OPENAI_API_KEY','process.env'`
- [ ] `package.json` 에 `dependencies`, `devDependencies`, `build` 스크립트가 없다
- [ ] `vercel.json` 이 `docs/01` 3.4절과 같다

---

## 2. 방법 A (권장) — GitHub + Vercel 대시보드

### 2.1 GitHub 에 코드 올리기
1. github.com → 오른쪽 위 **+** → **New repository**
2. Repository name: `moodwave` · **Private** 선택(권장) · 나머지는 그대로 → **Create repository**
3. 프로젝트 폴더에서 터미널을 열고 아래 명령 실행 (GitHub 화면에 나오는 주소로 바꿔서)
   ```bash
   git init
   git add .
   git commit -m "MOODWAVE 첫 버전"
   git branch -M main
   git remote add origin https://github.com/<내아이디>/moodwave.git
   git push -u origin main
   ```
4. GitHub 저장소 화면에서 **`.env` 파일이 없는지** 확인 (있으면 즉시 삭제하고 OpenAI 키를 새로 발급)

### 2.2 Vercel 에서 프로젝트 만들기
1. vercel.com 로그인 → **Add New…** → **Project**
2. **Import Git Repository** 에서 `moodwave` 선택 → **Import**
3. 설정 화면
   | 항목 | 값 |
   |---|---|
   | Framework Preset | **Other** (vercel.json 이 자동 지정) |
   | Root Directory | `./` (그대로) |
   | Build Command | 비워 둠 |
   | Output Directory | `public` (vercel.json 이 자동 지정) |
   | Install Command | 그대로 |
4. **Environment Variables** 펼치기 → 아래 추가
   | Key | Value | 비고 |
   |---|---|---|
   | `OPENAI_API_KEY` | `sk-...` (내 키) | 필수 |
   | `OPENAI_MODEL` | (넣지 않음) | 기본값 `gpt-6-luna` 사용 |
   - `MOCK_AI` 는 **넣지 않습니다.** (넣어도 운영 배포에서는 무시됨)
5. **Deploy** → 1분 정도 후 완료 화면의 주소(예: `https://moodwave-xxxx.vercel.app`) 확인

### 2.3 이후 수정 배포
- 코드를 고친 뒤 `git add .` → `git commit -m "수정 내용"` → `git push` 하면 Vercel 이 **자동으로 다시 배포**합니다.
- ⚠️ **환경 변수를 바꾼 경우**에는 자동 반영되지 않습니다. Vercel → 프로젝트 → **Deployments** → 최신 배포의 `⋯` → **Redeploy** 를 눌러야 적용됩니다.

---

## 3. 방법 B — Vercel CLI (GitHub 없이)

```bash
npx vercel          # 처음: 로그인 → 질문에 Enter → 미리보기(Preview) 주소 생성
npx vercel env add OPENAI_API_KEY   # 키 입력 → Production, Preview 선택
npx vercel --prod   # 운영(Production) 배포
```
- `npx` 는 필요할 때 도구를 잠깐 내려받아 실행할 뿐, 프로젝트에 패키지를 추가하지 않습니다(C-04 위반 아님).
- 생성되는 `.vercel/` 폴더는 `.gitignore` 에 이미 들어 있습니다.

---

## 4. 배포 후 확인 (스모크 테스트)

배포 주소에서 아래를 확인합니다. **실제 OpenAI 를 호출하므로 최대 5회**만 합니다.

| # | 할 일 | 기대 결과 |
|---|---|---|
| D-1 | 주소 접속 | 히어로 화면, Pretendard 글꼴, 콘솔 오류 없음 |
| D-2 | "긍정 예시" → 분석하기 | Positive 카드 활성, 신뢰도 표시, 이유가 한국어이고 `[테스트 모드]` 가 **없음** |
| D-3 | "부정 예시" → 분석하기 | Negative 카드 활성 |
| D-4 | "중립 예시" → 분석하기 | Neutral 카드 활성 |
| D-5 | 빈 입력으로 분석하기 | 서버 요청 없이 "분석할 문장을 입력해 주세요." |
| D-6 | `https://<주소>/api/analyze` 를 브라우저로 직접 열기 | `METHOD_NOT_ALLOWED` JSON |
| D-7 | `https://<주소>/.env`, `https://<주소>/lib/prompt.js` 열기 | 404 (공개되지 않음) |

---

## 5. 문제 해결

| 증상 | 원인 | 해결 |
|---|---|---|
| 분석 시 "서버 설정에 문제가 있어…" | 키 미등록 / 키 오타 / 등록 후 재배포 안 함 / 모델 ID 오류 | 2.2-4 확인 → **Redeploy**. Vercel → 프로젝트 → **Logs** 에서 `[analyze] SERVER_CONFIG_ERROR ...` 의 detail 확인 (`missing_api_key`, `openai_status_401` 등) |
| "AI 사용 한도를 초과했습니다…" | OpenAI 크레딧 소진·결제 수단 없음 | OpenAI 대시보드 → Billing |
| "요청이 많아…" | OpenAI 분당 한도 초과 | 30초 후 재시도, 계속되면 OpenAI 사용량 등급 확인 |
| 결과에 `[테스트 모드]` 가 보임 | 미리보기(Preview) 배포에 `MOCK_AI=true` 가 등록됨 | Vercel 환경 변수에서 `MOCK_AI` 삭제 → Redeploy |
| 화면은 뜨는데 `/api/analyze` 가 404 | `api/analyze.js` 위치·이름 오류 | 루트의 `api/` 폴더에 정확히 `analyze.js` 가 있는지 확인 |
| "No Output Directory named 'public'" | `public/` 폴더가 없거나 이름이 다름 | 폴더 구조를 `docs/01` 2장과 맞춤 |
| 글꼴이 Pretendard 가 아님 | 글꼴 CDN 접속 차단(회사망 등) | 다른 네트워크에서 확인. 시스템 글꼴로 대체되는 것은 정상 동작 |
| 응답이 매우 느림 / "AI 응답이 지연되고 있습니다" | OpenAI 지연 | 잠시 후 재시도. 반복되면 OpenAI 상태 페이지 확인 |

---

## 6. 완료 기준 (Phase 6)
- [ ] 1장 점검 전 항목 통과
- [ ] 4장 D-1 ~ D-7 통과
- [ ] GitHub 저장소에 `.env` 가 없음
- [ ] `README.md` 작성 (`docs/01` 7장)
