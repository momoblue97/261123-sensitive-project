# 02. UI 구현 지침

> **목적:** 화면의 모양(색·글꼴·크기·배치·상태)을 정의합니다. 이 문서의 수치가 레퍼런스 이미지보다 **우선**합니다.
> **대상 Phase:** Phase 3 (마크업·스타일), Phase 4 (상태별 모양 확인)
> **관련 파일:** `public/index.html`, `public/css/fonts.css`, `public/css/style.css`, `public/favicon.svg`

---

## 1. 레퍼런스 분석 (첨부 PDF → `docs/reference/`)

| 파일 | 레퍼런스 화면 | 가져올 특징 |
|---|---|---|
| `ref-01-hero.png` | 메인 비주얼 "Go back to the blue" | 화면 꽉 찬 블루 배경, 왼쪽 정렬 큰 흰색 영문 헤드라인, 밑줄 있는 "Read more ⟶" 텍스트 링크, 투명 헤더 |
| `ref-02-about.png` | ABOUT (네이비) | `#303F6A` 네이비 배경, 작은 eyebrow 라벨 + 큰 대문자 제목, 흰 본문, **흰색 직사각형 버튼 + 긴 화살표**, 2단 배치 |
| `ref-03-process.png` | PROCESS (차콜) | `#292929` 차콜 배경, **가로 타임라인 선 + 점**(현재 항목은 링 모양), **얇은 테두리 카드 + 왼쪽 위·오른쪽 아래만 둥근 모서리**, 활성 카드는 밝은 회색 배경 + 넓은 폭 + 네이비 제목, 오른쪽 아래 라인 아이콘 |
| `ref-04-product.png` | PRODUCT (네이비) | 왼쪽 텍스트 / 오른쪽 콘텐츠 2단 구성 |
| `ref-05-contact.png` | CONTACT (어두운 배경) | 가운데 정렬 eyebrow + 제목 + 흰 버튼 |
| 공통 | 헤더 | 스크롤 후 흰 배경, 진한 남색 로고(자간 넓음), 가운데 메뉴, 오른쪽 햄버거(가운데 줄이 짧음) |

**가져오지 않는 것 (C-07)**
- NETSPA 로고·문구·사진(바다, 그물, 펠릿, 돌고래 등)·아이콘
- 언어 선택 상자(`KOR ▾`), 히어로 슬라이더(`1 / 2`), 세로로 흐르는 장식 글자

**우리 화면과의 대응**
| 우리 섹션 | 레퍼런스 |
|---|---|
| Header | 헤더 그대로의 구조 (로고 / 메뉴 / 햄버거) |
| Hero `#home` | 메인 비주얼 (사진 → CSS 그라데이션 + 얇은 물결 선) |
| Analyze `#analyze` | ABOUT·PRODUCT 의 네이비 2단 (왼쪽 설명 / 오른쪽 입력창) |
| Result `#result` | PROCESS 의 타임라인 + 카드 3장 (긍정·중립·부정) |
| About `#about` | CONTACT 의 가운데 정렬 + 흰 버튼 |

**완성 목표 화면** (프로토타입으로 확인한 결과 — 이 모습과 같아야 함)
| 파일 | 내용 |
|---|---|
| `target-01-hero-desktop.png` | 1440px 히어로 |
| `target-02-analyze-desktop.png` | 1440px 입력 영역 (헤더 흰색 상태) |
| `target-03-result-desktop.png` | 1440px 결과 — 긍정 카드 활성 |
| `target-04-error-desktop.png` | 1440px 서버 오류 표시 |
| `target-05-about-desktop.png` | 1440px About + Footer |
| `target-06-result-tablet.png` | 820px 결과 — 중립 카드 활성 |
| `target-07-result-mobile.png` | 375px 결과 — 부정 카드 활성 |
| `target-08-menu-mobile.png` | 375px 햄버거 메뉴 열림 |

> 목표 화면 캡처는 글꼴 서버에 접속할 수 없는 환경에서 찍어 대체 글꼴로 보입니다. 실제 화면은 **Pretendard** 로 보여야 합니다.

---

## 2. 디자인 토큰 — `style.css` 맨 위 (글자 그대로 작성)

> 💡 **토큰이란?** 색·크기 같은 값에 이름을 붙여 한곳에 모아 둔 것입니다. 색을 바꾸고 싶으면 이곳만 고치면 전체가 바뀝니다.
> 🤖 **규칙:** `style.css` 의 다른 곳에서는 색상 코드(`#...`, `rgba(...)`)를 직접 쓰지 않고 `var(--토큰)` 만 사용합니다.

