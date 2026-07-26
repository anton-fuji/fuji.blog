# fuji.blog
[![Netlify Status](https://api.netlify.com/api/v1/badges/a983bb3e-627b-401d-b623-2c58424d701a/deploy-status)](https://app.netlify.com/projects/fuji-blog/deploys)

## Writing

Create a draft:

```sh
pnpm new:post "記事タイトル" ja my-post-slug
pnpm new:post "Post title" en my-post-slug
```

Posts live in `src/content/posts` and use this filename convention:

- `my-post-slug.ja.mdx` -> `/posts/my-post-slug`
- `my-post-slug.en.mdx` -> `/en/posts/my-post-slug`

For normal publishing, only `title`, `description`, `pubDate`, and `tags` are required. Keep `draft: true` while writing, then remove it or set it to `false`.
