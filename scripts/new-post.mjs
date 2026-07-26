#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const [, , rawTitle, rawLocale = 'ja', rawSlug] = process.argv;
const locale = rawLocale === 'en' ? 'en' : 'ja';

function slugify(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

if (!rawTitle) {
  console.error('Usage: pnpm new:post "Post title" [ja|en] [slug]');
  process.exit(1);
}

const slug = rawSlug ? slugify(rawSlug) : slugify(rawTitle) || `post-${today()}`;

const postsDir = join(process.cwd(), 'src/content/posts');
const filePath = join(postsDir, `${slug}.${locale}.mdx`);

if (existsSync(filePath)) {
  console.error(`Post already exists: ${filePath}`);
  process.exit(1);
}

const template = `---
title: "${rawTitle.replaceAll('"', '\\"')}"
description: ""
pubDate: ${today()}
tags: []
draft: true
---

## ${rawTitle}

`;

await mkdir(postsDir, { recursive: true });
await writeFile(filePath, template, 'utf8');

console.log(`Created ${filePath}`);
