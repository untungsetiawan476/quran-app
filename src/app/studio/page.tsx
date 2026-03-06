"use client";
import { useState } from 'react';
import { callGeminiAPI } from '@/lib/gemini';
import { BsStars } from 'react-icons/bs';
import { BiImageAdd, BiCopy, BiCheckCircle, BiVideoPlus } from 'react-icons/bi';

interface ContentData {
  surah: string;
  ayat: string;
  arab: string;
  terjemahan: string;
  hikmah: string;
  caption: string;
}

export default function StudioKontenPage() {
  const [tema, setTema] = useState('Penenang Hati');
  const [data, setData] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [copied, setCopied] = useState(false);

  const daftarTema = [
    "Penenang Hati & Overthinking", 
    "Kesabaran & Ujian Hidup", 
    "Pembuka Pintu Rezeki", 
    "Motivasi Belajar & Sukses", 
    "Mensyukuri Nikmat", 
    "Menjaga Lisan & Hati"
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setData(null);
    try {
      const prompt = `Pilihkan SATU potong ayat Al-Qur'an secara acak (jangan yang itu-itu saja) yang sangat relevan dengan tema: "${tema}". 
      Ayatnya jangan terlalu panjang (maksimal 20 kata Arab).
      Balas HANYA dengan format JSON murni tanpa tambahan apapun (tanpa markdown/backtick): 
      {"surah": "Nama Surah", "ayat": "Nomor Ayat", "arab": "Teks Arab", "terjemahan": "Terjemahan Bahasa Indonesia", "hikmah": "1 kalimat singkat padat yang memotivasi untuk di poster", "caption": "Tuliskan 1 paragraf caption TikTok/IG yang menyentuh hati, gaya bahasa santai namun sopan, diakhiri dengan 5 hashtag viral."}`;
      
      const response = await callGeminiAPI(prompt);
      const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanedResponse);
      
      setData(parsedData);
    } catch (error) {
      console.error("Gagal buat konten:", error);
      alert("AI sedang sibuk, tarik napas dan coba klik lagi ya, Mas!");
    }
    setLoading(false);
  };

  const copyCaption = () => {
    if (data) {
      navigator.clipboard.writeText(data.caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadTikTokPoster = async () => {
    setIsGeneratingPoster(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const element = document.getElementById('poster-studio');
      
      if (element) {
        // Tampilkan sebagai Flexbox agar tidak numpuk
        element.style.display = 'flex';
        const canvas = await html2canvas(element, { 
          scale: 2, 
          useCORS: true,
          backgroundColor: '#0f172a' // Biru Dongker Gelap ala Premium
        });
        element.style.display = 'none';

        const image = canvas.toDataURL("image/jpeg", 0.9);
        const link = document.createElement('a');
        link.href = image;
        link.download = `Konten-${tema.replace(/\s+/g, '-')}.jpg`;
        link.click();
      }
    } catch (error) {
      alert("Maaf, gagal mengekspor poster.");
    }
    setIsGeneratingPoster(false);
  };

  return (
    <div className="p-4 pt-8 pb-24 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 flex items-center">
          <BiVideoPlus className="mr-2 text-islamic-600" size={32} /> Studio Konten AI
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Mesin pembuat konten dakwah otomatis untuk TikTok, Reels & Shorts.</p>
      </div>
      
      {/* AREA KONTROL */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
          Pilih Tema Konten Hari Ini:
        </label>
        <div className="flex flex-wrap gap-2 mb-6">
          {daftarTema.map((t) => (
            <button
              key={t}
              onClick={() => setTema(t)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                tema === t 
                  ? 'bg-islamic-600 text-white shadow-md scale-105' 
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-islamic-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-gold-500 hover:bg-gold-400 text-islamic-900 font-bold py-4 rounded-2xl transition-all shadow-lg flex justify-center items-center text-lg"
        >
          {loading ? (
            <span className="flex items-center animate-pulse"><BsStars className="mr-2 animate-spin" size={24} /> AI Sedang Meracik Konten...</span>
          ) : (
            <><BsStars className="mr-2" size={24} /> Buat Konten Sekarang</>
          )}
        </button>
      </div>

      {/* HASIL KONTEN */}
      {data && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Hasil Poster Preview */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-islamic-700 dark:text-gold-400 flex items-center">
                🖼️ Preview Poster (9:16)
              </h3>
              <button 
                onClick={downloadTikTokPoster} 
                disabled={isGeneratingPoster} 
                className="bg-islamic-600 hover:bg-islamic-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center transition shadow-sm"
              >
                {isGeneratingPoster ? 'Memproses...' : <><BiImageAdd size={20} className="mr-2" /> Download HD</>}
              </button>
            </div>
            
            <div className="bg-slate-900 text-white p-6 rounded-2xl border-4 border-gold-500/30">
              <p className="text-center text-gold-400 text-xs tracking-[0.3em] mb-4 uppercase">Q.S {data.surah} : {data.ayat}</p>
              <p className="text-center font-arab text-2xl leading-loose mb-4" dir="rtl">{data.arab}</p>
              <p className="text-center text-sm text-gray-300 italic mb-6">&quot;{data.terjemahan}&quot;</p>
              <div className="bg-white/10 p-4 rounded-xl border-l-4 border-gold-500">
                <p className="font-bold text-gold-400 text-sm mb-1">✨ Hikmah:</p>
                <p className="text-sm text-gray-200">{data.hikmah}</p>
              </div>
            </div>
          </div>

          {/* Hasil Caption Siap Copy */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-blue-600 dark:text-blue-400 flex items-center">
                📝 Caption Siap Posting
              </h3>
              <button 
                onClick={copyCaption}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center transition"
              >
                {copied ? <><BiCheckCircle size={20} className="mr-2 text-green-500" /> Tersalin!</> : <><BiCopy size={20} className="mr-2" /> Copy Caption</>}
              </button>
            </div>
            <textarea 
              readOnly 
              value={data.caption} 
              className="w-full h-40 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none resize-none"
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* KANVAS POSTER RAHASIA (DIJAMIN TIDAK NUMPUK KARENA FLEX & GAP) */}
      {/* ======================================================== */}
      {data && (
        <div 
          id="poster-studio" 
          style={{ 
            display: 'none', 
            flexDirection: 'column',
            justifyContent: 'center', // Selalu ke tengah
            alignItems: 'center',
            width: '1080px', 
            height: '1920px', 
            backgroundColor: '#0f172a', 
            color: 'white', 
            fontFamily: 'sans-serif',
            padding: '120px 80px', 
            boxSizing: 'border-box',
            gap: '60px', // INI KUNCI ANTI NUMPUK! Jarak antar elemen dipaksa 60px
            position: 'relative'
          }}
        >
          {/* Ornamen Atas */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
             <BsStars size={60} color="#fbbf24" />
             <span style={{ fontSize: '30px', color: '#fbbf24', letterSpacing: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>
               Pesan Hari Ini
             </span>
          </div>

          {/* Kotak Utama Arab & Terjemahan */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '50px' }}>
            <p style={{ textAlign: 'center', fontSize: data.arab.length > 100 ? '60px' : '85px', lineHeight: '1.8', margin: 0, fontFamily: 'serif', direction: 'rtl' }}>
              {data.arab}
            </p>
            
            <p style={{ textAlign: 'center', fontSize: '36px', color: '#cbd5e1', fontStyle: 'italic', margin: 0, lineHeight: '1.6', maxWidth: '900px' }}>
              &quot;{data.terjemahan}&quot;
            </p>
            
            <span style={{ fontSize: '28px', color: '#94a3b8', fontWeight: 'bold' }}>
              — Q.S. {data.surah} : {data.ayat} —
            </span>
          </div>

          {/* Kotak Hikmah (Akan otomatis menyesuaikan isi tanpa menabrak) */}
          <div style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', padding: '50px', borderRadius: '40px', borderLeft: '12px solid #fbbf24', boxSizing: 'border-box' }}>
            <h3 style={{ color: '#fbbf24', fontSize: '34px', margin: '0 0 20px 0', display: 'flex', alignItems: 'center' }}>
               ✨ Hikmah Singkat
            </h3>
            <p style={{ fontSize: '32px', color: '#e2e8f0', lineHeight: '1.6', margin: 0 }}>
              {data.hikmah}
            </p>
          </div>

          {/* Watermark Bawah (Akan selalu di bawah kotak hikmah, berkat gap) */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: '#fbbf24', fontSize: '28px', letterSpacing: '3px' }}>BACA TAFSIR LENGKAPNYA DI</span>
            <div style={{ border: '2px solid #fbbf24', padding: '15px 40px', borderRadius: '50px' }}>
              <span style={{ fontSize: '30px', fontWeight: 'bold', color: 'white' }}>quran-app-two-eta.vercel.app</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}