```css
/* ===== 1. 디자인 토큰 ===== */
:root {
  /* 배경 */
  --color-navy: #303F6A;
  --color-navy-deep: #08166B;
  --color-charcoal: #292929;
  --color-deep: #1E2030;
  --color-deepest: #161821;
  --color-white: #FFFFFF;
  --color-card-active: #DFDFDF;

  /* 글자 */
  --color-ink: #1D1D1D;
  --color-ink-muted: #4A4A4A;
  --color-text-on-navy-muted: #A9BAD9;
  --color-text-on-charcoal-muted: #9E9E9E;
  --color-text-on-charcoal-soft: #D9D9D9;
  --color-text-on-deep-soft: #D6DCE8;
  --color-text-hero-soft: #E6ECF5;
  --color-text-footer: #9AA3B5;

  /* 선 */
  --color-line-on-navy: #A9BAD9;
  --color-line-on-charcoal: #BDBDBD;
  --color-line-header: rgba(0, 0, 0, 0.08);
  --color-line-footer: rgba(255, 255, 255, 0.06);
  --shadow-menu: 0 12px 24px rgba(0, 0, 0, 0.08);

  /* 상태 */
  --color-error: #FFB4AB;
  --color-error-bg: rgba(255, 180, 171, 0.12);
  --color-positive: #1F6F50;
  --color-neutral: #5F6670;
  --color-negative: #B03A2E;
  --color-track: #BDBDBD;

  /* 입력 */
  --color-input-bg: rgba(255, 255, 255, 0.06);
  --color-placeholder: rgba(255, 255, 255, 0.6);
  --color-focus-ring: rgba(255, 255, 255, 0.3);
  --color-hover-on-dark: rgba(255, 255, 255, 0.1);

  /* 히어로 배경 (이미지 대신 CSS 그라데이션) */
  --gradient-hero:
    linear-gradient(180deg, rgba(8, 22, 107, 0.35) 0%, rgba(30, 32, 48, 0.55) 100%),
    radial-gradient(ellipse 60% 50% at 78% 28%, rgba(214, 228, 245, 0.55) 0%, rgba(214, 228, 245, 0) 70%),
    radial-gradient(ellipse 45% 40% at 15% 85%, rgba(169, 186, 217, 0.3) 0%, rgba(169, 186, 217, 0) 70%),
    linear-gradient(135deg, #5D7BA6 0%, #3F5A8A 40%, #303F6A 70%, #1E2030 100%);
  --gradient-deep: linear-gradient(180deg, #1E2030 0%, #161821 100%);

  /* 글꼴 */
  --font-base: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Segoe UI', sans-serif;

  /* 글자 크기 */
  --fs-hero: clamp(2.5rem, 5.6vw, 4.75rem);
  --fs-section-title: clamp(2.25rem, 4.2vw, 3.5rem);
  --fs-lead: 1.125rem;
  --fs-body: 1rem;
  --fs-input: 1.0625rem;
  --fs-small: 0.875rem;
  --fs-caption: 0.8125rem;
  --fs-logo: 1.375rem;
  --fs-nav: 1.0625rem;
  --fs-card-title: 1.25rem;
  --fs-card-title-active: 1.5rem;
  --fs-confidence: 3rem;

  /* 레이아웃 */
  --header-height: 88px;
  --container-width: 1200px;
  --container-gutter: max(20px, 5vw);
  --section-padding: 140px;
  --timeline-gap: 56px;

  /* 모서리 (레퍼런스 특징: 왼쪽 위 + 오른쪽 아래만 둥글게) */
  --radius-card: 48px;
  --radius-input: 32px;
  --radius-chip: 12px;

  /* 움직임 */
  --duration-fast: 200ms;
  --duration-base: 300ms;
  --duration-slow: 450ms;
  --duration-bar: 600ms;
  --ease: cubic-bezier(0.22, 0.61, 0.36, 1);
}

@media (max-width: 767px) {
  :root {
    --header-height: 64px;
    --section-padding: 88px;
    --radius-card: 32px;
    --radius-input: 24px;
    --fs-logo: 1.125rem;
  }
}
```

### 2.1 색 사용 규칙과 대비(접근성)
| 토큰 | 값 | 쓰는 곳 | 배경 대비 |
|---|---|---|---|
| `--color-navy` | `#303F6A` | Analyze 배경, 활성 카드 제목·숫자·아이콘 | 흰 글자 10.3:1 |
| `--color-navy-deep` | `#08166B` | 흰 헤더의 로고 | 흰 배경 15.7:1 |
| `--color-charcoal` | `#292929` | Result 배경 | 흰 글자 14.6:1 |
| `--color-card-active` | `#DFDFDF` | 활성 카드 배경, 버튼 hover | 네이비 글자 7.7:1 |
| `--color-text-on-navy-muted` | `#A9BAD9` | 네이비 위 eyebrow·안내·글자 수 | 5.2:1 (레퍼런스 `#637B9F` 는 2.4:1 로 미달 → 보정, D-10) |
| `--color-text-on-charcoal-muted` | `#9E9E9E` | 차콜 위 eyebrow·한글 라벨·안내 | 5.4:1 |
| `--color-error` | `#FFB4AB` | 오류 테두리·아이콘·초과 글자 수 | 네이비 위 6.1:1 |
| `--color-positive` / `--color-neutral` / `--color-negative` | `#1F6F50` / `#5F6670` / `#B03A2E` | 신뢰도 막대 채움색 **만** | `#DFDFDF` 위 4.3~4.6:1 |

- 감정 구분은 **색 + 영문 제목 + 한글 라벨 + 표정 아이콘** 4가지로 한다. 색만으로 구분하지 않는다.

---

## 3. 타이포그래피

