---
title: Installation
layout: default
---

# Installation

## Prerequisites

- Node.js 18 or higher
- npm or bun

## Global Installation

Install Minuto globally to use the CLI from anywhere:

```bash
npm install -g minuto
```

## Using npx (Recommended)

No installation needed - use npx to run Minuto commands directly:

```bash
npx minuto init my-site
```

## Project Setup

After creating a new project:

```bash
# Navigate to your project
cd my-site

# Install dependencies
npm install

# Start development server
npm run dev
```

## Verification

Verify the installation:

```bash
minuto --version
```

## Troubleshooting

### Permission Issues

If you encounter permission errors during global installation:

```bash
# Use npx instead (no installation required)
npx minuto init my-site

# Or fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### Node Version

Check your Node.js version:

```bash
node --version
```

If you need to upgrade, visit [nodejs.org](https://nodejs.org/) or use a version manager like [nvm](https://github.com/nvm-sh/nvm).

## Next Steps

- [Usage Guide](usage.html)
- [Template Reference](templates.html)
