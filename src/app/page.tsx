import { db } from "../lib/db";
import Link from "next/link";

export default async function Home() {
  await db.execute("UPDATE site_settings SET value = CAST(value AS INTEGER) + 1 WHERE key = 'page_views'");
  const { rows: settingRows } = await db.execute("SELECT * FROM site_settings");
  const settings: Record<string, string> = {};
  settingRows.forEach((row: any) => { settings[row.key] = row.value; });

  const { rows: program } = await db.execute("SELECT * FROM posts ORDER BY id DESC LIMIT 6");

  return (
    <div>
      {/* HERO SLIDER DENGAN TOMBOL DINAMIS */}
      <div className="w-100 overflow-hidden bg-dark position-relative" style={{ height: '550px', marginTop: '-30px' }}>
        <img src={settings['slider_1']} className="w-100 h-100 opacity-50" style={{ objectFit: 'cover' }} alt="Slider" />
        <div className="position-absolute top-50 start-50 translate-middle text-center w-100 px-3">
          <span className="badge bg-primary px-4 py-2 rounded-pill fs-6 mb-3 shadow">Selamat Datang</span>
          <h1 className="display-3 fw-bolder text-white text-shadow-sm mb-4">{settings['brand_name'] || "Puskesmas"}</h1>
          <a href={settings['action_link'] || '#'} target="_blank" className="btn btn-light text-primary btn-lg rounded-pill px-5 py-3 fw-bold shadow-lg">
            {settings['action_title'] || 'Daftar Layanan'} <i className="fa-solid fa-arrow-right ms-2"></i>
          </a>
        </div>
      </div>

      {/* VISI & MISI */}
      <section id="visi-misi" className="py-5 bg-white">
        <div className="container py-5 text-center">
          <div className="d-inline-block bg-primary text-white rounded-circle p-3 mb-4 shadow"><i className="fa-solid fa-bullseye fa-2x"></i></div>
          <h2 className="fw-bold mb-4 text-dark">Visi & Misi</h2>
          <div className="mx-auto text-muted" style={{ maxWidth: '800px', fontSize: '1.15rem', lineHeight: '1.8' }} dangerouslySetInnerHTML={{ __html: settings['visi_misi'] }} />
        </div>
      </section>

      {/* BERITA & PROGRAM */}
      <section id="berita" className="py-5" style={{ backgroundColor: '#f8fafc' }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <span className="text-primary fw-bold text-uppercase tracking-wider">Informasi Publik</span>
            <h2 className="fw-bolder mt-2 display-6">Kabar & Layanan Terkini</h2>
            <div className="bg-primary mx-auto mt-4" style={{ width: '80px', height: '4px', borderRadius: '2px' }}></div>
          </div>
          
          <div className="row g-4">
            {program.length > 0 ? (
              program.map((p: any) => (
                <div key={p.id} className="col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden transition-all hover-lift">
                    <Link href={`/post/${p.slug}`} className="d-block bg-dark position-relative" style={{ height: '220px' }}>
                      {p.image_url ? (
                        <img src={p.image_url} className="w-100 h-100" style={{ objectFit: 'cover' }} alt={p.title} />
                      ) : (
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white"><i className="fa-solid fa-image fa-3x opacity-50"></i></div>
                      )}
                      <span className="position-absolute top-0 end-0 bg-primary text-white px-3 py-1 m-3 rounded-pill fw-bold text-xs">{p.type}</span>
                    </Link>
                    <div className="card-body p-4 d-flex flex-column bg-white">
                      <Link href={`/post/${p.slug}`} className="text-decoration-none text-dark">
                        <h5 className="fw-bold mb-3 hover-text-primary">{p.title}</h5>
                      </Link>
                      <div className="text-muted small mb-4 flex-grow-1" dangerouslySetInnerHTML={{ __html: String(p.content).substring(0, 100) + '...' }} />
                      <Link href={`/post/${p.slug}`} className="btn btn-outline-primary rounded-pill w-100 mt-auto fw-bold">Selengkapnya</Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center w-100 text-muted">Belum ada informasi yang dipublikasikan.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}