// 로컬 개발 전용 서버 (배포에는 쓰이지 않음).
// 1) public/ 폴더의 정적 파일을 보여 주고  2) /api/analyze 요청을 Vercel 과 같은 방식(api/analyze.js)으로 처리한다.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import analyzeFunction from '../api/analyze.js';

const PUBLIC_DIR = fileURLToPath(new URL('../public/', import.meta.url));
const PORT = Number(process.env.PORT) || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const API_ROUTES = {
  '/api/analyze': analyzeFunction,
};

// Node.js 요청(req)을 Web 표준 Request 로 바꿔 Vercel 함수와 같은 형태로 호출한다.
async function handleApi(req, res, apiFunction) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === 'string') {
      headers.set(key, value);
    }
  }
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const request = new Request(`http://localhost:${PORT}${req.url}`, {
    method: req.method,
    headers,
    body: hasBody ? Buffer.concat(chunks) : undefined,
  });
  const response = await apiFunction.fetch(request);
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(Buffer.from(await response.arrayBuffer()));
}

async function serveStatic(pathname, res) {
  const relativePath = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
  const filePath = normalize(join(PUBLIC_DIR, relativePath));
  // public/ 바깥 파일(예: /../.env)은 절대 보여 주지 않는다.
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }
  try {
    const data = await readFile(filePath);
    const contentType = MIME_TYPES[extname(filePath)] ?? 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-store' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  }
}

const server = createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, `http://localhost:${PORT}`);
    const decodedPath = decodeURIComponent(pathname);
    if (API_ROUTES[decodedPath]) {
      await handleApi(req, res, API_ROUTES[decodedPath]);
      return;
    }
    if (decodedPath.startsWith('/api/')) {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: false, error: { code: 'INVALID_REQUEST', message: '존재하지 않는 API 입니다.' } }));
      return;
    }
    await serveStatic(decodedPath, res);
  } catch (error) {
    console.error('[dev-server] 요청 처리 실패:', error?.name ?? 'UnknownError');
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`MOODWAVE 개발 서버 실행 중 → http://localhost:${PORT}`);
  console.log(`OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? '설정됨' : '없음 (MOCK_AI=true 로 테스트하거나 .env 에 키를 넣으세요)'}`);
  console.log(`MOCK_AI: ${process.env.MOCK_AI === 'true' ? '켜짐 (가짜 결과)' : '꺼짐 (실제 OpenAI 호출)'}`);
  console.log('종료하려면 Ctrl + C');
});
