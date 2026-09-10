import { db } from "../../lib/db"; 
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  if (!cookieStore.get("is_admin")) redirect("/login");

  const { rows } = await db.execute("SELECT * FROM site_settings");
  const settings: Record<string, string> = {};
  rows.forEach((row: any) => { settings[row.key] = String(row.value); });

  async function addPost(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const type = formData.get("type") as string;
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();

    let base64Image = null;
    const imageFile = formData.get("image") as File;
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      base64Image = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
    }
    await db.execute({
      sql: "INSERT INTO posts (title, slug, type, content, image_url) VALUES (?, ?, ?, ?, ?)",
      args: [title, slug, type, content, base64Image],
    });
    revalidatePath("/");
  }

  async function saveComplexSettings(formData: FormData) {
    "use server";
    // Semua kunci yang akan disimpan dari form
    const keysToUpdate = [
      'brand_name', 'address', 'phone', 'email', 'slider_1', 'logo_url', 
      'facebook', 'instagram', 'tiktok', 'youtube', 'whatsapp', 
      'action_title', 'action_link', 'visi_misi', 'profil_teks'
    ];
    
    for (const key of keysToUpdate) {
      const val = formData.get(key) as string;
      if (val !== null) {
        const { rows } = await db.execute({ sql: "SELECT * FROM site_settings WHERE key = ?", args: [key] });
        if (rows.length > 0) {
          await db.execute({ sql: "UPDATE site_settings SET value = ? WHERE key = ?", args: [val, key] });
        } else {
          await db.execute({ sql: "INSERT INTO site_settings (key, value) VALUES (?, ?)", args: [key, val] });
        }
      }
    }
    revalidatePath("/");
  }

  async function logout() {
    "use server";
    const cookieStore = await cookies();
    cookieStore.delete("is_admin");
    redirect("/login");
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-sidebar { width: 260px; background: #0f172a; color: white; position: fixed; height: 100vh; overflow-y: auto; }
        .admin-sidebar a { display: block; padding: 15px 25px; color: #94a3b8; text-decoration: none; border-left: 4px solid transparent; transition: 0.2s; }
        .admin-sidebar a:hover, .admin-sidebar a.active { background: rgba(255,255,255,0.05); color: #fff; border-left-color: #3b82f6; }
        .admin-main { margin-left: 260px; padding: 40px; width: calc(100% - 260px); }
        .form-control, .form-select { border: 1px solid #e2e8f0; padding: 0.6rem 1rem; }
        .form-control:focus { border-color: #3b82f6; box-shadow: 0 0 0 0.25rem rgba(59, 130, 246, 0.25); }
      `}} />

      <aside className="admin-sidebar shadow-lg">
        <div className="p-4 text-center border-bottom border-secondary border-opacity-25 mb-4">
            <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2 shadow" style={{width:'50px', height:'50px'}}><i className="fa-solid fa-user-tie fs-4"></i></div>
            <h5 className="fw-bolder text-white mb-0">SUPER ADMIN</h5>
            <small className="text-muted">Control Panel</small>
        </div>
        <a href="/admin" className="active"><i className="fa-solid fa-house me-3"></i> Dashboard Utama</a>
        <a href="/" target="_blank"><i className="fa-solid fa-arrow-up-right-from-square me-3"></i> Lihat Website</a>
        
        <form action={logout} className="mt-5 border-top border-secondary border-opacity-25 pt-3">
          <button type="submit" className="btn btn-link text-danger w-100 text-start text-decoration-none fw-bold" style={{ padding: '15px 25px' }}>
            <i className="fa-solid fa-power-off me-3"></i> Keluar Sistem
          </button>
        </form>
      </aside>

      <main className="admin-main">
        <h2 className="fw-bolder text-dark mb-4">Pusat Kendali Website</h2>
        
        <div className="row g-4">
          
          {/* KOLOM KIRI: SETTINGS SUPER KOMPLEKS */}
          <div className="col-xl-8">
            <div className="bg-white p-5 rounded-4 shadow-sm border border-light mb-4">
              <h5 className="fw-bolder border-bottom pb-3 mb-4 text-dark"><i className="fa-solid fa-gears text-primary me-2"></i> Pengaturan Konfigurasi Utama</h5>
              <form action={saveComplexSettings}>
                
                {/* Section 1: Identitas & Aksi */}
                <h6 className="fw-bold text-muted mt-4 mb-3"><i className="fa-regular fa-id-card me-2"></i>Identitas & Tombol Utama</h6>
                <div className="row g-3 bg-light p-3 rounded-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Nama Brand / Puskesmas</label>
                    <input name="brand_name" defaultValue={settings['brand_name']} className="form-control" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Link URL Logo & Favicon</label>
                    <input name="logo_url" defaultValue={settings['logo_url']} className="form-control" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Teks Tombol Navigasi (Contoh: Daftar)</label>
                    <input name="action_title" defaultValue={settings['action_title']} className="form-control border-primary" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Link Tombol (Link WhatsApp/Formulir)</label>
                    <input name="action_link" defaultValue={settings['action_link']} className="form-control border-primary" placeholder="https://..." />
                  </div>
                </div>

                {/* Section 2: Kontak & Sosmed */}
                <h6 className="fw-bold text-muted mt-4 mb-3"><i className="fa-solid fa-hashtag me-2"></i>Kontak & Media Sosial Baru</h6>
                <div className="row g-3 bg-light p-3 rounded-3 mb-4">
                  <div className="col-md-4">
                    <label className="form-label small fw-bold"><i className="fa-solid fa-phone me-1"></i> Telepon Kantor</label>
                    <input name="phone" defaultValue={settings['phone']} className="form-control" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold"><i className="fa-brands fa-whatsapp me-1 text-success"></i> No. WhatsApp (Mulai 628...)</label>
                    <input name="whatsapp" defaultValue={settings['whatsapp']} className="form-control" />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold"><i className="fa-solid fa-envelope me-1"></i> Email</label>
                    <input name="email" defaultValue={settings['email']} className="form-control" />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold"><i className="fa-solid fa-location-dot me-1"></i> Alamat Lengkap</label>
                    <input name="address" defaultValue={settings['address']} className="form-control" />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-bold"><i className="fa-brands fa-facebook text-primary me-1"></i> Facebook</label>
                    <input name="facebook" defaultValue={settings['facebook']} className="form-control" placeholder="https://..." />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-bold"><i className="fa-brands fa-instagram text-danger me-1"></i> Instagram</label>
                    <input name="instagram" defaultValue={settings['instagram']} className="form-control" placeholder="https://..." />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-bold"><i className="fa-brands fa-tiktok text-dark me-1"></i> TikTok</label>
                    <input name="tiktok" defaultValue={settings['tiktok']} className="form-control" placeholder="https://..." />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-bold"><i className="fa-brands fa-youtube text-danger me-1"></i> YouTube</label>
                    <input name="youtube" defaultValue={settings['youtube']} className="form-control" placeholder="https://..." />
                  </div>
                </div>

                {/* Section 3: Konten Teks */}
                <h6 className="fw-bold text-muted mt-4 mb-3"><i className="fa-solid fa-paragraph me-2"></i>Halaman Depan & Profil</h6>
                <div className="row g-3 bg-light p-3 rounded-3 mb-4">
                  <div className="col-12">
                    <label className="form-label small fw-bold">Link URL Foto Slider Utama</label>
                    <input name="slider_1" defaultValue={settings['slider_1']} className="form-control" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Visi & Misi (Bisa HTML)</label>
                    <textarea name="visi_misi" defaultValue={settings['visi_misi']} rows={5} className="form-control"></textarea>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">Teks Profil Footer (Singkat)</label>
                    <textarea name="profil_teks" defaultValue={settings['profil_teks']} rows={5} className="form-control"></textarea>
                  </div>
                </div>

                <div className="text-end border-top pt-4">
                  <button type="submit" className="btn btn-primary px-5 py-2 rounded-pill fw-bolder shadow">
                    <i className="fa-solid fa-floppy-disk me-2"></i> Simpan Konfigurasi Global
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* KOLOM KANAN: TAMBAH POST & KONTEN BARU */}
          <div className="col-xl-4">
            <div className="bg-white p-4 rounded-4 shadow-sm border border-light position-sticky" style={{ top: '30px' }}>
              <h5 className="fw-bolder border-bottom pb-3 mb-4 text-dark"><i className="fa-solid fa-folder-plus text-success me-2"></i> Publish Konten Baru</h5>
              <form action={addPost} className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-bold">Judul Postingan</label>
                  <input name="title" required className="form-control bg-light" />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Kategori / Menu</label>
                  <select name="type" className="form-select bg-light">
                    <option value="Berita">Berita & Artikel</option>
                    <option value="Program">Program Inovasi</option>
                    <option value="Layanan">Katalog Layanan</option>
                    <option value="Pengumuman">Pengumuman Penting</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Gambar Cover</label>
                  <input type="file" name="image" accept="image/*" className="form-control bg-light" />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Deskripsi Lengkap (HTML)</label>
                  <textarea name="content" rows={8} required className="form-control bg-light"></textarea>
                </div>
                <div className="col-12 mt-4">
                  <button type="submit" className="btn btn-success w-100 rounded-pill py-2 fw-bold shadow">
                    <i className="fa-solid fa-cloud-arrow-up me-2"></i> Upload Sekarang
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}