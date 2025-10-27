#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Example content showcasing Minuto features
const examples = {
  // Tailwind config
  'tailwind.config.js': `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './content/**/*.{md,html}',
    './templates/**/*.hbs',
    './build/**/*.html'
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
`,

  // Main Tailwind CSS file
  'styles/main.css': `@import "tailwindcss";
`,

  // Default template with Alpine.js and Tailwind
  'templates/default.hbs': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <link rel="stylesheet" href="/styles.css">
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body class="bg-gray-50 text-gray-900">
  {{> header}}

  <main class="container mx-auto px-4 py-8 max-w-4xl">
    <article class="prose prose-lg mx-auto">
      {{{content}}}
    </article>
  </main>

  {{> footer}}
</body>
</html>
`,

  // Blog post template
  'templates/blog.hbs': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <meta name="description" content="{{description}}">
  <link rel="stylesheet" href="/styles.css">
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body class="bg-gray-50 text-gray-900">
  {{> header}}

  <main class="container mx-auto px-4 py-8 max-w-3xl">
    <article class="bg-white rounded-lg shadow-sm p-8">
      <header class="mb-8">
        <h1 class="text-4xl font-bold mb-2">{{title}}</h1>
        <div class="text-gray-600 text-sm">
          <time datetime="{{date}}">{{date}}</time>
          {{#if author}}
          <span class="mx-2">•</span>
          <span>By {{author}}</span>
          {{/if}}
        </div>
      </header>

      <div class="prose prose-lg max-w-none">
        {{{content}}}
      </div>
    </article>
  </main>

  {{> footer}}
</body>
</html>
`,

  // Header partial with Alpine.js navigation
  'templates/partials/header.hbs': `<header class="bg-white shadow-sm" x-data="{ open: false }">
  <nav class="container mx-auto px-4 py-4">
    <div class="flex items-center justify-between">
      <a href="/" class="text-2xl font-bold text-blue-600">Minuto</a>

      <!-- Mobile menu button -->
      <button @click="open = !open" class="md:hidden">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path x-show="!open" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          <path x-show="open" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>

      <!-- Desktop menu -->
      <ul class="hidden md:flex space-x-6">
        <li><a href="/" class="hover:text-blue-600">Home</a></li>
        <li><a href="/about.html" class="hover:text-blue-600">About</a></li>
        <li><a href="/blog.html" class="hover:text-blue-600">Blog</a></li>
      </ul>
    </div>

    <!-- Mobile menu -->
    <ul x-show="open" x-transition class="md:hidden mt-4 space-y-2">
      <li><a href="/" class="block hover:text-blue-600">Home</a></li>
      <li><a href="/about.html" class="block hover:text-blue-600">About</a></li>
      <li><a href="/blog.html" class="block hover:text-blue-600">Blog</a></li>
    </ul>
  </nav>
</header>
`,

  // Footer partial
  'templates/partials/footer.hbs': `<footer class="bg-gray-800 text-white mt-16">
  <div class="container mx-auto px-4 py-8">
    <div class="text-center">
      <p class="text-gray-400">Built with Minuto • A minimal static site generator</p>
    </div>
  </div>
</footer>
`,

  // Homepage
  'content/index.md': `---
title: Welcome to Minuto
template: default
---

# Welcome to Minuto

A **minimal static site generator** with markdown, Handlebars, Alpine.js, and Tailwind CSS support.

## Features

- 📝 **Markdown content** with frontmatter
- 🎨 **Tailwind CSS** styling (v4)
- ⚡ **Alpine.js** for interactivity
- 🧩 **Handlebars** templates with partials
- 🗺️ **Automatic sitemap** generation
- 🔥 **Hot reload** dev server

<div x-data="{ count: 0 }" class="p-6 bg-blue-50 rounded-lg my-8">
  <p class="text-lg mb-4">Alpine.js counter example:</p>
  <div class="flex items-center gap-4">
    <button @click="count--" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">-</button>
    <span x-text="count" class="text-2xl font-bold min-w-[2rem] text-center"></span>
    <button @click="count++" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">+</button>
  </div>
</div>

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Serve built site
npm run serve
\`\`\`
`,

  // About page
  'content/about.md': `---
title: About Minuto
template: default
---

# About

Minuto is a minimal static site generator designed for simplicity and speed.

## Why Minuto?

- **Convention over configuration** - sensible defaults out of the box
- **Minimal dependencies** - just the essentials
- **Fast builds** - optimized for quick iteration
- **Modern stack** - Tailwind v4 + Alpine.js 3

## Project Structure

\`\`\`
project/
├── content/          # Markdown and HTML files
├── templates/        # Handlebars templates
│   └── partials/     # Reusable template components
├── styles/           # Tailwind CSS entry point
├── static/           # Static assets (images, fonts, etc.)
└── build/            # Generated site (git-ignored)
\`\`\`
`,

  // Blog listing page
  'content/blog.md': `---
title: Blog
template: default
---

# Blog

- [First Post](/blog/first-post.html) - Getting started with Minuto
- [Advanced Features](/blog/advanced-features.html) - Partials, frontmatter, and more
`,

  // Blog post 1
  'content/blog/first-post.md': `---
title: Getting Started with Minuto
date: 2024-01-15
author: Minuto Team
template: blog
description: Learn how to create your first static site with Minuto
---

Welcome to your first blog post! This example shows how to use frontmatter to set metadata.

## Frontmatter

The metadata at the top of this file (between \`---\` markers) is called frontmatter:

\`\`\`yaml
---
title: Getting Started with Minuto
date: 2024-01-15
author: Minuto Team
template: blog
description: Learn how to create your first static site
---
\`\`\`

You can access these values in your templates using Handlebars syntax like \`{{title}}\` or \`{{author}}\`.

## Markdown Features

All standard markdown features work:

- **Bold** and *italic* text
- [Links](https://github.com)
- Code blocks (see above)
- And more!

## Alpine.js Integration

<div x-data="{ shown: false }" class="my-6">
  <button @click="shown = !shown" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
    Toggle Message
  </button>
  <p x-show="shown" x-transition class="mt-4 p-4 bg-green-50 rounded">
    🎉 Alpine.js works great with Minuto!
  </p>
</div>
`,

  // Blog post 2
  'content/blog/advanced-features.md': `---
title: Advanced Features
date: 2024-01-20
author: Minuto Team
template: blog
description: Explore advanced Minuto features like partials and custom templates
---

## Partials

Minuto supports Handlebars partials for reusable components. Check out the header and footer on this page - they're partials!

Create partials in \`templates/partials/\` and use them with \`{{> partialName}}\`.

### Nested Partials

You can even organize partials in subdirectories:

\`\`\`
templates/partials/
├── header.hbs
├── footer.hbs
└── components/
    ├── card.hbs
    └── button.hbs
\`\`\`

Use them with: \`{{> components/card}}\`

## Custom Templates

Each content file can specify which template to use via frontmatter:

\`\`\`yaml
---
template: blog
---
\`\`\`

This post uses the \`blog\` template, which includes extra styling for articles.

## Tailwind CSS

Minuto uses Tailwind v4 with automatic class detection. Just use Tailwind classes in your markdown:

<div class="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
  <div class="p-6 bg-blue-100 rounded-lg">
    <h3 class="font-bold text-lg mb-2">Feature 1</h3>
    <p class="text-gray-700">Responsive grid layout</p>
  </div>
  <div class="p-6 bg-purple-100 rounded-lg">
    <h3 class="font-bold text-lg mb-2">Feature 2</h3>
    <p class="text-gray-700">Beautiful colors</p>
  </div>
  <div class="p-6 bg-pink-100 rounded-lg">
    <h3 class="font-bold text-lg mb-2">Feature 3</h3>
    <p class="text-gray-700">Easy to customize</p>
  </div>
</div>

## What's Next?

Explore the codebase to see how everything works. Minuto is designed to be simple and hackable!
`,

  // Static assets example
  'static/.gitkeep': '',

  // README
  '.gitignore': `node_modules/
build/
.DS_Store
`,

  'README.md': `# My Minuto Site

A static site built with [Minuto](https://github.com/yourusername/minuto).

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start dev server
npm run dev
\`\`\`

Visit http://localhost:3000

## Commands

- \`npm run dev\` - Start dev server with hot reload
- \`npm run build\` - Build for production
- \`npm run serve\` - Serve production build

## Project Structure

- \`content/\` - Markdown and HTML files
- \`templates/\` - Handlebars templates
- \`templates/partials/\` - Reusable components
- \`styles/\` - Tailwind CSS
- \`static/\` - Static assets
- \`build/\` - Generated output
`
};

