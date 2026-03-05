"use client";
import { useState, useEffect } from 'react';
import { BiFolder, BiTrash, BiChevronLeft, BiBookHeart } from 'react-icons/bi';

interface SavedAyat {
  surah: number;
  surahName: string;
  ayat: number;
  teksArab: string;
  terjemahan: string;
}

type Playlists = Record<string, SavedAyat[]>;

export default function KoleksiPage() {
  const [playlists, setPlaylists] = useState<Playlists>({});
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  useEffect(() => {
    // Membungkus dengan setTimeout untuk mencegah rendering berantai (membuat linter senang)
    const timer = setTimeout(() => {
      const savedData = localStorage.getItem('quran_playlists');
      if (savedData) {
        setPlaylists(JSON.parse(savedData));
      }
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  const deleteFolder = (folderName: string) => {
    const confirmDelete = confirm(`Hapus folder "${folderName}" beserta isinya?`);
    if (confirmDelete) {
      const updatedPlaylists = { ...playlists };
      delete updatedPlaylists[folderName];
      setPlaylists(updatedPlaylists);
      localStorage.setItem('quran_playlists', JSON.stringify(updatedPlaylists));
    }
  };

  const deleteAyatFromFolder = (folderName: string, index: number) => {
    const updatedPlaylists = { ...playlists };
    updatedPlaylists[folderName].splice(index, 1);
    
    // Jika folder kosong setelah ayat dihapus, kita bisa biarkan atau hapus foldernya
    // Di sini kita biarkan foldernya tetap ada meskipun kosong
    setPlaylists(updatedPlaylists);
    localStorage.setItem('quran_playlists', JSON.stringify(updatedPlaylists));
  };

  // --- TAMPILAN JIKA SEDANG MEMBUKA ISI FOLDER ---
  if (selectedFolder) {
    const ayats = playlists[selectedFolder] || [];
    return (
      <div className="p-4 pt-8 pb-24 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setSelectedFolder(null)} className="flex items-center text-gray-600 dark:text-gray-300 hover:text-islamic-600 transition">
            <BiChevronLeft size={28} /> <span className="font-medium ml-1">Kembali</span>
          </button>
          <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
            <BiFolder className="mr-2 text-islamic-500" /> {selectedFolder}
          </h1>
        </div>

        {ayats.length === 0 ? (
          <div className="text-center mt-20 opacity-50">
            <BiBookHeart size={60} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Folder ini masih kosong.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ayats.map((ayat, idx) => (
              <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 relative">
                <div className="flex justify-between items-start mb-4">
                  <span className="bg-islamic-50 dark:bg-gray-700 text-islamic-700 dark:text-islamic-300 text-xs font-bold px-3 py-1 rounded-full">
                    {ayat.surahName} : {ayat.ayat}
                  </span>
                  <button onClick={() => deleteAyatFromFolder(selectedFolder, idx)} className="text-gray-400 hover:text-red-500 transition" title="Hapus dari folder">
                    <BiTrash size={20} />
                  </button>
                </div>
                <p className="font-arab text-2xl text-right leading-loose mb-3 text-gray-800 dark:text-gray-100" dir="rtl">{ayat.teksArab}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{ayat.terjemahan}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- TAMPILAN UTAMA (DAFTAR FOLDER) ---
  const folderNames = Object.keys(playlists);

  return (
    <div className="p-4 pt-8 pb-24 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Koleksi Hafalan</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Simpan dan kelompokkan ayat favorit Anda di sini.</p>
      </div>

      {folderNames.length === 0 ? (
        <div className="text-center mt-20 opacity-60">
           <BiFolder size={80} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
           <p className="text-gray-500 dark:text-gray-400 font-medium">Belum ada folder playlist.</p>
           <p className="text-xs text-gray-400 mt-2">Gunakan ikon Bookmark di halaman bacaan untuk membuat folder baru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {folderNames.map((folder) => (
            <div key={folder} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-start relative group hover:border-islamic-300 transition cursor-pointer" onClick={() => setSelectedFolder(folder)}>
              <div className="w-12 h-12 bg-islamic-50 dark:bg-gray-700 text-islamic-600 dark:text-islamic-400 rounded-xl flex items-center justify-center mb-3">
                <BiFolder size={28} />
              </div>
              <h3 className="font-bold text-gray-800 dark:text-white truncate w-full">{folder}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{playlists[folder].length} Ayat</p>
              
              <button 
                onClick={(e) => { e.stopPropagation(); deleteFolder(folder); }} 
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                title="Hapus Folder"
              >
                <BiTrash size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}