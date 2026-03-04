"use client";
import { useState } from 'react';
import { callGeminiAPI } from '@/lib/gemini';
import { BiPlayCircle, BiBookmark } from 'react-icons/bi';
import { BsStars } from 'react-icons/bs';

interface AyatProps {
  nomorSurah: number; // Tambahan baru
  surahName: string;
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  terjemahan: string;
  audioUrl: string;
}

export default function AyatCard({ nomorSurah, surahName, nomorAyat, teksArab, teksLatin, terjemahan, audioUrl }: AyatProps) {
  const [tafsir, setTafsir] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleTafsirAI = async () => {
    setLoading(true);
    try {
      const prompt = `Berikan tafsir, penjelasan singkat, dan hikmah yang lembut dalam 3 paragraf untuk Surah ${surahName} ayat ${nomorAyat}. Teks terjemahan: "${terjemahan}". Gunakan bahasa Indonesia yang santun dan menenangkan.`;
      const response = await callGeminiAPI(prompt);
      setTafsir(response);
    } catch {
      setTafsir("Maaf, gagal memuat tafsir AI saat ini.");
    }
    setLoading(false);
  };

  const playAudio = () => {
    const audio = new Audio(audioUrl);
    audio.play();
  };

  // Logika Bookmark
  const handleBookmark = () => {
    localStorage.setItem('quran_last_read', JSON.stringify({
      surahName: surahName,
      nomorSurah: nomorSurah,
      ayat: nomorAyat
    }));
    setIsBookmarked(true);
    setTimeout(() => setIsBookmarked(false), 2000); // Efek hijau 2 detik
  };

  return (
    // Tambahkan id="ayat-X" di sini untuk fitur auto-scroll
    <div id={`ayat-${nomorAyat}`} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 mb-4 border dark:border-gray-700 scroll-mt-24">
      <div className="flex justify-between items-center mb-4">
        <div className="bg-islamic-100 dark:bg-islamic-900 text-islamic-700 dark:text-islamic-100 w-8 h-8 rounded-full flex items-center justify-center font-bold">
          {nomorAyat}
        </div>
        <div className="flex space-x-3">
          {/* Tombol Bookmark */}
          <button onClick={handleBookmark} className={`transition ${isBookmarked ? 'text-islamic-500' : 'text-gray-400 hover:text-islamic-500'}`}>
            <BiBookmark size={26} />
          </button>
          <button onClick={playAudio} className="text-islamic-500 hover:text-islamic-700 transition">
            <BiPlayCircle size={28} />
          </button>
          <button onClick={handleTafsirAI} disabled={loading} className="text-gold-500 hover:text-gold-400 transition relative">
            <BsStars size={28} />
            {loading && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-gold-500"></span></span>}
          </button>
        </div>
      </div>
      
      <p className="font-arab text-3xl text-right leading-loose mb-4 text-gray-800 dark:text-gray-100">{teksArab}</p>
      <p className="text-sm text-islamic-700 dark:text-islamic-400 italic mb-2">{teksLatin}</p>
      <p className="text-sm text-gray-600 dark:text-gray-300">{terjemahan}</p>

      {tafsir && (
        <div className="mt-4 p-4 bg-linear-to-br from-islamic-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-lg border border-islamic-100 dark:border-gray-600">
          <h4 className="flex items-center text-sm font-bold text-islamic-700 dark:text-gold-400 mb-2">
            <BsStars className="mr-2" /> Hikmah & Tafsir AI
          </h4>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2 whitespace-pre-wrap">
            {tafsir}
          </div>
        </div>
      )}
    </div>
  );
}