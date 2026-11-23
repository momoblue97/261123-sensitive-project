// 목(Mock) 모드: OpenAI 를 부르지 않고 규칙에 따른 가짜 결과를 만든다. 개발·검증 전용.
import { MOCK_DELAY_MS } from './constants.js';
import { AppError } from './errors.js';
import { normalizeResult } from './openai-client.js';

const POSITIVE_KEYWORDS = ['좋', '행복', '최고', '감사', '사랑', '기쁘', '만족'];
const NEGATIVE_KEYWORDS = ['싫', '나쁘', '최악', '화가', '화나', '슬프', '실망', '짜증'];

// 문장에 이 표시가 들어 있으면 해당 오류를 흉내 낸다.
const ERROR_TRIGGERS = [
  ['[timeout]', 'AI_TIMEOUT'],
  ['[ratelimit]', 'RATE_LIMITED'],
  ['[quota]', 'AI_QUOTA_EXCEEDED'],
  ['[error]', 'AI_UNAVAILABLE'],
  ['[refuse]', 'AI_REFUSED'],
  ['[invalid]', 'AI_INVALID_RESPONSE'],
  ['[config]', 'SERVER_CONFIG_ERROR'],
];

// 운영 배포(VERCEL_ENV=production)에서는 MOCK_AI 값과 관계없이 항상 꺼진다.
export function isMockEnabled(env) {
  return env.MOCK_AI === 'true' && env.VERCEL_ENV !== 'production';
}

export async function mockSentiment(text, delayMs = MOCK_DELAY_MS) {
  await new Promise((resolve) => setTimeout(resolve, delayMs));

  const trigger = ERROR_TRIGGERS.find(([keyword]) => text.includes(keyword));
  if (trigger) {
    throw new AppError(trigger[1], 'mock_trigger');
  }

  const hasPositive = POSITIVE_KEYWORDS.some((keyword) => text.includes(keyword));
  const hasNegative = NEGATIVE_KEYWORDS.some((keyword) => text.includes(keyword));

  if (hasPositive && !hasNegative) {
    return normalizeResult({ sentiment: 'positive', confidence: 90, reason: '[테스트 모드] 긍정적인 표현이 포함되어 있어 긍정으로 판단했습니다.' });
  }
  if (hasNegative && !hasPositive) {
    return normalizeResult({ sentiment: 'negative', confidence: 88, reason: '[테스트 모드] 부정적인 표현이 포함되어 있어 부정으로 판단했습니다.' });
  }
  return normalizeResult({ sentiment: 'neutral', confidence: 60, reason: '[테스트 모드] 뚜렷한 감정 표현이 없어 중립으로 판단했습니다.' });
}
