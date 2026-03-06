"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  BiTimeFive, 
  BiRightArrowAlt, 
  BiBookOpen, 
  BiTrophy, 
  BiWrench, 
  BiCompass, 
  BiCalendarEvent 
} from 'react-icons/bi';
import PrayerTimes from '@/components/PrayerTimes';
import AyatHarian from '@/components/AyatHarian';
import StatistikDashboard from '@/components/StatistikDashboard';

interface LastRead {
  surahName: string;
  nomorSurah: number;
  ayat: number;
}

export default function Home() {
  const [lastRead, setLastRead] = useState<LastRead | null>(null);
  const [greeting, setGreeting] = useState('Selamat Datang');

  useEffect(() => {
    const timer = setTimeout(() => {
      const hour = new Date().getHours();
      if (hour < 11) setGreeting('Selamat Pagi');
      else if (hour < 15) setGreeting('Selamat Siang');
      else if (hour < 18) setGreeting('Selamat Sore');
      else setGreeting('Selamat Malam');

      const saved = localStorage.getItem('quran_last_read');
      if (saved) {
        setLastRead(JSON.parse(saved));
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-28">
      {/* ========================================== */}
      {/* 1. HERO SECTION (Ucapan Selamat Datang)  */}
      {/* ========================================== */}
      <div className="relative">
        <div className="bg-islamic-900 rounded-b-[2.5rem] pt-12 pb-24 px-6 relative overflow-hidden shadow-xl shadow-islamic-900/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
          
          <div className="relative z-10 flex justify-between items-end mb-4">
            <div>
              <h2 className="text-islamic-100 text-sm font-medium mb-1 tracking-wide">{greeting},</h2>
              <h1 className="text-2xl font-bold text-white">Assalamu&apos;alaikum</h1>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 shadow-inner">
               <BiTimeFive className="text-gold-400" size={24} />
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* 2. KARTU TERAKHIR DIBACA (Melayang)        */}
        {/* ========================================== */}
        <div className="px-5 relative -mt-16 z-20">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-5 shadow-xl flex items-center justify-between group">
            <div>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
                <BiBookOpen className="mr-1.5 text-islamic-500" size={16} /> Terakhir Dibaca
              </div>
              {lastRead ? (
                <>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white">{lastRead.surahName}</h3>
                  <p className="text-sm text-islamic-600 dark:text-gold-400 font-medium">Ayat {lastRead.ayat}</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">Belum ada aktivitas</h3>
                  <p className="text-sm text-islamic-600 dark:text-gold-400 font-medium">Mulai baca hari ini</p>
                </>
              )}
            </div>
            
            <Link 
              href={lastRead ? `/quran/${lastRead.nomorSurah}#ayat-${lastRead.ayat}` : "/quran"} 
              className="bg-islamic-500 text-white hover:bg-gold-500 h-12 w-12 rounded-full flex items-center justify-center transition-all shadow-lg group-hover:scale-110 active:scale-95 shrink-0"
            >
              <BiRightArrowAlt size={28} />
            </Link>
          </div>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-8">
        
        {/* ========================================== */}
        {/* 3. MENU PINTASAN CEPAT (Tools & Kuis)      */}
        {/* ========================================== */}
        <div className="grid grid-cols-4 gap-4 animate-fade-in-up">
          {/* Tombol 1: Kuis Hafalan */}
          <Link href="/kuis" className="flex flex-col items-center group">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-sm transition-all duration-300 group-hover:scale-110 group-active:scale-95 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
              <BiTrophy size={28} />
            </div>
            <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">Kuis</span>
          </Link>

          {/* Tombol 2: Tasbih & Tools */}
          <Link href="/tools" className="flex flex-col items-center group">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-sm transition-all duration-300 group-hover:scale-110 group-active:scale-95 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
              <BiWrench size={28} />
            </div>
            <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">Tasbih</span>
          </Link>

          {/* Tombol 3: Arah Kiblat */}
          <Link href="#" className="flex flex-col items-center group opacity-80 hover:opacity-100">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-sm transition-all duration-300 group-hover:scale-110 group-active:scale-95 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50">
              <BiCompass size={28} />
            </div>
            <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">Kiblat</span>
          </Link>

          {/* Tombol 4: Jadwal Sholat */}
          <Link href="#" className="flex flex-col items-center group opacity-80 hover:opacity-100">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-2 shadow-sm transition-all duration-300 group-hover:scale-110 group-active:scale-95 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50">
              <BiCalendarEvent size={28} />
            </div>
            <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300">Jadwal</span>
          </Link>
        </div>

        {/* ========================================== */}
        {/* 4. DASHBOARD STATISTIK                     */}
        {/* ========================================== */}
        <StatistikDashboard />

        {/* ========================================== */}
        {/* 5. JADWAL SHOLAT WIDGET                    */}
        {/* ========================================== */}
        <div className="relative">
          <PrayerTimes />
        </div>

        {/* ========================================== */}
        {/* 6. AYAT HARIAN AI                          */}
        {/* ========================================== */}
        <div className="relative pb-6">
          <AyatHarian />
        </div>
        
      </div>
    </div>
  );
}
