"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AyatCard from '@/components/AyatCard';
import SettingsModal from '@/components/SettingsModal'; 
import { updateDashboardStats } from '@/lib/stats'; 
import { useAudio } from '@/context/AudioContext'; 
import { 
  BiArrowBack, BiCog, BiBookReader, BiListUl, BiHide, 
  BiPlayCircle, BiPauseCircle 
} from 'react-icons/bi';

interface Ayat { nomorAyat: number; teksArab: string; teksLatin: string; teksIndonesia: string; audio: { '05': string }; }
interface DetailSurat { nomor: number; nama: string; namaLatin: string; jumlahAyat: number; tempatTurun: string; arti: string; ayat: Ayat[]; audioFull: { [key: string]: string }; }

export default function SuratDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [surat, setSurat] = useState<DetailSurat | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState<'mushaf' | 'list'>('list');
  const [modeHafalan, setModeHafalan] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [fontSize, setFontSize] = useState(30);
  const [fontFamily, setFontFamily] = useState('font-arab');
  const [showPosterBtn, setShowPosterBtn] = useState(true);

  // --- PAKAI AUDIO GLOBAL ---
  const { playFullSurat, isPlaying, currentSurah } = useAudio();
  const isThisSuratPlaying = isPlaying && currentSurah === surat?.namaLatin;

  // 1. Ambil Pengaturan Font/Mode dari LocalStorage
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

  const handleUpdateSettings = (updates: Partial<{fontSize: number; fontFamily: string; showPosterBtn: boolean; viewMode: 'mushaf' | 'list'}>) => {
    const newSettings = { fontSize, fontFamily, showPosterBtn, viewMode, ...updates };
    localStorage.setItem('quran_reader_settings', JSON.stringify(newSettings));
  };

  // 2. Fetch Data Surat dari API
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`https://equran.id/api/v2/surat/${id}`);
        const data = await res.json();
        setSurat(data.data);
        // PENCATATAN TARGET BACA DIHAPUS DARI SINI
      } catch {
        console.error("Gagal mengambil detail surat");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  // ==========================================================
  // 3. SENSOR WAKTU (TARGET BACA 10 DETIK)
  // ==========================================================
  useEffect(() => {
    // Kalau surat belum dimuat, jangan hitung waktu
    if (!surat) return;

    // Pasang timer 10 detik (10.000 milidetik)
    const timer = setTimeout(() => {
      updateDashboardStats('baca', surat.jumlahAyat);
      console.log(`Sah! Surat ${surat.namaLatin} dibaca lebih dari 10 detik. Target ditambahkan.`);
    }, 10000);

    // CLEANUP: Kalau user menekan tombol 'Back' sebelum 10 detik, timer dibatalkan!
    return () => {
      clearTimeout(timer);
      console.log("Membaca dibatalkan. Belum 10 detik sudah keluar.");
    };
  }, [surat]); // Efek ini akan berjalan setelah 'surat' berhasil dimuat


  if (isLoading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-islamic-700"></div></div>;
  if (!surat) return <div className="p-6 text-center">Surat tidak ditemukan.</div>;

  return (
    <div className="min-h-screen pb-32 relative bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between shadow-sm">
        <button onClick={() => router.back()} className="text-gray-700 dark:text-white p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"><BiArrowBack size={24} /></button>
        <div className="text-center">
          <h1 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">{surat.namaLatin}</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">{surat.arti} • {surat.jumlahAyat} Ayat</p>
        </div>
        <button onClick={() => setShowSettings(true)} className="text-gray-700 dark:text-white p-2 hover:bg-islamic-50 dark:hover:bg-gray-800 rounded-full transition"><BiCog size={24} /></button>
      </div>

      <div className="p-4 max-w-3xl mx-auto">
        <div className="bg-linear-to-br from-islamic-700 to-islamic-900 rounded-[2.5rem] p-10 text-center text-white shadow-2xl mb-10 relative overflow-hidden border border-islamic-600">
          <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
            <span className="font-arab text-9xl">{surat.nama}</span>
          </div>
          <h2 className="font-arab text-5xl mb-4 relative z-10">{surat.nama}</h2>
          <p className="text-sm font-bold text-gold-400 relative z-10 uppercase tracking-[0.3em]">{surat.namaLatin}</p>
          <div className="w-16 h-1 bg-gold-500/40 mx-auto my-6 rounded-full relative z-10"></div>
          <p className="text-xs opacity-90 relative z-10 font-bold tracking-widest mb-6">{surat.tempatTurun.toUpperCase()} • {surat.jumlahAyat} AYAT</p>

          <button 
            onClick={() => playFullSurat(surat.audioFull['05'], surat.namaLatin)}
            className="relative z-10 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center mx-auto transition-all active:scale-95 shadow-lg"
          >
            {isThisSuratPlaying ? <BiPauseCircle size={24} className="mr-2 animate-pulse" /> : <BiPlayCircle size={24} className="mr-2" />}
            {isThisSuratPlaying ? 'Jeda Murottal' : 'Putar Murottal Full'}
          </button>
        </div>

        <div className="flex gap-2 mb-8 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
           <button onClick={() => { setViewMode('mushaf'); handleUpdateSettings({viewMode: 'mushaf'}); }} className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'mushaf' ? 'bg-white dark:bg-gray-700 shadow-md text-islamic-600 dark:text-gold-400' : 'text-gray-400'}`}><BiBookReader className="mr-2" size={18}/> Mushaf</button>
           <button onClick={() => { setViewMode('list'); handleUpdateSettings({viewMode: 'list'}); }} className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-md text-islamic-600 dark:text-gold-400' : 'text-gray-400'}`}><BiListUl className="mr-2" size={18}/> List</button>
           <button onClick={() => setModeHafalan(!modeHafalan)} className={`flex-1 flex items-center justify-center py-2.5 rounded-xl text-xs font-bold transition-all ${modeHafalan ? 'bg-gold-500 text-white shadow-md' : 'text-gray-400'}`}><BiHide className="mr-2" size={18}/> Hafalan</button>
        </div>

        {surat.nomor !== 1 && surat.nomor !== 9 && (
          <div className="text-center font-arab text-4xl mb-12 text-gray-800 dark:text-gray-100 transition-all opacity-90 hover:opacity-100">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
        )}

        {viewMode === 'mushaf' ? (
          <div className="bg-white dark:bg-gray-800 p-8 md:p-12 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300" dir="rtl">
            <p className={`text-justify leading-[2.8] text-gray-800 dark:text-gray-100 ${fontFamily}`} style={{ fontSize: `${fontSize}px` }}>
              {surat.ayat.map((ayat) => (
                <span key={ayat.nomorAyat} id={`ayat-${ayat.nomorAyat}`} className="inline scroll-mt-28">
                  <span className={`transition-all duration-500 cursor-pointer ${modeHafalan ? 'text-transparent bg-gray-100 dark:bg-gray-700 rounded-md px-2 blur-sm hover:blur-none hover:text-gray-800 dark:hover:text-white hover:bg-transparent' : ''}`}>{ayat.teksArab}</span>
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-islamic-100 text-islamic-600 dark:text-gold-500 dark:border-gray-700 text-xs font-bold font-sans mx-4 align-middle bg-gray-50/50 dark:bg-gray-900/30 shadow-inner">{ayat.nomorAyat}</span>
                </span>
              ))}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {surat.ayat.map((ayat) => (
              <AyatCard key={ayat.nomorAyat} nomorSurah={surat.nomor} surahName={surat.namaLatin} nomorAyat={ayat.nomorAyat} teksArab={ayat.teksArab} teksLatin={modeHafalan ? '' : ayat.teksLatin} terjemahan={modeHafalan ? 'Mode Hafalan Aktif.' : ayat.teksIndonesia} audioUrl={ayat.audio['05']} fontSize={fontSize} fontFamily={fontFamily} showPosterBtn={showPosterBtn} />
            ))}
          </div>
        )}
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} fontSize={fontSize} setFontSize={(s: number) => { setFontSize(s); handleUpdateSettings({fontSize: s}); }} fontFamily={fontFamily} setFontFamily={(f: string) => { setFontFamily(f); handleUpdateSettings({fontFamily: f}); }} showPosterBtn={showPosterBtn} setShowPosterBtn={(v: boolean) => { setShowPosterBtn(v); handleUpdateSettings({showPosterBtn: v}); }} />
    </div>
  );
}
