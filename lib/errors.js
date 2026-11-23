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
