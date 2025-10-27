#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const MarkdownIt = require('markdown-it');
const Handlebars = require('handlebars');
const matter = require('gray-matter');

// Initialize markdown parser
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
});

// Directories (convention over configuration)
const CONTENT_DIR = './content';
const TEMPLATES_DIR = './templates';
const PARTIALS_DIR = './templates/partials';
const STATIC_DIR = './static';
const BUILD_DIR = './build';
const STYLES_DIR = './styles';

// Ensure build directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Copy directory recursively
function copyDir(src, dest) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Register partials recursively
function registerPartials(dir = PARTIALS_DIR, basePath = '') {
  if (!fs.existsSync(dir)) {
    return;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Recursively register partials in subdirectories
      const newBasePath = basePath ? `${basePath}/${entry.name}` : entry.name;
      registerPartials(fullPath, newBasePath);
    } else if (entry.name.endsWith('.hbs')) {
      // Register partial with namespaced name if in subdirectory
      const partialName = basePath
        ? `${basePath}/${path.basename(entry.name, '.hbs')}`
        : path.basename(entry.name, '.hbs');

      const partialSource = fs.readFileSync(fullPath, 'utf8');
      Handlebars.registerPartial(partialName, partialSource);
      console.log(`  ✓ Registered partial: ${partialName}`);
    }
  });
}

// Load and compile template
function loadTemplate(name) {
  const templatePath = path.join(TEMPLATES_DIR, `${name}.hbs`);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${name}`);
  }
  const templateSource = fs.readFileSync(templatePath, 'utf8');
  return Handlebars.compile(templateSource);
}

// Process markdown file
function processMarkdown(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const { data, content: markdownContent } = matter(content);
  
  // Convert markdown to HTML
  const html = md.render(markdownContent);
  
  return {
    frontmatter: data,
    content: html,
    ...data
  };
}

// Get all content files recursively (markdown and HTML)
function getContentFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getContentFiles(filePath, fileList);
    } else if (path.extname(file) === '.md' || path.extname(file) === '.html') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Legacy function name for compatibility
function getMarkdownFiles(dir, fileList = []) {
  return getContentFiles(dir, fileList);
}

// Generate sitemap.xml
function generateSitemap(urls, baseUrl = 'https://example.com') {
  const now = new Date().toISOString().split('T')[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  urls.forEach(({ url, lastmod, priority }) => {
    xml += '  <url>\n';
    xml += `    <loc>${baseUrl}${url}</loc>\n`;
    xml += `    <lastmod>${lastmod || now}</lastmod>\n`;
    xml += `    <priority>${priority || '0.5'}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
}

// Compile Tailwind CSS
function compileTailwind() {
  // Look for Tailwind CSS entry point
  const possibleEntryPoints = [
    path.join(STYLES_DIR, 'main.css'),
    path.join(STYLES_DIR, 'styles.css'),
    path.join(STYLES_DIR, 'tailwind.css'),
    './tailwind.css',
    './styles/index.css'
  ];

  let inputFile = null;
  for (const file of possibleEntryPoints) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      // Check if it imports tailwindcss
      if (content.includes('@import "tailwindcss"') || content.includes("@import 'tailwindcss'")) {
        inputFile = file;
        break;
      }
    }
  }

  if (!inputFile) {
    return false; // No Tailwind CSS found
  }

  console.log('🎨 Compiling Tailwind CSS...');

  try {
    const outputFile = path.join(BUILD_DIR, 'styles.css');

    // Use npx to run tailwindcss CLI with content scanning
    // Tailwind v4 scans for classes automatically, but we need to specify the paths
    // Include templates (with partials), content, and build output
    execSync(`npx tailwindcss -i ${inputFile} -o ${outputFile} --minify --content "./templates/**/*.hbs" --content "./content/**/*.{md,html}" --content "./build/**/*.html"`, {
      stdio: 'inherit'
    });
    console.log(`  ✓ Compiled Tailwind CSS to styles.css`);
    return true;
  } catch (error) {
    console.error('  ❌ Tailwind compilation failed:', error.message);
    return false;
  }
}

