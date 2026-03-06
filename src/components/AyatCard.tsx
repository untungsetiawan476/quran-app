"use client";
import { useState, useRef, useEffect } from 'react';
import { callGeminiAPI } from '@/lib/gemini';
import { 
  BiPlayCircle, BiPauseCircle, BiBookmark, BiHeadphone, 
  BiImageAdd, BiBrain, BiFolderPlus, BiCheckCircle 
} from 'react-icons/bi';
import { BsStars } from 'react-icons/bs';

interface AyatProps {
  nomorSurah: number;
  surahName: string;
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  terjemahan: string;
  audioUrl: string;
  fontSize: number;
  fontFamily: string;
  showPosterBtn: boolean;
}

export default function AyatCard({ 
  nomorSurah, surahName, nomorAyat, teksArab, teksLatin, terjemahan, audioUrl,
  fontSize, fontFamily, showPosterBtn 
}: AyatProps) {
  const [tafsir, setTafsir] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFocusMenu, setShowFocusMenu] = useState(false);
  const [loopLimit, setLoopLimit] = useState(1);
  const [ambientMode, setAmbientMode] = useState('none');
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [hiddenWords, setHiddenWords] = useState<number[]>([]);

  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [playlists, setPlaylists] = useState<string[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ambientRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem('quran_playlists');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setPlaylists(Object.keys(parsedData));
    }
    
    audioRef.current = new Audio(audioUrl);
    ambientRef.current = new Audio();
    ambientRef.current.loop = true; 
    ambientRef.current.volume = 0.3;

    return () => {
      audioRef.current?.pause();
      ambientRef.current?.pause();
    };
  }, [audioUrl]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      ambientRef.current?.pause();
      setIsPlaying(false);
    } else {
      playSequence(0);
    }
  };

  const playSequence = (currentLoopCount: number) => {
    if (!audioRef.current) return;
    if (ambientRef.current && ambientMode !== 'none') {
      if (ambientMode === 'rain') ambientRef.current.src = '/audio/rain.mp3';
      else if (ambientMode === 'ocean') ambientRef.current.src = '/audio/ocean.mp3';
      else if (ambientMode === 'jungle') ambientRef.current.src = '/audio/jungle.mp3';
      ambientRef.current.play().catch(() => {});
    }
    audioRef.current.play();
    setIsPlaying(true);

    audioRef.current.onended = () => {
      const nextCount = currentLoopCount + 1;
      if (loopLimit === 0 || nextCount < loopLimit) playSequence(nextCount);
      else {
        ambientRef.current?.pause();
        setIsPlaying(false);
      }
    };
  };

  const toggleQuizMode = () => {
    if (!isQuizMode) {
      const words = teksArab.split(' ');
      const numToHide = Math.max(1, Math.floor(words.length * 0.3)); 
      const indices = new Set<number>();
      while (indices.size < numToHide) {
        indices.add(Math.floor(Math.random() * words.length));
      }
      setHiddenWords(Array.from(indices));
      setIsQuizMode(true);
    } else {
      setIsQuizMode(false);
      setHiddenWords([]);
    }
  };

  const revealWord = (index: number) => {
    setHiddenWords(prev => prev.filter(i => i !== index));
  };

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

  const handleSaveToPlaylist = (folderName: string) => {
    const savedData = localStorage.getItem('quran_playlists');
    const allPlaylists = savedData ? JSON.parse(savedData) : {};
    
    if (!allPlaylists[folderName]) {
      allPlaylists[folderName] = [];
    }

    const exists = allPlaylists[folderName].find((item: { surah: number; ayat: number }) => item.surah === nomorSurah && item.ayat === nomorAyat);
    
    if (!exists) {
      allPlaylists[folderName].push({
        surah: nomorSurah,
        surahName: surahName,
        ayat: nomorAyat,
        teksArab: teksArab,
        terjemahan: terjemahan
      });
      localStorage.setItem('quran_playlists', JSON.stringify(allPlaylists));
    }

    setPlaylists(Object.keys(allPlaylists));
    setNewPlaylistName('');
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setShowPlaylistMenu(false);
    }, 1500);
  };

  const downloadPoster = async () => {
    setIsGeneratingPoster(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const element = document.getElementById(`poster-${nomorAyat}`);
      if (element) {
        element.style.display = 'block';
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: '#0f172a' });
        element.style.display = 'none';
        const image = canvas.toDataURL("image/jpeg", 0.9);
        const link = document.createElement('a');
        link.href = image;
        link.download = `Hikmah-${surahName}-${nomorAyat}.jpg`;
        link.click();
      }
    } catch (error) {
      console.error("Gagal membuat poster", error);
    }
    setIsGeneratingPoster(false);
  };

  return (
    <div id={`ayat-${nomorAyat}`} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-6 border border-gray-100 dark:border-gray-700 scroll-mt-24 transition-all duration-500 relative">
      <div className="flex justify-between items-start mb-6">
        <div className="bg-islamic-100 dark:bg-islamic-900 text-islamic-700 dark:text-islamic-100 w-9 h-9 rounded-full flex items-center justify-center font-bold shrink-0 shadow-inner">
          {nomorAyat}
        </div>
        
        <div className="flex flex-col items-end space-y-2 relative">
          <div className="flex space-x-3 items-center">
            {showPosterBtn && (
              <button onClick={downloadPoster} disabled={isGeneratingPoster} className={`transition p-2 rounded-full text-gray-400 hover:text-islamic-500 hover:bg-islamic-50 dark:hover:bg-gray-700`} title="Jadikan Poster">
                {isGeneratingPoster ? <span className="flex h-5 w-5 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-islamic-400 opacity-75"></span><span className="relative inline-flex rounded-full h-5 w-5 bg-islamic-500"></span></span> : <BiImageAdd size={24} />}
              </button>
            )}
            
            <button onClick={() => setShowFocusMenu(!showFocusMenu)} className={`transition p-2 rounded-full ${showFocusMenu ? 'bg-islamic-100 text-islamic-700 dark:bg-gray-700' : 'text-gray-400 hover:text-islamic-500 hover:bg-islamic-50 dark:hover:bg-gray-700'}`} title="Pusat Kontrol Belajar">
              <BiHeadphone size={24} />
            </button>
            
            <button onClick={() => setShowPlaylistMenu(!showPlaylistMenu)} className={`transition p-2 rounded-full ${showPlaylistMenu ? 'text-islamic-500 bg-islamic-50 dark:bg-gray-700' : 'text-gray-400 hover:text-islamic-500 hover:bg-islamic-50 dark:hover:bg-gray-700'}`} title="Simpan ke Playlist">
              <BiBookmark size={24} />
            </button>

            <button onClick={togglePlay} className={`${isPlaying ? 'text-gold-500 animate-pulse' : 'text-islamic-500 hover:text-islamic-700'} transition p-1`}>
              {isPlaying ? <BiPauseCircle size={32} /> : <BiPlayCircle size={32} />}
            </button>

            <button onClick={handleTafsirAI} disabled={loading} className="text-gold-500 hover:text-gold-400 transition relative p-2">
              <BsStars size={26} />
              {loading && <span className="absolute top-1 right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-gold-500"></span></span>}
            </button>
          </div>

          {showPlaylistMenu && (
            <div className="absolute top-12 right-0 z-20 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xl w-64 animate-fade-in-down">
              <h4 className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-widest">Simpan ke Koleksi</h4>
              {saveSuccess ? (
                <div className="flex items-center text-islamic-600 dark:text-islamic-400 text-sm font-bold py-2 italic">
                  <BiCheckCircle size={20} className="mr-2" /> Berhasil Tersimpan!
                </div>
              ) : (
                <>
                  <div className="max-h-32 overflow-y-auto mb-3 space-y-1">
                    {playlists.length === 0 ? (
                      <p className="text-xs text-gray-400 italic py-2">Belum ada folder koleksi.</p>
                    ) : (
                      playlists.map((folder, idx) => (
                        <button key={idx} onClick={() => handleSaveToPlaylist(folder)} className="w-full text-left px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-islamic-50 dark:hover:bg-gray-700 rounded-xl transition-all">
                          📁 {folder}
                        </button>
                      ))
                    )}
                  </div>
                  <div className="border-t dark:border-gray-700 pt-3">
                    <div className="flex space-x-2">
                      <input 
                        type="text" 
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        placeholder="Folder Baru..." 
                        className="w-full text-xs px-3 py-2 border dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white outline-none focus:border-islamic-500"
                      />
                      <button onClick={() => newPlaylistName.trim() && handleSaveToPlaylist(newPlaylistName.trim())} disabled={!newPlaylistName.trim()} className="bg-islamic-600 text-white p-2 rounded-xl disabled:opacity-50 hover:bg-islamic-700 shadow-sm">
                        <BiFolderPlus size={20} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {showFocusMenu && (
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex flex-col gap-4 text-sm animate-fade-in-down w-full max-w-xs justify-end shadow-xl mt-2 z-20">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 mb-2 uppercase">Ulangi:</span>
                  <select value={loopLimit} onChange={(e) => setLoopLimit(Number(e.target.value))} className="bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-200 border-none rounded-xl px-3 py-2 shadow-sm outline-none">
                    <option value={1}>1x Putar</option>
                    <option value={3}>3x Putar</option>
                    <option value={5}>5x Putar</option>
                    <option value={0}>∞ Loop</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 mb-2 uppercase">Latar:</span>
                  <select value={ambientMode} onChange={(e) => setAmbientMode(e.target.value)} className="bg-white dark:bg-gray-800 text-xs text-gray-700 dark:text-gray-200 border-none rounded-xl px-3 py-2 shadow-sm outline-none">
                    <option value="none">Mute</option>
                    <option value="rain">Hujan</option>
                    <option value="ocean">Ombak</option>
                    <option value="jungle">Malam</option>
                  </select>
                </div>
              </div>
              <button onClick={toggleQuizMode} className={`flex items-center justify-center py-3 rounded-xl font-bold transition-all shadow-sm ${isQuizMode ? 'bg-gold-500 text-white' : 'bg-white dark:bg-gray-800 text-islamic-700 dark:text-gold-400 hover:bg-islamic-50'}`}>
                <BiBrain className="mr-2" size={20} /> {isQuizMode ? 'Selesai Uji Hafalan' : 'Mulai Uji Hafalan'}
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div 
        className={`${fontFamily} leading-[2.2] text-right mb-6 text-gray-800 dark:text-gray-100 transition-all duration-300`} 
        dir="rtl"
        style={{ fontSize: `${fontSize}px` }}
      >
        {!isQuizMode ? teksArab : teksArab.split(' ').map((word, idx) => (
          <span key={idx} className="inline-block mx-1">
            {hiddenWords.includes(idx) ? (
              <span onClick={() => revealWord(idx)} className="cursor-pointer inline-block bg-gray-100 dark:bg-gray-700 text-transparent hover:bg-islamic-200 dark:hover:bg-islamic-900 rounded-lg px-6 select-none transition-all border-2 border-dashed border-gray-300 dark:border-gray-600 animate-pulse" title="Klik untuk menebak">
                {word}
              </span>
            ) : (
              <span>{word}</span>
            )}
          </span>
        ))}
      </div>

      <p className="text-sm text-islamic-600 dark:text-gold-400 font-medium italic mb-3 tracking-wide">{teksLatin}</p>
      <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">{terjemahan}</p>

      {tafsir && (
        <div className="mt-6 p-6 bg-linear-to-br from-islamic-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-3xl border border-islamic-100 dark:border-gray-600 shadow-inner">
          <h4 className="flex items-center text-xs font-black text-islamic-700 dark:text-gold-400 mb-4 uppercase tracking-[0.2em]"><BsStars className="mr-2" size={18} /> Hikmah & Tafsir AI</h4>
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-3 whitespace-pre-wrap leading-loose">{tafsir}</div>
        </div>
      )}

      {/* KANVAS POSTER RAHASIA DENGAN TAFSIR AI */}
      <div id={`poster-${nomorAyat}`} style={{ display: 'none', width: '1080px', padding: '80px', backgroundColor: '#0f172a', color: 'white', fontFamily: 'sans-serif' }}>
        <div style={{ border: '4px solid #fbbf24', borderRadius: '50px', padding: '80px', position: 'relative', backgroundColor: 'rgba(255,255,255,0.02)' }}>
          <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#0f172a', padding: '0 30px' }}>
            <BsStars size={80} color="#fbbf24" />
          </div>
          <h2 style={{ textAlign: 'center', color: '#fbbf24', fontSize: '36px', letterSpacing: '8px', marginBottom: '80px', textTransform: 'uppercase', fontWeight: 'bold' }}>Ayat Hari Ini</h2>
          <p style={{ textAlign: 'center', fontSize: '80px', lineHeight: '2.2', marginBottom: '60px', fontFamily: 'serif', direction: 'rtl' }}>{teksArab}</p>
          <p style={{ textAlign: 'center', fontSize: '38px', color: '#cbd5e1', fontStyle: 'italic', marginBottom: '60px', lineHeight: '1.6' }}>&quot;{terjemahan}&quot;</p>
          
          {/* TAFSIR AI MUNCUL DI POSTER */}
          {tafsir && (
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '50px', borderRadius: '30px', marginBottom: '60px', borderLeft: '10px solid #fbbf24' }}>
              <h3 style={{ color: '#fbbf24', fontSize: '30px', marginBottom: '20px', fontWeight: 'bold' }}>
                ✨ Hikmah Singkat:
              </h3>
              <p style={{ fontSize: '28px', color: '#e2e8f0', lineHeight: '1.8' }}>
                {tafsir.length > 350 ? tafsir.substring(0, 350) + '...' : tafsir}
              </p>
            </div>
          )}

          <div style={{ marginTop: '100px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #334155', paddingTop: '50px' }}>
            <span style={{ fontSize: '32px', color: '#fbbf24', fontWeight: 'bold' }}>Q.S. {surahName} : {nomorAyat}</span>
            <span style={{ fontSize: '24px', color: '#64748b' }}>quran-app-two-eta.vercel.app</span>
          </div>
        </div>
      </div>

    </div>
  );
}
