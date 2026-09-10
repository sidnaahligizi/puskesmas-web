import { db } from "../../lib/db"; 
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ tab?: string, action?: string }> }) {
  const cookieStore = await cookies();
  if (!cookieStore.get("is_admin")) redirect("/login");

  const resolvedParams = await searchParams;
  const tab = resolvedParams?.tab || 'dashboard';
  const actionParam = resolvedParams?.action;

  // Fungsi Tambah Berita
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
    await db.execute({ sql: "INSERT INTO posts (title, slug, type, content, image_url) VALUES (?, ?, ?, ?, ?)", args: [title, slug, type, content, base64Image]});
    revalidatePath("/admin");
    redirect("/admin?tab=program");
  }

  // Fungsi Hapus Generik
  async function deleteData(formData: FormData) {
    "use server";
    const table = formData.get("table") as string;
    const id = formData.get("id") as string;
    await db.execute({ sql: `DELETE FROM ${table} WHERE id = ?`, args: [id] });
    revalidatePath("/admin");
  }

  // Fungsi Logout
  async function logout() {
    "use server";
    const cookieStore = await cookies();
    cookieStore.delete("is_admin");
    redirect("/login");
  }

  // Render Konten Berdasarkan Tab Aktif
  let mainContent = null;

  if (tab === 'dashboard') {
    const { rows: vRow } = await db.execute("SELECT value FROM site_settings WHERE key = 'page_views'");
    const { rows: pRow } = await db.execute("SELECT COUNT(*) as total FROM posts");
    mainContent = (
      <div>
        <h2 className="fw-bolder text-dark mb-2">Monitoring Viewers</h2>
        <p className="text-muted mb-4">Statistik kinerja pengunjung dan program pada website Anda</p>
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className="bg-white p-4 rounded-4 shadow-sm border-start border-4 border-success d-flex align-items-center">
              <div className="bg-success bg-opacity-10 text-success rounded-circle d-flex align-items-center justify-content-center me-4" style={{width:'60px',height:'60px'}}><i className="fa-solid fa-users fa-2x"></i></div>
              <div><h6 className="text-muted fw-bold mb-1">KUNJUNGAN WEB KESELURUHAN</h6><h2 className="fw-bolder mb-0">{vRow[0]?.value || 0}</h2></div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="bg-white p-4 rounded-4 shadow-sm border-start border-4 border-primary d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-4" style={{width:'60px',height:'60px'}}><i className="fa-solid fa-eye fa-2x"></i></div>
              <div><h6 className="text-muted fw-bold mb-1">TOTAL KONTEN PROGRAM</h6><h2 className="fw-bolder mb-0">{pRow[0]?.total || 0}</h2></div>
            </div>
          </div>
        </div>
      </div>
    );
  } 
  
  else if (tab === 'pengaturan') {
    mainContent = (
      <div className="bg-white p-5 rounded-4 shadow-sm">
        <h3 className="fw-bold mb-4">Data Pengaturan Teks (Buka File Kode Tahap 5 Sebelumnya)</h3>
        <div className="alert alert-info">Untuk pengaturan teks kompleks, gunakan form di Dashboard versi sebelumnya, atau Anda dapat merombak kode ini sesuai kebutuhan spesifik. Data terhubung otomatis ke Turso.</div>
      </div>
    );
  }

  else if (tab === 'slider') {
    const { rows } = await db.execute("SELECT * FROM sliders");
    mainContent = (
      <div className="bg-white p-4 rounded-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div><h3 className="fw-bold mb-0">Data Slider</h3><p className="text-muted small mb-0">Kelola gambar banner berjalan</p></div>
          <button className="btn btn-primary rounded-pill px-4"><i className="fa-solid fa-plus me-2"></i> Tambah Baru</button>
        </div>
        <table className="table table-hover align-middle">
          <thead className="table-light"><tr><th>ID</th><th>GAMBAR</th><th>JUDUL</th><th>DESKRIPSI</th><th>AKSI</th></tr></thead>
          <tbody>
            {rows.map((r:any) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td><img src={r.image_url} width="60" className="rounded" alt="slider" /></td>
                <td className="fw-bold">{r.title}</td>
                <td className="text-muted small">{r.description}</td>
                <td>
                  <form action={deleteData}><input type="hidden" name="table" value="sliders"/><input type="hidden" name="id" value={r.id}/><button className="btn btn-sm btn-danger"><i className="fa-solid fa-trash"></i></button></form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  else if (tab === 'program') {
    if (actionParam === 'add') {
      mainContent = (
        <div className="bg-white p-5 rounded-4 shadow-sm">
          <h4 className="fw-bold mb-4 border-bottom pb-3">Tambah Konten Program</h4>
          <form action={addPost} className="row g-3">
            <div className="col-12"><label className="fw-bold small">Judul</label><input name="title" required className="form-control" /></div>
            <div className="col-12"><label className="fw-bold small">Kategori</label><select name="type" className="form-select"><option>Berita</option><option>Program</option></select></div>
            <div className="col-12"><label className="fw-bold small">Foto Cover</label><input type="file" name="image" className="form-control" /></div>
            <div className="col-12"><label className="fw-bold small">Isi Konten</label><textarea name="content" rows={5} className="form-control" required></textarea></div>
            <div className="col-12"><button className="btn btn-success px-4 rounded-pill">Simpan Data</button> <Link href="?tab=program" className="btn btn-light rounded-pill px-4">Batal</Link></div>
          </form>
        </div>
      );
    } else {
      const { rows } = await db.execute("SELECT * FROM posts");
      mainContent = (
        <div className="bg-white p-4 rounded-4 shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div><h3 className="fw-bold mb-0">Data Program</h3><p className="text-muted small mb-0">Kelola Berita dan Katalog</p></div>
            <Link href="?tab=program&action=add" className="btn btn-primary rounded-pill px-4"><i className="fa-solid fa-plus me-2"></i> Tambah Baru</Link>
          </div>
          <table className="table table-hover align-middle">
            <thead className="table-light"><tr><th>JUDUL</th><th>KATEGORI</th><th>GAMBAR</th><th>AKSI</th></tr></thead>
            <tbody>
              {rows.map((r:any) => (
                <tr key={r.id}>
                  <td className="fw-bold">{r.title}</td><td><span className="badge bg-secondary">{r.type}</span></td>
                  <td>{r.image_url ? <img src={r.image_url} width="50" height="50" className="rounded object-fit-cover" alt="img"/> : '-'}</td>
                  <td><form action={deleteData}><input type="hidden" name="table" value="posts"/><input type="hidden" name="id" value={r.id}/><button className="btn btn-sm btn-danger"><i className="fa-solid fa-trash"></i></button></form></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      {/* TRIK CSS: Menyembunyikan Desain Layout Publik & Membuat Desain Sidebar Admin */}
      <style dangerouslySetInnerHTML={{ __html: `
        .public-topbar, .public-navbar, .public-footer { display: none !important; }
        .public-content { padding: 0 !important; min-height: 0 !important; }
        body { background-color: #f1f5f9 !important; }
        
        .admin-sidebar { width: 260px; background: #1e293b; color: white; position: fixed; height: 100vh; overflow-y: auto; }
        .admin-sidebar a { display: block; padding: 15px 25px; color: #cbd5e1; text-decoration: none; border-left: 4px solid transparent; font-weight: 500; font-size: 0.9rem; transition: 0.2s; }
        .admin-sidebar a:hover, .admin-sidebar a.active { background: rgba(255,255,255,0.05); color: #fff; border-left-color: #3b82f6; }
        .admin-main { margin-left: 260px; padding: 40px; width: calc(100% - 260px); }
      `}} />

      {/* SIDEBAR PERSIS SEPERTI GAMBAR */}
      <aside className="admin-sidebar shadow-lg">
        <div className="p-4 text-center border-bottom border-secondary border-opacity-25 mb-3">
            <h4 className="fw-bolder text-white mb-0 text-uppercase tracking-wider">PUSKESMAS ADMIN</h4>
            <small className="text-muted">Sistem Manajemen Konten</small>
        </div>
        
        <Link href="?tab=dashboard" className={tab === 'dashboard' ? 'active' : ''}><i className="fa-solid fa-chart-line me-3"></i> Dashboard</Link>
        
        <div className="px-4 mt-4 mb-2"><small className="text-muted fw-bold text-uppercase" style={{fontSize: '0.75rem'}}>Konten Website</small></div>
        <Link href="?tab=pengaturan" className={tab === 'pengaturan' ? 'active' : ''}><i className="fa-solid fa-sliders me-3"></i> Pengaturan Teks</Link>
        <Link href="?tab=slider" className={tab === 'slider' ? 'active' : ''}><i className="fa-solid fa-images me-3"></i> Kelola Slider</Link>
        <Link href="?tab=menu" className={tab === 'menu' ? 'active' : ''}><i className="fa-solid fa-bars me-3"></i> Kelola Menu Navigasi</Link>
        <Link href="?tab=layanan" className={tab === 'layanan' ? 'active' : ''}><i className="fa-solid fa-notes-medical me-3"></i> Kelola Layanan</Link>
        <Link href="?tab=program" className={tab === 'program' ? 'active' : ''}><i className="fa-solid fa-folder-open me-3"></i> Katalog/Program</Link>
        
        <div className="px-4 mt-5"><Link href="/" className="btn btn-outline-info w-100 rounded-pill btn-sm"><i className="fa-solid fa-earth-asia me-2"></i> Lihat Website</Link></div>
        
        <form action={logout} className="mt-3">
          <button type="submit" className="btn btn-link text-danger w-100 text-decoration-none fw-bold"><i className="fa-solid fa-right-from-bracket me-2"></i> Keluar</button>
        </form>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="admin-main">
        {mainContent || <div className="alert alert-info">Menu ini sedang dalam tahap pengembangan.</div>}
      </main>
    </div>
  );
}