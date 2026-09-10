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
      {/* HERO SLIDER FULL WIDTH */}
      <div className="w-100 overflow-hidden bg-dark position-relative" style={{ height: '500px', marginTop: '-30px' }}>
        <img src={settings['slider_1']} className="w-100 h-100 opacity-75" style={{ objectFit: 'cover' }} alt="Slider" />
        <div className="position-absolute top-50 start-50 translate-middle text-center w-100 px-3">
          <h1 className="display-4 fw-bold text-white shadow-sm mb-3">Selamat Datang di {settings['brand_name'] || "Puskesmas"}</h1>
          <p className="lead text-white bg-dark bg-opacity-50 d-inline-block px-4 py-2 rounded-pill">Pelayanan Profesional, Ramah, dan Terpercaya</p>
        </div>
      </div>

      {/* VISI & MISI SECTION */}
      <section className="py-5 bg-white">
        <div className="container py-4 text-center">
          <h2 className="fw-bold mb-4 text-primary">Visi & Misi</h2>
          <div className="mx-auto" style={{ maxWidth: '800px', fontSize: '1.1rem' }} dangerouslySetInnerHTML={{ __html: settings['visi_misi'] }} />
        </div>
      </section>

      {/* BERITA & PROGRAM */}
      <section id="berita" className="py-5 bg-light">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Katalog Berita & Program</h2>
            <div className="bg-primary mx-auto" style={{ width: '60px', height: '4px', borderRadius: '2px' }}></div>
          </div>
          
          <div className="row g-4">
            {program.length > 0 ? (
              program.map((p: any) => (
                <div key={p.id} className="col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                    <Link href={`/post/${p.slug}`} className="d-block bg-dark" style={{ height: '220px' }}>
                      {p.image_url ? (
                        <img src={p.image_url} className="w-100 h-100" style={{ objectFit: 'cover' }} alt={p.title} />
                      ) : (
                        <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white"><i className="fa-solid fa-image fa-3x opacity-50"></i></div>
                      )}
                    </Link>
                    <div className="card-body p-4 d-flex flex-column">
                      <span className="badge bg-primary bg-opacity-10 text-primary w-auto mb-3" style={{ width: 'fit-content' }}>{p.type}</span>
                      <Link href={`/post/${p.slug}`} className="text-decoration-none text-dark">
                        <h5 className="fw-bold mb-3">{p.title}</h5>
                      </Link>
                      <div className="text-muted small mb-4 flex-grow-1" dangerouslySetInnerHTML={{ __html: String(p.content).substring(0, 100) + '...' }} />
                      <Link href={`/post/${p.slug}`} className="btn btn-outline-primary rounded-pill w-100 mt-auto">Selengkapnya</Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center w-100 text-muted">Belum ada berita.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}