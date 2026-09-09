import { db } from "../../../lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function DetailPost({ params }: { params: { slug: string } }) {
  const { rows } = await db.execute({
    sql: "SELECT * FROM posts WHERE slug = ?",
    args: [params.slug],
  });

  if (rows.length === 0) return notFound();
  const post = rows[0] as any;

  return (
    <div className="content-wrapper bg-light min-h-screen">
      <header className="wrapper bg-white shadow-sm">
        <div className="container py-4">
          <Link href="/" className="text-green-700 font-bold hover:underline">
            &larr; Kembali ke Beranda
          </Link>
        </div>
      </header>
      
      <main className="container py-10 max-w-4xl mx-auto">
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl">
          <span className="badge bg-green text-white mb-4">{post.type}</span>
          <h1 className="text-3xl md:text-5xl font-bold text-dark mb-6">{post.title}</h1>
          
          {post.image_url && (
            <img src={post.image_url} alt={post.title} className="w-full rounded-lg mb-8 shadow-md" />
          )}
          
          <div 
            className="text-gray-700 text-lg leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
        </div>
      </main>
    </div>
  );
}