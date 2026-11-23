// DOM 요소를 찾고 화면을 그리는 함수 모음.
import {
  BUTTON_LABELS,
  ERROR_MESSAGES,
  SENTIMENT_LABELS,
  SENTIMENTS,
  successMessage,
} from './constants.js';

export function getElements() {
  const ids = [
    'site-header',
    'menu-button',
    'analyze-form',
    'text-input',
    'char-counter',
    'char-count',
    'example-positive',
    'example-negative',
    'example-neutral',
    'analyze-button',
    'analyze-button-label',
    'clear-button',
    'analyze-error',
    'analyze-error-message',
    'analyze',
    'result',
    'result-title',
    'result-status',
    'result-list',
    'again-button',
  ];

  const el = {};
  for (const id of ids) {
    const node = document.getElementById(id);
    if (!node) {
      throw new Error(`#${id} 요소를 찾을 수 없습니다. index.html 의 id 를 확인하세요.`);
    }
    el[id] = node;
  }

  el.cards = {};
  for (const s of SENTIMENTS) {
    const item = document.getElementById(`result-item-${s}`);
    const body = document.getElementById(`card-body-${s}`);
    const confidence = document.getElementById(`card-confidence-${s}`);
    const bar = document.getElementById(`card-bar-${s}`);
    const reason = document.getElementById(`card-reason-${s}`);

    if (!item || !body || !confidence || !bar || !reason) {
      throw new Error(`결과 카드 #${s} 요소를 찾을 수 없습니다.`);
    }
    el.cards[s] = { item, body, confidence, bar, reason };
  }

  return el;
}

export function renderCounter(el, count, isOver) {
  el['char-count'].textContent = count.toLocaleString('ko-KR');
  if (isOver) {
    el['char-counter'].classList.add('char-counter--over');
  } else {
    el['char-counter'].classList.remove('char-counter--over');
  }
}

export function showError(el, code) {
  const msg = ERROR_MESSAGES[code] || ERROR_MESSAGES.INTERNAL_ERROR;
  el['analyze-error-message'].textContent = msg;
  el['analyze-error'].hidden = false;

  if (code === 'EMPTY_TEXT' || code === 'TEXT_TOO_LONG') {
    el['text-input'].setAttribute('aria-invalid', 'true');
  } else {
    el['text-input'].removeAttribute('aria-invalid');
  }
}

export function hideError(el) {
  el['analyze-error'].hidden = true;
  el['analyze-error-message'].textContent = '';
  el['text-input'].removeAttribute('aria-invalid');
}

export function setBusy(el, isBusy) {
  el['analyze-button'].disabled = isBusy;
  if (isBusy) {
    el['analyze-button'].classList.add('button--loading');
    el['analyze-button-label'].textContent = BUTTON_LABELS.loading;
  } else {
    el['analyze-button'].classList.remove('button--loading');
    el['analyze-button-label'].textContent = BUTTON_LABELS.idle;
  }

  el['text-input'].readOnly = isBusy;
  el['clear-button'].disabled = isBusy;
  el['again-button'].disabled = isBusy;
  el['example-positive'].disabled = isBusy;
  el['example-negative'].disabled = isBusy;
  el['example-neutral'].disabled = isBusy;

  el['result-list'].setAttribute('aria-busy', isBusy ? 'true' : 'false');
}

export function renderStatus(el, message) {
  el['result-status'].textContent = message;
}

export function resetCards(el) {
  for (const s of SENTIMENTS) {
    const card = el.cards[s];
    card.item.classList.remove('result-item--active');
    card.body.hidden = true;
    card.confidence.textContent = '0';
    card.bar.style.width = '0%';
    card.reason.textContent = '';
  }
}

export function renderResult(el, result) {
  resetCards(el);

  const { sentiment, confidence, reason } = result;
  const card = el.cards[sentiment];
  if (!card) return;

  card.item.classList.add('result-item--active');
  card.body.hidden = false;
  card.confidence.textContent = String(confidence);
  card.reason.textContent = reason;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      card.bar.style.width = `${confidence}%`;
    });
  });

  const label = SENTIMENT_LABELS[sentiment] || sentiment;
  renderStatus(el, successMessage(label));
}