function init() {
  console.log('🎬 Initializing Minuto project...\n');

  // Check if project already has content
  if (fs.existsSync('./content') || fs.existsSync('./templates')) {
    console.log('⚠️  Warning: content/ or templates/ already exists.');
    console.log('This will create example files but won\'t overwrite existing ones.\n');
  }

  let filesCreated = 0;
  let filesSkipped = 0;

  // Create all example files
  for (const [filePath, content] of Object.entries(examples)) {
    const fullPath = path.join(process.cwd(), filePath);
    const dir = path.dirname(fullPath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Only create file if it doesn't exist
    if (!fs.existsSync(fullPath)) {
      fs.writeFileSync(fullPath, content);
      console.log(`  ✓ Created ${filePath}`);
      filesCreated++;
    } else {
      console.log(`  ⊘ Skipped ${filePath} (already exists)`);
      filesSkipped++;
    }
  }

  console.log(`\n✨ Initialization complete!`);
  console.log(`   Created ${filesCreated} files`);
  if (filesSkipped > 0) {
    console.log(`   Skipped ${filesSkipped} files (already existed)`);
  }

  console.log('\n📦 Next steps:');
  console.log('   1. npm install');
  console.log('   2. npm run dev');
  console.log('   3. Open http://localhost:3000\n');
}

init();
