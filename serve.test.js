import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const PORT = 3001; // Use different port for testing
const TEST_BUILD_DIR = path.join(import.meta.dir, 'test-build');

describe('Serve Script', () => {
  let serverProcess;

  beforeAll(async () => {
    // Create test build directory
    fs.mkdirSync(TEST_BUILD_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(TEST_BUILD_DIR, 'index.html'),
      '<html><body><h1>Test</h1></body></html>'
    );
    fs.writeFileSync(
      path.join(TEST_BUILD_DIR, 'style.css'),
      'body { margin: 0; }'
    );

    // Start server on different port
    const code = `
const http = require('http');
const fs = require('fs');
const path = require('path');
const BUILD_DIR = '${TEST_BUILD_DIR}';
const PORT = ${PORT};
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
};
const server = http.createServer((req, res) => {
  let filePath = path.join(BUILD_DIR, req.url === '/' ? 'index.html' : req.url);
  if (!path.extname(filePath)) filePath += '.html';
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});
server.listen(PORT, () => console.log('Test server started'));
`;

    serverProcess = spawn('bun', ['-e', code]);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for server to start
  });

  afterAll(() => {
    // Clean up
    serverProcess.kill();
    if (fs.existsSync(TEST_BUILD_DIR)) {
      fs.rmSync(TEST_BUILD_DIR, { recursive: true });
    }
  });

  test('should serve HTML files', async () => {
    const res = await fetch(`http://localhost:${PORT}/`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/html');

    const data = await res.text();
    expect(data).toContain('<h1>Test</h1>');
  });

  test('should serve CSS files', async () => {
    const res = await fetch(`http://localhost:${PORT}/style.css`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('text/css');
  });

  test('should return 404 for missing files', async () => {
    const res = await fetch(`http://localhost:${PORT}/nonexistent.html`);
    expect(res.status).toBe(404);
  });

  test('should handle URLs without extension', async () => {
    const res = await fetch(`http://localhost:${PORT}/index`);
    expect(res.status).toBe(200);
  });
});
