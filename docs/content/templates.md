---
title: Template Reference
layout: default
---

# Template Reference

## Handlebars Basics

Minuto uses [Handlebars](https://handlebarsjs.com/) for templating.

### Variables

Access front matter and built-in variables:

```handlebars
<h1>{{title}}</h1>
<p>{{description}}</p>
```

### Content

The markdown content is available as `{{{content}}}` (triple braces for unescaped HTML):

```handlebars
<article>
    {{{content}}}
</article>
```

### Partials

Include reusable components:

```handlebars
{{> header}}
{{> navigation}}
{{{content}}}
{{> footer}}
```

Partials are loaded from `templates/partials/`.

## Available Variables

### Built-in Variables

- `{{{content}}}` - Rendered markdown content (HTML)
- `{{title}}` - Page title from front matter
- Any custom front matter variables

### Example

Given this front matter:

```yaml
---
title: About Us
author: Jane Doe
date: 2024-01-15
---
```

You can use:

```handlebars
<article>
    <h1>{{title}}</h1>
    <p class="meta">By {{author}} on {{date}}</p>
    {{{content}}}
</article>
```

## Template Examples

### Blog Post Template

Create `templates/post.hbs`:

```handlebars
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}} - My Blog</title>
    <link rel="stylesheet" href="/styles/main.css">
</head>
<body class="bg-gray-50">
    {{> header}}

    <main class="max-w-3xl mx-auto px-4 py-8">
        <article class="bg-white rounded-lg shadow-md p-8">
            <h1 class="text-4xl font-bold mb-4">{{title}}</h1>

            {{#if author}}
            <div class="text-gray-600 mb-6">
                By {{author}}
                {{#if date}}on {{date}}{{/if}}
            </div>
            {{/if}}

            <div class="prose max-w-none">
                {{{content}}}
            </div>
        </article>
    </main>

    {{> footer}}
</body>
</html>
```

### Documentation Template

Create `templates/docs.hbs`:

```handlebars
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}} - Documentation</title>
    <link rel="stylesheet" href="/styles/main.css">
</head>
<body class="flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-100 min-h-screen p-6">
        {{> sidebar}}
    </aside>

    <!-- Main content -->
    <main class="flex-1 p-8">
        <article class="prose max-w-none">
            <h1>{{title}}</h1>
            {{{content}}}
        </article>
    </main>
</body>
</html>
```

## Partials Examples

### Header Partial

`templates/partials/header.hbs`:

```handlebars
<header class="bg-blue-600 text-white">
    <div class="max-w-6xl mx-auto px-4 py-4">
        <nav class="flex items-center justify-between">
            <a href="/" class="text-2xl font-bold">My Site</a>
            <div class="space-x-4">
                <a href="/" class="hover:underline">Home</a>
                <a href="/about.html" class="hover:underline">About</a>
                <a href="/blog.html" class="hover:underline">Blog</a>
            </div>
        </nav>
    </div>
</header>
```

### Footer Partial

`templates/partials/footer.hbs`:

```handlebars
<footer class="bg-gray-800 text-white mt-12">
    <div class="max-w-6xl mx-auto px-4 py-8">
        <div class="text-center">
            <p>&copy; 2024 My Site. Built with Minuto.</p>
        </div>
    </div>
</footer>
```

## Best Practices

1. **Use partials** for repeated elements (header, footer, navigation)
2. **Keep templates simple** - complex logic belongs in your build process
3. **Use Tailwind classes** for styling instead of custom CSS when possible
4. **Organize partials** by function (layout/, components/, etc.)
5. **Document custom variables** in your front matter

## Next Steps

- [Usage Guide](usage.html)
- [Examples](examples/)
