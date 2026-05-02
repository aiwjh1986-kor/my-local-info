"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PostData {
  slug: string;
  title: string;
  date: string;
  summary: string;
  category: string;
}

export default function BlogList() {
  const [posts, setPosts] = useState<PostData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blog')
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch posts:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-gray-400">데이터를 불러오는 중입니다...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {posts.length > 0 ? (
        posts.map(({ slug, date, title, summary, category }) => (
          <article key={slug} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden border border-orange-50 group">
            <Link href={`/blog/${slug}`} className="block h-full flex flex-col">
              <div className="p-8 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                    {category}
                  </span>
                  <time className="text-sm text-gray-400 font-mono">{date}</time>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-orange-600 transition-colors">
                  {title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                  {summary}
                </p>
              </div>
              <div className="px-8 py-4 bg-orange-50/50 border-t border-orange-100 text-orange-600 text-sm font-bold flex justify-between items-center">
                읽어보기
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          </article>
        ))
      ) : (
        <div className="col-span-2 text-center py-20 bg-white rounded-2xl border border-dashed border-orange-200">
          <p className="text-gray-400">등록된 블로그 글이 없습니다.</p>
        </div>
      )}
    </div>
  );
}
