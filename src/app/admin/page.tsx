import { db } from "../../lib/db"; 
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { SubmitButton } from "../../components/SubmitButton";

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ tab?: string, action?: string, id?: string }> }) {
  const cookieStore = await cookies();
  if (!cookieStore.get("is_admin")) redirect("/login");

  const resolvedParams = await searchParams;
  const tab = resolvedParams?.tab || 'dashboard';
  const actionParam = resolvedParams?.action;
  const idParam = resolvedParams?.id;

  // --- FUNGSI SERVER ACTIONS ---
  async function saveComplexSettings(formData: FormData) {
    "use server";
    const keys = ['brand_name', 'address', 'phone', 'email', 'facebook', 'instagram', 'tiktok', 'youtube', 'whatsapp', 'action_title', 'action_link', 'slider_1', 'visi_misi', 'profil_teks', 'logo_url'];
    for (const key of keys) {
      const val = formData.get(key) as string;
      if (val !== null) {
        const { rows } = await db.execute({ sql: "SELECT * FROM site_settings WHERE key = ?", args: [key] });
        if (rows.length > 0) await db.execute({ sql: "UPDATE site_settings SET value = ? WHERE key = ?", args: [val, key] });
        else await db.execute({ sql: "INSERT INTO site_settings (key, value) VALUES (?, ?)", args: [key, val] });
      }
    }
    revalidatePath("/");
    redirect("/admin?tab=pengaturan");
  }

  async function saveSlider(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const image_url = formData.get("image_url") as string;
    if (id) await db.execute({ sql: "UPDATE sliders SET title=?, description=?, image_url=? WHERE id=?", args: [title, description, image_url, id] });
    else await db.execute({ sql: "INSERT INTO sliders (title, description, image_url) VALUES (?, ?, ?)", args: [title, description, image_url] });
    revalidatePath("/");
    redirect("/admin?tab=slider");
  }

  async function saveMenu(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const link = formData.get("link") as string;
    const order_num = formData.get("order_num") as string;
    const parent_id = formData.get("parent_id") as string;
    const pId = parent_id ? parseInt(parent_id) : 0;

    if (id) await db.execute({ sql: "UPDATE menus SET title=?, link=?, order_num=?, parent_id=? WHERE id=?", args: [title, link, order_num, pId, id] });
    else await db.execute({ sql: "INSERT INTO menus (title, link, order_num, parent_id) VALUES (?, ?, ?, ?)", args: [title, link, order_num, pId] });
    revalidatePath("/");
    redirect("/admin?tab=menu");
  }

  async function saveService(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const icon = formData.get("icon") as string;
    if (id) await db.execute({ sql: "UPDATE services SET title=?, description=?, icon=? WHERE id=?", args: [title, description, icon, id] });
    else await db.execute({ sql: "INSERT INTO services (title, description, icon) VALUES (?, ?, ?)", args: [title, description, icon] });
    revalidatePath("/");
    redirect("/admin?tab=layanan");
  }

  async function savePost(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const type = formData.get("type") as string;
    
    let base64Image = formData.get("existing_image") as string;
    const imageFile = formData.get("image") as File;
    if (imageFile && imageFile.size > 0) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      base64Image = `data:${imageFile.type};base64,${buffer.toString("base64")}`;
    }

    if (id) await db.execute({ sql: "UPDATE posts SET title=?, type=?, content=?, image_url=? WHERE id=?", args: [title, type, content, base64Image, id] });
    else {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now();
      await db.execute({ sql: "INSERT INTO posts (title, slug, type, content, image_url) VALUES (?, ?, ?, ?, ?)", args: [title, slug, type, content, base64Image]});
    }
    revalidatePath("/");
    redirect("/admin?tab=program");
  }

  async function deleteData(formData: FormData) {
    "use server";
    const table = formData.get("table") as string;
    const id = formData.get("id") as string;
    await db.execute({ sql: `DELETE FROM ${table} WHERE id = ?`, args: [id] });
    revalidatePath("/");
  }

  async function logout() {
    "use server";
    const cookieStore = await cookies();
    cookieStore.delete("is_admin");
    redirect("/login");
  }

  // --- RENDER HALAMAN ---
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
              <div><h6 className="text-muted fw-bold mb-1">KUNJUNGAN WEB KESELURUHAN</h6><h2 className="fw-bolder mb-0">{String(vRow[0]?.value || "0")}</h2></div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="bg-white p-4 rounded-4 shadow-sm border-start border-4 border-primary d-flex align-items-center">
              <div className="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center me-4" style={{width:'60px',height:'60px'}}><i className="fa-solid fa-eye fa-2x"></i></div>
              <div><h6 className="text-muted fw-bold mb-1">TOTAL KONTEN PROGRAM</h6><h2 className="fw-bolder mb-0">{String(pRow[0]?.total || "0")}</h2></div>
            </div>
          </div>
        </div>
      </div>
    );
  } 
  
  else if (tab === 'pengaturan') {
    const { rows } = await db.execute("SELECT * FROM site_settings");
    const set: Record<string, string> = {};
    rows.forEach((row: any) => { set[row.key] = String(row.value); });
    mainContent = (
      <div className="bg-white p-5 rounded-4 shadow-sm border border-light">
        <h4 className="fw-bolder border-bottom pb-3 mb-4 text-dark"><i className="fa-solid fa-gears text-primary me-2"></i> Pengaturan Konfigurasi Utama</h4>
        <form action={saveComplexSettings}>
          <div className="row g-3 bg-light p-3 rounded-3 mb-4">
            <div className="col-md-6"><label className="form-label small fw-bold">Nama Brand / Puskesmas</label><input name="brand_name" defaultValue={set['brand_name']} className="form-control" /></div>
            <div className="col-md-6"><label className="form-label small fw-bold">Link Logo & Favicon</label><input name="logo_url" defaultValue={set['logo_url']} className="form-control" /></div>
            <div className="col-md-6"><label className="form-label small fw-bold">Teks Tombol Navigasi</label><input name="action_title" defaultValue={set['action_title']} className="form-control border-primary" /></div>
            <div className="col-md-6"><label className="form-label small fw-bold">Link Tombol Pendaftaran</label><input name="action_link" defaultValue={set['action_link']} className="form-control border-primary" /></div>
          </div>
          <div className="row g-3 bg-light p-3 rounded-3 mb-4">
            <div className="col-md-4"><label className="form-label small fw-bold"><i className="fa-solid fa-phone"></i> Telepon</label><input name="phone" defaultValue={set['phone']} className="form-control" /></div>
            <div className="col-md-4"><label className="form-label small fw-bold"><i className="fa-brands fa-whatsapp"></i> WhatsApp</label><input name="whatsapp" defaultValue={set['whatsapp']} className="form-control" /></div>
            <div className="col-md-4"><label className="form-label small fw-bold"><i className="fa-solid fa-envelope"></i> Email</label><input name="email" defaultValue={set['email']} className="form-control" /></div>
            <div className="col-12"><label className="form-label small fw-bold"><i className="fa-solid fa-location-dot"></i> Alamat</label><input name="address" defaultValue={set['address']} className="form-control" /></div>
            <div className="col-md-3"><label className="form-label small fw-bold">Facebook</label><input name="facebook" defaultValue={set['facebook']} className="form-control" /></div>
            <div className="col-md-3"><label className="form-label small fw-bold">Instagram</label><input name="instagram" defaultValue={set['instagram']} className="form-control" /></div>
            <div className="col-md-3"><label className="form-label small fw-bold">TikTok</label><input name="tiktok" defaultValue={set['tiktok']} className="form-control" /></div>
            <div className="col-md-3"><label className="form-label small fw-bold">YouTube</label><input name="youtube" defaultValue={set['youtube']} className="form-control" /></div>
          </div>
          <div className="row g-3 bg-light p-3 rounded-3 mb-4">
            <div className="col-md-6"><label className="form-label small fw-bold">Visi & Misi (Bisa HTML)</label><textarea name="visi_misi" defaultValue={set['visi_misi']} rows={5} className="form-control"></textarea></div>
            <div className="col-md-6"><label className="form-label small fw-bold">Teks Profil Footer</label><textarea name="profil_teks" defaultValue={set['profil_teks']} rows={5} className="form-control"></textarea></div>
          </div>
          <div className="text-end pt-3 border-top"><SubmitButton text="Simpan Konfigurasi" className="btn btn-warning px-5 rounded-pill fw-bold" /></div>
        </form>
      </div>
    );
  }

  else if (tab === 'slider' || tab === 'menu' || tab === 'layanan') {
    const tableMap: any = { slider: 'sliders', menu: 'menus', layanan: 'services' };
    const tableName = tableMap[tab];

    if (actionParam === 'add' || actionParam === 'edit') {
      let editData: any = {};
      let parentMenus: any[] = []; // PERBAIKAN: Menambahkan tipe any[]

      if (actionParam === 'edit' && idParam) {
        const { rows } = await db.execute({ sql: `SELECT * FROM ${tableName} WHERE id = ?`, args: [idParam] });
        if (rows.length > 0) editData = rows[0];
      }

      if (tab === 'menu') {
        const { rows } = await db.execute("SELECT id, title FROM menus WHERE parent_id = 0 OR parent_id IS NULL ORDER BY order_num ASC");
        parentMenus = rows as any[];
      }

      mainContent = (
        <div className="bg-white p-5 rounded-4 shadow-sm">
          <h4 className="fw-bold mb-4 border-bottom pb-3 text-capitalize">{actionParam === 'edit' ? 'Edit' : 'Tambah'} {tab}</h4>
          <form action={tab === 'slider' ? saveSlider : tab === 'menu' ? saveMenu : saveService} className="row g-3">
            <input type="hidden" name="id" value={editData.id || ''} />
            
            {tab === 'slider' && (
              <>
                <div className="col-12"><label className="fw-bold small">Judul Slider</label><input name="title" defaultValue={editData.title} required className="form-control" /></div>
                <div className="col-12"><label className="fw-bold small">Deskripsi</label><textarea name="description" defaultValue={editData.description} rows={3} className="form-control" /></div>
                <div className="col-12"><label className="fw-bold small">URL Gambar (http...)</label><input name="image_url" defaultValue={editData.image_url} required className="form-control" /></div>
              </>
            )}
            {tab === 'menu' && (
              <>
                <div className="col-md-6"><label className="fw-bold small">Nama Menu</label><input name="title" defaultValue={editData.title} required className="form-control" /></div>
                <div className="col-md-6"><label className="fw-bold small">URL Link (contoh: /#layanan)</label><input name="link" defaultValue={editData.link} required className="form-control" /></div>
                
                <div className="col-md-8">
                  <label className="fw-bold small text-primary">Jadikan Sub-Menu dari: (Opsional)</label>
                  <select name="parent_id" defaultValue={editData.parent_id || 0} className="form-select border-primary">
                    <option value="0">-- Ini adalah Menu Utama --</option>
                    {parentMenus.map((pm: any) => (
                      <option key={pm.id} value={pm.id}>{String(pm.title)}</option>
                    ))}
                  </select>
                  <small className="text-muted">Jika dipilih, menu ini akan muncul di bawah menu induk (Dropdown).</small>
                </div>

                <div className="col-md-4"><label className="fw-bold small">Nomor Urut</label><input type="number" name="order_num" defaultValue={editData.order_num} required className="form-control" /></div>
              </>
            )}
            {tab === 'layanan' && (
              <>
                <div className="col-md-6"><label className="fw-bold small">Judul Layanan</label><input name="title" defaultValue={editData.title} required className="form-control" /></div>
                <div className="col-md-6"><label className="fw-bold small">Ikon (FontAwesome misal: fa-solid fa-baby)</label><input name="icon" defaultValue={editData.icon} required className="form-control" /></div>
                <div className="col-12"><label className="fw-bold small">Deskripsi Singkat</label><textarea name="description" defaultValue={editData.description} rows={3} className="form-control" required /></div>
              </>
            )}

            <div className="col-12 mt-4"><SubmitButton /> <Link href={`?tab=${tab}`} className="btn btn-light rounded-pill px-4 ms-2">Batal</Link></div>
          </form>
        </div>
      );
    } else {
      let rows: any[] = []; // PERBAIKAN: Menambahkan tipe any[]
      if(tab === 'menu') {
        const res = await db.execute(`
          SELECT m1.*, m2.title as parent_title 
          FROM menus m1 
          LEFT JOIN menus m2 ON m1.parent_id = m2.id 
          ORDER BY m1.parent_id ASC, m1.order_num ASC
        `);
        rows = res.rows as any[];
      } else {
        const res = await db.execute(`SELECT * FROM ${tableName} ORDER BY id DESC`);
        rows = res.rows as any[];
      }

      mainContent = (
        <div className="bg-white p-4 rounded-4 shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="fw-bold mb-0 text-capitalize">Data {tab}</h3>
            <Link href={`?tab=${tab}&action=add`} className="btn btn-primary rounded-pill px-4"><i className="fa-solid fa-plus me-2"></i> Tambah Baru</Link>
          </div>
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                {tab === 'slider' && <><th>GAMBAR</th><th>JUDUL</th><th>DESKRIPSI</th></>}
                {tab === 'menu' && <><th>URUTAN</th><th>NAMA MENU</th><th>POSISI</th><th>LINK</th></>}
                {tab === 'layanan' && <><th>IKON</th><th>JUDUL</th><th>DESKRIPSI</th></>}
                <th>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r:any) => (
                <tr key={r.id}>
                  {tab === 'slider' && <><td><img src={String(r.image_url)} width="60" className="rounded" alt="slider"/></td><td className="fw-bold">{String(r.title)}</td><td>{String(r.description)}</td></>}
                  {tab === 'menu' && <>
                    <td>{String(r.order_num)}</td>
                    <td className="fw-bold">{String(r.title)}</td>
                    <td>
                      {r.parent_id && r.parent_id !== 0 && r.parent_id !== '0' 
                        ? <span className="badge bg-info text-dark"><i className="fa-solid fa-level-up-alt fa-rotate-90 me-1"></i> Sub dari: {String(r.parent_title)}</span>
                        : <span className="badge bg-primary">Menu Utama</span>}
                    </td>
                    <td>{String(r.link)}</td>
                  </>}
                  {tab === 'layanan' && <><td><i className={`${String(r.icon)} fs-3 text-primary`}></i></td><td className="fw-bold">{String(r.title)}</td><td>{String(r.description)}</td></>}
                  <td>
                    <div className="d-flex gap-2">
                      <Link href={`?tab=${tab}&action=edit&id=${r.id}`} className="btn btn-sm btn-warning text-white"><i className="fa-solid fa-pen"></i></Link>
                      <form action={deleteData}><input type="hidden" name="table" value={tableName}/><input type="hidden" name="id" value={String(r.id)}/><button className="btn btn-sm btn-danger"><i className="fa-solid fa-trash"></i></button></form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  }

  else if (tab === 'program') {
    if (actionParam === 'add' || actionParam === 'edit') {
      let editData: any = {};
      if (actionParam === 'edit' && idParam) {
        const { rows } = await db.execute({ sql: `SELECT * FROM posts WHERE id = ?`, args: [idParam] });
        if (rows.length > 0) editData = rows[0];
      }
      mainContent = (
        <div className="bg-white p-5 rounded-4 shadow-sm">
          <h4 className="fw-bold mb-4 border-bottom pb-3">{actionParam === 'edit' ? 'Edit' : 'Tambah'} Konten</h4>
          <form action={savePost} className="row g-3">
            <input type="hidden" name="id" value={editData.id || ''} />
            <input type="hidden" name="existing_image" value={editData.image_url || ''} />
            <div className="col-12"><label className="fw-bold small">Judul</label><input name="title" defaultValue={editData.title} required className="form-control" /></div>
            <div className="col-12">
              <label className="fw-bold small">Kategori</label>
              <select name="type" defaultValue={editData.type || 'Berita'} className="form-select">
                <option value="Berita">Berita</option><option value="Program">Program</option><option value="Layanan">Layanan</option><option value="Pengumuman">Pengumuman</option>
              </select>
            </div>
            <div className="col-12">
              <label className="fw-bold small">Foto Cover (Kosongkan jika tidak ingin mengubah)</label>
              {editData.image_url && <div className="mb-2"><img src={editData.image_url} height="60" className="rounded" alt="cover"/></div>}
              <input type="file" name="image" className="form-control" />
            </div>
            <div className="col-12"><label className="fw-bold small">Isi Konten (HTML Diizinkan)</label><textarea name="content" defaultValue={editData.content} rows={7} className="form-control" required></textarea></div>
            <div className="col-12 mt-4"><SubmitButton /> <Link href="?tab=program" className="btn btn-light rounded-pill px-4 ms-2">Batal</Link></div>
          </form>
        </div>
      );
    } else {
      const { rows } = await db.execute("SELECT * FROM posts ORDER BY id DESC");
      mainContent = (
        <div className="bg-white p-4 rounded-4 shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div><h3 className="fw-bold mb-0">Data Program & Berita</h3></div>
            <Link href="?tab=program&action=add" className="btn btn-primary rounded-pill px-4"><i className="fa-solid fa-plus me-2"></i> Tambah Baru</Link>
          </div>
          <table className="table table-hover align-middle">
            <thead className="table-light"><tr><th>JUDUL</th><th>KATEGORI</th><th>GAMBAR</th><th>AKSI</th></tr></thead>
            <tbody>
              {rows.map((r:any) => (
                <tr key={r.id}>
                  <td className="fw-bold">{String(r.title)}</td><td><span className="badge bg-secondary">{String(r.type)}</span></td>
                  <td>{r.image_url ? <img src={String(r.image_url)} width="50" height="50" className="rounded object-fit-cover" alt="img"/> : '-'}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Link href={`?tab=program&action=edit&id=${r.id}`} className="btn btn-sm btn-warning text-white"><i className="fa-solid fa-pen"></i></Link>
                      <form action={deleteData}><input type="hidden" name="table" value="posts"/><input type="hidden" name="id" value={String(r.id)}/><button className="btn btn-sm btn-danger"><i className="fa-solid fa-trash"></i></button></form>
                    </div>
                  </td>
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
      <style dangerouslySetInnerHTML={{ __html: `
        .public-topbar, .public-navbar, .public-footer { display: none !important; }
        .public-content { padding: 0 !important; min-height: 0 !important; }
        body { background-color: #f1f5f9 !important; }
        .admin-sidebar { width: 260px; background: #1e293b; color: white; position: fixed; height: 100vh; overflow-y: auto; }
        .admin-sidebar a { display: block; padding: 15px 25px; color: #cbd5e1; text-decoration: none; border-left: 4px solid transparent; font-weight: 500; font-size: 0.9rem; transition: 0.2s; }
        .admin-sidebar a:hover, .admin-sidebar a.active { background: rgba(255,255,255,0.05); color: #fff; border-left-color: #3b82f6; }
        .admin-main { margin-left: 260px; padding: 40px; width: calc(100% - 260px); }
      `}} />

      <aside className="admin-sidebar shadow-lg">
        <div className="p-4 text-center border-bottom border-secondary border-opacity-25 mb-3">
            <h4 className="fw-bolder text-white mb-0 text-uppercase tracking-wider">PUSKESMAS ADMIN</h4>
        </div>
        <Link href="?tab=dashboard" className={tab === 'dashboard' ? 'active' : ''}><i className="fa-solid fa-chart-line me-3"></i> Dashboard</Link>
        <div className="px-4 mt-4 mb-2"><small className="text-muted fw-bold text-uppercase" style={{fontSize: '0.75rem'}}>Konten Website</small></div>
        <Link href="?tab=pengaturan" className={tab === 'pengaturan' ? 'active' : ''}><i className="fa-solid fa-sliders me-3"></i> Pengaturan Teks</Link>
        <Link href="?tab=slider" className={tab === 'slider' ? 'active' : ''}><i className="fa-solid fa-images me-3"></i> Kelola Slider</Link>
        <Link href="?tab=menu" className={tab === 'menu' ? 'active' : ''}><i className="fa-solid fa-bars me-3"></i> Kelola Menu Navigasi</Link>
        <Link href="?tab=layanan" className={tab === 'layanan' ? 'active' : ''}><i className="fa-solid fa-notes-medical me-3"></i> Kelola Layanan</Link>
        <Link href="?tab=program" className={tab === 'program' ? 'active' : ''}><i className="fa-solid fa-folder-open me-3"></i> Katalog/Program</Link>
        <div className="px-4 mt-5"><Link href="/" className="btn btn-outline-info w-100 rounded-pill btn-sm"><i className="fa-solid fa-earth-asia me-2"></i> Lihat Website</Link></div>
        <form action={logout} className="mt-3"><button type="submit" className="btn btn-link text-danger w-100 text-decoration-none fw-bold"><i className="fa-solid fa-right-from-bracket me-2"></i> Keluar</button></form>
      </aside>

      <main className="admin-main">
        {mainContent}
      </main>
    </div>
  );
}