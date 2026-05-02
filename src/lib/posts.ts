import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'src/content/posts');

export interface PostData {
  slug: string;
  title: string;
  date: string;
  summary: string;
  category: string;
  tags: string[];
  content: string;
  link?: string;
  image?: string;
}

export function getSortedPostsData(): PostData[] {
  // src/content/posts 폴더가 없으면 빈 배열 반환
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      // 날짜 처리: 더 견고한 변환 로직
      let date = "2026-05-01"; // 기본값
      try {
        const rawDate = matterResult.data.date;
        if (rawDate instanceof Date) {
          date = rawDate.toISOString().split('T')[0];
        } else if (rawDate) {
          // "2026.05.02" 형식을 "2026-05-02"로 변환 시도
          const dateStr = String(rawDate).replace(/\./g, '-');
          const d = new Date(dateStr);
          if (!isNaN(d.getTime())) {
            date = d.toISOString().split('T')[0];
          } else {
            date = dateStr;
          }
        }
      } catch (e) {
        console.error("Date parsing error for slug:", slug, e);
      }

      return {
        ...matterResult.data,
        slug,
        title: matterResult.data.title || "제목 없음",
        date,
        summary: matterResult.data.summary || '',
        category: (matterResult.data.category || '생활정보').toString().replace(/["']/g, "").trim().toLowerCase(),
        tags: Array.isArray(matterResult.data.tags) ? matterResult.data.tags : [],
        link: matterResult.data.link || '',
        content: matterResult.content || '',
      } as PostData;
    });

  // 날짜순으로 정렬 (더 안전한 비교)
  return allPostsData.sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    return timeB - timeA;
  });
}

export function getPostData(slug: string): PostData | null {
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  // 날짜 처리
  let date = matterResult.data.date;
  if (date instanceof Date) {
    date = date.toISOString().split('T')[0];
  } else if (typeof date !== 'string') {
    date = String(date);
  }

  return {
    ...matterResult.data,
    slug,
    title: matterResult.data.title,
    date,
    summary: matterResult.data.summary || '',
    category: (matterResult.data.category || '').toString().replace(/["']/g, "").trim().toLowerCase(),
    tags: matterResult.data.tags || [],
    link: matterResult.data.link || '',
    content: matterResult.content,
  } as PostData;
}
