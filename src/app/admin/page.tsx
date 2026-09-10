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
    const keysToUpdate = ['brand_name', 'address', 'phone', 'email', 'facebook', 'instagram', 'visi_misi', 'profil_teks', 'slider_1', 'logo_url'];
    
    for (const key of keysToUpdate) {
      const val = formData.get(key) as string;
      if (val !== null) {
        // Cek apakah key sudah ada
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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-sidebar { width: 250px; background: #1e293b; color: white; position: fixed; height: 100vh; overflow-y: auto; }
        .admin-sidebar a { display: block; padding: 15px 25px; color: #cbd5e1; text-decoration: none; border-left: 4px solid transparent; }
        .admin-sidebar a:hover { background: rgba(255,255,255,0.1); color: white; border-left-color: #3b82f6; }
        .admin-main { margin-left: 250px; padding: 30px; width: calc(100% - 250px); }
      `}} />

      <aside className="admin-sidebar shadow-lg">
        <div className="p-4 text-center border-bottom border-secondary mb-3">
            <h5 className="fw-bold text-white mb-0">SUPER ADMIN</h5>
        </div>
        <a href="/" target="_blank"><i className="fa-solid fa-earth-asia me-2"></i> Lihat Website</a>
        <form action={logout} className="mt-5 border-top border-secondary pt-3">
          <button type="submit" className="btn btn-link text-danger w-100 text-start text-decoration-none fw-bold" style={{ padding: '15px 25px' }}>
            <i className="fa-solid fa-power-off me-2"></i> Keluar
          </button>
        </form>
      </aside>

      <main className="admin-main">
        <h2 className="fw-bold mb-4">Dashboard & Pengaturan Global</h2>
        
        <div className="row g-4">
          {/* KOLOM KIRI: SETTINGS KOMPLEKS */}
          <div className="col-xl-8">
            <div className="bg-white p-4 rounded-4 shadow-sm mb-4">
              <h5 className="fw-bold border-bottom pb-3 mb-4"><i className="fa-solid fa-gears text-warning me-2"></i> Pengaturan Website Lengkap</h5>
              <form action={saveComplexSettings} className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Nama Brand / Puskesmas</label>
                  <input name="brand_name" defaultValue={settings['brand_name']} className="form-control bg-light" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Link URL Logo & Favicon</label>
                  <input name="logo_url" defaultValue={settings['logo_url']} className="form-control bg-light" />
                </div>
                
                <div className="col-md-4">
                  <label className="form-label small fw-bold">No. Telepon</label>
                  <input name="phone" defaultValue={settings['phone']} className="form-control bg-light" />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">Email</label>
                  <input name="email" defaultValue={settings['email']} className="form-control bg-light" />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-bold">Alamat Lengkap</label>
                  <input name="address" defaultValue={settings['address']} className="form-control bg-light" />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">Link Facebook</label>
                  <input name="facebook" defaultValue={settings['facebook']} className="form-control bg-light" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Link Instagram</label>
                  <input name="instagram" defaultValue={settings['instagram']} className="form-control bg-light" />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold">Link URL Gambar Slider Depan</label>
                  <input name="slider_1" defaultValue={settings['slider_1']} className="form-control bg-light" />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold">Visi & Misi (HTML)</label>
                  <textarea name="visi_misi" defaultValue={settings['visi_misi']} rows={4} className="form-control bg-light"></textarea>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Teks Profil Singkat (Footer)</label>
                  <textarea name="profil_teks" defaultValue={settings['profil_teks']} rows={4} className="form-control bg-light"></textarea>
                </div>

                <div className="col-12 text-end mt-4">
                  <button type="submit" className="btn btn-warning px-5 rounded-pill fw-bold shadow-sm">Simpan Pengaturan Web</button>
                </div>
              </form>
            </div>
          </div>

          {/* KOLOM KANAN: TAMBAH BERITA */}
          <div className="col-xl-4">
            <div className="bg-white p-4 rounded-4 shadow-sm">
              <h5 className="fw-bold border-bottom pb-3 mb-4"><i className="fa-solid fa-pen text-primary me-2"></i> Buat Berita/Program</h5>
              <form action={addPost} className="row g-3">
                <div className="col-12">
                  <label className="form-label small fw-bold">Judul</label>
                  <input name="title" required className="form-control bg-light" />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Kategori</label>
                  <select name="type" className="form-select bg-light">
                    <option value="Berita">Berita</option>
                    <option value="Program">Program</option>
                    <option value="Layanan">Layanan</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Upload Cover File</label>
                  <input type="file" name="image" accept="image/*" className="form-control bg-light" />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold">Isi (HTML)</label>
                  <textarea name="content" rows={5} required className="form-control bg-light"></textarea>
                </div>
                <div className="col-12 mt-3">
                  <button type="submit" className="btn btn-primary w-100 rounded-pill fw-bold shadow-sm">Publish Postingan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}