// Build site
function build() {
  console.log('🔨 Building site...');

  // Register partials first
  if (fs.existsSync(PARTIALS_DIR)) {
    console.log('🧩 Registering partials...');
    registerPartials();
  }

  // Clean and create build directory
  if (fs.existsSync(BUILD_DIR)) {
    fs.rmSync(BUILD_DIR, { recursive: true });
  }
  ensureDir(BUILD_DIR);
  
  // Copy static files first
  if (fs.existsSync(STATIC_DIR)) {
    console.log('📁 Copying static files...');
    copyDir(STATIC_DIR, BUILD_DIR);
  }

  // Compile Tailwind CSS (this will overwrite build/styles.css if it exists)
  const hasTailwind = compileTailwind();

  // If both static/styles.css and Tailwind exist, append static CSS to compiled Tailwind
  if (hasTailwind) {
    const staticStyles = path.join(STATIC_DIR, 'styles.css');
    const buildStyles = path.join(BUILD_DIR, 'styles.css');

    if (fs.existsSync(staticStyles)) {
      console.log('  📎 Appending static/styles.css to Tailwind output');
      const staticCss = fs.readFileSync(staticStyles, 'utf8');
      const tailwindCss = fs.readFileSync(buildStyles, 'utf8');

      // Combine: Tailwind first, then custom CSS
      fs.writeFileSync(buildStyles, tailwindCss + '\n\n/* Custom CSS from static/styles.css */\n' + staticCss);
    }
  }

  // Process content files (markdown and HTML)
  const sitemapUrls = [];

  if (fs.existsSync(CONTENT_DIR)) {
    console.log('📝 Processing content files...');
    const contentFiles = getContentFiles(CONTENT_DIR);

    contentFiles.forEach(filePath => {
      const ext = path.extname(filePath);

      if (ext === '.html') {
        // Process HTML files - copy as-is or optionally process with frontmatter
        const content = fs.readFileSync(filePath, 'utf8');
        const relativePath = path.relative(CONTENT_DIR, filePath);
        const outputPath = path.join(BUILD_DIR, relativePath);

        // Ensure output directory exists
        ensureDir(path.dirname(outputPath));

        // Write file as-is
        fs.writeFileSync(outputPath, content);
        console.log(`  ✓ ${relativePath} → ${path.relative(BUILD_DIR, outputPath)}`);

        // Add to sitemap
        const url = '/' + relativePath.replace(/\\/g, '/');
        const priority = url === '/index.html' ? '1.0' : url.includes('/blog/') ? '0.8' : '0.7';
        sitemapUrls.push({
          url: url === '/index.html' ? '/' : url.replace('.html', ''),
          lastmod: new Date().toISOString().split('T')[0],
          priority
        });
      } else if (ext === '.md') {
        // Process markdown files
        const data = processMarkdown(filePath);

        // Determine template (from frontmatter or default to 'default')
        const templateName = data.template || 'default';
        const template = loadTemplate(templateName);

        // Generate HTML
        const html = template(data);

        // Determine output path
        const relativePath = path.relative(CONTENT_DIR, filePath);
        const outputPath = path.join(
          BUILD_DIR,
          relativePath.replace(/\.md$/, '.html')
        );

        // Ensure output directory exists
        ensureDir(path.dirname(outputPath));

        // Write file
        fs.writeFileSync(outputPath, html);
        console.log(`  ✓ ${relativePath} → ${path.relative(BUILD_DIR, outputPath)}`);

        // Add to sitemap
        const url = '/' + relativePath.replace(/\.md$/, '.html').replace(/\\/g, '/');
        const priority = url === '/index.html' ? '1.0' : url.includes('/blog/') ? '0.8' : '0.7';
        sitemapUrls.push({
          url: url === '/index.html' ? '/' : url.replace('.html', ''),
          lastmod: data.date || new Date().toISOString().split('T')[0],
          priority
        });
      }
    });
  }

  // Generate sitemap
  if (sitemapUrls.length > 0) {
    console.log('🗺️  Generating sitemap...');
    const sitemap = generateSitemap(sitemapUrls);
    fs.writeFileSync(path.join(BUILD_DIR, 'sitemap.xml'), sitemap);
    console.log(`  ✓ sitemap.xml (${sitemapUrls.length} URLs)`);
  }

  console.log('✨ Build complete!');
}

// Run build
try {
  build();
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
