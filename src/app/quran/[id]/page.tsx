"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AyatCard from '@/components/AyatCard';
import { BiArrowBack, BiCog, BiBookReader, BiListUl, BiHide } from 'react-icons/bi';

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
  
  // Toggles & Modes
  const [viewMode, setViewMode] = useState<'mushaf' | 'list'>('mushaf');
  const [modeHafalan, setModeHafalan] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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
    <div className="min-h-screen pb-24 relative">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-islamic-50/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-islamic-100 dark:border-gray-800 p-4 flex items-center justify-between shadow-sm transition-colors">
        <button onClick={() => router.back()} className="text-islamic-900 dark:text-white hover:text-islamic-700 transition">
          <BiArrowBack size={24} />
        </button>
        <div className="text-center">
          <h1 className="font-bold text-lg text-islamic-900 dark:text-white">{surat.namaLatin}</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">{surat.arti} • {surat.jumlahAyat} Ayat</p>
        </div>
        <button onClick={() => setShowSettings(!showSettings)} className="text-islamic-900 dark:text-white hover:text-islamic-700 transition">
          <BiCog size={24} />
        </button>
      </div>

      {/* Dropdown Settings */}
      {showSettings && (
        <div className="fixed top-16 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 w-64 animate-fade-in">
          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Tampilan</h3>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button 
              onClick={() => { setViewMode('mushaf'); setShowSettings(false); }}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition ${viewMode === 'mushaf' ? 'bg-islamic-50 border-islamic-500 text-islamic-700 dark:bg-gray-700 dark:border-gold-500 dark:text-gold-400' : 'border-gray-200 dark:border-gray-600 dark:text-gray-300'}`}
            >
              <BiBookReader size={24} className="mb-1" />
              <span className="text-xs font-medium">Mushaf</span>
            </button>
            <button 
              onClick={() => { setViewMode('list'); setShowSettings(false); }}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition ${viewMode === 'list' ? 'bg-islamic-50 border-islamic-500 text-islamic-700 dark:bg-gray-700 dark:border-gold-500 dark:text-gold-400' : 'border-gray-200 dark:border-gray-600 dark:text-gray-300'}`}
            >
              <BiListUl size={24} className="mb-1" />
              <span className="text-xs font-medium">Arab+Latin</span>
            </button>
          </div>

          <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Fitur</h3>
          <button 
            onClick={() => setModeHafalan(!modeHafalan)}
            className={`w-full flex items-center justify-between p-3 rounded-xl border transition ${modeHafalan ? 'bg-gold-50 border-gold-500 text-gold-600 dark:bg-gray-700 dark:text-gold-400' : 'border-gray-200 dark:border-gray-600 dark:text-gray-300'}`}
          >
            <span className="text-sm font-medium flex items-center">
              <BiHide className="mr-2" size={18} /> Mode Hafalan
            </span>
            <div className={`w-10 h-6 rounded-full relative transition ${modeHafalan ? 'bg-gold-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${modeHafalan ? 'left-5' : 'left-1'}`}></div>
            </div>
          </button>
        </div>
      )}

      {/* Header Info Surat */}
      <div className="p-4">
        <div className="bg-linear-to-br from-islamic-700 to-islamic-900 rounded-3xl p-8 text-center text-white shadow-lg mb-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 flex items-center justify-center">
            <span className="font-arab text-9xl">{surat.nama}</span>
          </div>
          <h2 className="font-arab text-4xl mb-2 relative z-10">{surat.nama}</h2>
          <p className="text-sm opacity-90 relative z-10 uppercase tracking-widest">{surat.namaLatin}</p>
          <div className="w-16 h-1 bg-gold-500 mx-auto my-4 rounded-full relative z-10"></div>
          <p className="text-sm relative z-10">
            {surat.tempatTurun} • {surat.jumlahAyat} Ayat
          </p>
        </div>

        {/* Bismillah (kecuali Al-Fatihah dan At-Taubah) */}
        {surat.nomor !== 1 && surat.nomor !== 9 && (
          <div className="text-center font-arab text-3xl mb-8 text-gray-800 dark:text-gray-100">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
        )}

        {/* Konten Ayat */}
        {viewMode === 'mushaf' ? (
          // MODE MUSHAF
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700" dir="rtl">
            <p className="text-justify leading-16 text-gray-800 dark:text-gray-100">
              {surat.ayat.map((ayat) => (
                // Tambahkan id="ayat-X" di sini
                <span key={ayat.nomorAyat} id={`ayat-${ayat.nomorAyat}`} className="inline font-arab text-3xl scroll-mt-24">
                  <span className={`transition-all duration-300 ${modeHafalan ? 'text-transparent text-shadow-blur hover:text-gray-800 dark:hover:text-gray-100' : ''}`}>
                    {ayat.teksArab}
                  </span>
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-islamic-500 text-islamic-700 dark:text-gold-400 dark:border-gold-500 text-sm font-sans mx-2 align-middle">
                    {ayat.nomorAyat}
                  </span>
                </span>
              ))}
            </p>
          </div>
        ) : (
          // MODE LIST
          <div className="space-y-4">
            {surat.ayat.map((ayat) => (
              <AyatCard 
                key={ayat.nomorAyat}
                nomorSurah={surat.nomor} // Tambahan properti baru
                surahName={surat.namaLatin}
                nomorAyat={ayat.nomorAyat}
                teksArab={ayat.teksArab}
                teksLatin={modeHafalan ? '' : ayat.teksLatin}
                terjemahan={modeHafalan ? 'Mode Hafalan Aktif: Terjemahan disembunyikan.' : ayat.teksIndonesia}
                audioUrl={ayat.audio['05']}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}