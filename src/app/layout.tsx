import type { Metadata } from "next";
import Script from "next/script"; // <-- Perbaikan 1: Mengimpor komponen Script dari Next.js
import "./globals.css";

export const metadata: Metadata = {
  title: "Puskesmas Nelayan - Home",
  description: "Website Resmi Puskesmas Nelayan Kabupaten Gresik",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="shortcut icon" href="https://pkm-alunalun-dinkes.gresikkab.go.id/storage/photos/3/Logo/logo-square.png" />
        <link rel="stylesheet" href="https://pkm-alunalun-dinkes.gresikkab.go.id/frontend/assets/css/plugins.css" />
        <link rel="stylesheet" href="https://pkm-alunalun-dinkes.gresikkab.go.id/frontend/assets/css/fonts/iconify-icons.css" />
        <link rel="stylesheet" href="https://pkm-alunalun-dinkes.gresikkab.go.id/frontend/assets/css/fonts/dm.css" />
        <link rel="stylesheet" href="https://pkm-alunalun-dinkes.gresikkab.go.id/frontend/assets/css/style.css" />
      </head>
      <body>
        {children}
        {/* Perbaikan 2: Menggunakan huruf S besar untuk memanggil komponen Script */}
        <Script src="https://pkm-alunalun-dinkes.gresikkab.go.id/backend/assets/js/jquery.min.js" strategy="beforeInteractive" />
        <Script src="https://pkm-alunalun-dinkes.gresikkab.go.id/frontend/assets/js/plugins.js" strategy="lazyOnload" />
        <Script src="https://pkm-alunalun-dinkes.gresikkab.go.id/frontend/assets/js/theme.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}