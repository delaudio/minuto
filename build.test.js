import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const TEST_DIR = path.join(import.meta.dir, 'test-fixtures');
const TEST_BUILD_DIR = path.join(TEST_DIR, 'build');

describe('Build Script', () => {
  beforeAll(() => {
    // Create test fixtures
    if (!fs.existsSync(TEST_DIR)) {
      fs.mkdirSync(TEST_DIR, { recursive: true });
    }

    // Create test content
    fs.mkdirSync(path.join(TEST_DIR, 'content'), { recursive: true });
    fs.writeFileSync(
      path.join(TEST_DIR, 'content', 'test.md'),
      `---
title: Test Page
date: 2024-01-01
template: default
---

# Hello World

This is a test.`
    );

    // Create test template
    fs.mkdirSync(path.join(TEST_DIR, 'templates'), { recursive: true });
    fs.writeFileSync(
      path.join(TEST_DIR, 'templates', 'default.hbs'),
      `<!DOCTYPE html>
<html>
<head><title>{{title}}</title></head>
<body>{{{content}}}</body>
</html>`
    );

    // Create test static file
    fs.mkdirSync(path.join(TEST_DIR, 'static'), { recursive: true });
    fs.writeFileSync(
      path.join(TEST_DIR, 'static', 'style.css'),
      'body { margin: 0; }'
    );
  });

  afterAll(() => {
    // Clean up test fixtures
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true });
    }
  });

  test('should create build directory', () => {
    // Run build with test fixtures
    const buildScript = path.join(import.meta.dir, 'build.js');
    const originalCwd = process.cwd();

    try {
      process.chdir(TEST_DIR);
      execSync(`node ${buildScript}`, {
        env: { ...process.env },
        cwd: TEST_DIR
      });
    } finally {
      process.chdir(originalCwd);
    }

    expect(fs.existsSync(TEST_BUILD_DIR)).toBe(true);
  });

  test('should process markdown files', () => {
    const outputFile = path.join(TEST_BUILD_DIR, 'test.html');
    expect(fs.existsSync(outputFile)).toBe(true);

    const content = fs.readFileSync(outputFile, 'utf8');
    expect(content).toContain('<title>Test Page</title>');
    expect(content).toContain('<h1>Hello World</h1>');
  });

  test('should copy static files', () => {
    const staticFile = path.join(TEST_BUILD_DIR, 'style.css');
    expect(fs.existsSync(staticFile)).toBe(true);

    const content = fs.readFileSync(staticFile, 'utf8');
    expect(content).toBe('body { margin: 0; }');
  });

  test('should generate sitemap', () => {
    const sitemapFile = path.join(TEST_BUILD_DIR, 'sitemap.xml');
    expect(fs.existsSync(sitemapFile)).toBe(true);

    const content = fs.readFileSync(sitemapFile, 'utf8');
    expect(content).toContain('<?xml version="1.0"');
    expect(content).toContain('<loc>');
  });

  test('should register partials from subdirectories', () => {
    // Create test partial in subdirectory
    const partialsDir = path.join(TEST_DIR, 'templates', 'partials');
    const blogDir = path.join(partialsDir, 'blog');
    fs.mkdirSync(blogDir, { recursive: true });
    fs.writeFileSync(
      path.join(blogDir, 'header.hbs'),
      '<header>Blog Header</header>'
    );
    fs.writeFileSync(
      path.join(partialsDir, 'footer.hbs'),
      '<footer>Footer</footer>'
    );

    // Create content that uses the partial
    fs.writeFileSync(
      path.join(TEST_DIR, 'content', 'partial-test.md'),
      `---
title: Partial Test
template: with-partial
---

Test content`
    );

    // Create template that uses partials
    fs.writeFileSync(
      path.join(TEST_DIR, 'templates', 'with-partial.hbs'),
      `<!DOCTYPE html>
<html>
<head><title>{{title}}</title></head>
<body>
{{> blog/header}}
{{{content}}}
{{> footer}}
</body>
</html>`
    );

    // Run build
    const buildScript = path.join(import.meta.dir, 'build.js');
    const originalCwd = process.cwd();

    try {
      process.chdir(TEST_DIR);
      execSync(`node ${buildScript}`, {
        env: { ...process.env },
        cwd: TEST_DIR
      });
    } finally {
      process.chdir(originalCwd);
    }

    // Check output includes both partials
    const outputFile = path.join(TEST_BUILD_DIR, 'partial-test.html');
    expect(fs.existsSync(outputFile)).toBe(true);

    const content = fs.readFileSync(outputFile, 'utf8');
    expect(content).toContain('<header>Blog Header</header>');
    expect(content).toContain('<footer>Footer</footer>');
  });
});
