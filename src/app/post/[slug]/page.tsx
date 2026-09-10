import { db } from "../../../lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";

// PERBAIKAN: params sekarang harus berbentuk Promise dan di-await
export default async function DetailPost({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  const { rows } = await db.execute({
    sql: "SELECT * FROM posts WHERE slug = ?",
    args: [resolvedParams.slug],
  });

  if (rows.length === 0) return notFound();
  const post = rows[0] as any;

  return (
    <div className="content-wrapper" style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '100px 15px 50px' }}>
      <main className="container" style={{ maxWidth: '850px', margin: '0 auto' }}>
        
        <div className="card-gizi p-4 p-md-5 mx-auto bg-white rounded-4 shadow-sm" style={{ borderTop: '5px solid var(--accent-orange)' }}>
          <Link href="/#program" className="btn btn-light rounded-pill mb-4 fw-bold text-primary text-decoration-none">
            <i className="fa-solid fa-arrow-left me-2"></i> Kembali ke Beranda
          </Link>
          <br />
          <span className="badge bg-primary px-3 py-2 rounded-pill mb-3">{String(post.type)}</span>
          <h1 className="fw-bold text-dark mb-4">{String(post.title)}</h1>
          
          {post.image_url && (
            <img src={String(post.image_url)} alt={String(post.title)} className="w-100 rounded-4 shadow-sm mb-4" style={{ maxHeight: '400px', objectFit: 'cover' }} />
          )}
          
          <div 
            className="text-muted leading-relaxed" 
            style={{ fontSize: '1.1rem', lineHeight: '1.8' }}
            dangerouslySetInnerHTML={{ __html: String(post.content) }} 
          />
        </div>

      </main>
    </div>
  );
}