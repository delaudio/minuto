#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const WATCH_DIRS = ['./content', './templates', './static', './styles'];

let building = false;
let needsRebuild = false;

function build() {
  if (building) {
    needsRebuild = true;
    return;
  }

  building = true;
  console.log('\n🔄 Rebuilding...');

  const buildProcess = spawn('node', ['build.js'], { stdio: 'inherit' });

  buildProcess.on('close', (code) => {
    building = false;
    if (code === 0) {
      console.log('✅ Ready');
    }
    if (needsRebuild) {
      needsRebuild = false;
      build();
    }
  });
}

function watchDir(dir) {
  if (!fs.existsSync(dir)) return;

  let debounceTimer;
  const watcher = fs.watch(dir, { recursive: true }, (eventType, filename) => {
    if (filename) {
      // Ignore temporary editor files and hidden files
      if (filename.startsWith('.') ||
          filename.endsWith('~') ||
          filename.endsWith('.swp') ||
          filename.includes('.tmp')) {
        return;
      }

      // Debounce to avoid multiple rapid rebuilds
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        console.log(`📝 Changed: ${path.join(dir, filename)}`);
        build();
      }, 100);
    }
  });

  console.log(`👀 Watching: ${dir}`);
  return watcher;
}

// Initial build
build();

// Watch directories
WATCH_DIRS.forEach(watchDir);

// Start server
console.log('🚀 Starting server...');
const serverProcess = spawn('node', ['serve.js'], { stdio: 'inherit' });

// Cleanup on exit
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  serverProcess.kill();
  process.exit(0);
});
