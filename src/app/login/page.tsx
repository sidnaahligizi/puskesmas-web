"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const form = e.target as HTMLFormElement;
    
    setTimeout(() => {
      if (form.username.value === "admin" && form.password.value === "password123") {
        document.cookie = "is_admin=true; path=/";
        router.push("/admin");
      } else {
        setError("Kredensial tidak valid. Silakan coba lagi.");
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)' }}>
      <div className="bg-white p-5 rounded-4 shadow-lg w-100 mx-3 position-relative" style={{ maxWidth: '420px', zIndex: 10 }}>
        
        <div className="text-center mb-5">
          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow" style={{ width: '70px', height: '70px' }}>
            <i className="fa-solid fa-shield-halved fa-2x"></i>
          </div>
          <h3 className="fw-bolder text-dark mb-1">Admin Portal</h3>
          <p className="text-muted small">Sistem Manajemen Konten Terpadu</p>
        </div>

        {error && (
          <div className="alert alert-danger border-0 bg-danger bg-opacity-10 text-danger rounded-3 d-flex align-items-center mb-4">
            <i className="fa-solid fa-triangle-exclamation me-2"></i> <small className="fw-bold">{error}</small>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="mb-4">
            <label className="form-label text-muted small fw-bold text-uppercase">Username</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-0 text-muted px-3"><i className="fa-solid fa-user"></i></span>
              <input name="username" placeholder="Masukkan admin..." required className="form-control py-3 bg-light border-0 shadow-none" />
            </div>
          </div>
          <div className="mb-5">
            <label className="form-label text-muted small fw-bold text-uppercase">Password Akses</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-0 text-muted px-3"><i className="fa-solid fa-key"></i></span>
              <input name="password" type="password" placeholder="••••••••" required className="form-control py-3 bg-light border-0 shadow-none" />
            </div>
          </div>
          <button type="submit" disabled={isLoading} className="btn btn-primary w-100 rounded-pill py-3 fw-bold shadow-sm d-flex justify-content-center align-items-center">
            {isLoading ? <div className="spinner-border spinner-border-sm text-white" role="status"></div> : 'Otorisasi Masuk'}
          </button>
        </form>

        <div className="text-center mt-5">
          <Link href="/" className="text-muted small text-decoration-none hover-text-primary">
            <i className="fa-solid fa-arrow-left me-1"></i> Kembali ke Website Utama
          </Link>
        </div>
      </div>
      
      {/* Dekorasi Background */}
      <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style={{ zIndex: 1, pointerEvents: 'none' }}>
        <div className="position-absolute rounded-circle bg-primary opacity-25 blur-3xl" style={{ width: '400px', height: '400px', top: '-10%', left: '-5%', filter: 'blur(80px)' }}></div>
        <div className="position-absolute rounded-circle bg-info opacity-25 blur-3xl" style={{ width: '500px', height: '500px', bottom: '-10%', right: '-10%', filter: 'blur(100px)' }}></div>
      </div>
    </div>
  );
}