### 3.1 `public/css/fonts.css` — 사용자 제공 원본 (한 글자도 바꾸지 않음)
```css
/* Pretendard 웹폰트 — 사용자 제공 선언을 그대로 사용 (수정 금지) */
@font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Thin.woff2') format('woff2');
    font-weight: 100;
    font-display: swap;
}

@font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-ExtraLight.woff2') format('woff2');
    font-weight: 200;
    font-display: swap;
}

@font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Light.woff2') format('woff2');
    font-weight: 300;
    font-display: swap;
}

@font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Regular.woff2') format('woff2');
    font-weight: 400;
    font-display: swap;
}

@font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Medium.woff2') format('woff2');
    font-weight: 500;
    font-display: swap;
}

@font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-SemiBold.woff2') format('woff2');
    font-weight: 600;
    font-display: swap;
}

@font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Bold.woff2') format('woff2');
    font-weight: 700;
    font-display: swap;
}

@font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-ExtraBold.woff2') format('woff2');
    font-weight: 800;
    font-display: swap;
}

@font-face {
    font-family: 'Pretendard';
    src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/pretendard@1.0/Pretendard-Black.woff2') format('woff2');
    font-weight: 900;
    font-display: swap;
}

@font-face {
    font-family: 'PretendardVariable';
    src: url('https://cdn.jsdelivr.net/gh/Project-Noonnu/2611030106@font-variable-694/variable-694/PretendardVariable.woff2') format('woff2');
    font-weight: 45 930;
    font-display: swap;
}

/* 가변: font-family: 'PretendardVariable'; font-variation-settings: "wght" 400; */
```

- 화면 전체 글꼴은 `--font-base`(**'Pretendard'** 우선, 실패 시 시스템 글꼴) 하나만 사용합니다.
- `'PretendardVariable'` 은 선언만 유지하고 사용하지 않습니다.
- 실제로 쓰는 굵기: 400, 500, 600, 700, 800

### 3.2 글자 크기 표
| 용도 | 토큰 | 크기 | 굵기 | 줄 간격 | 기타 |
|---|---|---|---|---|---|
| 히어로 제목 | `--fs-hero` | 40 → 76px (화면 너비 따라) | 700 | 1.1 | 자간 -0.02em, 최대 너비 14ch |
| 섹션 제목 (ANALYZE 등) | `--fs-section-title` | 36 → 56px | 700 | 1.1 | 영문 대문자, 자간 -0.01em |
| eyebrow (MOODWAVE) | `--fs-caption` | 13px | 600 | — | 대문자, 자간 0.12em |
| 리드 문장 | `--fs-lead` | 18px | 400 | 1.75 | — |
| 본문 | `--fs-body` | 16px | 400 | 1.6 | — |
| 입력창 | `--fs-input` | 17px | 400 | 1.7 | — |
| 작은 글자 | `--fs-small` | 14px | 400~600 | — | 안내·라벨·글자 수 |
| 로고 | `--fs-logo` | 22px (모바일 18px) | 800 | — | 자간 0.28em |
| 메뉴 | `--fs-nav` | 17px | 500 | — | — |
| 카드 제목 | `--fs-card-title` | 20px → 활성 24px | 700 | 1.3 | — |
| 신뢰도 숫자 | `--fs-confidence` | 48px | 800 | 1.1 | 숫자 폭 고정(`tabular-nums`) |

- 본문 전체 `word-break: keep-all` (한국어 단어 중간에서 줄이 바뀌지 않게)

---

## 4. 레이아웃과 반응형

| 구간 | 너비 | 바뀌는 점 |
|---|---|---|
| 모바일 | **≤ 767px** | 헤더 64px, 섹션 위아래 여백 88px, 카드 모서리 32px, 결과 카드 세로 쌓기 + 타임라인 숨김, 푸터 가운데 정렬 |
| 태블릿 | 768 ~ 1023px | 햄버거 메뉴, Analyze 1단, 결과 카드는 가로 유지(간격 16px) |
| 데스크톱 | **≥ 1024px** | 메뉴 가로 표시(햄버거 숨김), Analyze 2단(5:7) |

- 콘텐츠 폭: `.container` = `min(1200px, 100% - 좌우 여백×2)`, 좌우 여백 `max(20px, 5vw)`
- 360px ~ 1920px 어디서도 **가로 스크롤이 생기면 안 됨** (NFR-05)
- 섹션 이동 시 고정 헤더에 가리지 않도록 `html { scroll-padding-top: var(--header-height); }`

---

## 5. 공통 스타일 — `style.css` 2장 (글자 그대로 작성)

```css
/* ===== 2. 기본 ===== */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  scroll-padding-top: var(--header-height);
  -webkit-text-size-adjust: 100%;
}

body {
  margin: 0;
  font-family: var(--font-base);
  font-size: var(--fs-body);
  line-height: 1.6;
  color: var(--color-ink);
  background: var(--color-deepest);
  word-break: keep-all;
  overflow-wrap: break-word;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, p, ul, ol {
  margin: 0;
}

ul, ol {
  padding: 0;
  list-style: none;
}

a {
  color: inherit;
  text-decoration: none;
}

svg {
  display: block;
}

button, textarea {
  font: inherit;
  color: inherit;
}

button {
  cursor: pointer;
}

:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}

[hidden] {
  display: none !important;
}

.container {
  width: min(var(--container-width), 100% - 2 * var(--container-gutter));
  margin-inline: auto;
}

.skip-link {
  position: absolute;
  top: -100px;
  left: 16px;
  z-index: 200;
  padding: 12px 20px;
  background: var(--color-white);
  color: var(--color-ink);
  font-weight: 600;
}

.skip-link:focus {
  top: 16px;
}
```

> ⚠️ `[hidden] { display: none !important; }` 는 꼭 필요합니다. 오류 박스처럼 `display: flex` 를 준 요소는 이 규칙이 없으면 `hidden` 속성을 붙여도 사라지지 않습니다.

---

## 6. 전체 마크업 — `public/index.html` (글자 그대로 작성)

