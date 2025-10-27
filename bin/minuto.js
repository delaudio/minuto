#!/usr/bin/env node

const { Command } = require('commander');
const path = require('path');
const { spawn } = require('child_process');

const program = new Command();

program
  .name('minuto')
  .description('Minimal static site generator for markdown content')
  .version('0.0.1');

program
  .command('build')
  .description('Build the static site')
  .action(() => {
    const buildScript = path.join(__dirname, '../build.js');
    const build = spawn('node', [buildScript], { stdio: 'inherit' });
    build.on('exit', (code) => process.exit(code));
  });

program
  .command('serve')
  .description('Serve the built site locally')
  .action(() => {
    const serveScript = path.join(__dirname, '../serve.js');
    const serve = spawn('node', [serveScript], { stdio: 'inherit' });
    serve.on('exit', (code) => process.exit(code));
  });

program
  .command('dev')
  .description('Watch for changes and rebuild automatically')
  .action(() => {
    const devScript = path.join(__dirname, '../dev.js');
    const dev = spawn('node', [devScript], { stdio: 'inherit' });
    dev.on('exit', (code) => process.exit(code));
  });

program
  .command('init [directory]')
  .description('Initialize a new Minuto project with example content')
  .option('-t, --template <type>', 'Template to use (default, blog, portfolio, docs)', 'default')
  .action((directory, options) => {
    const initScript = path.join(__dirname, '../init.js');
    const args = [initScript];

    if (directory) {
      args.push(directory);
    }

    if (options.template) {
      args.push('--template', options.template);
    }

    const init = spawn('node', args, { stdio: 'inherit' });
    init.on('exit', (code) => process.exit(code));
  });

program.parse();
