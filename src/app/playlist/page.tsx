"use client";
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { 
  BiBookmarkHeart, 
  BiPlayCircle, 
  BiPauseCircle, 
  BiTrash, 
  BiHeadphone,
  BiLeftArrowAlt,
  BiInfoCircle
} from 'react-icons/bi';
import { BsStars } from 'react-icons/bs';

interface SavedAyat {
  id: string; 
  surah: number;
  surahName: string;
  ayat: number;
  teksArab: string;
  terjemahan: string;
  audioUrl: string;
}

// Struktur data sekarang menggunakan Folder!
type FolderData = Record<string, SavedAyat[]>;

export default function PlaylistPage() {
  const [semuaFolder, setSemuaFolder] = useState<FolderData>({});
  const [activeFolder, setActiveFolder] = useState<string>('');
  
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 1. Ambil data FOLDER dari LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('quran_playlists'); 
    if (saved) {
      const parsed = JSON.parse(saved);
      // eslint-disable-next-line
      setSemuaFolder(parsed);
      
      // Otomatis buka folder pertama kalau ada
      const daftarFolder = Object.keys(parsed);
      if (daftarFolder.length > 0) {
        // eslint-disable-next-line
        setActiveFolder(daftarFolder[0]);
      }
    }
  }, []);

  // Ayat yang sedang aktif dilihat (berdasarkan folder yang dipilih)
  const koleksiAktif = semuaFolder[activeFolder] || [];

  // 2. Logika Pemutar Audio Otomatis
  useEffect(() => {
    if (currentIndex !== null && koleksiAktif[currentIndex]) {
      // Pastikan audioUrl ada (untuk ayat lama yang tersimpan tanpa audio, kita lewati)
      if (!koleksiAktif[currentIndex].audioUrl) {
        alert("Maaf, ayat ini disimpan di versi lama dan tidak memiliki audio. Silakan hapus dan simpan ulang.");
        setCurrentIndex(null);
        setIsPlaying(false);
        return;
      }

      if (!audioRef.current) {
        audioRef.current = new Audio(koleksiAktif[currentIndex].audioUrl);
      } else {
        audioRef.current.src = koleksiAktif[currentIndex].audioUrl;
      }
      
      audioRef.current.play();
      // eslint-disable-next-line
      setIsPlaying(true);

      audioRef.current.onended = () => {
        if (currentIndex < koleksiAktif.length - 1) {
          setCurrentIndex(currentIndex + 1); 
        } else {
          // eslint-disable-next-line
          setIsPlaying(false);
          // eslint-disable-next-line
          setCurrentIndex(null); 
        }
      };
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentIndex, koleksiAktif]);

  const togglePlayAll = () => {
    if (koleksiAktif.length === 0) return;
    
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (currentIndex === null) {
        setCurrentIndex(0); 
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    }
  };

  const playSingle = (index: number) => {
    if (currentIndex === index && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setCurrentIndex(index);
    }
  };

  const hapusDariKoleksi = (id: string) => {
    const dataBaru = { ...semuaFolder };
    
    // Hapus ayat dari folder aktif
    dataBaru[activeFolder] = dataBaru[activeFolder].filter(a => a.id !== id);
    
    // Kalau foldernya jadi kosong setelah dihapus, hapus sekalian foldernya
    if (dataBaru[activeFolder].length === 0) {
      delete dataBaru[activeFolder];
      const sisaFolder = Object.keys(dataBaru);
      setActiveFolder(sisaFolder.length > 0 ? sisaFolder[0] : '');
    }

    setSemuaFolder(dataBaru);
    localStorage.setItem('quran_playlists', JSON.stringify(dataBaru));
    
    if (currentIndex !== null && koleksiAktif[currentIndex]?.id === id) {
      audioRef.current?.pause();
      setIsPlaying(false);
      setCurrentIndex(null);
    }
  };

  const daftarNamaFolder = Object.keys(semuaFolder);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
      {/* HEADER SULTAN */}
      <div className="bg-emerald-600 dark:bg-emerald-800 pt-12 pb-8 px-6 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 border border-white/30 shadow-inner">
            <BiBookmarkHeart size={36} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Playlist Hafalan</h1>
          <p className="text-emerald-100 text-sm">
            {daftarNamaFolder.length} Folder Tersimpan
          </p>
        </div>
      </div>

      <div className="p-5 -mt-6 relative z-20 max-w-md mx-auto">
        
        {/* PILIH FOLDER (Bisa di-scroll ke samping) */}
        {daftarNamaFolder.length > 0 && (
          <div className="flex overflow-x-auto gap-2 mb-6 pb-2 hide-scrollbar">
            {daftarNamaFolder.map(folder => (
              <button
                key={folder}
                onClick={() => {
                  setActiveFolder(folder);
                  setCurrentIndex(null); // Reset player kalau pindah folder
                  setIsPlaying(false);
                  audioRef.current?.pause();
                }}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  activeFolder === folder
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-700'
                }`}
              >
                📁 {folder} ({semuaFolder[folder].length})
              </button>
            ))}
          </div>
        )}

        {/* TOMBOL PUTAR SEMUA */}
        {koleksiAktif.length > 0 && (
          <button 
            onClick={togglePlayAll}
            className={`w-full py-4 rounded-2xl flex justify-center items-center font-bold text-lg transition-all shadow-lg mb-6 ${
              isPlaying 
                ? 'bg-amber-500 text-white shadow-amber-500/40 animate-pulse' 
                : 'bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 border border-gray-100 dark:border-gray-700'
            }`}
          >
            {isPlaying ? (
              <><BiPauseCircle size={28} className="mr-2" /> Jeda Muroja&apos;ah</>
            ) : (
              <><BiHeadphone size={28} className="mr-2" /> Putar Semua Ayat</>
            )}
          </button>
        )}

        {/* JIKA SAMA SEKALI KOSONG */}
        {daftarNamaFolder.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700 mt-6">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <BsStars size={40} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Belum Ada Hafalan</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Mulai buat folder dan simpan target hafalan Mas Untung dari halaman baca Qur&apos;an.
            </p>
            <Link href="/quran" className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md">
              <BiLeftArrowAlt size={20} className="mr-2" /> Eksplorasi Qur&apos;an
            </Link>
          </div>
        ) : (
          /* JIKA ADA ISINYA (DAFTAR AYAT DI FOLDER AKTIF) */
          <div className="space-y-4">
            {koleksiAktif.map((ayat, index) => {
              const isThisPlaying = currentIndex === index;
              return (
                <div 
                  key={ayat.id || index} 
                  className={`bg-white dark:bg-gray-800 p-5 rounded-3xl shadow-sm border transition-all ${
                    isThisPlaying 
                      ? 'border-amber-500 dark:border-amber-500 ring-4 ring-amber-500/10 scale-[1.02]' 
                      : 'border-gray-100 dark:border-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
                      {ayat.surahName} : {ayat.ayat}
                    </span>
                    <button 
                      onClick={() => hapusDariKoleksi(ayat.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Hapus dari Playlist"
                    >
                      <BiTrash size={20} />
                    </button>
                  </div>

                  <p className="text-right font-arab text-2xl leading-loose mb-3 text-gray-800 dark:text-gray-100" dir="rtl">
                    {ayat.teksArab}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-4 line-clamp-2">
                    &quot;{ayat.terjemahan}&quot;
                  </p>

                  <button 
                    onClick={() => playSingle(index)}
                    className={`w-full py-2.5 rounded-xl flex justify-center items-center text-sm font-bold transition-all ${
                      isThisPlaying
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
                    }`}
                  >
                    {isThisPlaying ? (
                      <><BiPauseCircle size={20} className="mr-2 animate-pulse" /> Sedang Diputar...</>
                    ) : (
                      <><BiPlayCircle size={20} className="mr-2" /> Putar Ayat Ini</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* PANDUAN PENGGUNA */}
      {daftarNamaFolder.length > 0 && (
        <div className="max-w-md mx-auto px-5 mt-8 mb-4 flex items-start text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 p-4 rounded-2xl">
           <BiInfoCircle size={18} className="mr-2 shrink-0 text-amber-500" />
           <p>Pilih folder di atas, lalu gunakan tombol &quot;Putar Semua Ayat&quot; untuk memutar murottal secara berurutan, cocok untuk muroja&apos;ah hafalan.</p>
        </div>
      )}
    </div>
  );
}