> 🤖 **규칙:** id, class, `aria-*`, `role`, 문구를 바꾸지 않습니다. JS(`docs/03`)가 이 id 들로 요소를 찾습니다. SVG 아이콘은 이 파일에 직접 들어 있으며 JS 로 만들지 않습니다.

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MOODWAVE — AI 감성 분석</title>
  <meta name="description" content="문장을 입력하면 AI가 긍정·부정·중립을 판정하고 신뢰도와 판단 이유를 알려 드립니다.">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
  <link rel="stylesheet" href="/css/fonts.css">
  <link rel="stylesheet" href="/css/style.css">
  <script type="module" src="/js/main.js"></script>
</head>
<body>
  <a class="skip-link" href="#analyze">본문으로 바로가기</a>

  <!-- ===== Header ===== -->
  <header class="site-header" id="site-header">
    <div class="container site-header__inner">
      <a class="site-header__logo" href="#home">MOODWAVE</a>
      <nav class="site-nav" aria-label="주요 메뉴">
        <ul class="site-nav__list" id="site-nav-list">
          <li><a class="site-nav__link" href="#home">Home</a></li>
          <li><a class="site-nav__link" href="#analyze">Analyze</a></li>
          <li><a class="site-nav__link" href="#result">Result</a></li>
          <li><a class="site-nav__link" href="#about">About</a></li>
        </ul>
      </nav>
      <button class="menu-button" id="menu-button" type="button" aria-expanded="false" aria-controls="site-nav-list" aria-label="메뉴 열기">
        <svg class="menu-button__icon menu-button__icon--open" viewBox="0 0 32 24" aria-hidden="true" focusable="false">
          <path d="M2 3h28M12 12h18M2 21h28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <svg class="menu-button__icon menu-button__icon--close" viewBox="0 0 32 24" aria-hidden="true" focusable="false">
          <path d="M7 2l18 20M25 2L7 22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </header>

  <main id="main">
    <!-- ===== 1. Hero ===== -->
    <section class="hero" id="home" aria-labelledby="hero-title">
      <svg class="hero__waves" viewBox="0 0 1440 320" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path d="M0 200C240 140 480 140 720 200S1200 260 1440 200" fill="none" stroke="currentColor" stroke-width="1"/>
        <path d="M0 240C240 180 480 180 720 240S1200 300 1440 240" fill="none" stroke="currentColor" stroke-width="1"/>
        <path d="M0 280C240 220 480 220 720 280S1200 340 1440 280" fill="none" stroke="currentColor" stroke-width="1"/>
      </svg>
      <div class="container hero__inner">
        <h1 class="hero__title" id="hero-title">Read the mood of your words</h1>
        <p class="hero__text">문장 속에 담긴 감정을 AI가 긍정 · 부정 · 중립으로 읽어 드립니다.</p>
        <a class="text-link" href="#analyze">
          분석 시작하기
          <svg class="arrow-icon" viewBox="0 0 32 12" aria-hidden="true" focusable="false"><path d="M0 6h30M25 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
        </a>
      </div>
    </section>

    <!-- ===== 2. Analyze ===== -->
    <section class="section section--navy" id="analyze" aria-labelledby="analyze-title">
      <div class="container analyze">
        <div class="analyze__intro">
          <p class="eyebrow">MOODWAVE</p>
          <h2 class="section-title" id="analyze-title">ANALYZE</h2>
          <p class="section-text">분석하고 싶은 문장을 입력해 주세요.<br>AI가 문장의 감정을 판정하고, 그렇게 판단한 이유를 함께 알려 드립니다.</p>
          <ul class="analyze__tips">
            <li>최대 1,000자까지 입력할 수 있습니다.</li>
            <li><kbd>Ctrl</kbd> + <kbd>Enter</kbd> (Mac은 <kbd>⌘</kbd> + <kbd>Enter</kbd>)로 바로 분석할 수 있습니다.</li>
            <li>입력한 문장은 분석을 위해 OpenAI로 전송되며, 저장하지 않습니다.</li>
          </ul>
        </div>

        <form class="analyze-form" id="analyze-form" novalidate>
          <label class="analyze-form__label" for="text-input">분석할 문장</label>
          <textarea class="analyze-form__textarea" id="text-input" name="text" rows="8"
            placeholder="예) 오늘 처음 가 본 카페가 생각보다 훨씬 좋아서 기분이 좋아졌어요."
            aria-describedby="char-counter analyze-error-message"></textarea>
          <p class="char-counter" id="char-counter"><span id="char-count">0</span> / 1,000</p>

          <div class="examples" role="group" aria-labelledby="examples-label">
            <span class="examples__label" id="examples-label">예시 문장</span>
            <button class="chip" id="example-positive" type="button" data-example="positive">긍정 예시</button>
            <button class="chip" id="example-negative" type="button" data-example="negative">부정 예시</button>
            <button class="chip" id="example-neutral" type="button" data-example="neutral">중립 예시</button>
          </div>

          <div class="analyze-form__actions">
            <button class="button button--primary" id="analyze-button" type="submit">
              <span class="button__spinner" aria-hidden="true"></span>
              <span id="analyze-button-label">분석하기</span>
              <svg class="arrow-icon" viewBox="0 0 32 12" aria-hidden="true" focusable="false"><path d="M0 6h30M25 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
            </button>
            <button class="button button--ghost" id="clear-button" type="button">지우기</button>
          </div>

          <div class="error-box" id="analyze-error" role="alert" hidden>
            <svg class="error-box__icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              <circle cx="10" cy="10" r="8.5" fill="none" stroke="currentColor" stroke-width="1.5"/>
              <path d="M10 5.5v5.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
              <circle cx="10" cy="14.2" r="1" fill="currentColor"/>
            </svg>
            <p class="error-box__message" id="analyze-error-message"></p>
          </div>
        </form>
      </div>
    </section>

    <!-- ===== 3. Result ===== -->
    <section class="section section--charcoal" id="result" aria-labelledby="result-title">
      <div class="container">
        <p class="eyebrow eyebrow--muted">MOODWAVE</p>
        <h2 class="section-title" id="result-title" tabindex="-1">RESULT</h2>
        <p class="result-status" id="result-status" role="status">문장을 입력하고 분석하기를 누르면 결과가 여기에 표시됩니다.</p>

        <ol class="result-list" id="result-list">
          <li class="result-item" id="result-item-positive" data-sentiment="positive">
            <span class="result-item__dot" aria-hidden="true"></span>
            <article class="result-card" aria-labelledby="card-title-positive">
              <h3 class="result-card__title" id="card-title-positive">Positive<span class="result-card__label">긍정</span></h3>
              <div class="result-card__body" id="card-body-positive" hidden>
                <p class="result-card__meta">신뢰도</p>
                <p class="result-card__confidence"><span id="card-confidence-positive">0</span>%</p>
                <div class="confidence-bar" aria-hidden="true"><span class="confidence-bar__fill" id="card-bar-positive"></span></div>
                <p class="result-card__meta result-card__meta--reason">분석 이유</p>
                <p class="result-card__reason" id="card-reason-positive"></p>
              </div>
              <svg class="result-card__icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
                <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" stroke-width="2"/>
                <circle cx="23" cy="26" r="2.2" fill="currentColor"/>
                <circle cx="41" cy="26" r="2.2" fill="currentColor"/>
                <path d="M21 38c3 5 7 8 11 8s8-3 11-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </article>
          </li>
          <li class="result-item" id="result-item-neutral" data-sentiment="neutral">
            <span class="result-item__dot" aria-hidden="true"></span>
            <article class="result-card" aria-labelledby="card-title-neutral">
              <h3 class="result-card__title" id="card-title-neutral">Neutral<span class="result-card__label">중립</span></h3>
              <div class="result-card__body" id="card-body-neutral" hidden>
                <p class="result-card__meta">신뢰도</p>
                <p class="result-card__confidence"><span id="card-confidence-neutral">0</span>%</p>
                <div class="confidence-bar" aria-hidden="true"><span class="confidence-bar__fill" id="card-bar-neutral"></span></div>
                <p class="result-card__meta result-card__meta--reason">분석 이유</p>
                <p class="result-card__reason" id="card-reason-neutral"></p>
              </div>
              <svg class="result-card__icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
                <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" stroke-width="2"/>
                <circle cx="23" cy="26" r="2.2" fill="currentColor"/>
                <circle cx="41" cy="26" r="2.2" fill="currentColor"/>
                <path d="M22 41h20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </article>
          </li>
          <li class="result-item" id="result-item-negative" data-sentiment="negative">
            <span class="result-item__dot" aria-hidden="true"></span>
            <article class="result-card" aria-labelledby="card-title-negative">
              <h3 class="result-card__title" id="card-title-negative">Negative<span class="result-card__label">부정</span></h3>
              <div class="result-card__body" id="card-body-negative" hidden>
                <p class="result-card__meta">신뢰도</p>
                <p class="result-card__confidence"><span id="card-confidence-negative">0</span>%</p>
                <div class="confidence-bar" aria-hidden="true"><span class="confidence-bar__fill" id="card-bar-negative"></span></div>
                <p class="result-card__meta result-card__meta--reason">분석 이유</p>
                <p class="result-card__reason" id="card-reason-negative"></p>
              </div>
              <svg class="result-card__icon" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
                <circle cx="32" cy="32" r="26" fill="none" stroke="currentColor" stroke-width="2"/>
                <circle cx="23" cy="26" r="2.2" fill="currentColor"/>
                <circle cx="41" cy="26" r="2.2" fill="currentColor"/>
                <path d="M21 46c3-5 7-8 11-8s8 3 11 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </article>
          </li>
        </ol>

        <p class="result-note">※ 신뢰도는 AI가 스스로 평가한 확신 정도이며, 결과의 정확도를 보장하지 않습니다.</p>
      </div>
    </section>

    <!-- ===== 4. About ===== -->
    <section class="section section--deep about" id="about" aria-labelledby="about-title">
      <div class="container about__inner">
        <p class="eyebrow">MOODWAVE</p>
        <h2 class="section-title" id="about-title">ABOUT</h2>
        <p class="section-text about__text">MOODWAVE는 OpenAI API를 활용해 문장의 감정을 분석하는 서비스입니다.<br>입력한 문장은 분석을 위해 OpenAI로 전송되며, MOODWAVE는 이를 저장하지 않습니다.</p>
        <button class="button button--primary" id="again-button" type="button">
          새 문장 분석하기
          <svg class="arrow-icon" viewBox="0 0 32 12" aria-hidden="true" focusable="false"><path d="M0 6h30M25 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
        </button>
      </div>
    </section>
  </main>

  <!-- ===== Footer ===== -->
  <footer class="site-footer">
    <div class="container site-footer__inner">
      <p class="site-footer__logo">MOODWAVE</p>
      <p class="site-footer__copy">© 2026 MOODWAVE. All rights reserved. · Powered by OpenAI API</p>
    </div>
  </footer>
