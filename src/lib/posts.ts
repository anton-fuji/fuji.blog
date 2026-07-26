import type { CollectionEntry } from 'astro:content';

type Post = CollectionEntry<'posts'>;
type Locale = 'ja' | 'en';

const ENGLISH_WORDS_PER_SECOND = 220 / 60;
const JAPANESE_CHARS_PER_SECOND = 450 / 60;

function parsePostId(post: Post): { slug: string; locale?: Locale } {
  const fileName = post.filePath?.split('/').pop();
  const fileMatch = fileName?.match(/^(.*)\.(ja|en)\.mdx?$/);
  if (fileMatch) {
    return {
      slug: fileMatch[1],
      locale: fileMatch[2] as Locale,
    };
  }

  const match = post.id.match(/^(.*)\.(ja|en)$/);
  if (!match) {
    return { slug: post.id };
  }

  return {
    slug: match[1],
    locale: match[2] as Locale,
  };
}

export function getPostLocale(post: Post): Locale {
  return post.data.lang ?? parsePostId(post).locale ?? 'ja';
}

export function getPostSlug(post: Post): string {
  return post.data.routeSlug ?? parsePostId(post).slug;
}

export function getPostTranslationKey(post: Post): string {
  return post.data.translationKey ?? getPostSlug(post);
}

export function formatPostDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getReadingTime(post: Post): string {
  const text = post.body ?? '';
  const latinWords = text.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g)?.length ?? 0;
  const japaneseChars = text.replace(/[A-Za-z0-9\s!"#$%&'()*+,./:;<=>?@[\\\]^_`{|}~-]/g, '').length;
  const readingSeconds =
    latinWords / ENGLISH_WORDS_PER_SECOND +
    japaneseChars / JAPANESE_CHARS_PER_SECOND;
  const minutes = Math.max(1, Math.ceil(readingSeconds / 60));

  if (getPostLocale(post) === 'ja') {
    return `${minutes}分で読める`;
  }

  return `${minutes} min read`;
}

export function getPublishedPosts(posts: Post[], locale: Locale): Post[] {
  return posts
    .filter((post) => !post.data.draft && getPostLocale(post) === locale)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function getTranslatedPost(post: Post, posts: Post[], locale: Locale): Post | undefined {
  return posts.find(
    (candidate) =>
      !candidate.data.draft &&
      getPostTranslationKey(candidate) === getPostTranslationKey(post) &&
      getPostLocale(candidate) === locale
  );
}

export function getPostPath(post: Post): string {
  const prefix = getPostLocale(post) === 'en' ? '/en/posts' : '/posts';
  return `${prefix}/${getPostSlug(post)}`;
}
