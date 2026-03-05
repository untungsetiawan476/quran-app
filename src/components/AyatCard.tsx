"use client";
import { useState, useRef, useEffect } from 'react';
import { callGeminiAPI } from '@/lib/gemini';
import { BiPlayCircle, BiPauseCircle, BiBookmark, BiHeadphone, BiImageAdd } from 'react-icons/bi';
import { BsStars } from 'react-icons/bs';

interface AyatProps {
  nomorSurah: number;
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
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  
  // State Audio
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFocusMenu, setShowFocusMenu] = useState(false);
  const [loopLimit, setLoopLimit] = useState(1);
  const [ambientMode, setAmbientMode] = useState('none');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ambientRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
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

  const handleBookmark = () => {
    localStorage.setItem('quran_last_read', JSON.stringify({ surahName, nomorSurah, ayat: nomorAyat }));
    setIsBookmarked(true);
    setTimeout(() => setIsBookmarked(false), 2000);
  };

  // Fungsi Ajaib Membuat Poster (Lazy Loading)
  const downloadPoster = async () => {
    setIsGeneratingPoster(true);
    try {
      // Library hanya diload SAAT tombol diklik!
      const html2canvas = (await import('html2canvas')).default;
      const element = document.getElementById(`poster-${nomorAyat}`);
      
      if (element) {
        // Tampilkan sementara untuk difoto
        element.style.display = 'block';
        
        const canvas = await html2canvas(element, { 
          scale: 2, // Kualitas HD
          useCORS: true,
          backgroundColor: '#0f172a' // Warna background poster
        });
        
        // Sembunyikan lagi
        element.style.display = 'none';

        const image = canvas.toDataURL("image/jpeg", 0.9);
        const link = document.createElement('a');
        link.href = image;
        link.download = `Hikmah-${surahName}-${nomorAyat}.jpg`;
        link.click();
      }
    } catch (error) {
      console.error("Gagal membuat poster", error);
      alert("Maaf, gagal membuat poster saat ini.");
    }
    setIsGeneratingPoster(false);
  };

  return (
    <div id={`ayat-${nomorAyat}`} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 mb-4 border dark:border-gray-700 scroll-mt-24 transition-all duration-500 relative">
      <div className="flex justify-between items-start mb-4">
        <div className="bg-islamic-100 dark:bg-islamic-900 text-islamic-700 dark:text-islamic-100 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">
          {nomorAyat}
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          <div className="flex space-x-3 items-center">
            {/* Tombol Buat Poster */}
            <button onClick={downloadPoster} disabled={isGeneratingPoster} className={`transition p-1.5 rounded-full text-gray-400 hover:text-islamic-500`} title="Jadikan Poster">
              {isGeneratingPoster ? (
                <span className="flex h-5 w-5 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-islamic-400 opacity-75"></span><span className="relative inline-flex rounded-full h-5 w-5 bg-islamic-500"></span></span>
              ) : (
                <BiImageAdd size={24} />
              )}
            </button>
            <button onClick={() => setShowFocusMenu(!showFocusMenu)} className={`transition p-1.5 rounded-full ${showFocusMenu ? 'bg-islamic-100 text-islamic-700 dark:bg-gray-700' : 'text-gray-400 hover:text-islamic-500'}`} title="Mode Hafalan">
              <BiHeadphone size={24} />
            </button>
            <button onClick={handleBookmark} className={`transition ${isBookmarked ? 'text-islamic-500' : 'text-gray-400 hover:text-islamic-500'}`}>
              <BiBookmark size={26} />
            </button>
            <button onClick={togglePlay} className={`${isPlaying ? 'text-gold-500 animate-pulse' : 'text-islamic-500 hover:text-islamic-700'} transition`}>
              {isPlaying ? <BiPauseCircle size={30} /> : <BiPlayCircle size={30} />}
            </button>
            <button onClick={handleTafsirAI} disabled={loading} className="text-gold-500 hover:text-gold-400 transition relative">
              <BsStars size={28} />
              {loading && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-gold-500"></span></span>}
            </button>
          </div>

          {showFocusMenu && (
            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-600 flex flex-wrap gap-4 text-sm animate-fade-in-down w-full max-w-sm justify-end">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Ulangi Ayat:</span>
                <select value={loopLimit} onChange={(e) => setLoopLimit(Number(e.target.value))} className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border rounded-lg px-2 py-1 outline-none">
                  <option value={1}>1x Putaran</option>
                  <option value={3}>3x Putaran</option>
                  <option value={5}>5x Putaran</option>
                  <option value={0}>∞ Tak Terbatas</option>
                </select>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Suara Latar (ASMR):</span>
                <select value={ambientMode} onChange={(e) => setAmbientMode(e.target.value)} className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border rounded-lg px-2 py-1 outline-none">
                  <option value="none">Mute (Hanya Murattal)</option>
                  <option value="rain">Hujan di Atap</option>
                  <option value="ocean">Ombak Lautan</option>
                  <option value="jungle">Malam di Hutan</option>
                </select>
              </div>
            </div>
          )}
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
          <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2 whitespace-pre-wrap">{tafsir}</div>
        </div>
      )}

      {/* ========================================= */}
      {/* KANVAS POSTER RAHASIA (TIDAK TERLIHAT DI LAYAR) */}
      {/* ========================================= */}
      <div 
        id={`poster-${nomorAyat}`} 
        style={{ display: 'none', width: '1080px', padding: '80px', backgroundColor: '#0f172a', color: 'white', fontFamily: 'sans-serif' }}
      >
        <div style={{ border: '2px solid #fbbf24', borderRadius: '30px', padding: '60px', position: 'relative' }}>
          {/* Hiasan Bintang */}
          <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#0f172a', padding: '0 20px' }}>
            <BsStars size={50} color="#fbbf24" />
          </div>
          
          <h2 style={{ textAlign: 'center', color: '#fbbf24', fontSize: '30px', letterSpacing: '4px', marginBottom: '60px', textTransform: 'uppercase' }}>
            Kutipan Al-Qur&apos;an
          </h2>
          
          <p style={{ textAlign: 'center', fontSize: '60px', lineHeight: '2', marginBottom: '40px', fontFamily: 'serif', direction: 'rtl' }}>
            {teksArab}
          </p>
          
          <p style={{ textAlign: 'center', fontSize: '28px', color: '#cbd5e1', fontStyle: 'italic', marginBottom: '50px', lineHeight: '1.6' }}>
            &quot;{terjemahan}&quot;
          </p>
          
          {tafsir && (
            <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '20px', marginTop: '40px' }}>
              <h3 style={{ color: '#fbbf24', fontSize: '24px', marginBottom: '20px' }}>✨ Hikmah:</h3>
              <p style={{ fontSize: '22px', color: '#e2e8f0', lineHeight: '1.8' }}>{tafsir.substring(0, 250)}...</p>
            </div>
          )}
          
          <div style={{ marginTop: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #334155', paddingTop: '40px' }}>
            <span style={{ fontSize: '24px', color: '#fbbf24', fontWeight: 'bold' }}>Q.S. {surahName} : {nomorAyat}</span>
            <span style={{ fontSize: '20px', color: '#64748b' }}>Generated by Qur&apos;an App Digital</span>
          </div>
        </div>
      </div>
      {/* ========================================= */}
    </div>
  );
}