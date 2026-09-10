import { db } from "../lib/db";
import Link from "next/link";

export default async function Home() {
  await db.execute("UPDATE site_settings SET value = CAST(value AS INTEGER) + 1 WHERE key = 'page_views'");

  // PERBAIKAN: Membungkus hasil database dengan String()
  const { rows: brandRow } = await db.execute("SELECT value FROM site_settings WHERE key = 'brand_name'");
  const brandName = String(brandRow[0]?.value || "Puskesmas Nelayan");

  const { rows: viewsRow } = await db.execute("SELECT value FROM site_settings WHERE key = 'page_views'");
  const totalViews = String(viewsRow[0]?.value || "0");

  const { rows: program } = await db.execute("SELECT * FROM posts ORDER BY id DESC LIMIT 6");

  const linkWa = "https://wa.me/6285536666320";

  return (
    <div id="public-view">
      {/* NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-light fixed-top shadow-sm">
        <div className="container">
          <Link href="/" className="navbar-brand fw-bold text-primary d-flex align-items-center">
            <img src="https://lh3.googleusercontent.com/d/1lmHDe6r7V4bp3xdRNqfQyuzqREGYe29o" alt="Logo Puskesmas Nelayan" className="me-2" />
            {brandName}
          </Link>
          <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item"><Link className="nav-link" href="#home">Beranda</Link></li>
              <li className="nav-item"><Link className="nav-link" href="#program">Program</Link></li>
              <li className="nav-item"><Link className="nav-link" href="#keunggulan">Keunggulan</Link></li>
              <li className="nav-item"><Link className="nav-link fw-bold text-primary" href="/login"><i className="fa-solid fa-lock me-1"></i> Admin</Link></li>
              <li className="nav-item ms-lg-3 mt-3 mt-lg-0">
                <a className="btn btn-wa rounded-pill px-4 py-2" href={linkWa} target="_blank">
                  <i className="fa-brands fa-whatsapp me-2"></i>Hubungi Kami
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <main>
        {/* HERO SECTION */}
        <header id="home" className="hero-section bg-gradient-primary text-center">
          <div className="container">
            <h1 className="display-4 fw-bold mb-4">Solusi Kesehatan Tepat untuk Masyarakat Nelayan</h1>
            <p className="lead mb-4 px-md-5 fw-light mx-auto" style={{ maxWidth: '800px', fontSize: '1.15rem' }}>
              Bersama tenaga kesehatan tepercaya di {brandName}, kami menghadirkan pelayanan medis dan pendampingan nutrisi. Solusi nyata untuk tumbuh kembang anak, layanan kesehatan keluarga, hingga terapi penyakit klinis.
            </p>
            <div className="d-grid gap-3 d-sm-flex justify-content-sm-center mb-5">
              <a href="#program" className="btn btn-outline-light btn-lg px-5 rounded-pill shadow-sm">Jelajahi Program</a>
              <a href={linkWa} target="_blank" className="btn btn-wa btn-lg px-5 shadow-sm rounded-pill">Konsultasi Sekarang</a>
            </div>
          </div>
        </header>

        {/* LAYANAN UNGGULAN STATIS */}
        <section id="layanan" className="py-5 mt-4">
          <div className="container py-4">
            <h2 className="text-center section-title">Program Layanan Kesehatan</h2>
            <div className="row g-4 mt-2 justify-content-center">
              <div className="col-md-6 col-lg-4">
                <article className="card-gizi h-100 p-4 text-center d-flex flex-column">
                  <div className="feature-icon"><i className="fa-solid fa-baby"></i></div>
                  <h3 className="fw-bold mb-3 h5">Gizi Anak & Stunting</h3>
                  <p className="text-muted small mb-4 flex-grow-1">Evaluasi status gizi presisi, perhitungan Z-Score WHO, dan terapi nutrisi khusus untuk kejar tumbuh serta pencegahan stunting pada balita.</p>
                  <a href={linkWa} target="_blank" className="btn btn-outline-primary w-100 mt-auto">Daftar Program</a>
                </article>
              </div>
              <div className="col-md-6 col-lg-4">
                <article className="card-gizi h-100 p-4 text-center d-flex flex-column">
                  <div className="feature-icon"><i className="fa-solid fa-weight-scale"></i></div>
                  <h3 className="fw-bold mb-3 h5">Manajemen Kesehatan Nelayan</h3>
                  <p className="text-muted small mb-4 flex-grow-1">Program kesehatan preventif dan kuratif yang disesuaikan dengan aktivitas melaut untuk menjaga kebugaran fisik dan stamina nelayan.</p>
                  <a href={linkWa} target="_blank" className="btn btn-outline-primary w-100 mt-auto">Daftar Program</a>
                </article>
              </div>
              <div className="col-md-6 col-lg-4">
                <article className="card-gizi h-100 p-4 text-center d-flex flex-column">
                  <div className="feature-icon" style={{ color: 'var(--accent-orange)', background: '#fef3c7' }}><i className="fa-solid fa-notes-medical"></i></div>
                  <h3 className="fw-bold mb-3 h5">Layanan Medis Umum</h3>
                  <p className="text-muted small mb-4 flex-grow-1">Perencanaan kesehatan, cek medis rutin, dan edukasi pencegahan untuk Penyakit Tidak Menular (Diabetes, Hipertensi, Asam Urat).</p>
                  <a href={linkWa} target="_blank" className="btn btn-outline-primary w-100 mt-auto">Daftar Program</a>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* PROGRAM / BERITA DINAMIS DARI DATABASE */}
        <section id="program" className="py-5 mt-4 bg-white">
          <div className="container py-4">
            <div className="text-center mb-5">
              <h2 className="section-title">Katalog & Program Puskesmas</h2>
              <p className="text-muted mt-2">Berbagai program kesehatan dan terapi yang telah kami susun untuk masyarakat.</p>
            </div>
            <div className="row g-4 justify-content-center">
              {program.length > 0 ? (
                program.map((p: any) => (
                  <div key={p.id} className="col-md-6 col-lg-4">
                    <div className="card-gizi h-100 d-flex flex-column overflow-hidden">
                      <Link href={`/post/${p.slug}`} className="position-relative overflow-hidden bg-dark d-block" style={{ height: '200px' }}>
                        {p.image_url ? (
                          <img src={p.image_url} className="w-100 h-100" style={{ objectFit: 'cover' }} alt={p.title} />
                        ) : (
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white">
                            <i className="fa-solid fa-image fa-3x opacity-50"></i>
                          </div>
                        )}
                        <span className="position-absolute top-0 end-0 bg-primary text-white small fw-bold px-3 py-1 m-3 rounded-pill" style={{ zIndex: 3 }}>
                          {p.type}
                        </span>
                      </Link>
                      <div className="p-4 d-flex flex-column flex-grow-1">
                        <Link href={`/post/${p.slug}`} className="text-decoration-none">
                          <h3 className="fw-bold h5 mb-3 text-dark">{p.title}</h3>
                        </Link>
                        <div className="text-muted small flex-grow-1 mb-4" dangerouslySetInnerHTML={{ __html: String(p.content).substring(0, 100) + '...' }} />
                        <div className="d-flex gap-2 mt-auto">
                          <Link href={`/post/${p.slug}`} className="btn btn-outline-primary btn-sm flex-grow-1 rounded-pill">
                            Baca Selengkapnya
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted text-center w-100">Belum ada portofolio program. Silakan tambah via halaman Admin.</p>
              )}
            </div>
          </div>
        </section>

        {/* MENGAPA MEMILIH KAMI */}
        <section id="keunggulan" className="py-5" style={{ backgroundColor: '#f0fdf4' }}>
          <div className="container py-4">
            <div className="row align-items-center">
              <div className="col-lg-5 mb-5 mb-lg-0 text-center">
                <img src="https://lh3.googleusercontent.com/d/1lmHDe6r7V4bp3xdRNqfQyuzqREGYe29o" alt="Ilustrasi Puskesmas" className="img-fluid bg-white p-4 shadow-sm" style={{ borderRadius: '30px', maxWidth: '250px' }} />
              </div>
              <div className="col-lg-7">
                <h2 className="fw-bold mb-4">Mengapa Memilih Pelayanan Bersama Kami?</h2>
                <ul className="list-unstyled mt-4">
                  <li className="mb-4 d-flex align-items-start">
                    <div className="bg-primary text-white rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                      <i className="fa-solid fa-microscope"></i>
                    </div>
                    <div className="ms-3">
                      <h4 className="fw-bold mb-1 h6">Pelayanan Sesuai Standar Kemenkes</h4>
                      <p className="text-muted small mb-0">Rekomendasi tindakan medis dan asupan gizi mengacu pada standar kesehatan resmi dari Kementerian Kesehatan RI dan WHO.</p>
                    </div>
                  </li>
                  <li className="mb-4 d-flex align-items-start">
                    <div className="bg-primary text-white rounded-circle flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: '45px', height: '45px' }}>
                      <i className="fa-solid fa-leaf"></i>
                    </div>
                    <div className="ms-3">
                      <h4 className="fw-bold mb-1 h6">Pendekatan Ramah Masyarakat Nelayan</h4>
                      <p className="text-muted small mb-0">Solusi kesehatan dan gizi disesuaikan dengan kondisi lingkungan dan potensi bahan makanan lokal pesisir Gresik.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="pt-5 pb-3 bg-dark text-white">
        <div className="container text-center">
          <div className="mb-4">
            <img src="https://lh3.googleusercontent.com/d/1lmHDe6r7V4bp3xdRNqfQyuzqREGYe29o" alt="Logo Puskesmas Nelayan Footer" height="70" className="bg-white rounded-circle p-2 shadow" />
          </div>
          <h5 className="fw-bold mb-2">{brandName}</h5>
          <p className="mb-4 text-secondary small">Sahabat kesehatan terpercaya untuk masyarakat pesisir, tumbuh kembang anak, dan gaya hidup sehat keluarga Anda.</p>
          
          <div className="seo-areas mt-4 mb-4 p-3 bg-secondary bg-opacity-10 rounded">
            <span className="d-block mb-1 fw-bold text-light">Jangkauan Layanan {brandName}:</span>
            <span style={{ wordWrap: 'break-word' }}>Bungah, Dukun, Kebomas, Manyar, Panceng, Sidayu, Ujungpangkah, Sangkapura, Tambak, dan seluruh wilayah pesisir Kabupaten Gresik.</span>
          </div>
          
          <div className="badge bg-white text-dark mb-4 py-2 px-4 rounded-pill">
            <i className="fa-solid fa-eye text-primary me-2"></i> Pengunjung Web: <strong>{totalViews}</strong>
          </div>
          
          <hr className="border-secondary mb-3 opacity-25" />
          <p className="mb-1 small text-secondary">© 2026 {brandName}. Hak Cipta Dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}