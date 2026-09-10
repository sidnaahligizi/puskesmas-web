import { db } from "../../../lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function DetailPost({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { rows } = await db.execute({ sql: "SELECT * FROM posts WHERE slug = ?", args: [resolvedParams.slug] });
  if (rows.length === 0) return notFound();
  const post = rows[0] as any;

  return (
    <div className="container py-5">
      <div className="bg-white p-5 rounded-4 shadow-sm mx-auto" style={{ maxWidth: '900px' }}>
        <Link href="/#berita" className="btn btn-light rounded-pill mb-4 text-primary fw-bold">
          <i className="fa-solid fa-arrow-left me-2"></i> Kembali
        </Link>
        <div className="mb-3"><span className="badge bg-primary px-3 py-2 rounded-pill">{String(post.type)}</span></div>
        <h1 className="fw-bold text-dark mb-4">{String(post.title)}</h1>
        
        {post.image_url && (
          <img src={String(post.image_url)} alt="Cover" className="w-100 rounded-4 shadow-sm mb-5" style={{ maxHeight: '450px', objectFit: 'cover' }} />
        )}
        
        <div className="text-muted" style={{ fontSize: '1.1rem', lineHeight: '1.8' }} dangerouslySetInnerHTML={{ __html: String(post.content) }} />
      </div>
    </div>
  );
}