</body>
</html>
```

**`public/favicon.svg`** (글자 그대로 작성)
```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M8 0H32V24A8 8 0 0 1 24 32H0V8A8 8 0 0 1 8 0Z" fill="#303F6A"/><path d="M6 13c3.3-3.5 6.7-3.5 10 0s6.7 3.5 10 0" fill="none" stroke="#A9BAD9" stroke-width="2.4" stroke-linecap="round"/><path d="M6 20c3.3-3.5 6.7-3.5 10 0s6.7 3.5 10 0" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round"/></svg>
```

---

## 7. 컴포넌트 명세

### 7.1 버튼
| 종류 | 클래스 | 모양 | hover | 비활성(`disabled`) | 포커스 |
|---|---|---|---|---|---|
| 주 버튼 | `.button.button--primary` | 흰 배경, `--color-ink` 글자 16px/600, 높이 56px, 좌우 32px, **모서리 0**, 글자 + 화살표 간격 12px | 배경 `--color-card-active`, 화살표 오른쪽 6px 이동 | 불투명도 0.45, `not-allowed` | 흰 외곽선 2px, 간격 4px |
| 로딩 중 주 버튼 | `+ .button--loading` | 화살표 숨김, 16px 회전 원(테두리 2px, 오른쪽만 투명, 0.8초 1회전) + "분석 중…" | — | 불투명도 1, 커서 `progress` | — |
| 보조 버튼 | `.button.button--ghost` | 투명 배경, 흰 글자 16px/500, 좌우 12px | 밑줄 표시(간격 6px) | 불투명도 0.45 | 기본 |
| 텍스트 링크 | `.text-link` | 16px/600, 아래 테두리 1px, 아래 여백 6px, 화살표 간격 12px | 화살표 6px 이동 | — | 기본 |
| 예시 칩 | `.chip` | 높이 36px, 좌우 16px, 14px/500, 테두리 1px `--color-line-on-navy`, 모서리 `12px 0 12px 0` | 배경 `--color-hover-on-dark` | 불투명도 0.45 | 기본 |

- 화살표 아이콘(`.arrow-icon`): 32×12px, 선 두께 1.5 — 레퍼런스의 긴 화살표 `⟶`

### 7.2 헤더 (`.site-header`)
| 상태 | 조건 | 배경 | 글자 | 로고 |
|---|---|---|---|---|
| 투명 | 스크롤 0~80px | 투명 | 흰색 | 흰색 |
| 흰색 | 스크롤 80px 초과 → `.site-header--solid` | `#FFFFFF` + 아래 1px 그림자선 | `--color-ink` | `--color-navy-deep` |
| 메뉴 열림 | `.site-header--menu-open` | 흰색 (스크롤 무관) | `--color-ink` | `--color-navy-deep` |

