"use client";
import { useState, useEffect } from 'react';
import { callGeminiAPI } from '@/lib/gemini';
import { BsStars } from 'react-icons/bs';
import { BiBookHeart, BiImageAdd } from 'react-icons/bi';

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
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);

  useEffect(() => {
    const fetchDaily = async () => {
      const today = new Date().toISOString().split('T')[0];
      const saved = localStorage.getItem('quran_daily_motivation');

      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === today && parsed.data) {
          setData(parsed.data);
          setLoading(false);
          return;
        }
      }

      try {
        const prompt = `Berikan 1 potong ayat Al-Qur'an pendek (maksimal 15 kata) yang menginspirasi. Balas HANYA dengan format JSON persis seperti ini tanpa tambahan teks/markdown apapun: {"surah": "Nama Surah Ayat X", "arab": "Teks Arab", "latin": "Teks Latin", "arti": "Terjemahan", "hikmah": "1 kalimat motivasi Islami yang menyejukkan hati terkait kehidupan"}`;
        
        const response = await callGeminiAPI(prompt);
        const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsedData = JSON.parse(cleanedResponse);

        setData(parsedData);
        localStorage.setItem('quran_daily_motivation', JSON.stringify({
          date: today,
          data: parsedData
        }));
      } catch (error) {
        console.error("Gagal mengambil motivasi AI", error);
        setData({
          surah: "Al-Baqarah Ayat 286",
          arab: "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
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

  // --- LOGIKA PEMBUATAN POSTER TIKTOK/REELS ---
  const downloadTikTokPoster = async () => {
    setIsGeneratingPoster(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const element = document.getElementById('poster-daily');
      
      if (element) {
        // Tampilkan sementara sebagai flexbox
        element.style.display = 'flex';
        
        const canvas = await html2canvas(element, { 
          scale: 2, // Kualitas HD
          useCORS: true,
          backgroundColor: '#022c22' // Warna dasar hijau sangat gelap (Forest Green)
        });
        
        // Sembunyikan lagi
        element.style.display = 'none';

        const image = canvas.toDataURL("image/jpeg", 0.9);
        const link = document.createElement('a');
        link.href = image;
        link.download = `Inspirasi-Harian-QuranApp.jpg`;
        link.click();
      }
    } catch (error) {
      console.error("Gagal membuat poster", error);
      alert("Maaf, gagal membuat poster saat ini.");
    }
    setIsGeneratingPoster(false);
  };

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
    <div className="bg-linear-to-br from-islamic-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-3xl p-6 shadow-sm border border-islamic-100 dark:border-gray-700 mb-8 relative overflow-hidden group">
      <div className="absolute -top-4 -right-4 p-4 opacity-5 dark:opacity-10">
        <BiBookHeart size={120} className="text-islamic-500 dark:text-gold-500" />
      </div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="flex items-center text-sm font-bold text-islamic-700 dark:text-gold-400 uppercase tracking-wider">
            <BsStars className="mr-2" size={18} /> Inspirasi Hari Ini
          </h3>
          
          {/* Tombol Download Poster Promosi */}
          <button 
            onClick={downloadTikTokPoster} 
            disabled={isGeneratingPoster} 
            className="bg-islamic-100 dark:bg-gray-700 text-islamic-600 dark:text-gold-400 p-2 rounded-full hover:bg-islamic-200 transition-colors shadow-sm"
            title="Bagikan ke Sosial Media"
          >
            {isGeneratingPoster ? (
              <span className="flex h-5 w-5 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-islamic-400 opacity-75"></span><span className="relative inline-flex rounded-full h-5 w-5 bg-islamic-500"></span></span>
            ) : (
              <BiImageAdd size={22} />
            )}
          </button>
        </div>

        <p className="font-arab text-3xl text-right text-islamic-900 dark:text-white leading-loose mb-2" dir="rtl">{data.arab}</p>
        <p className="text-xs text-right text-gray-500 dark:text-gray-400 italic mb-4">{data.latin}</p>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1 font-medium">&quot;{data.arti}&quot;</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">— {data.surah}</p>
        
        <div className="bg-white/60 dark:bg-gray-700/50 p-4 rounded-2xl border-l-4 border-gold-500 backdrop-blur-sm shadow-sm">
          <p className="text-sm font-bold text-islamic-900 dark:text-white leading-relaxed">
            <span className="text-gold-500 mr-1">✨ Hikmah:</span> {data.hikmah}
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* KANVAS POSTER TIKTOK / REELS (RASIO 9:16 - 1080x1920) */}
      {/* ======================================================== */}
      <div 
        id="poster-daily" 
        style={{ 
          display: 'none', 
          flexDirection: 'column',
          justifyContent: 'center',
          width: '1080px', 
          height: '1920px', 
          backgroundColor: '#022c22', // Dark Emerald
          color: 'white', 
          fontFamily: 'sans-serif',
          padding: '100px',
          boxSizing: 'border-box',
          position: 'relative'
        }}
      >
        {/* Ornamen Latar */}
        <div style={{ position: 'absolute', top: '10%', right: '5%', opacity: '0.05' }}><BiBookHeart size={500} color="#fbbf24" /></div>
        <div style={{ position: 'absolute', bottom: '20%', left: '5%', opacity: '0.05' }}><BsStars size={400} color="#fbbf24" /></div>

        <div style={{ zIndex: 10, border: '4px solid rgba(251, 191, 36, 0.3)', borderRadius: '60px', padding: '80px', backgroundColor: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '80px' }}>
            <BsStars size={50} color="#fbbf24" style={{ marginRight: '20px' }} />
            <h2 style={{ textAlign: 'center', color: '#fbbf24', fontSize: '40px', letterSpacing: '8px', textTransform: 'uppercase', margin: 0 }}>Inspirasi Hari Ini</h2>
          </div>
          
          <p style={{ textAlign: 'center', fontSize: '85px', lineHeight: '2.2', marginBottom: '60px', fontFamily: 'serif', direction: 'rtl', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
            {data.arab}
          </p>
          
          <p style={{ textAlign: 'center', fontSize: '36px', color: '#a7f3d0', fontStyle: 'italic', marginBottom: '80px', lineHeight: '1.6' }}>
            &quot;{data.arti}&quot;
          </p>

          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <span style={{ fontSize: '32px', color: '#fbbf24', fontWeight: 'bold', borderBottom: '2px solid #fbbf24', paddingBottom: '10px' }}>— {data.surah}</span>
          </div>
          
          <div style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', borderLeft: '10px solid #fbbf24', padding: '50px', borderRadius: '0 30px 30px 0' }}>
            <h3 style={{ color: '#fbbf24', fontSize: '32px', marginBottom: '20px', marginTop: 0 }}>✨ Hikmah:</h3>
            <p style={{ fontSize: '30px', color: '#e2e8f0', lineHeight: '1.8', margin: 0 }}>{data.hikmah}</p>
          </div>
        </div>

        {/* WATERMARK PROMOSI TIKTOK DI BAWAH */}
        <div style={{ position: 'absolute', bottom: '100px', left: '0', right: '0', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          <p style={{ color: '#fbbf24', fontSize: '36px', fontWeight: 'bold', margin: '0 0 15px 0', letterSpacing: '2px', textAlign: 'center' }}>
            BACA QUR&apos;AN DENGAN TAFSIR AI SEKARANG
          </p>
          <div style={{ backgroundColor: 'white', padding: '20px 50px', borderRadius: '50px', border: '4px solid #fbbf24' }}>
            <span style={{ color: '#022c22', fontSize: '34px', fontWeight: 'bold' }}>
              quran-app-two-eta.vercel.app
            </span>
          </div>
        </div>
      </div>
      {/* ======================================================== */}
    </div>
  );
}
