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
  deadline?: string | null;
  is_urgent?: boolean;
  is_popular?: boolean;
  endDate?: string | null;
  region?: string;
  cta?: string;
  id?: string | number;
}

export interface TipData {
  slug: string;
  id: string;
  title: string;
  date: string;
  category: string;
  summary: string;
  image: string;
  productName: string;
  productLink: string;
  content: string;
}

const tipsDirectory = path.join(process.cwd(), 'src/content/tips');

export function getAllFilesRecursive(dirPath: string, arrayOfFiles: string[] = []): string[] {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFilesRecursive(fullPath, arrayOfFiles);
    } else {
      if (file.endsWith('.md')) {
        arrayOfFiles.push(fullPath);
      }
    }
  });

  return arrayOfFiles;
}

export function getSortedPostsData(): PostData[] {
  // src/content/posts 폴더가 없으면 빈 배열 반환
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const allFiles = getAllFilesRecursive(postsDirectory);
  const allPostsData = allFiles
    .map((fullPath) => {
      const fileName = path.basename(fullPath);
      const slug = fileName.replace(/\.md$/, '');
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      // 날짜 처리: 더 견고한 변환 로직
      let date = "2026-05-01"; // 기본값
      try {
        const rawDate = matterResult.data.date;
        if (rawDate instanceof Date) {
          date = rawDate.toISOString();
        } else if (rawDate) {
          // "2026.05.02" 형식을 "2026-05-02"로 변환 시도
          const dateStr = String(rawDate).replace(/\./g, '-');
          const d = new Date(dateStr);
          if (!isNaN(d.getTime())) {
            date = d.toISOString();
          } else {
            date = dateStr;
          }
        }
      } catch (e) {
        console.error("Date parsing error for slug:", slug, e);
      }

      // 마감일 처리
      let deadline = matterResult.data.deadline;
      if (deadline instanceof Date) {
        deadline = deadline.toISOString();
      } else if (deadline) {
        deadline = String(deadline).replace(/\./g, '-');
      }

      // 마감 임박 계산 (마감 7일 전)
      const TODAY = "2026-05-04";
      const todayDate = new Date(TODAY);
      let is_urgent = false;
      
      if (deadline) {
        const dDate = new Date(deadline);
        const diffTime = dDate.getTime() - todayDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= 7) {
          is_urgent = true;
        }
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
        deadline: deadline || null,
        is_urgent: is_urgent || matterResult.data.is_urgent || false,
      } as PostData;
    });

  // 1. 진행 중인 글과 종료된 글을 분리하여 정렬
  const TODAY = "2026-05-04";

  return allPostsData.sort((a, b) => {
    const isClosedA = a.deadline && a.deadline < TODAY;
    const isClosedB = b.deadline && b.deadline < TODAY;

    // 둘 다 진행 중이거나 둘 다 종료된 경우 -> 날짜순 정렬
    if (isClosedA === isClosedB) {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      
      // 날짜가 다르면 날짜순 정렬
      if (timeB !== timeA) {
        return timeB - timeA;
      }
      
      // 날짜가 같으면 파일명(slug) 기준 내림차순 정렬 (02가 01보다 위로)
      return b.slug.localeCompare(a.slug);
    }

    // 진행 중인 글(false)이 종료된 글(true)보다 앞으로 오게 함
    return isClosedA ? 1 : -1;
  });
}

export function getPostData(slug: string): PostData | null {
  const allFiles = getAllFilesRecursive(postsDirectory);
  const fullPath = allFiles.find(file => path.basename(file) === `${slug}.md`);

  if (!fullPath) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  // 날짜 처리
  let date = matterResult.data.date;
  if (date instanceof Date) {
    date = date.toISOString();
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

export function getSortedTipsData(): TipData[] {
  if (!fs.existsSync(tipsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(tipsDirectory);
  const allTipsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(tipsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const matterResult = matter(fileContents);

      return {
        ...matterResult.data,
        slug,
        content: matterResult.content,
      } as TipData;
    });

  return allTipsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getTipData(slug: string): TipData | null {
  const fullPath = path.join(tipsDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const matterResult = matter(fileContents);

  return {
    ...matterResult.data,
    slug,
    content: matterResult.content,
  } as TipData;
}
