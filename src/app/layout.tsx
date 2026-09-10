import type { Metadata } from "next";
import Script from "next/script";
import { db } from "../lib/db";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Website Resmi Puskesmas",
  description: "Portal Layanan Kesehatan",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Mengambil semua pengaturan dari database
  const { rows } = await db.execute("SELECT * FROM site_settings");
  const settings: Record<string, string> = {};
  rows.forEach((row: any) => { settings[row.key] = row.value; });

  const brandName = settings['brand_name'] || "Puskesmas Nelayan";
  const logoUrl = settings['logo_url'] || "https://lh3.googleusercontent.com/d/1lmHDe6r7V4bp3xdRNqfQyuzqREGYe29o";

  return (
    <html lang="id">
      <head>
        <link rel="icon" href={logoUrl} type="image/png" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <style dangerouslySetInnerHTML={{ __html: `
          body { background-color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; }
          .top-bar { background-color: #3b82f6; color: white; padding: 8px 0; font-size: 0.85rem; }
          .navbar { background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.05); padding: 15px 0; }
          .nav-link { font-weight: 600; color: #333 !important; margin: 0 5px; }
          .nav-link:hover { color: #3b82f6 !important; }
          .footer-dark { background-color: #1e293b; color: #cbd5e1; padding: 60px 0 20px; }
          .content-min-height { min-height: 70vh; padding-top: 130px; }
        `}} />
      </head>
      <body>
        {/* TOP BAR BIRU (Seperti Dinkes) */}
        <div className="top-bar fixed-top">
          <div className="container d-flex justify-content-between align-items-center flex-wrap">
            <div><i className="fa-solid fa-location-dot me-2"></i>{settings['address']}</div>
            <div className="d-flex gap-4">
              <span><i className="fa-solid fa-phone me-2"></i>{settings['phone']}</span>
              <span><i className="fa-solid fa-envelope me-2"></i>{settings['email']}</span>
            </div>
          </div>
        </div>

        {/* MAIN MENU NAVBAR */}
        <nav className="navbar navbar-expand-lg fixed-top" style={{ marginTop: '35px' }}>
          <div className="container">
            <Link href="/" className="navbar-brand d-flex align-items-center">
              <img src={logoUrl} alt="Logo" height="50" className="me-2" />
              <span className="fw-bold text-dark">{brandName}</span>
            </Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto align-items-center">
                <li className="nav-item"><Link className="nav-link" href="/">Home</Link></li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">Profil</a>
                  <ul className="dropdown-menu">
                    <li><Link className="dropdown-item" href="#">Visi Misi</Link></li>
                    <li><Link className="dropdown-item" href="#">Struktur Organisasi</Link></li>
                  </ul>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">Layanan</a>
                  <ul className="dropdown-menu">
                    <li><Link className="dropdown-item" href="#">Layanan Medis</Link></li>
                    <li><Link className="dropdown-item" href="#">Gizi & Anak</Link></li>
                  </ul>
                </li>
                <li className="nav-item"><Link className="nav-link" href="/#berita">Berita</Link></li>
                <li className="nav-item"><Link className="nav-link" href="#">PPID</Link></li>
                <li className="nav-item"><Link className="nav-link" href="#">Kontak</Link></li>
                <li className="nav-item ms-3"><Link className="btn btn-outline-primary btn-sm rounded-pill" href="/login"><i className="fa-solid fa-lock me-1"></i> Admin</Link></li>
              </ul>
            </div>
          </div>
        </nav>

        {/* KONTEN HALAMAN (Berubah-ubah sesuai URL) */}
        <div className="content-min-height">
          {children}
        </div>

        {/* FOOTER GLOBAL */}
        <footer className="footer-dark">
          <div className="container">
            <div className="row g-4 mb-5">
              <div className="col-lg-4">
                <img src={logoUrl} alt="Logo" height="60" className="bg-white p-1 rounded mb-3" />
                <h5 className="text-white fw-bold">{brandName}</h5>
                <p className="small mb-3">{settings['profil_teks']}</p>
                <div className="d-flex gap-3">
                  <a href={settings['facebook']} className="text-white fs-4"><i className="fa-brands fa-facebook"></i></a>
                  <a href={settings['instagram']} className="text-white fs-4"><i className="fa-brands fa-instagram"></i></a>
                </div>
              </div>
              <div className="col-lg-4">
                <h5 className="text-white fw-bold mb-3">Kontak Kami</h5>
                <ul className="list-unstyled small">
                  <li className="mb-2"><i className="fa-solid fa-location-dot me-2 text-primary"></i> {settings['address']}</li>
                  <li className="mb-2"><i className="fa-solid fa-phone me-2 text-primary"></i> {settings['phone']}</li>
                  <li className="mb-2"><i className="fa-solid fa-envelope me-2 text-primary"></i> {settings['email']}</li>
                </ul>
              </div>
              <div className="col-lg-4">
                <h5 className="text-white fw-bold mb-3">Link Terkait</h5>
                <ul className="list-unstyled small">
                  <li className="mb-2"><a href="#" className="text-decoration-none text-light">Pemerintah Kabupaten Gresik</a></li>
                  <li className="mb-2"><a href="#" className="text-decoration-none text-light">Dinas Kesehatan Gresik</a></li>
                  <li className="mb-2"><a href="#" className="text-decoration-none text-light">Kementerian Kesehatan RI</a></li>
                </ul>
              </div>
            </div>
            <div className="border-top border-secondary pt-3 text-center small">
              © 2026 {brandName}. Hak Cipta Dilindungi. | Pengunjung: {settings['page_views'] || 0}
            </div>
          </div>
        </footer>

        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}