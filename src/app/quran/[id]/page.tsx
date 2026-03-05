"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AyatCard from '@/components/AyatCard';
import SettingsModal from '@/components/SettingsModal'; 
import { BiArrowBack, BiCog } from 'react-icons/bi';

interface Ayat {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: { '05': string };
}

interface DetailSurat {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  ayat: Ayat[];
}

export default function SuratDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [surat, setSurat] = useState<DetailSurat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState<'mushaf' | 'list'>('list');
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(30);
  const [fontFamily, setFontFamily] = useState('font-arab');
  const [showPosterBtn, setShowPosterBtn] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('quran_reader_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      setFontSize(parsed.fontSize || 30);
      setFontFamily(parsed.fontFamily || 'font-arab');
      setShowPosterBtn(parsed.showPosterBtn ?? true);
      if(parsed.viewMode) setViewMode(parsed.viewMode);
    }
  }, []);

  // Memperbaiki error 'any' dengan memberikan tipe Record
  const handleUpdateSettings = (updates: Partial<{fontSize: number; fontFamily: string; showPosterBtn: boolean; viewMode: string}>) => {
    const newSettings = {
      fontSize,
      fontFamily,
      showPosterBtn,
      viewMode,
      ...updates
    };
    localStorage.setItem('quran_reader_settings', JSON.stringify(newSettings));
  };

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`https://equran.id/api/v2/surat/${id}`);
        const data = await res.json();
        setSurat(data.data);
      } catch {
        console.error("Gagal mengambil detail surat");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-islamic-700 dark:border-gold-500"></div>
      </div>
    );
  }

  if (!surat) return <div className="p-6 text-center">Surat tidak ditemukan.</div>;

  return (
    <div className="min-h-screen pb-24 relative bg-gray-50 dark:bg-gray-900">
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between shadow-sm">
        <button onClick={() => router.back()} className="text-gray-700 dark:text-white transition p-2">
          <BiArrowBack size={24} />
        </button>
        <div className="text-center">
          <h1 className="font-bold text-lg text-gray-900 dark:text-white">{surat.namaLatin}</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">{surat.arti} • {surat.jumlahAyat} Ayat</p>
        </div>
        <button onClick={() => setShowSettings(true)} className="text-gray-700 dark:text-white p-2">
          <BiCog size={24} />
        </button>
      </div>

      <div className="p-4 max-w-3xl mx-auto">
        {/* Update ke bg-linear-to-br sesuai saran Tailwind */}
        <div className="bg-linear-to-br from-islamic-700 to-islamic-900 rounded-[2.5rem] p-8 text-center text-white shadow-xl mb-8 relative overflow-hidden border border-islamic-600">
          <div className="absolute inset-0 opacity-10 flex items-center justify-center">
            <span className="font-arab text-9xl">{surat.nama}</span>
          </div>
          <h2 className="font-arab text-5xl mb-3 relative z-10">{surat.nama}</h2>
          <p className="text-sm font-bold text-gold-400 relative z-10 uppercase tracking-[0.2em]">{surat.namaLatin}</p>
          <div className="w-12 h-1 bg-gold-500/50 mx-auto my-5 rounded-full relative z-10"></div>
          <p className="text-xs opacity-80 relative z-10 font-medium">
            {surat.tempatTurun.toUpperCase()} • {surat.jumlahAyat} AYAT
          </p>
        </div>

        {surat.nomor !== 1 && surat.nomor !== 9 && (
          <div className="text-center font-arab text-4xl mb-10 text-gray-800 dark:text-gray-100">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
        )}

        <div className="space-y-6">
          {surat.ayat.map((ayat) => (
            <AyatCard 
              key={ayat.nomorAyat}
              nomorSurah={surat.nomor}
              surahName={surat.namaLatin}
              nomorAyat={ayat.nomorAyat}
              teksArab={ayat.teksArab}
              teksLatin={ayat.teksLatin}
              terjemahan={ayat.teksIndonesia}
              audioUrl={ayat.audio['05']}
              fontSize={fontSize}
              fontFamily={fontFamily}
              showPosterBtn={showPosterBtn}
            />
          ))}
        </div>
      </div>

      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        fontSize={fontSize}
        // Memberikan tipe data number, string, boolean pada parameter v, f, s
        setFontSize={(s: number) => { setFontSize(s); handleUpdateSettings({fontSize: s}); }}
        fontFamily={fontFamily}
        setFontFamily={(f: string) => { setFontFamily(f); handleUpdateSettings({fontFamily: f}); }}
        showPosterBtn={showPosterBtn}
        setShowPosterBtn={(v: boolean) => { setShowPosterBtn(v); handleUpdateSettings({showPosterBtn: v}); }}
      />
    </div>
  );
}
