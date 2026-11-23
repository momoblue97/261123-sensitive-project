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
