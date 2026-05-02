import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://my-local-info-42x.pages.dev'; // 실제 도메인으로 변경 가능

  // 블로그 글 목록 가져오기
  const postsDirectory = path.join(process.cwd(), 'src/content/posts');
  let blogUrls: MetadataRoute.Sitemap = [];
  
  if (fs.existsSync(postsDirectory)) {
    const fileNames = fs.readdirSync(postsDirectory);
    blogUrls = fileNames
      .filter((fileName) => fileName.endsWith('.md'))
      .map((fileName) => ({
        url: `${baseUrl}/blog/${fileName.replace(/\.md$/, '')}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      }));
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...blogUrls,
  ];
}
