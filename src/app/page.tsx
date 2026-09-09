import { db } from "../lib/db";
import Link from "next/link";

export default async function Home() {
  const { rows: berita } = await db.execute("SELECT * FROM posts ORDER BY id DESC LIMIT 3");

  return (
    <div className="content-wrapper">
      <header className="wrapper bg-light">
        <nav className="navbar navbar-expand-lg center-nav transparent navbar-light shadow-sm">
          <div className="container flex-lg-row flex-nowrap align-items-center">
            <div className="navbar-brand w-100">
              <Link href="/" className="d-flex align-items-center">
                <img src="https://pkm-alunalun-dinkes.gresikkab.go.id/storage/photos/3/Logo/logo-square.png" width="60" alt="Logo" />
                <span className="ms-3 fs-20 font-bold text-dark">Puskesmas Nelayan</span>
              </Link>
            </div>
            <div className="navbar-collapse offcanvas offcanvas-nav offcanvas-start">
              <ul className="navbar-nav">
                <li className="nav-item"><Link href="/" className="nav-link">Home</Link></li>
                <li className="nav-item"><Link href="/profil" className="nav-link">Profil</Link></li>
                <li className="nav-item"><Link href="/layanan" className="nav-link">Layanan</Link></li>
                <li className="nav-item"><Link href="/login" className="nav-link text-primary font-bold">Admin Login</Link></li>
              </ul>
            </div>
          </div>
        </nav>
      </header>

      <section className="wrapper bg-light">
        <div className="container pt-10 pb-10">
          <img src="https://pkm-alunalun-dinkes.gresikkab.go.id/storage/photos/3/Banner/banner-1.png" className="img-fluid rounded w-100" alt="Banner" />
        </div>
      </section>

      <section className="wrapper bg-light">
        <div className="container py-14 py-md-16">
          <div className="row mb-3 text-center">
            <h1>Berita & Informasi Terbaru</h1>
          </div>
          <div className="row gy-6">
            {berita.map((item: any) => (
              <div key={item.id} className="col-md-4">
                <div className="card shadow-lg h-100">
                  <div className="card-body p-6">
                    <h4 className="mb-3">{item.title}</h4>
                    <div dangerouslySetInnerHTML={{ __html: item.content }} />
                  </div>
                  <div className="card-footer bg-white border-0">
                    <span className="badge bg-green text-white">{item.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <footer className="bg-dark text-inverse mt-10">
        <div className="container py-10 text-center">
          <p className="mb-0">© 2026 Puskesmas Nelayan Kabupaten Gresik. Dikelola dinamis dengan Turso & Vercel.</p>
        </div>
      </footer>
    </div>
  );
}