"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    if (form.username.value === "admin" && form.password.value === "password123") {
      document.cookie = "is_admin=true; path=/";
      router.push("/admin");
    } else {
      setError("Username atau Password salah!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-green-700">Login Admin</h2>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input name="username" placeholder="Username" required className="w-full border p-2 rounded text-black" />
          <input name="password" type="password" placeholder="Password" required className="w-full border p-2 rounded text-black" />
          <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">Masuk</button>
        </form>
      </div>
    </div>
  );
}