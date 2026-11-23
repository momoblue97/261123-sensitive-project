// 화면 진입점: 상태 관리, 이벤트 연결 및 순서 제어
import { requestAnalysis } from './api.js';
import {
  EXAMPLE_TEXTS,
  MAX_TEXT_LENGTH,
  STATUS_MESSAGES,
} from './constants.js';
import { initHeader } from './header.js';
import {
  getElements,
  hideError,
  renderCounter,
  renderResult,
  renderStatus,
  resetCards,
  setBusy,
  showError,
} from './ui.js';

const state = {
  status: 'idle', // 'idle' | 'loading' | 'success' | 'error'
  errorCode: null,
};

let el;

function setError(code) {
  state.errorCode = code;
  showError(el, code);
}

function clearError() {
  state.errorCode = null;
  hideError(el);
}

function syncInputState() {
  const value = el['text-input'].value;
  const count = Array.from(value).length;
  const isOver = count > MAX_TEXT_LENGTH;

  renderCounter(el, count, isOver);
  el['analyze-button'].disabled = (state.status === 'loading') || isOver;

  return isOver;
}

function handleInput() {
  const isOver = syncInputState();
  if (isOver) {
    setError('TEXT_TOO_LONG');
  } else if (state.errorCode === 'EMPTY_TEXT' || state.errorCode === 'TEXT_TOO_LONG') {
    clearError();
  }
}

async function analyze() {
  if (state.status === 'loading') {
    return;
  }

  const rawValue = el['text-input'].value;
  if (Array.from(rawValue).length > MAX_TEXT_LENGTH) {
    setError('TEXT_TOO_LONG');
    el['text-input'].focus();
    return;
  }

  const text = rawValue.trim();
  if (text.length === 0) {
    setError('EMPTY_TEXT');
    el['text-input'].focus();
    return;
  }

  clearError();
  state.status = 'loading';
  resetCards(el);
  renderStatus(el, STATUS_MESSAGES.loading);
  setBusy(el, true);

  const response = await requestAnalysis(text);
  setBusy(el, false);

  if (response.ok) {
    state.status = 'success';
    renderResult(el, response.data);
    el['result-title'].focus({ preventScroll: true });
    el.result.scrollIntoView({ block: 'start' });
  } else {
    state.status = 'error';
    renderStatus(el, STATUS_MESSAGES.error);
    setError(response.code);
    el['text-input'].focus();
  }

  syncInputState();
}

function resetAll() {
  el['text-input'].value = '';
  clearError();
  state.status = 'idle';
  resetCards(el);
  renderStatus(el, STATUS_MESSAGES.idle);
  syncInputState();
}

document.addEventListener('DOMContentLoaded', () => {
  el = getElements();
  initHeader(el);
  syncInputState();

  el['analyze-form'].addEventListener('submit', (event) => {
    event.preventDefault();
    analyze();
  });

  el['text-input'].addEventListener('input', handleInput);

  el['text-input'].addEventListener('keydown', (event) => {
    if (event.isComposing) return;
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      analyze();
    }
  });

  const chips = [el['example-positive'], el['example-negative'], el['example-neutral']];
  for (const chip of chips) {
    chip.addEventListener('click', () => {
      const type = chip.dataset.example;
      if (EXAMPLE_TEXTS[type]) {
        el['text-input'].value = EXAMPLE_TEXTS[type];
        clearError();
        syncInputState();
        el['text-input'].focus();
      }
    });
  }

  el['clear-button'].addEventListener('click', () => {
    resetAll();
    el['text-input'].focus();
  });

  el['again-button'].addEventListener('click', () => {
    resetAll();
    el.analyze.scrollIntoView({ block: 'start' });
    el['text-input'].focus({ preventScroll: true });
  });
});
