import { db } from "../lib/db";
import Link from "next/link";

export default async function Home() {
  await db.execute("UPDATE site_settings SET value = CAST(value AS INTEGER) + 1 WHERE key = 'page_views'");
  const { rows: settingRows } = await db.execute("SELECT * FROM site_settings");
  const settings: Record<string, string> = {};
  settingRows.forEach((row: any) => { settings[row.key] = row.value; });

  const { rows: program } = await db.execute("SELECT * FROM posts ORDER BY id DESC LIMIT 6");
  const { rows: sliders } = await db.execute("SELECT * FROM sliders ORDER BY id DESC");
  const { rows: services } = await db.execute("SELECT * FROM services ORDER BY id ASC");

  return (
    <div id="home">
      {/* MULTI IMAGE CAROUSEL SLIDER */}
      <div id="heroCarousel" className="carousel slide" data-bs-ride="carousel" style={{ marginTop: '-30px' }}>
        <div className="carousel-inner" style={{ height: '550px' }}>
          {sliders.map((s: any, idx: number) => (
            <div key={s.id} className={`carousel-item h-100 ${idx === 0 ? 'active' : ''}`}>
              <div className="position-absolute top-0 w-100 h-100 bg-dark">
                <img src={s.image_url} className="w-100 h-100 opacity-50" style={{ objectFit: 'cover' }} alt={s.title} />
              </div>
              <div className="carousel-caption d-none d-md-block bg-dark bg-opacity-50 rounded-4 p-4 mb-5 shadow-lg mx-auto" style={{ maxWidth: '700px' }}>
                <h2 className="display-5 fw-bolder text-white">{s.title}</h2>
                <p className="text-light mb-0 fs-5">{s.description}</p>
                <div className="mt-4">
                  <a href={settings['action_link'] || '#'} target="_blank" className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow">
                    {settings['action_title'] || 'Daftar Layanan'} <i className="fa-solid fa-arrow-right ms-2"></i>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon p-3 bg-dark bg-opacity-50 rounded-circle" aria-hidden="true"></span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon p-3 bg-dark bg-opacity-50 rounded-circle" aria-hidden="true"></span>
        </button>
      </div>

      {/* LAYANAN DINAMIS */}
      <section id="layanan" className="py-5 bg-white">
        <div className="container py-4">
          <h2 className="text-center fw-bold text-dark mb-5">Program Layanan Kesehatan</h2>
          <div className="row g-4 justify-content-center">
            {services.map((svc: any) => (
              <div key={svc.id} className="col-md-4">
                <article className="card h-100 border-0 shadow-sm rounded-4 p-4 text-center">
                  <div className="bg-primary bg-opacity-10 text-primary mx-auto rounded-circle d-flex align-items-center justify-content-center mb-4" style={{ width: '80px', height: '80px' }}>
                    <i className={`${svc.icon} fa-2x`}></i>
                  </div>
                  <h4 className="fw-bold mb-3">{svc.title}</h4>
                  <p className="text-muted small">{svc.description}</p>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISI & MISI */}
      <section id="visi-misi" className="py-5" style={{ backgroundColor: '#f0fdf4' }}>
        <div className="container py-5 text-center">
          <div className="d-inline-block bg-success text-white rounded-circle p-3 mb-4 shadow"><i className="fa-solid fa-bullseye fa-2x"></i></div>
          <h2 className="fw-bold mb-4 text-dark">Visi & Misi</h2>
          <div className="mx-auto text-muted" style={{ maxWidth: '800px', fontSize: '1.15rem', lineHeight: '1.8' }} dangerouslySetInnerHTML={{ __html: settings['visi_misi'] }} />
        </div>
      </section>

      {/* BERITA & PROGRAM */}
      <section id="berita" className="py-5" style={{ backgroundColor: '#f8fafc' }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <span className="text-primary fw-bold text-uppercase tracking-wider">Katalog Program</span>
            <h2 className="fw-bolder mt-2 display-6">Informasi & Layanan Terkini</h2>
            <div className="bg-primary mx-auto mt-4" style={{ width: '80px', height: '4px', borderRadius: '2px' }}></div>
          </div>
          <div className="row g-4">
            {program.map((p: any) => (
              <div key={p.id} className="col-md-6 col-lg-4">
                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
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
                      <h5 className="fw-bold mb-3">{p.title}</h5>
                    </Link>
                    <div className="text-muted small mb-4 flex-grow-1" dangerouslySetInnerHTML={{ __html: String(p.content).substring(0, 100) + '...' }} />
                    <Link href={`/post/${p.slug}`} className="btn btn-outline-primary rounded-pill w-100 mt-auto fw-bold">Selengkapnya</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}