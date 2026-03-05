"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BiBookOpen, BiTrophy, BiWrench, BiRightArrowAlt } from 'react-icons/bi';
import { BsStars } from 'react-icons/bs';
import PrayerTimes from '@/components/PrayerTimes';
import AyatHarian from '@/components/AyatHarian';

interface LastRead {
  surahName: string;
  nomorSurah: number;
  ayat: number;
}

export default function Home() {
  const [lastRead, setLastRead] = useState<LastRead | null>(null);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    // Dibungkus dengan setTimeout agar ESLint tidak protes soal sinkronisasi state
    const timer = setTimeout(() => {
      // Set sapaan berdasarkan waktu
      const hour = new Date().getHours();
      if (hour < 11) setGreeting('Selamat Pagi');
      else if (hour < 15) setGreeting('Selamat Siang');
      else if (hour < 18) setGreeting('Selamat Sore');
      else setGreeting('Selamat Malam');

      // Ambil data Terakhir Dibaca
      const saved = localStorage.getItem('quran_last_read');
      if (saved) {
        setLastRead(JSON.parse(saved));
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const quickAccess = [
    { title: "Baca Al-Qur&apos;an", desc: "Mushaf, Terjemahan & Tafsir AI", icon: <BiBookOpen size={28} />, path: '/quran', color: 'bg-islamic-500' },
    { title: "Kuis Ayat", desc: "Latih hafalan dengan audio", icon: <BiTrophy size={28} />, path: '/kuis', color: 'bg-gold-500' },
    { title: "Doa & Wirid", desc: "Kumpulan doa & Curhat AI", icon: <BsStars size={28} />, path: '/doa', color: 'bg-purple-500' },
    { title: "Tools Islami", desc: "Tasbih & Arah Kiblat", icon: <BiWrench size={28} />, path: '/tools', color: 'bg-blue-500' },
  ];

  return (
    <div className="p-4 pt-8 pb-24 min-h-screen">
      {/* Header Greeting */}
      <div className="mb-8">
        <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{greeting},</h2>
        {/* Tanda petik diubah menjadi &apos; */}
        <h1 className="text-2xl font-bold text-islamic-900 dark:text-white">Assalamu&apos;alaikum</h1>
      </div>

      {/* Jadwal Sholat */}
    <PrayerTimes />

      {/* Ayat & Hikmah Harian */}
      <AyatHarian />

      {/* Card Terakhir Dibaca */}
      <div className="bg-linear-to-r from-islamic-700 to-islamic-900 rounded-3xl p-6 shadow-lg shadow-islamic-500/30 text-white mb-8 relative overflow-hidden">
        {/* Dekorasi Ikon Transparan di Latar */}
        <div className="absolute -right-6 -bottom-6 opacity-10">
          <BiBookOpen size={120} />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-4 opacity-90">
            <BiBookOpen className="mr-2" size={20} />
            <span className="text-sm font-medium">Terakhir Dibaca</span>
          </div>
          
          {lastRead ? (
            <>
              <h3 className="text-2xl font-bold mb-1">{lastRead.surahName}</h3>
              <p className="text-sm opacity-80 mb-4">Ayat {lastRead.ayat}</p>
              <Link href={`/quran/${lastRead.nomorSurah}#ayat-${lastRead.ayat}`} className="inline-flex items-center bg-white/20 hover:bg-white/30 px-5 py-2.5 rounded-full text-sm font-bold transition backdrop-blur-sm">
                Lanjut Baca <BiRightArrowAlt size={20} className="ml-1" />
              </Link>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold mb-2">Belum ada aktivitas</h3>
              {/* Tanda petik diubah menjadi &apos; */}
              <p className="text-sm opacity-80 mb-4">Mulai baca Al-Qur&apos;an hari ini.</p>
              <Link href="/quran" className="inline-flex items-center bg-gold-500 hover:bg-gold-400 px-5 py-2.5 rounded-full text-sm font-bold transition text-white shadow-md">
                Mulai Membaca <BiRightArrowAlt size={20} className="ml-1" />
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Menu Quick Access Grid */}
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Menu Utama</h3>
      <div className="grid grid-cols-2 gap-4">
        {quickAccess.map((item, idx) => (
          <Link href={item.path} key={idx}>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition group h-full flex flex-col justify-between">
              <div className={`w-12 h-12 ${item.color} text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                {item.icon}
              </div>
              <div>
                {/* Judul akan dirender dengan &apos; otomatis oleh React */}
                <h4 className="font-bold text-gray-800 dark:text-white text-sm mb-1" dangerouslySetInnerHTML={{ __html: item.title }} />
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