- 위치 고정(`position: fixed`), 높이 `--header-height`, 배경·글자색 전환 300ms
- 내부: 3칸 그리드 `1fr auto 1fr` — 로고(왼쪽) / 메뉴(가운데) / 햄버거(오른쪽)
- 메뉴 링크: 간격 64px, hover·포커스 시 아래 1px 선이 왼쪽에서 오른쪽으로 펼쳐짐(300ms)
- **≤ 1023px:** 메뉴 목록 숨김, 햄버거(44×44px 터치 영역, 아이콘 32×24px) 표시. 열리면 헤더 바로 아래에 흰 패널(전체 너비)로 링크 세로 나열(글자 18px, 위아래 14px), 아이콘은 X 로 바뀜

### 7.3 Hero (`.hero`)
- 높이: `max(600px, 100svh)`, 내용 세로 가운데, 왼쪽 정렬
- 배경: `--gradient-hero` (이미지 사용 금지)
- 물결 장식(`.hero__waves`): 아래쪽 40% 높이, 흰 선 3개, 불투명도 0.18, 클릭 통과
- 안쪽 여백: 위 `헤더 높이 + 40px`, 아래 80px
- 설명 문장 위 간격 24px(색 `--color-text-hero-soft`), 링크 위 간격 48px

### 7.4 Analyze (`#analyze`)
| 요소 | 명세 |
|---|---|
| 배치 | 2단 그리드 `5fr 7fr`, 간격 80px, 위쪽 정렬 / ≤1023px 1단, 간격 48px |
| 안내 목록 `.analyze__tips` | 위 32px, 항목 간격 10px, 14px, 색 `--color-text-on-navy-muted`, 앞에 4px 원형 점 |
| `kbd` | 13px, 좌우 6px, 테두리 1px `--color-line-on-navy`, 모서리 4px |
| 라벨 | 16px/600, 아래 12px |
| 입력창 | 너비 100%, 최소 높이 240px, 안쪽 `24px 28px`, 17px/1.7, 흰 글자, 배경 `--color-input-bg`, 테두리 1px `--color-line-on-navy`, 모서리 `32px 0 32px 0`(모바일 24px), 세로로만 크기 조절 |
| 입력창 포커스 | 테두리 흰색 + 바깥 3px 링 `--color-focus-ring` (외곽선 대신) |
| 입력창 오류 (`aria-invalid="true"`) | 테두리 `--color-error` |
| 입력창 잠김 (`readonly`, 로딩 중) | 불투명도 0.7 |
| 글자 수 `.char-counter` | 위 10px, 오른쪽 정렬, 14px, 숫자 폭 고정 / 초과 시 `.char-counter--over` → `--color-error` + 600 |
| 예시 영역 | 위 16px, 줄바꿈 허용, 간격 세로 8px · 가로 10px, 라벨 14px muted |
| 버튼 영역 | 위 36px, 간격 16px, 줄바꿈 허용 |
| 오류 박스 `.error-box` | 위 24px, 안쪽 `16px 20px`, 배경 `--color-error-bg`, **왼쪽 테두리 3px** `--color-error`, 아이콘 20px(`--color-error`) + 문구 15px/1.6 흰색, 간격 12px |

