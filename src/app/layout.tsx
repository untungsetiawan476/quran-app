import './globals.css';
import BottomNav from '@/components/BottomNav';
import type { Metadata } from 'next';
import { AudioProvider } from '@/context/AudioContext';
import InstallBanner from '@/components/InstallBanner';

export const metadata: Metadata = {
  title: "Qur'an Digital Learning App",
  description: "Aplikasi Al-Qur'an modern karya Untung Setiawan",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="bg-islamic-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 pb-24 min-h-screen transition-colors duration-300">
        <main className="max-w-md mx-auto bg-white dark:bg-gray-800 min-h-screen shadow-xl relative">
        <AudioProvider>
        <InstallBanner />
          {children}
        {/* Kalau Mas pakai BottomNav, letakkan di bawah children tapi tetap di dalam AudioProvider */}
        </AudioProvider>  
          {/* Footer Donasi & Copyright */}
          <div className="p-6 text-center border-t dark:border-gray-700 mt-8 mb-16">
            <p className="text-sm mb-4">Dukung pengembangan aplikasi ini:</p>
            <a href="https://saweria.co/Untungsetiawan" target="_blank" rel="noreferrer" className="bg-gold-500 hover:bg-gold-400 text-white px-6 py-2 rounded-full font-semibold shadow-lg transition transform hover:scale-105">
              ☕ Donasi via Saweria
            </a>
            <p className="text-xs text-gray-400 mt-6">© 2026 Untung Setiawan – All Rights Reserved</p>
          </div>
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
