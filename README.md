# MOODWAVE — AI 감성 분석 웹 서비스

문장을 입력하면 AI가 **긍정 · 부정 · 중립**을 판정하고, **신뢰도(%)** 와 **판단 이유**를 알려 주는 한 페이지 웹 서비스입니다.

---

## 1. 주요 기능
- **단순한 분석 인터페이스:** 문장 입력(최대 1,000자) 및 예시 칩(긍정/부정/중립) 제공
- **정교한 감성 분석:** OpenAI Responses API와 Structured Outputs를 통한 긍정·부정·중립 분류, 신뢰도(0~100%), 한국어 판단 근거 표시
- **반응형 & 무의존성 디자인:** 외부 npm 패키지 없이(Zero Dependencies) 웹 표준 HTML, CSS, JavaScript로 구현, 모바일(360px)부터 데스크톱(1920px)까지 완벽 대응
- **비용 절약 목(Mock) 모드:** API 키 없이도 모든 상태(로딩, 성공 3종, 다양한 오류)를 테스트할 수 있는 개발 환경 지원

---

## 2. 로컬 실행 방법

### 사전 준비
- **Node.js 22.9 이상**이 필요합니다 (`node -v`로 확인).
- 외부 패키지 설치(`npm install`)가 전혀 필요하지 않습니다.

### 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 아래 내용을 입력합니다.
```bash
# OpenAI API 키 (실제 AI 분석 시 필요, 없으면 MOCK_AI=true 로 테스트 가능)
OPENAI_API_KEY=your-api-key-here

# 개발 및 테스트용 가짜 AI 모드 (true로 설정 시 OpenAI 호출 없이 즉시 테스트)
MOCK_AI=true

# 개발 서버 포트 (기본값: 3000)
PORT=3000
```

### 실행 명령어
```bash
# 로컬 개발 서버 실행
npm run dev

# 자동 단위 테스트 실행 (33개 테스트)
npm test
```
실행 후 브라우저에서 `http://localhost:3000`으로 접속합니다.

---

## 3. 배포 안내 (Vercel)

1. GitHub에 새 저장소를 만들고 코드를 push합니다. (`.env` 파일은 절대 올리지 않습니다)
2. [Vercel](https://vercel.com)에 로그인 후 해당 저장소를 Import합니다.
3. 프로젝트 설정:
   - **Framework Preset:** Other
   - **Output Directory:** public
4. **Environment Variables**에 `OPENAI_API_KEY`를 등록하고 **Deploy**를 진행합니다.
