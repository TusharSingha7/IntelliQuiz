import React from 'react';
import './globals.css';
import Header from './components/header';
import Footer from './components/footer';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full flex flex-col">
        <Header/>
        <div className="flex-1">
          {children}
        </div>
        <Footer/>
      </body>
    </html>
  );
}
