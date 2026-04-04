import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';

export default function BlogList() {
  const posts = getAllPosts();

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8">
      <h1 className="text-3xl font-bold text-pink-600 mb-8">블로그</h1>
      <div className="grid gap-6">
        {posts.map((post) => (
          <Link href={`/blog/${post.slug}`} key={post.slug} className="block p-6 bg-white border border-pink-200 rounded-lg shadow hover:shadow-md transition">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h2>
            <p className="text-gray-500 text-sm mb-4">{post.date}</p>
            <p className="text-gray-700">{post.summary}</p>
          </Link>
        ))}
        {posts.length === 0 && (
          <p className="text-gray-500">아직 작성된 블로그 글이 없습니다.</p>
        )}
      </div>
    </div>
  );
}
