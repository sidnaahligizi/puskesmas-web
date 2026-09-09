import { db } from "../../lib/db"; 
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  if (!cookieStore.get("is_admin")) {
    redirect("/login");
  }

  async function addPost(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    const type = formData.get("type") as string;
    const slug = title.toLowerCase().replace(/ /g, "-") + "-" + Date.now();

    await db.execute({
      sql: "INSERT INTO posts (title, slug, type, content) VALUES (?, ?, ?, ?)",
      args: [title, slug, type, content],
    });
    revalidatePath("/");
  }

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
        <a href="/" className="text-blue-500 underline">Lihat Website</a>
      </div>

      <div className="bg-white p-6 rounded shadow-md border">
        <h2 className="text-xl font-semibold mb-4 text-black">Tambah Konten Baru</h2>
        <form action={addPost} className="space-y-4">
          <input name="title" placeholder="Judul Berita" required className="w-full border p-2 rounded text-black" />
          <select name="type" className="w-full border p-2 rounded text-black">
            <option value="Berita">Berita</option>
            <option value="Pengumuman">Pengumuman</option>
          </select>
          <textarea name="content" placeholder="Isi Berita..." rows={5} required className="w-full border p-2 rounded text-black" />
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">Simpan & Publikasikan</button>
        </form>
      </div>
    </div>
  );
}