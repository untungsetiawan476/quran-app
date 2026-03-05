"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BiFolderOpen, BiCompass, BiCalculator, BiReset, BiBookHeart } from 'react-icons/bi';
import { MdTouchApp } from 'react-icons/md';

export default function ToolsPage() {
  // State untuk Tasbih
  const [count, setCount] = useState(0);

  // Load memori Tasbih agar tidak hilang saat aplikasi ditutup
  useEffect(() => {
    const timer = setTimeout(() => {
      const savedCount = localStorage.getItem('quran_tasbih_count');
      if (savedCount) setCount(parseInt(savedCount));
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  const handleTasbih = () => {
    const newCount = count + 1;
    setCount(newCount);
    localStorage.setItem('quran_tasbih_count', newCount.toString());
    
    // Efek Getar (Vibration) khusus untuk pengguna HP Android/iOS
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50); // Bergetar halus 50 milidetik
    }
  };

  const resetTasbih = () => {
    if(confirm('Mulai ulang hitungan tasbih dari 0?')) {
      setCount(0);
      localStorage.removeItem('quran_tasbih_count');
    }
  };

  return (
    <div className="p-4 pt-8 pb-24 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Pusat Aktivitas</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Jelajahi fitur tambahan untuk menyempurnakan ibadah Anda.</p>
      </div>

      {/* 1. TASBIH DIGITAL INTERAKTIF (Desain Premium) */}
      <div className="bg-linear-to-br from-islamic-500 to-islamic-700 rounded-3xl p-6 shadow-lg mb-8 relative overflow-hidden text-white border border-islamic-400">
        {/* Ornamen Background */}
        <div className="absolute -right-4 -bottom-4 opacity-10">
          <MdTouchApp size={150} />
        </div>

        <div className="flex justify-between items-start mb-6 relative z-10">
          <div>
            <h2 className="text-lg font-bold flex items-center tracking-wide">
              Tasbih Digital
            </h2>
            <p className="text-islamic-100 text-xs mt-1 opacity-80">Lanjutkan dzikir harian Anda</p>
          </div>
          <button onClick={resetTasbih} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition backdrop-blur-sm" title="Reset Tasbih">
            <BiReset size={20} />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center relative z-10 py-4">
          <button 
            onClick={handleTasbih}
            className="w-36 h-36 bg-white/10 hover:bg-white/20 active:bg-white/30 active:scale-95 border-4 border-white/30 rounded-full flex flex-col items-center justify-center transition-all backdrop-blur-md shadow-inner"
          >
            <span className="text-5xl font-bold tracking-wider">{count}</span>
            <span className="text-[10px] uppercase tracking-widest mt-2 opacity-70">Ketuk layar</span>
          </button>
        </div>
      </div>

      {/* 2. GRID MENU EKSPLORASI */}
      <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center">
        Eksplorasi Fitur
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Menu Koleksi (Aktif) */}
        <Link href="/koleksi" className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:border-islamic-300 dark:hover:border-islamic-500 transition group flex flex-col items-start relative overflow-hidden">
          <div className="w-12 h-12 bg-islamic-50 dark:bg-gray-700 text-islamic-600 dark:text-islamic-400 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <BiFolderOpen size={28} />
          </div>
          <h3 className="font-bold text-gray-800 dark:text-white text-sm">Koleksi Hafalan</h3>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">Buka playlist ayat yang Anda simpan.</p>
        </Link>

        {/* Menu Jurnal (Coming Soon) */}
        <div className="bg-gray-100 dark:bg-gray-800/50 p-5 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-start opacity-70 cursor-not-allowed">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 text-gray-400 rounded-xl flex items-center justify-center mb-3">
            <BiBookHeart size={28} />
          </div>
          <h3 className="font-bold text-gray-800 dark:text-white text-sm">Jurnal Ibadah</h3>
          <span className="text-[9px] font-bold bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300 px-2 py-0.5 rounded-full mt-1">Segera Hadir</span>
        </div>

        {/* Menu Arah Kiblat (Coming Soon) */}
        <div className="bg-gray-100 dark:bg-gray-800/50 p-5 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-start opacity-70 cursor-not-allowed">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 text-gray-400 rounded-xl flex items-center justify-center mb-3">
            <BiCompass size={28} />
          </div>
          <h3 className="font-bold text-gray-800 dark:text-white text-sm">Arah Kiblat</h3>
          <span className="text-[9px] font-bold bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300 px-2 py-0.5 rounded-full mt-1">Segera Hadir</span>
        </div>

        {/* Menu Kalkulator Zakat (Coming Soon) */}
        <div className="bg-gray-100 dark:bg-gray-800/50 p-5 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-start opacity-70 cursor-not-allowed">
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 text-gray-400 rounded-xl flex items-center justify-center mb-3">
            <BiCalculator size={28} />
          </div>
          <h3 className="font-bold text-gray-800 dark:text-white text-sm">Hitung Zakat</h3>
          <span className="text-[9px] font-bold bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300 px-2 py-0.5 rounded-full mt-1">Segera Hadir</span>
        </div>
      </div>
    </div>
  );
}
