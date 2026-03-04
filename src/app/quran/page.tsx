"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BiSearch, BiBookOpen } from 'react-icons/bi';

interface Surah {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
}

export default function QuranPage() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const res = await fetch('https://equran.id/api/v2/surat');
        const data = await res.json();
        setSurahs(data.data);
      } catch {
        console.error("Gagal mengambil data surat");
      } finally {
        setIsLoading(false);
      }
    };

    // Menggunakan setTimeout untuk mencegah error linting pada Next.js
    const timer = setTimeout(() => {
      fetchSurahs();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Logika pencarian surat berdasarkan nama latin atau artinya
  const filteredSurahs = surahs.filter(surah => 
    surah.namaLatin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.arti.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 pt-6 pb-24 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-islamic-900 dark:text-white flex items-center">
          <BiBookOpen className="mr-2 text-gold-500" /> Al-Qur&apos;an
        </h1>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <BiSearch className="text-gray-400" size={20} />
        </div>
        <input
          type="text"
          placeholder="Cari nama surat atau arti..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-gray-800 border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-islamic-500 dark:text-white focus:outline-none transition-all"
        />
      </div>

      {/* List Surat */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-islamic-700 dark:border-gold-500"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSurahs.length > 0 ? (
            filteredSurahs.map((surah) => (
              <Link href={`/quran/${surah.nomor}`} key={surah.nomor} className="block">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm hover:shadow-md transition border border-gray-100 dark:border-gray-700 flex items-center justify-between group">
                  <div className="flex items-center space-x-4">
                    {/* Nomor Surat */}
                    <div className="w-10 h-10 bg-islamic-50 dark:bg-gray-700 rounded-xl flex items-center justify-center text-islamic-700 dark:text-gold-400 font-bold group-hover:bg-islamic-500 group-hover:text-white transition-colors">
                      {surah.nomor}
                    </div>
                    {/* Detail Surat */}
                    <div>
                      <h2 className="font-bold text-gray-800 dark:text-white">{surah.namaLatin}</h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {surah.tempatTurun} • {surah.jumlahAyat} Ayat
                      </p>
                    </div>
                  </div>
                  {/* Teks Arab & Arti */}
                  <div className="text-right">
                    <p className="font-arab text-xl text-islamic-900 dark:text-gold-400">{surah.nama}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{surah.arti}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              Surat tidak ditemukan.
            </div>
          )}
        </div>
      )}
    </div>
  );
}