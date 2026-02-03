import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { generateOGImage } from '../../lib/og-image';

export async function getStaticPaths() {
  const posts = await getCollection('posts');

  return posts.map((post) => ({
    params: { id: post.id },
    props: { post },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as any;

  // 日付をフォーマット
  const formattedDate = `${post.data.pubDate.getFullYear()}-${post.data.pubDate.getMonth() + 1}-${post.data.pubDate.getDate()}`;

  // OG画像を生成
  const png = await generateOGImage({
    title: post.data.title,
    date: formattedDate,
  });

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
