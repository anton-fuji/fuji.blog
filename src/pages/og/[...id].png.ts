import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { generateOGImage } from '../../lib/og-image';
import { formatPostDate, getPostLocale, getPostSlug } from '../../lib/posts';

export async function getStaticPaths() {
  const posts = await getCollection('posts');

  return posts.map((post) => ({
    params: {
      id: getPostLocale(post) === 'en' ? `en/${getPostSlug(post)}` : getPostSlug(post),
    },
    props: { post },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as any;

  const formattedDate = formatPostDate(post.data.pubDate);

  // OG画像を生成
  const png = await generateOGImage({
    title: post.data.title,
    date: formattedDate,
    locale: getPostLocale(post),
  });

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
