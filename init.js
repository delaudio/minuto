#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
let targetDir = process.cwd();
let templateName = 'default';

// Parse directory and template options
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--template' && args[i + 1]) {
    templateName = args[i + 1];
    i++;
  } else if (!args[i].startsWith('-')) {
    targetDir = path.resolve(process.cwd(), args[i]);
  }
}

const validTemplates = ['default', 'blog', 'portfolio', 'docs'];
if (!validTemplates.includes(templateName)) {
  console.error(`❌ Error: Invalid template "${templateName}"`);
  console.error(`   Valid templates: ${validTemplates.join(', ')}`);
  process.exit(1);
}

function copyRecursive(src, dest, stats) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyRecursive(srcPath, destPath, stats);
    } else {
      if (!fs.existsSync(destPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`  ✓ Created ${path.relative(targetDir, destPath)}`);
        stats.filesCreated++;
      } else {
        console.log(`  ⊘ Skipped ${path.relative(targetDir, destPath)} (already exists)`);
        stats.filesSkipped++;
      }
    }
  }
}

function init() {
  console.log(`🎬 Initializing Minuto project with "${templateName}" template...\n`);

  // Create target directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    console.log(`  ✓ Created directory: ${targetDir}\n`);
  }

  // Find template source directory
  const templateSrc = path.join(__dirname, 'templates', templateName);

  // Check if template exists
  if (!fs.existsSync(templateSrc)) {
    console.error(`❌ Error: Template directory not found: ${templateSrc}`);
    console.error('   Please ensure templates are installed correctly.');
    process.exit(1);
  }

  // Check if project already has content
  const contentExists = fs.existsSync(path.join(targetDir, 'content'));
  const templatesExists = fs.existsSync(path.join(targetDir, 'templates'));

  if (contentExists || templatesExists) {
    console.log('⚠️  Warning: content/ or templates/ already exists.');
    console.log('This will create example files but won\'t overwrite existing ones.\n');
  }

  const stats = { filesCreated: 0, filesSkipped: 0 };

  // Copy template files
  copyRecursive(templateSrc, targetDir, stats);

  console.log(`\n✨ Initialization complete!`);
  console.log(`   Template: ${templateName}`);
  console.log(`   Created ${stats.filesCreated} files`);
  if (stats.filesSkipped > 0) {
    console.log(`   Skipped ${stats.filesSkipped} files (already existed)`);
  }

  console.log('\n📦 Next steps:');
  if (targetDir !== process.cwd()) {
    console.log(`   1. cd ${path.relative(process.cwd(), targetDir)}`);
    console.log('   2. npm install');
    console.log('   3. npm run dev');
  } else {
    console.log('   1. npm install');
    console.log('   2. npm run dev');
  }
  console.log('   4. Open http://localhost:3000\n');
}

init();
