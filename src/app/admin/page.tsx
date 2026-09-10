import { db } from "../../lib/db"; 
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  if (!cookieStore.get("is_admin")) redirect("/login");

  // PERBAIKAN: Membungkus hasil database dengan String()
  const { rows: viewsRow } = await db.execute("SELECT value FROM site_settings WHERE key = 'page_views'");
  const totalViews = String(viewsRow[0]?.value || "0");
  
  const { rows: brandRow } = await db.execute("SELECT value FROM site_settings WHERE key = 'brand_name'");
  const currentBrand = String(brandRow[0]?.value || "Puskesmas Nelayan");

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

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Panel Admin Canggih</h1>
        <div className="flex gap-4">
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold shadow">
            👁️ Total Dilihat: {totalViews} kali
          </div>
          <a href="/" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow">Lihat Website</a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-200">
          <h2 className="text-xl font-bold mb-4 text-black border-b pb-2">✍️ Tambah Konten Baru</h2>
          <form action={addPost} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1">Judul Konten</label>
              <input name="title" required className="w-full border p-3 rounded-lg text-black bg-gray-50" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">Kategori</label>
                <select name="type" className="w-full border p-3 rounded-lg text-black bg-gray-50">
                  <option value="Berita">Berita</option>
                  <option value="Pengumuman">Pengumuman</option>
                  <option value="Layanan">Layanan</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">Upload Foto (Opsional)</label>
                <input type="file" name="image" accept="image/*" className="w-full border p-2 rounded-lg text-black bg-gray-50" />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1">Isi Konten (HTML Diizinkan)</label>
              <textarea name="content" rows={6} required className="w-full border p-3 rounded-lg text-black bg-gray-50" />
            </div>
            <button type="submit" className="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition">Publikasikan Sekarang</button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 h-fit">
          <h2 className="text-xl font-bold mb-4 text-black border-b pb-2">⚙️ Pengaturan Web</h2>
          <form action={updateBrand} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-1">Nama Brand Puskesmas</label>
              <input name="brand_name" defaultValue={currentBrand} required className="w-full border p-3 rounded-lg text-black bg-gray-50" />
            </div>
            <button type="submit" className="w-full bg-yellow-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-yellow-600 transition">Update Nama</button>
          </form>
        </div>
      </div>
    </div>
  );
}