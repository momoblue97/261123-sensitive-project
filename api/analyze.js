// Vercel 서버리스 함수 진입점: POST /api/analyze
// 실제 처리는 lib/analyze-handler.js 에 있다 (로컬 개발 서버와 테스트가 같은 코드를 쓰도록).
import { handleAnalyze } from '../lib/analyze-handler.js';

export default {
  fetch(request) {
    return handleAnalyze(request);
  },
};
