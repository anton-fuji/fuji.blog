import { getCollection } from 'astro:content';
import { getPostLocale, getPostPath } from '../lib/posts';

export async function GET() {
  const posts = (await getCollection('posts'))
    .filter((post) => !post.data.draft)
    .map((post) => ({
      title: post.data.title,
      description: post.data.description,
      tags: post.data.tags,
      lang: getPostLocale(post),
      href: getPostPath(post),
    }));

  return new Response(JSON.stringify(posts), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
