# Minuto

A minimal static site generator for markdown content with Alpine.js and Tailwind support.

Convention over configuration. Just create content and it works.

## Installation

```bash
npm install minuto
```

Or use directly with npx:

```bash
npx minuto build
```

## Quick Start

### Option 1: Start with examples

```bash
# Create new project
mkdir my-site && cd my-site
npm init -y
npm install minuto

# Initialize with example content
npx minuto init

# Install dependencies and start
npm install
npm run dev
```

### Option 2: Start from scratch

```bash
# Install
npm install minuto

# Create your content structure
mkdir -p content templates static

# Start development server (watches for changes)
npx minuto dev

# Build for production
npx minuto build

# Serve built site
npx minuto serve
```

## Commands

- `minuto init` - Initialize a new project with example content
- `minuto build` - Build the static site
- `minuto serve` - Serve the built site locally (http://localhost:3000)
- `minuto dev` - Watch for changes and rebuild automatically + serve

## Directory Structure

```
.
├── content/          # Your markdown files
│   └── index.md
├── templates/        # Handlebars templates
│   ├── default.hbs
│   └── partials/    # Optional partials
├── styles/          # Tailwind CSS source (optional)
│   └── main.css
├── static/          # CSS, JS, images (copied as-is)
│   └── script.js
└── build/           # Generated site (created on build)
```

## Writing Content

Create `.md` files in the `content/` directory with frontmatter:

```markdown
---
title: My Post Title
date: 2025-10-26
template: default
---

# Your content here

Write your post in **Markdown**!
```

### Frontmatter Options

- `title`: Page title
- `date`: Publication date
- `template`: Template name (without .hbs extension, defaults to "default")
- Any custom fields you want to use in your templates

## Templates

Create `.hbs` files in the `templates/` directory. Use `{{{content}}}` (triple braces) for the rendered markdown HTML.

Available variables:
- `{{{content}}}` - Rendered markdown HTML
- `{{title}}` - From frontmatter
- `{{date}}` - From frontmatter
- Any custom frontmatter fields

### Partials

Create reusable template parts in `templates/partials/`:

```handlebars
<!-- templates/partials/header.hbs -->
<header>
  <nav>...</nav>
</header>
```

Use in templates:
```handlebars
{{> header}}
```

## Static Assets

Put your CSS, JavaScript, images, etc. in the `static/` directory. They'll be copied to the build output as-is.

## Features

- ✅ Markdown to HTML conversion
- ✅ Frontmatter support (YAML)
- ✅ Handlebars templates with partials
- ✅ Automatic static file copying
- ✅ Nested content directories
- ✅ Development server with auto-rebuild
- ✅ Automatic sitemap generation
- ✅ HTML files support (alongside markdown)
- ✅ Zero configuration needed
- ✅ Alpine.js ready
- ✅ Tailwind CSS v4 with automatic compilation

## Tailwind CSS v4 Support

Minuto has built-in support for Tailwind CSS v4 with automatic compilation during build.

### Setup Tailwind

1. Create a `styles/main.css` file:

```css
@import "tailwindcss";

/* Your custom CSS here */
```

2. Minuto will automatically:
   - Detect your Tailwind CSS file
   - Compile it during `minuto build`
   - Watch for changes in `minuto dev` mode
   - Output to `build/styles.css`

3. Include the compiled CSS in your templates:

```html
<!-- templates/default.hbs -->
<!DOCTYPE html>
<html>
<head>
  <title>{{title}}</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  {{{content}}}
</body>
</html>
```

### Tailwind Configuration

Tailwind v4 uses CSS-based configuration. Add your custom theme in your CSS file:

```css
@import "tailwindcss";

@theme {
  --color-primary: #3b82f6;
  --font-display: "Inter", sans-serif;
}

/* Your custom utilities */
@utility tab-* {
  tab-size: *;
}
```

### Supported Entry Points

Minuto looks for Tailwind CSS in these locations (in order):
- `styles/main.css`
- `styles/styles.css`
- `styles/tailwind.css`
- `tailwind.css`
- `styles/index.css`

Any file containing `@import "tailwindcss"` will be detected and compiled.

## Alpine.js

For interactivity, include Alpine.js from CDN:

```html
<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
```

Then use Alpine directives in your templates or markdown:

```html
<div x-data="{ open: false }">
  <button @click="open = !open">Toggle</button>
  <div x-show="open">Content</div>
</div>
```

## Package.json Integration

Add to your project's `package.json`:

```json
{
  "scripts": {
    "build": "minuto build",
    "serve": "minuto serve",
    "dev": "minuto dev"
  },
  "devDependencies": {
    "minuto": "^0.0.1"
  }
}
```

Then run:
```bash
npm run dev
```

## Dependencies

Only 4 runtime dependencies:
- `markdown-it` - Markdown parser
- `handlebars` - Template engine
- `gray-matter` - Frontmatter parser
- `commander` - CLI framework

Dev dependency (optional - only needed if using Tailwind):
- `@tailwindcss/cli` - Tailwind CSS v4 compiler

## Philosophy

Convention over configuration. No config files, no complex build systems, just a simple compiler that turns markdown into beautiful static sites.

Perfect for:
- Blogs
- Documentation sites
- Landing pages
- Portfolio sites
- Any content-focused website

## License

MIT
