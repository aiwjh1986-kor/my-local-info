import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getAllFilesRecursive } from '@/lib/posts';

export async function POST(request: Request) {
  try {
    const { slug, id, category } = await request.json();
    
    // 1. 마크다운 파일 업데이트
    if (slug) {
      const postsDirectory = path.join(process.cwd(), 'src/content/posts');
      const filesPaths = getAllFilesRecursive(postsDirectory);
      const targetFilePath = filesPaths.find(file => path.basename(file).includes(slug));

      if (targetFilePath) {
        const fileContent = fs.readFileSync(targetFilePath, 'utf8');
        const { data, content } = matter(fileContent);
        
        data.category = category;
        const newContent = matter.stringify(content, data);
        
        const safeCategory = category.replace(/[<>:"/\\|?*]/g, '_');
        const newTargetDir = path.join(postsDirectory, safeCategory);
        if (!fs.existsSync(newTargetDir)) {
          fs.mkdirSync(newTargetDir, { recursive: true });
        }
        
        const newFilePath = path.join(newTargetDir, path.basename(targetFilePath));
        fs.writeFileSync(newFilePath, newContent);
        
        if (newFilePath !== targetFilePath) {
          fs.unlinkSync(targetFilePath);
        }
      }
    }

    // 2. local-info.json 업데이트 (있는 경우)
    const dataPath = path.join(process.cwd(), 'public/data/local-info.json');
    if (fs.existsSync(dataPath)) {
      const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
      
      // events나 benefits에서 해당 ID 찾기
      ['events', 'benefits'].forEach(key => {
        if (jsonData[key]) {
          const item = jsonData[key].find((i: any) => i.id === id || i.slug === slug);
          if (item) {
            item.category = category;
          }
        }
      });
      
      fs.writeFileSync(dataPath, JSON.stringify(jsonData, null, 2));
    }

    // 3. featured-cards.json 업데이트
    const featuredPath = path.join(process.cwd(), 'public/data/featured-cards.json');
    if (fs.existsSync(featuredPath)) {
      const featuredData = JSON.parse(fs.readFileSync(featuredPath, 'utf8'));
      const item = featuredData.find((i: any) => i.id === id || i.slug === slug);
      if (item) {
        item.category = category;
      }
      fs.writeFileSync(featuredPath, JSON.stringify(featuredData, null, 2));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ success: false, error: 'Failed to update category' }, { status: 500 });
  }
}