### 7.5 Result (`#result`) — 레퍼런스 PROCESS 의 핵심 디자인
- 상태 문장 `.result-status`: 제목 아래 24px, 18px, `--color-text-on-charcoal-soft`
- 카드 목록: 위 72px, 가로 배치 간격 32px(태블릿 16px), 위쪽에 **타임라인 선**(1px, 불투명도 0.6) — 선과 카드 사이 `--timeline-gap`(56px)
- 각 카드 칸 위의 **점**: 지름 10px 회색, 카드 왼쪽 끝에서 6px 위치 / 활성 카드의 점은 **지름 30px 링(흰 테두리 1px) + 안쪽 10px 흰 점**
- 카드: 최소 높이 340px, 안쪽 `32px 28px 112px`, 테두리 1px `--color-line-on-charcoal`, **모서리 `48px 0 48px 0`**, 아이콘 64px 오른쪽 아래(28px 띄움)
- 활성 카드(`.result-item--active`): 폭 2배(`flex-grow: 2`, 450ms 전환), 배경 `--color-card-active`, 제목 24px 네이비, 라벨·아이콘 네이비, 본문 표시
- 활성 카드 본문: "신뢰도"(14px/600 `--color-ink-muted`) → 숫자 48px/800 네이비 + `%` → 막대(높이 8px, 바탕 `--color-track`, 채움 = 감정 색, 600ms 동안 0 → 목표) → "분석 이유"(위 24px) → 이유 문장(16px/1.7 `--color-ink`)
- 로딩 중(`aria-busy="true"`): 모든 카드 불투명도 0.4
- 안내 문구 `.result-note`: 위 40px, 14px muted
- **모바일(≤767px):** 세로 쌓기 간격 16px, 타임라인·점 숨김, 카드 최소 높이 없음·안쪽 24px, 아이콘 48px 오른쪽 위, 제목 오른쪽 64px 비움

아래 코드는 이 카드 디자인의 기준입니다(글자 그대로 작성).

```css
/* ===== 7. Result ===== */
.result-status {
  margin-top: 24px;
  font-size: var(--fs-lead);
  color: var(--color-text-on-charcoal-soft);
}

.result-list {
  position: relative;
  display: flex;
  gap: 32px;
  margin-top: 72px;
  padding-top: var(--timeline-gap);
}

/* 레퍼런스 PROCESS 섹션의 가로 타임라인 */
.result-list::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--color-line-on-charcoal);
  opacity: 0.6;
}

.result-item {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  transition: flex-grow var(--duration-slow) var(--ease);
}

.result-item--active {
  flex-grow: 2;
}

.result-item__dot {
  position: absolute;
  top: calc(-1 * var(--timeline-gap));
  left: 6px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-line-on-charcoal);
  transform: translate(-50%, -50%);
  transition: width var(--duration-base) var(--ease), height var(--duration-base) var(--ease), background-color var(--duration-base) var(--ease);
}

.result-item--active .result-item__dot {
  width: 30px;
  height: 30px;
  background: var(--color-charcoal);
  border: 1px solid var(--color-white);
}

.result-item--active .result-item__dot::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--color-white);
  transform: translate(-50%, -50%);
}

.result-card {
  position: relative;
  height: 100%;
  min-height: 340px;
  padding: 32px 28px 112px;
  color: var(--color-white);
  border: 1px solid var(--color-line-on-charcoal);
  border-radius: var(--radius-card) 0 var(--radius-card) 0;
  transition: background-color var(--duration-slow) var(--ease), border-color var(--duration-slow) var(--ease), color var(--duration-slow) var(--ease), opacity var(--duration-base) var(--ease);
}

.result-card__title {
  font-size: var(--fs-card-title);
  font-weight: 700;
  line-height: 1.3;
}

.result-card__label {
  display: block;
  margin-top: 4px;
  font-size: var(--fs-small);
  font-weight: 500;
  color: var(--color-text-on-charcoal-muted);
}

.result-card__icon {
  position: absolute;
  right: 28px;
  bottom: 28px;
  width: 64px;
  height: 64px;
}

.result-card__body {
  margin-top: 28px;
}

.result-card__meta {
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--color-ink-muted);
}

.result-card__meta--reason {
  margin-top: 24px;
}

.result-card__confidence {
  margin-top: 4px;
  font-size: var(--fs-confidence);
  font-weight: 800;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
  color: var(--color-navy);
}

.confidence-bar {
  height: 8px;
  margin-top: 12px;
  overflow: hidden;
  background: var(--color-track);
}

.confidence-bar__fill {
  display: block;
  width: 0;
  height: 100%;
  background: var(--card-accent);
  transition: width var(--duration-bar) var(--ease);
}

.result-item[data-sentiment='positive'] {
  --card-accent: var(--color-positive);
}

.result-item[data-sentiment='neutral'] {
  --card-accent: var(--color-neutral);
}

.result-item[data-sentiment='negative'] {
  --card-accent: var(--color-negative);
}

.result-card__reason {
  margin-top: 8px;
  line-height: 1.7;
  color: var(--color-ink);
}

.result-item--active .result-card {
  color: var(--color-ink);
  background: var(--color-card-active);
  border-color: var(--color-card-active);
}

.result-item--active .result-card__title {
  font-size: var(--fs-card-title-active);
  color: var(--color-navy);
}

.result-item--active .result-card__label,
.result-item--active .result-card__icon {
  color: var(--color-navy);
}

.result-list[aria-busy='true'] .result-card {
  opacity: 0.4;
}

.result-note {
  margin-top: 40px;
  font-size: var(--fs-small);
  color: var(--color-text-on-charcoal-muted);
}

@media (max-width: 1023px) {
  .result-list {
    gap: 16px;
  }

  .result-card {
    padding: 28px 20px 100px;
  }

  .result-card__icon {
    right: 20px;
    bottom: 24px;
    width: 56px;
    height: 56px;
  }
}

@media (max-width: 767px) {
  .result-list {
    flex-direction: column;
    gap: 16px;
    margin-top: 40px;
    padding-top: 0;
  }

  .result-list::before,
  .result-item__dot {
    display: none;
  }

  .result-card {
    min-height: 0;
    padding: 24px;
  }

  .result-card__title {
    padding-right: 64px;
  }

  .result-card__icon {
    top: 24px;
    right: 24px;
    bottom: auto;
    width: 48px;
    height: 48px;
  }
}
```

