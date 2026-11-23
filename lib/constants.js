// 서버에서 쓰는 고정값 모음. 값은 docs/04-api-spec.md 2장 표와 반드시 같아야 한다.
export const MAX_TEXT_LENGTH = 1000;
export const MAX_BODY_BYTES = 16384;
export const MAX_REASON_LENGTH = 300;
export const OPENAI_API_URL = 'https://api.openai.com/v1/responses';
export const DEFAULT_OPENAI_MODEL = 'gpt-6-luna';
export const OPENAI_TIMEOUT_MS = 20000;
export const OPENAI_MAX_OUTPUT_TOKENS = 1000;
export const OPENAI_REASONING_EFFORT = 'low';
export const MOCK_DELAY_MS = 800;
export const SENTIMENTS = ['positive', 'neutral', 'negative'];
export const SENTIMENT_LABELS = { positive: '긍정', neutral: '중립', negative: '부정' };
