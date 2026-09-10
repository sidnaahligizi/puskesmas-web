import { db } from "../../lib/db"; 
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  if (!cookieStore.get("is_admin")) redirect("/login");

  const { rows: viewsRow } = await db.execute("SELECT value FROM site_settings WHERE key = 'page_views'");
  const totalViews = String(viewsRow[0]?.value || "0");
  
  const { rows: brandRow } = await db.execute("SELECT value FROM site_settings WHERE key = 'brand_name'");
  const currentBrand = String(brandRow[0]?.value || "Puskesmas Nelayan");

  // FUNGSI BACKEND
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

  async function updateBrand(formData: FormData) {
    "use server";
    const newBrand = formData.get("brand_name") as string;
    await db.execute({
      sql: "UPDATE site_settings SET value = ? WHERE key = 'brand_name'",
      args: [newBrand]
    });
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
      
      {/* INJEKSI CSS KHUSUS ADMIN (Dari template Apps Script Anda) */}
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-sidebar { width: 250px; background: #1e293b; color: white; min-height: 100vh; position: fixed; left: 0; top: 0; overflow-y: auto; z-index: 1000; }
        .admin-sidebar a { display: block; padding: 15px 25px; color: #cbd5e1; text-decoration: none; font-weight: 500; border-left: 4px solid transparent; transition: 0.3s; }
        .admin-sidebar a:hover, .admin-sidebar a.active { background: rgba(255,255,255,0.1); color: white; border-left-color: var(--primary-green); }
        .admin-main { margin-left: 250px; padding: 30px; width: calc(100% - 250px); }
        @media (max-width: 768px) {
            .admin-sidebar { width: 100%; position: relative; min-height: auto; }
            .admin-main { margin-left: 0; padding: 15px; width: 100%; }
        }
      `}} />

      {/* 1. SIDEBAR KIRI */}
      <aside className="admin-sidebar shadow-lg">
        <div className="p-4 text-center border-bottom border-secondary border-opacity-25 mb-3">
            <h4 className="fw-bold text-white mb-0">ADMIN PANEL</h4>
            <p className="small text-muted mb-0 mt-1">Sistem Manajemen Konten</p>
        </div>
        
        <a href="/admin" className="active"><i className="fa-solid fa-chart-line me-2"></i> Dashboard</a>
        
        <p className="px-4 text-xs font-bold text-secondary mt-4 mb-2 text-uppercase" style={{ fontSize: '0.75rem' }}>Aksi Web</p>
        
        <a href="/"><i className="fa-solid fa-earth-asia me-2"></i> Lihat Website Utama</a>
        
        <form action={logout} className="mt-5 border-top border-secondary border-opacity-25 pt-3">
          <button type="submit" className="btn btn-link text-danger text-decoration-none w-100 text-start" style={{ padding: '15px 25px', fontWeight: 500 }}>
            <i className="fa-solid fa-right-from-bracket me-2"></i> Keluar (Logout)
          </button>
        </form>
      </aside>

      {/* 2. KONTEN UTAMA KANAN */}
      <main className="admin-main">
        
        {/* Widget Statistik */}
        <div className="row g-4 mb-5">
            <div className="col-md-6">
                <div className="bg-white p-4 rounded-4 shadow-sm border-start border-4 border-success h-100 d-flex align-items-center">
                    <div className="bg-light text-success rounded-circle d-flex align-items-center justify-content-center fs-3 me-4" style={{width:'60px', height:'60px'}}><i className="fa-solid fa-users"></i></div>
                    <div>
                        <h6 className="text-muted fw-bold text-uppercase mb-1">Total Kunjungan Web</h6>
                        <h2 className="fw-bolder text-dark mb-0">{totalViews} Viewer</h2>
                    </div>
                </div>
            </div>
            <div className="col-md-6">
                <div className="bg-white p-4 rounded-4 shadow-sm border-start border-4 border-primary h-100 d-flex align-items-center">
                    <div className="bg-light text-primary rounded-circle d-flex align-items-center justify-content-center fs-3 me-4" style={{width:'60px', height:'60px'}}><i className="fa-solid fa-hospital"></i></div>
                    <div>
                        <h6 className="text-muted fw-bold text-uppercase mb-1">Nama Brand Aktif</h6>
                        <h2 className="fw-bolder text-dark mb-0">{currentBrand}</h2>
                    </div>
                </div>
            </div>
        </div>

        <div className="row g-4">
          {/* Form Tambah Berita/Program */}
          <div className="col-lg-8">
            <div className="bg-white p-4 rounded-4 shadow-sm">
              <div className="d-flex align-items-center border-bottom pb-3 mb-4">
                <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{width:'40px', height:'40px'}}>
                  <i className="fa-solid fa-pen"></i>
                </div>
                <h4 className="fw-bold text-dark mb-0">Tambah Konten Baru</h4>
              </div>
              
              <form action={addPost} className="row g-3">
                <div className="col-12">
                  <label className="form-label text-muted small fw-bold">Judul Konten</label>
                  <input name="title" required className="form-control py-2 rounded-3 bg-light border-0" placeholder="Masukkan judul..." />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label text-muted small fw-bold">Kategori</label>
                  <select name="type" className="form-select py-2 rounded-3 bg-light border-0">
                    <option value="Berita">Berita</option>
                    <option value="Pengumuman">Pengumuman</option>
                    <option value="Program">Program Terapi</option>
                    <option value="Layanan">Layanan</option>
                  </select>
                </div>
                
                <div className="col-md-6">
                  <label className="form-label text-muted small fw-bold">Upload Foto (Opsional)</label>
                  <input type="file" name="image" accept="image/*" className="form-control py-2 rounded-3 bg-light border-0" />
                </div>
                
                <div className="col-12">
                  <label className="form-label text-muted small fw-bold">Isi Konten (Bisa menggunakan tag HTML)</label>
                  <textarea name="content" rows={7} required className="form-control py-2 rounded-3 bg-light border-0" placeholder="Tulis deskripsi konten di sini..."></textarea>
                </div>
                
                <div className="col-12 mt-4 text-end">
                  <button type="submit" className="btn btn-primary rounded-pill px-5 py-2 fw-bold shadow-sm">
                    <i className="fa-solid fa-paper-plane me-2"></i> Publikasikan Sekarang
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Form Pengaturan */}
          <div className="col-lg-4">
            <div className="bg-white p-4 rounded-4 shadow-sm h-100">
              <div className="d-flex align-items-center border-bottom pb-3 mb-4">
                <div className="bg-warning text-dark rounded-circle d-flex align-items-center justify-content-center me-3" style={{width:'40px', height:'40px'}}>
                  <i className="fa-solid fa-gear"></i>
                </div>
                <h4 className="fw-bold text-dark mb-0">Pengaturan Web</h4>
              </div>
              
              <form action={updateBrand} className="row g-3">
                <div className="col-12">
                  <label className="form-label text-muted small fw-bold">Ubah Nama Brand Puskesmas</label>
                  <input name="brand_name" defaultValue={currentBrand} required className="form-control py-2 rounded-3 bg-light border-0" />
                </div>
                <div className="col-12 mt-4">
                  <button type="submit" className="btn btn-warning w-100 rounded-pill py-2 fw-bold shadow-sm">
                    <i className="fa-solid fa-save me-2"></i> Update Pengaturan
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