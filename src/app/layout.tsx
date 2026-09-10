import type { Metadata } from "next";
import Script from "next/script";
import { db } from "../lib/db";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Website Resmi Puskesmas",
  description: "Portal Layanan Kesehatan",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { rows: settingRows } = await db.execute("SELECT * FROM site_settings");
  const settings: Record<string, string> = {};
  settingRows.forEach((row: any) => { settings[row.key] = String(row.value); });

  // Ambil semua menu, urutkan berdasarkan order_num
  const { rows: menus } = await db.execute("SELECT * FROM menus ORDER BY order_num ASC");
  
  // Pisahkan menu utama (parent_id 0) dan sub-menu
  const parentMenus = menus.filter((m: any) => !m.parent_id || Number(m.parent_id) === 0);
  const childMenus = menus.filter((m: any) => Number(m.parent_id) > 0);

  const brandName = settings['brand_name'] || "Puskesmas Nelayan";
  const logoUrl = settings['logo_url'] || "https://lh3.googleusercontent.com/d/1lmHDe6r7V4bp3xdRNqfQyuzqREGYe29o";

  return (
    <html lang="id">
      <head>
        <link rel="icon" href={logoUrl} type="image/png" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <style dangerouslySetInnerHTML={{ __html: `
          body { background-color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; scroll-behavior: smooth; }
          .top-bar { background-color: #3b82f6; color: white; padding: 8px 0; font-size: 0.85rem; }
          .navbar { background: white; box-shadow: 0 2px 10px rgba(0,0,0,0.05); padding: 15px 0; }
          .nav-link { font-weight: 600; color: #333 !important; margin: 0 5px; transition: 0.3s; }
          .nav-link:hover { color: #3b82f6 !important; }
          
          /* FIX DROPDOWN NEXT.JS */
          @media (min-width: 992px) {
            .dropdown:hover .dropdown-menu { display: block; margin-top: 0; animation: fadeIn 0.3s ease; }
          }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          
          .footer-dark { background-color: #1e293b; color: #cbd5e1; padding: 60px 0 20px; }
          .content-min-height { min-height: 70vh; padding-top: 130px; }
          .social-circle { width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.1); border-radius: 50%; transition: 0.3s; color: white; text-decoration: none; }
          .social-circle:hover { background: #3b82f6; color: white; transform: translateY(-3px); }
        `}} />
      </head>
      <body>
        <div className="public-topbar top-bar fixed-top">
          <div className="container d-flex justify-content-between align-items-center flex-wrap">
            <div><i className="fa-solid fa-location-dot me-2"></i>{settings['address']}</div>
            <div className="d-flex gap-4">
              <span><i className="fa-solid fa-phone me-2"></i>{settings['phone']}</span>
              <span><i className="fa-solid fa-envelope me-2"></i>{settings['email']}</span>
            </div>
          </div>
        </div>

        <nav className="public-navbar navbar navbar-expand-lg fixed-top" style={{ marginTop: '35px' }}>
          <div className="container">
            <Link href="/" className="navbar-brand d-flex align-items-center">
              <img src={logoUrl} alt="Logo" height="50" className="me-2" />
              <span className="fw-bold text-dark fs-4">{brandName}</span>
            </Link>
            <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto align-items-center">
                
                {/* RENDER MENU SECARA DINAMIS DENGAN DROPDOWN */}
                {parentMenus.map((pm: any) => {
                  // Cek apakah menu induk ini punya anak
                  const children = childMenus.filter((cm: any) => Number(cm.parent_id) === Number(pm.id));
                  
                  if (children.length > 0) {
                    return (
                      <li className="nav-item dropdown" key={pm.id}>
                        <Link className="nav-link dropdown-toggle" href={String(pm.link)}>{String(pm.title)}</Link>
                        <ul className="dropdown-menu border-0 shadow-sm rounded-3">
                          {children.map((cm: any) => (
                            <li key={cm.id}><Link className="dropdown-item py-2" href={String(cm.link)}>{String(cm.title)}</Link></li>
                          ))}
                        </ul>
                      </li>
                    );
                  } else {
                    return (
                      <li className="nav-item" key={pm.id}>
                        <Link className="nav-link" href={String(pm.link)}>{String(pm.title)}</Link>
                      </li>
                    );
                  }
                })}
                
                <li className="nav-item ms-lg-3 mt-3 mt-lg-0">
                  <a className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" href={settings['action_link'] || '#'} target="_blank">
                    {settings['action_title'] || 'Daftar Konsultasi Online'}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="public-content content-min-height">
          {children}
        </div>

        <footer className="public-footer footer-dark">
          <div className="container">
            <div className="row g-4 mb-5">
              <div className="col-lg-5">
                <img src={logoUrl} alt="Logo" height="60" className="bg-white p-1 rounded mb-3" />
                <h4 className="text-white fw-bold mb-3">{brandName}</h4>
                <p className="small mb-4 pe-md-5" style={{ lineHeight: '1.8' }}>{settings['profil_teks']}</p>
                <div className="d-flex gap-2">
                  {settings['facebook'] && <a href={settings['facebook']} className="social-circle"><i className="fa-brands fa-facebook-f"></i></a>}
                  {settings['instagram'] && <a href={settings['instagram']} className="social-circle"><i className="fa-brands fa-instagram"></i></a>}
                  {settings['tiktok'] && <a href={settings['tiktok']} className="social-circle"><i className="fa-brands fa-tiktok"></i></a>}
                  {settings['youtube'] && <a href={settings['youtube']} className="social-circle"><i className="fa-brands fa-youtube"></i></a>}
                  {settings['whatsapp'] && <a href={`https://wa.me/${settings['whatsapp']}`} className="social-circle"><i className="fa-brands fa-whatsapp"></i></a>}
                </div>
              </div>
              <div className="col-lg-3">
                <h5 className="text-white fw-bold mb-4">Kontak Cepat</h5>
                <ul className="list-unstyled small">
                  <li className="mb-3 d-flex"><i className="fa-solid fa-location-dot mt-1 me-3 text-primary"></i> <span>{settings['address']}</span></li>
                  <li className="mb-3 d-flex"><i className="fa-solid fa-phone mt-1 me-3 text-primary"></i> <span>{settings['phone']}</span></li>
                  <li className="mb-3 d-flex"><i className="fa-solid fa-envelope mt-1 me-3 text-primary"></i> <span>{settings['email']}</span></li>
                </ul>
              </div>
              <div className="col-lg-4 text-lg-end">
                <h5 className="text-white fw-bold mb-4">Akses Internal</h5>
                <Link className="btn btn-outline-light rounded-pill px-4 mb-4" href="/login">
                  <i className="fa-solid fa-lock me-2"></i> Login Admin
                </Link>
                <div className="bg-dark bg-opacity-50 p-3 rounded-3 d-inline-block text-start">
                  <span className="d-block small text-muted mb-1">Statistik Pengunjung</span>
                  <h3 className="text-white mb-0 fw-bold"><i className="fa-solid fa-chart-simple text-primary me-2"></i> {settings['page_views'] || 0}</h3>
                </div>
              </div>
            </div>
            <div className="border-top border-secondary border-opacity-25 pt-4 text-center small text-muted">
              © 2026 {brandName}. Hak Cipta Dilindungi.
            </div>
          </div>
        </footer>
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}