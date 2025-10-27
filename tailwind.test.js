import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const TEST_DIR = path.join(import.meta.dir, 'test-tailwind');
const TEST_BUILD_DIR = path.join(TEST_DIR, 'build');
const TEST_STYLES_DIR = path.join(TEST_DIR, 'styles');

describe('Tailwind CSS Integration', () => {
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
title: Tailwind Test
template: default
---

<div class="text-blue-500 font-bold">Tailwind works!</div>`
    );

    // Create test template
    fs.mkdirSync(path.join(TEST_DIR, 'templates'), { recursive: true });
    fs.writeFileSync(
      path.join(TEST_DIR, 'templates', 'default.hbs'),
      `<!DOCTYPE html>
<html>
<head>
  <title>{{title}}</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>{{{content}}}</body>
</html>`
    );

    // Create Tailwind CSS file
    fs.mkdirSync(TEST_STYLES_DIR, { recursive: true });
    fs.writeFileSync(
      path.join(TEST_STYLES_DIR, 'main.css'),
      '@import "tailwindcss";\n'
    );
  });

  afterAll(() => {
    // Clean up test fixtures
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true });
    }
  });

  test('should detect and compile Tailwind CSS', () => {
    const buildScript = path.join(import.meta.dir, 'build.js');
    const originalCwd = process.cwd();

    try {
      process.chdir(TEST_DIR);
      const output = execSync(`node ${buildScript}`, {
        env: { ...process.env },
        cwd: TEST_DIR,
        encoding: 'utf8'
      });

      // Check that Tailwind compilation was triggered
      expect(output).toContain('Compiling Tailwind CSS');
      expect(output).toContain('Compiled Tailwind CSS');
    } finally {
      process.chdir(originalCwd);
    }
  });

  test('should generate compiled CSS file', () => {
    const outputCss = path.join(TEST_BUILD_DIR, 'styles.css');
    expect(fs.existsSync(outputCss)).toBe(true);

    const content = fs.readFileSync(outputCss, 'utf8');
    // Check for Tailwind CSS output
    expect(content).toContain('tailwindcss');
    expect(content.length).toBeGreaterThan(1000); // Should have substantial content
  });

  test('should include Tailwind classes in compiled CSS', () => {
    const outputCss = path.join(TEST_BUILD_DIR, 'styles.css');
    const content = fs.readFileSync(outputCss, 'utf8');

    // Check for classes used in our test content
    expect(content).toContain('text-blue-500');
    expect(content).toContain('font-bold');
  });

  test('should link to compiled CSS in HTML', () => {
    const outputHtml = path.join(TEST_BUILD_DIR, 'test.html');
    expect(fs.existsSync(outputHtml)).toBe(true);

    const content = fs.readFileSync(outputHtml, 'utf8');
    expect(content).toContain('<link rel="stylesheet" href="/styles.css">');
  });
});