### 7.6 About (`#about`) · Footer
| 요소 | 명세 |
|---|---|
| About 배경 | `--gradient-deep` |
| About 위아래 여백 | `섹션 여백 + 20px` |
| About 정렬 | 세로 가운데 정렬, 글자 가운데 |
| About 문장 | 최대 너비 680px, `--color-text-on-deep-soft` |
| About 버튼 | 위 48px, 주 버튼 |
| Footer | 배경 `--color-deepest`, 위 테두리 1px `--color-line-footer`, 위아래 32px, 양 끝 정렬(모바일: 세로·가운데) |
| Footer 로고 | 15px/800, 자간 0.28em, 흰색 |
| Footer 문구 | 13px, `--color-text-footer` |

---

## 8. 상태별 화면 요약

| 상태 | 분석 버튼 | 입력창·칩·지우기·새 문장 버튼 | 결과 상태 문장 | 카드 | 오류 박스 |
|---|---|---|---|---|---|
| 처음(idle) | "분석하기" + 화살표 | 사용 가능 | 문장을 입력하고 분석하기를 누르면 결과가 여기에 표시됩니다. | 3장 모두 기본 | 숨김 |
| 1,000자 초과 | 비활성 | 사용 가능 | (변화 없음) | (변화 없음) | TEXT_TOO_LONG 문구 |
| 로딩(loading) | 회전 원 + "분석 중…" (비활성) | 잠김 | AI가 문장을 분석하고 있습니다… | 3장 기본 + 흐리게(0.4) | 숨김 |
| 성공(success) | "분석하기" | 사용 가능 | 분석이 완료되었습니다. 이 문장은 ‘긍정’으로 판정되었습니다. | 해당 1장 활성 | 숨김 |
| 실패(error) | "분석하기" | 사용 가능 | 분석하지 못했습니다. 위쪽 입력 영역의 안내 메시지를 확인해 주세요. | 3장 모두 기본 | 오류 코드 문구 |

---

## 9. 움직임

| 대상 | 효과 | 시간 |
|---|---|---|
| 헤더 배경·글자색 | 전환 | 300ms |
| 메뉴 링크 밑줄 | 왼→오 펼침 | 300ms |
| 화살표 | 오른쪽 6px 이동 | 200ms |
| 활성 카드 폭·배경 | 전환 | 450ms |
| 타임라인 점 → 링 | 크기 전환 | 300ms |
| 신뢰도 막대 | 0 → 목표 너비 | 600ms |
| 로딩 회전 원 | 회전 | 0.8초/회 |
| 섹션 이동 스크롤 | 부드럽게 | 브라우저 기본 |

- 그 밖의 애니메이션(등장 효과, 패럴랙스, 자동 슬라이드 등)은 **추가하지 않습니다.**
- 사용자가 "움직임 줄이기"를 켰다면 모두 즉시 바뀝니다(아래 코드, 글자 그대로 작성).

```css
/* ===== 10. 움직임 줄이기 설정 존중 ===== */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. 접근성 체크리스트
- [ ] `<html lang="ko">`, 제목 구조 h1(히어로 1개) → h2(섹션) → h3(카드)
- [ ] "본문으로 바로가기" 링크: Tab 첫 번째에서 화면 왼쪽 위에 나타남
- [ ] 입력창에 보이는 `<label>` 연결, `aria-describedby` 로 글자 수·오류 문구 연결
- [ ] 오류 박스 `role="alert"`, 결과 상태 문장 `role="status"`
- [ ] 장식 SVG 는 모두 `aria-hidden="true" focusable="false"`
- [ ] 햄버거 버튼 `aria-expanded` / `aria-controls` / `aria-label`("메뉴 열기" ↔ "메뉴 닫기")
- [ ] 키보드 포커스가 모든 버튼·링크·입력창에서 보임
- [ ] 2.1절 대비 기준 충족

---

## 11. 완료 기준 (Phase 3)
- [ ] 6장 마크업과 2·5장·7.5·9장 코드가 글자 그대로 있다
- [ ] 7장 명세 수치와 실제 화면이 일치한다 (개발자 도구로 확인)
- [ ] 360 / 768 / 1280 / 1920px 에서 가로 스크롤 없음
- [ ] `docs/reference/target-*.png` 와 배치·색·모서리 모양이 같다
- [ ] 이미지 파일(png, jpg, webp 등)이 `public/` 에 없다
- [ ] 글꼴이 Pretendard 로 보인다 (개발자 도구 → Elements → Computed → Rendered Fonts)
