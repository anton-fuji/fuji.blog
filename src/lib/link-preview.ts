export interface LinkPreview {
  title: string;
  description: string;
  image?: string;
  siteName: string;
}

const previewCache = new Map<string, Promise<LinkPreview>>();

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function readAttribute(tag: string, name: string): string | undefined {
  const match = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, 'i'));
  return match ? decodeHtml(match[1]) : undefined;
}

function fallbackPreview(href: string): LinkPreview {
  const url = new URL(href);
  const siteName = url.hostname.replace(/^www\./, '');
  const path = url.pathname.replace(/^\//, '').replace(/\/$/, '');

  return {
    title: path ? `${siteName}/${path}` : siteName,
    description: '外部リンクを開く',
    siteName,
  };
}

async function loadPreview(href: string): Promise<LinkPreview> {
  const fallback = fallbackPreview(href);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);

  try {
    const response = await fetch(href, {
      headers: { 'user-agent': 'fuji.blog link preview' },
      signal: controller.signal,
    });

    if (!response.ok) return fallback;

    const html = await response.text();
    const meta = [...html.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => ({
      property: readAttribute(tag, 'property') ?? readAttribute(tag, 'name'),
      content: readAttribute(tag, 'content'),
    }));
    const value = (name: string) => meta.find((item) => item.property?.toLowerCase() === name)?.content;
    const title = value('og:title') ?? value('twitter:title') ?? html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
    const description = value('og:description') ?? value('twitter:description') ?? value('description');
    const image = value('og:image') ?? value('twitter:image');
    const siteName = value('og:site_name') ?? fallback.siteName;

    return {
      title: title ? decodeHtml(title) : fallback.title,
      description: description ? decodeHtml(description) : fallback.description,
      image,
      siteName,
    };
  } catch {
    return fallback;
  } finally {
    clearTimeout(timeout);
  }
}

export function getLinkPreview(href: string): Promise<LinkPreview> {
  const cached = previewCache.get(href);
  if (cached) return cached;

  const preview = loadPreview(href);
  previewCache.set(href, preview);
  return preview;
}
