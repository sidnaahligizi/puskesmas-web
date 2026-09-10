import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Puskesmas Nelayan Kabupaten Gresik - Layanan Kesehatan & Gizi",
  description: "Cari layanan kesehatan dan gizi terdekat di Gresik? Puskesmas nelayan Kabupaten Gresik melayani kesehatan masyarakat nelayan, pendampingan gizi anak stunting, dan terapi medis secara profesional.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="https://lh3.googleusercontent.com/d/1lmHDe6r7V4bp3xdRNqfQyuzqREGYe29o" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        
        {/* CSS Custom dari file asli Anda */}
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
              --primary-green: #059669; 
              --light-green: #d1fae5;
              --accent-orange: #f59e0b; 
              --dark-text: #1e293b;
          }
          body { 
              font-family: 'Poppins', sans-serif; 
              color: #475569; 
              scroll-behavior: smooth; 
              background-color: #f8fafc;
              margin: 0;
          }
          .bg-gradient-primary { background: linear-gradient(135deg, #065f46 0%, #10b981 100%); }
          .text-primary { color: var(--primary-green) !important; }
          .bg-primary { background-color: var(--primary-green) !important; }
          
          .hero-section { 
              padding: 120px 0 80px; color: white; position: relative; overflow: hidden;
              border-bottom-left-radius: 40px; border-bottom-right-radius: 40px;
              box-shadow: 0 10px 30px rgba(16, 185, 129, 0.1);
          }
          .card-gizi { 
              border: none; transition: all 0.3s ease; border-radius: 24px; background: #ffffff;
              box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid rgba(16, 185, 129, 0.1);
          }
          .card-gizi:hover { 
              transform: translateY(-8px); box-shadow: 0 20px 40px rgba(16, 185, 129, 0.12); border-color: var(--light-green);
          }
          .btn-wa { background-color: #25d366; color: white; font-weight: 600; border-radius: 50px; transition: 0.3s; }
          .btn-wa:hover { background-color: #128c7e; color: white; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(37, 211, 102, 0.3); }
          .btn-outline-primary { border-color: var(--primary-green); color: var(--primary-green); border-radius: 50px; }
          .btn-outline-primary:hover { background-color: var(--primary-green); color: white; }
          
          .feature-icon { 
              font-size: 2.5rem; color: var(--primary-green); margin-bottom: 20px; background: var(--light-green);
              width: 80px; height: 80px; line-height: 80px; border-radius: 50%; margin-left: auto; margin-right: auto;
              display: flex; align-items: center; justify-content: center;
          }
          .section-title { font-weight: 700; position: relative; margin-bottom: 50px; color: var(--dark-text); }
          .section-title::after { 
              content: ''; width: 60px; height: 4px; background: var(--accent-orange); position: absolute;
              bottom: -15px; left: 50%; transform: translateX(-50%); border-radius: 2px;
          }
          .navbar { padding: 12px 0; background: rgba(255, 255, 255, 0.98) !important; backdrop-filter: blur(10px); }
          .navbar-brand img { height: 45px; width: auto; object-fit: contain; }
          .nav-link { font-weight: 500; color: #475569 !important; padding: 10px 15px !important; }
          .nav-link:hover { color: var(--primary-green) !important; }
          .seo-areas { font-size: 0.85rem; color: #cbd5e1; line-height: 1.8; text-align: center; }
          
          @media (max-width: 768px) {
              .hero-section { padding: 100px 0 60px; border-bottom-left-radius: 25px; border-bottom-right-radius: 25px; }
              .display-4 { font-size: 2.2rem; }
          }
        `}} />
      </head>
      <body>
        {children}
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}