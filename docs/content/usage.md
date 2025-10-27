---
title: Usage Guide
layout: default
---

# Usage Guide

## Project Structure

A typical Minuto project looks like this:

```
my-site/
├── content/          # Your markdown files
│   ├── index.md
│   └── about.md
├── templates/        # Handlebars templates
│   ├── default.hbs
│   └── partials/
│       ├── header.hbs
│       └── footer.hbs
├── static/           # Static assets (copied as-is)
│   ├── images/
│   └── script.js
├── styles/           # CSS files (Tailwind input)
│   └── main.css
├── build/            # Generated site (gitignored)
└── package.json
```

## Creating Content

Create markdown files in the `content/` directory:

```markdown
---
title: My Page
layout: default
---

# Welcome

This is my content.
```

### Front Matter

Front matter is YAML metadata at the top of your markdown files:

- `title` - Page title
- `layout` - Template to use (defaults to "default")
- Custom variables - Available in templates as `{{variableName}}`

## Templates

Templates use Handlebars syntax. Create them in `templates/`:

```handlebars
<!DOCTYPE html>
<html>
<head>
    <title>{{title}}</title>
    <link rel="stylesheet" href="/styles/main.css">
</head>
<body>
    {{> header}}

    <main>
        {{{content}}}
    </main>

    {{> footer}}
</body>
</html>
```

### Partials

Create reusable components in `templates/partials/`:

```handlebars
<!-- templates/partials/header.hbs -->
<header>
    <nav>
        <a href="/">Home</a>
        <a href="/about.html">About</a>
    </nav>
</header>
```

## Styling

Minuto includes Tailwind CSS. Add utility classes to your templates:

```handlebars
<div class="max-w-4xl mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold mb-4">{{title}}</h1>
    {{{content}}}
</div>
```

Customize Tailwind in `styles/main.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Your custom styles */
.prose {
    @apply max-w-none;
}
```

## Development

Start the development server:

```bash
npm run dev
```

This will:
- Build your site
- Start a local server at `http://localhost:3000`
- Watch for changes and rebuild automatically
- Live reload in the browser

## Building for Production

Generate the production site:

```bash
npm run build
```

The built site is in the `build/` directory, ready to deploy.

## Deployment

Deploy the `build/` directory to any static hosting:

- **Netlify**: Drag and drop the `build/` folder
- **Vercel**: `vercel --prod`
- **GitHub Pages**: Push `build/` to `gh-pages` branch
- **Any HTTP server**: Copy `build/` contents

## Next Steps

- [Template Reference](templates.html)
- [Examples](examples/)
