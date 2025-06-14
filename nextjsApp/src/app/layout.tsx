import React from 'react';
import './globals.css';
import Header from '@/components/header';
import Footer from '@/components/footer';
import Script from 'next/script';
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="min-h-full">
      <head>
        <Script src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js' strategy='beforeInteractive'></Script>
        <Script src='https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.rings.min.js' strategy='beforeInteractive'></Script>
        <Script src='https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.halo.min.js' strategy='beforeInteractive'></Script>
        <Script src='https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js' strategy='beforeInteractive'></Script>
        <Script src='https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js' strategy='beforeInteractive'></Script>
        <Script src='https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.dots.min.js' strategy='beforeInteractive'></Script>
        <Script src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.waves.min.js" strategy='beforeInteractive'></Script>

      </head>
      <body className="min-h-screen flex flex-col max-w-screen overflow-x-hidden">
        <Header/>
          <div className="flex-1 overflow-y-auto">
                  {children}
          </div>
        <Footer/>
      </body>
    </html>
  );
}
