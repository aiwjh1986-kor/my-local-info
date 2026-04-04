import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'src/content/posts');

export type Post = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  category?: string;
  tags?: string[];
  content: string;
};

export function getPostSlugs() {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs.readdirSync(postsDirectory).filter(file => file.endsWith('.md'));
}

export function getPostBySlug(slug: string): Post {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = path.join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  let dateValue = data.date || '';
  if (dateValue instanceof Date) {
    dateValue = dateValue.toISOString().slice(0, 10);
  } else if (typeof dateValue === 'string' && dateValue.includes('T')) {
    dateValue = dateValue.split('T')[0];
  }

  return {
    slug: realSlug,
    title: data.title || 'Untitled',
    date: dateValue,
    summary: data.summary || '',
    category: data.category || '',
    tags: data.tags || [],
    content,
  };
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}
