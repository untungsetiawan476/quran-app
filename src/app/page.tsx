"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BiBookOpen, BiRightArrowAlt, BiTimeFive } from 'react-icons/bi';
import { BsStars, BsGrid1X2 } from 'react-icons/bs';
import { LuBrainCircuit } from 'react-icons/lu';
import { TbCompass } from 'react-icons/tb';
import PrayerTimes from '@/components/PrayerTimes';
import AyatHarian from '@/components/AyatHarian';

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

  const quickAccess = [
    { title: "Baca Al-Qur'an", desc: "Mushaf & Tafsir", icon: <BiBookOpen size={24} />, path: '/quran', bg: 'bg-linear-to-br from-islamic-400 to-islamic-600', shadow: 'shadow-islamic-500/30' },
    { title: "Kuis Hafalan", desc: "Uji daya ingat", icon: <LuBrainCircuit size={24} />, path: '/kuis', bg: 'bg-linear-to-br from-gold-400 to-gold-600', shadow: 'shadow-gold-500/30' },
    { title: "Pusat Doa", desc: "Kumpulan wirid", icon: <BsStars size={24} />, path: '/doa', bg: 'bg-linear-to-br from-purple-400 to-purple-600', shadow: 'shadow-purple-500/30' },
    { title: "Tools Islami", desc: "Tasbih & lainnya", icon: <TbCompass size={24} />, path: '/tools', bg: 'bg-linear-to-br from-blue-400 to-blue-600', shadow: 'shadow-blue-500/30' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24">
      {/* 1. HERO SECTION (Gabungan Sapaan & Terakhir Dibaca bergaya Shadow Box) */}
      <div className="bg-islamic-900 rounded-b-[2.5rem] pt-12 pb-24 px-6 relative overflow-hidden shadow-xl shadow-islamic-900/20">
        {/* Ornamen 3D Layer di Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10 flex justify-between items-end mb-8">
          <div>
            <h2 className="text-islamic-100 text-sm font-medium mb-1 tracking-wide">{greeting},</h2>
            <h1 className="text-2xl font-bold text-white">Assalamu&apos;alaikum</h1>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 shadow-inner">
             <BiTimeFive className="text-gold-400" size={24} />
          </div>
        </div>

        {/* Kartu Terakhir Dibaca Melayang (Floating Card) */}
        <div className="absolute left-6 right-6 -bottom-16">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-5 shadow-2xl flex items-center justify-between group">
            <div className="text-white">
              <div className="flex items-center text-xs text-islamic-100 mb-1 opacity-80">
                <BiBookOpen className="mr-1.5" size={14} /> Terakhir Dibaca
              </div>
              {lastRead ? (
                <>
                  <h3 className="text-xl font-bold">{lastRead.surahName}</h3>
                  <p className="text-sm text-gold-300">Ayat {lastRead.ayat}</p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-bold">Belum ada aktivitas</h3>
                  <p className="text-sm text-gold-300">Mulai baca hari ini</p>
                </>
              )}
            </div>
            
            <Link 
              href={lastRead ? `/quran/${lastRead.nomorSurah}#ayat-${lastRead.ayat}` : "/quran"} 
              className="bg-white text-islamic-800 hover:bg-gold-400 hover:text-white h-12 w-12 rounded-full flex items-center justify-center transition-all shadow-lg group-hover:scale-110 active:scale-95"
            >
              <BiRightArrowAlt size={28} />
            </Link>
          </div>
        </div>
      </div>

      {/* Spacer untuk memberi ruang pada kartu yang melayang */}
      <div className="h-20"></div>

      <div className="px-5 space-y-6">
        {/* 2. MENU CEPAT (Grid 3D) */}
        <div className="mt-2">
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center">
              <BsGrid1X2 className="mr-2 text-islamic-500" size={18} /> Eksplorasi
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {quickAccess.map((item, idx) => (
              <Link href={item.path} key={idx} className="block group">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1 relative overflow-hidden h-full">
                  <div className={`w-10 h-10 ${item.bg} text-white rounded-2xl flex items-center justify-center mb-3 shadow-lg ${item.shadow} group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <h4 className="font-bold text-gray-800 dark:text-white text-sm mb-0.5" dangerouslySetInnerHTML={{ __html: item.title }} />
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 3. JADWAL SHOLAT (Memanggil Komponen) */}
        <div className="relative">
          <PrayerTimes />
        </div>

        {/* 4. AYAT HARIAN (Memanggil Komponen) */}
        <div className="relative pb-6">
          <AyatHarian />
        </div>
      </div>
    </div>
  );
}
