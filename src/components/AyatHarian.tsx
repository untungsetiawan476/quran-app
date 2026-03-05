"use client";
import { useState, useEffect } from 'react';
import { callGeminiAPI } from '@/lib/gemini';
import { BsStars } from 'react-icons/bs';
import { BiBookHeart } from 'react-icons/bi';

interface DailyData {
  surah: string;
  arab: string;
  latin: string;
  arti: string;
  hikmah: string;
}

export default function AyatHarian() {
  const [data, setData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDaily = async () => {
      // Ambil tanggal hari ini (Format: YYYY-MM-DD)
      const today = new Date().toISOString().split('T')[0];
      const saved = localStorage.getItem('quran_daily_motivation');

      // 1. Cek apakah hari ini sudah ada motivasi yang tersimpan
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === today && parsed.data) {
          setData(parsed.data);
          setLoading(false);
          return;
        }
      }

      // 2. Jika belum ada atau ganti hari, panggil AI Gemini
      try {
        const prompt = `Berikan 1 potong ayat Al-Qur'an pendek (maksimal 15 kata) yang menginspirasi. Balas HANYA dengan format JSON persis seperti ini tanpa tambahan teks/markdown apapun: {"surah": "Nama Surah Ayat X", "arab": "Teks Arab", "latin": "Teks Latin", "arti": "Terjemahan", "hikmah": "1 kalimat motivasi Islami yang menyejukkan hati terkait kehidupan"}`;
        
        const response = await callGeminiAPI(prompt);
        // Membersihkan format backtick markdown jika AI menambahkannya
        const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(cleanedResponse);

        setData(parsedData);
        // Simpan ke memori HP untuk hari ini
        localStorage.setItem('quran_daily_motivation', JSON.stringify({
          date: today,
          data: parsedData
        }));
      } catch (error) {
        console.error("Gagal mengambil motivasi AI", error);
        // 3. Fallback (Penyelamat) jika sedang offline / API limit
        setData({
          surah: "Al-Baqarah Ayat 286",
          arab: "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
          latin: "Lā yukallifullāhu nafsan illā wus'ahā",
          arti: "Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya.",
          hikmah: "Tarik napas panjang. Seberat apapun masalahmu hari ini, percayalah Allah tahu kamu pasti bisa melewatinya."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDaily();
  }, []);

  if (loading) {
    return (
      <div className="bg-linear-to-r from-islamic-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-3xl p-6 shadow-sm border border-islamic-100 dark:border-gray-700 mb-8 animate-pulse">
         <div className="h-4 bg-islamic-200 dark:bg-gray-700 rounded-full w-1/3 mb-6"></div>
         <div className="h-10 bg-islamic-200 dark:bg-gray-700 rounded-xl w-full mb-3"></div>
         <div className="h-4 bg-islamic-200 dark:bg-gray-700 rounded-full w-2/3 mb-6"></div>
         <div className="h-12 bg-islamic-100 dark:bg-gray-600 rounded-xl w-full"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-linear-to-br from-islamic-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-3xl p-6 shadow-sm border border-islamic-100 dark:border-gray-700 mb-8 relative overflow-hidden">
      {/* Ikon Background Transparan */}
      <div className="absolute -top-4 -right-4 p-4 opacity-5 dark:opacity-10">
        <BiBookHeart size={120} className="text-islamic-500 dark:text-gold-500" />
      </div>
      
      <div className="relative z-10">
        <h3 className="flex items-center text-sm font-bold text-islamic-700 dark:text-gold-400 mb-4 uppercase tracking-wider">
          <BsStars className="mr-2" size={18} /> Inspirasi Hari Ini
        </h3>
        <p className="font-arab text-3xl text-right text-islamic-900 dark:text-white leading-loose mb-2">{data.arab}</p>
        <p className="text-xs text-right text-gray-500 dark:text-gray-400 italic mb-4">{data.latin}</p>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1 font-medium">&quot;{data.arti}&quot;</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">— {data.surah}</p>
        
        {/* Kotak Hikmah */}
        <div className="bg-white/60 dark:bg-gray-700/50 p-4 rounded-2xl border-l-4 border-gold-500 backdrop-blur-sm shadow-sm">
          <p className="text-sm font-bold text-islamic-900 dark:text-white leading-relaxed">
            <span className="text-gold-500 mr-1">✨ Hikmah:</span> {data.hikmah}
          </p>
        </div>
      </div>
    </div>
  );
}