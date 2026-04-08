# Changelog

All notable changes to this project will be documented in this file.

## [0.0.7] - 2026-04-09

### Added

- Native `data/` directory support for `.json`, `.yaml`, and `.yml` files exposed as `site.data`
- `collections/` manifests for collection-driven page generation from structured data
- Watch mode support for `data/` and `collections/`
- Test coverage and documentation for structured data and collection pages

## [0.0.1] - 2025-10-27

### Added

- Initial release of Minuto
- Markdown to HTML conversion with markdown-it
- Frontmatter support with gray-matter
- Handlebars templating with partial support
- Static file copying
- Automatic sitemap generation
- Development server with file watching
- Production server for built sites
- HTML file support alongside markdown
- CLI with build, serve, and dev commands
- **Tailwind CSS v4 integration with automatic compilation**
- Tailwind auto-detection from styles directory
- Watch mode for Tailwind CSS in development
- Comprehensive test suite
- Alpine.js ready

### Features

- Zero configuration required
- Convention over configuration philosophy
- Nested directory support
- Custom frontmatter fields
- Multiple template support
- Automatic Tailwind CSS compilation
- Build-time CSS optimization
