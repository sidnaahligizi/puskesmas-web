import { db } from "../lib/db";
import Link from "next/link";

export default async function Home() {
  // 1. Tambah +1 setiap kali website dibuka
  await db.execute("UPDATE site_settings SET value = CAST(value AS INTEGER) + 1 WHERE key = 'page_views'");

  // 2. Ambil data Brand dan View terbaru
  const { rows: brandRow } = await db.execute("SELECT value FROM site_settings WHERE key = 'brand_name'");
  const brandName = brandRow[0]?.value || "Puskesmas Nelayan";
  
  const { rows: viewsRow } = await db.execute("SELECT value FROM site_settings WHERE key = 'page_views'");
  const totalViews = viewsRow[0]?.value || 0;

  // 3. Ambil Berita terbaru
  const { rows: berita } = await db.execute("SELECT * FROM posts ORDER BY id DESC LIMIT 6");

  return (
    <div className="content-wrapper">
      <header className="wrapper bg-light">
        <nav className="navbar navbar-expand-lg center-nav transparent navbar-light shadow-sm py-3">
          <div className="container flex-lg-row flex-nowrap align-items-center">
            <div className="navbar-brand w-100">
              <Link href="/" className="d-flex align-items-center text-decoration-none">
                <img src="https://pkm-alunalun-dinkes.gresikkab.go.id/storage/photos/3/Logo/logo-square.png" width="55" alt="Logo" />
                <span className="ms-3 fs-22 fw-bolder text-dark">{brandName}</span>
              </Link>
            </div>
            <div className="navbar-collapse offcanvas offcanvas-nav offcanvas-start">
              <ul className="navbar-nav">
                <li className="nav-item"><Link href="/" className="nav-link">Home</Link></li>
                <li className="nav-item"><Link href="#berita" className="nav-link">Berita</Link></li>
                <li className="nav-item"><Link href="/login" className="nav-link text-primary font-bold">🛠️ Admin</Link></li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <section className="wrapper bg-soft-primary">
        <div className="container pt-10 pb-10 text-center">
          <h1 className="display-2 mb-4 text-dark">Selamat Datang di {brandName}</h1>
          <p className="lead fs-lg mb-7 px-md-10 px-lg-0">Melayani dengan Hati, Inovasi untuk Negeri.</p>
          <img src="https://pkm-alunalun-dinkes.gresikkab.go.id/storage/photos/3/Banner/banner-1.png" className="img-fluid rounded-xl shadow-lg w-100" alt="Banner" />
        </div>
      </section>

      <section id="berita" className="wrapper bg-light">
        <div className="container py-14">
          <div className="row mb-8 text-center">
            <h2 className="display-4 mb-3">Pusat Informasi & Layanan</h2>
          </div>
          
          <div className="row gy-6">
            {berita.map((item: any) => (
              <div key={item.id} className="col-md-6 col-lg-4">
                <Link href={`/post/${item.slug}`} className="card shadow-lg h-100 lift text-decoration-none transition-all">
                  {item.image_url ? (
                    <img src={item.image_url} className="card-img-top object-cover" style={{height: "200px"}} alt={item.title} />
                  ) : (
                    <div className="card-img-top bg-soft-green d-flex align-items-center justify-content-center" style={{height: "200px"}}>
                      <span className="fs-50 text-green">📰</span>
                    </div>
                  )}
                  <div className="card-body p-6">
                    <span className="badge bg-green text-white mb-2">{item.type}</span>
                    <h4 className="mb-3 text-dark">{item.title}</h4>
                    <p className="text-muted line-clamp-3">Klik untuk membaca selengkapnya...</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <footer className="bg-dark text-inverse mt-auto">
        <div className="container py-10 text-center">
          <p className="mb-2 fs-18">© 2026 {brandName}. Dikelola mandiri.</p>
          <div className="badge bg-white text-dark fs-14 py-2 px-4 rounded-pill shadow">
            Statistik Pengunjung: <strong className="text-primary">{totalViews}</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}