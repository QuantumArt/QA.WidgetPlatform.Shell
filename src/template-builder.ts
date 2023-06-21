#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import spawn from 'cross-spawn';

const projectName = process.argv[2];

const currentDir = process.cwd();
const projectDir = path.resolve(currentDir, projectName);
fs.mkdirSync(projectDir, { recursive: true });

const templateDir = path.resolve(__dirname, 'template');
fs.cpSync(templateDir, projectDir, { recursive: true });

fs.renameSync(path.join(projectDir, 'gitignore'), path.join(projectDir, '.gitignore'));

spawn.sync('npm', ['install'], { cwd: `${projectDir}`, stdio: 'inherit' });

console.log('Success! Shell project QP8.WidgetPlatform is ready.');
console.log(`Created ${projectName} at ${projectDir}`);
