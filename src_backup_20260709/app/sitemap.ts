import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';
import { getAllFilesRecursive } from '@/lib/posts';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://koreatripinfo.com'; // 실제 도메인으로 변경 완료

  // 블로그 글 목록 가져오기
  const postsDirectory = path.join(process.cwd(), 'src/content/posts');
  let blogUrls: MetadataRoute.Sitemap = [];
  
  if (fs.existsSync(postsDirectory)) {
    const filePaths = getAllFilesRecursive(postsDirectory);
    blogUrls = filePaths
      .filter((filePath) => filePath.endsWith('.md'))
      .map((filePath) => ({
        url: `${baseUrl}/blog/${path.basename(filePath).replace(/\.md$/, '')}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      }));
  }

  // 꿀팁 글 목록 가져오기
  const tipsDirectory = path.join(process.cwd(), 'src/content/tips');
  let tipUrls: MetadataRoute.Sitemap = [];

  if (fs.existsSync(tipsDirectory)) {
    const fileNames = fs.readdirSync(tipsDirectory);
    tipUrls = fileNames
      .filter((fileName) => fileName.endsWith('.md'))
      .map((fileName) => ({
        url: `${baseUrl}/tips/${fileName.replace(/\.md$/, '')}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
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
    {
      url: `${baseUrl}/tips`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...blogUrls,
    ...tipUrls,
  ];
}
