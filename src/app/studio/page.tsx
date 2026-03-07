"use client";
import { useState } from 'react';
import { callGeminiAPI } from '@/lib/gemini';
import { BsStars } from 'react-icons/bs';
import { BiImageAdd, BiCopy, BiCheckCircle, BiVideoPlus } from 'react-icons/bi';

interface ContentData {
  jenis: string; 
  sumber: string; 
  arab: string;
  terjemahan: string;
  hikmah: string;
  caption: string;
}

export default function StudioKontenPage() {
  const [tema, setTema] = useState('Penenang Hati & Overthinking');
  const [data, setData] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);
  const [copied, setCopied] = useState(false);

  // DAFTAR 24 TEMA KONTEN "FYP BAITER" (Dikumpulkan berdasarkan tren Dakwah Sosmed)
  const daftarTema = [
    // 🧠 Kategori Mental & Ketenangan Hati
    "Penenang Hati & Overthinking", 
    "Kesabaran & Ujian Hidup", 
    "Melepaskan Masa Lalu (Move On)",
    "Mengatasi Rasa Insecure",
    "Tawakkal & Pasrah Total",
    "Obat Sedih & Patah Hati",
    
    // 💼 Kategori Rezeki, Karir & Masa Depan
    "Doa Pembuka Pintu Rezeki", 
    "Motivasi Belajar & Sukses",
    "Keajaiban Jalur Langit",
    "Jalan Keluar dari Hutang",
    "Mencari Keberkahan Kerja",
    
    // 📿 Kategori Ibadah & Taubat
    "Merasa Banyak Dosa (Taubat)",
    "Semangat Bangun Tahajud",
    "Menjaga Istiqomah (Konsisten)",
    "Keutamaan Sedekah",
    "Self-Reminder Kematian",
    
    // 👨‍👩‍👧‍👦 Kategori Hubungan & Sosial
    "Galau Meminta Jodoh",
    "Berbakti pada Ayah Ibu",
    "Sabar Menghadapi Orang Lain",
    "Nasihat Menjaga Lisan",
    
    // 🌅 Kategori Harian (Waktu Spesifik)
    "Mensyukuri Nikmat Hari Ini",
    "Doa Pagi Pembuka Hari",
    "Doa Malam & Tidur Tenang",
    "Nasihat Jumat Berkah"
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setData(null);
    try {
      // PROMPT SULTAN: Paksa AI mencari ayat/hadits yang bervariasi dan anti-mainstream!
      const prompt = `Saya seorang content creator dakwah. Buatkan 1 konten Islami yang SANGAT RELEVAN dengan tema: "${tema}".
      PENTING: Pilih Ayat Al-Qur'an, Hadits Shahih, ATAU Doa secara ACAK. Eksplorasi ayat/hadits yang jarang dibahas namun memiliki makna yang sangat mendalam dan menyentuh hati. Jangan gunakan ayat yang itu-itu saja.
      Teks Arab maksimal 25 kata agar muat di poster.
      Balas HANYA dengan JSON murni tanpa tambahan apapun (tanpa markdown/backtick): 
      {
        "jenis": "Ayat / Hadits / Doa", 
        "sumber": "Contoh: Q.S. Al-Baqarah : 286 atau HR. Bukhari", 
        "arab": "Teks Arab", 
        "terjemahan": "Terjemahan Bahasa Indonesia", 
        "hikmah": "1 kalimat motivasi singkat", 
        "caption": "Caption YouTube Shorts SANGAT SINGKAT. MAKSIMAL TOTAL 90 KARAKTER (Wajib hitung hurufnya, sudah termasuk 2 hashtag pendek). Contoh: Hati tenang dengan mengingat-Nya ✨ #ngaji #doa"
      }`;
      
      const response = await callGeminiAPI(prompt);
      const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanedResponse);
      
      if (parsedData.caption && parsedData.caption.length > 100) {
        parsedData.caption = parsedData.caption.substring(0, 97) + "...";
      }

      setData(parsedData);
    } catch (error) {
      console.error("Gagal buat konten:", error);
      alert("AI sedang sibuk meracik ide brilian, tarik napas dan coba klik lagi ya, Mas!");
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
        element.style.display = 'flex';
        const canvas = await html2canvas(element, { 
          scale: 2, 
          useCORS: true,
          backgroundColor: '#0f172a' 
        });
        element.style.display = 'none';

        const image = canvas.toDataURL("image/jpeg", 0.9);
        const link = document.createElement('a');
        link.href = image;
        link.download = `Konten-${tema.replace(/\s+/g, '-')}.jpg`;
        link.click();
      }
    } catch (error) {
      console.error("Gagal membuat poster:", error);
      alert("Maaf, gagal mengekspor poster.");
    }
    setIsGeneratingPoster(false);
  };

  const getJudulPoster = () => {
    if (!data) return "PESAN HARI INI";
    const jenis = data.jenis.toLowerCase();
    if (jenis.includes('doa')) return "DOA HARI INI";
    if (jenis.includes('hadits')) return "HADITS HARI INI";
    return "PESAN HARI INI";
  };

  return (
    <div className="p-4 pt-8 pb-24 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 flex items-center">
          <BiVideoPlus className="mr-2 text-indigo-600 dark:text-gold-400" size={32} /> Studio Konten AI
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Mesin pembuat konten dakwah otomatis untuk TikTok, Reels & Shorts.</p>
      </div>
      
      {/* AREA KONTROL */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">
          Pilih Tema Konten Hari Ini:
        </label>
        
        {/* Kontainer tema sekarang dibuat bisa di-scroll (max-height) agar rapi karena jumlahnya banyak */}
        <div className="flex flex-wrap gap-2.5 mb-6 max-h-60 overflow-y-auto p-1 hide-scrollbar">
          {daftarTema.map((t) => (
            <button
              key={t}
              onClick={() => setTema(t)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-300 ${
                tema === t 
                  ? 'bg-slate-800 text-white dark:bg-gold-500 dark:text-slate-900 shadow-md scale-105 border border-transparent' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:border-gray-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-gold-500 hover:bg-gold-400 text-slate-900 font-black py-4 rounded-2xl transition-all shadow-lg flex justify-center items-center text-lg active:scale-95"
        >
          {loading ? (
            <span className="flex items-center animate-pulse"><BsStars className="mr-2 animate-spin" size={24} /> Sedang Meracik Konten...</span>
          ) : (
            <><BsStars className="mr-2" size={24} /> Generate Konten</>
          )}
        </button>
      </div>

      {/* HASIL KONTEN */}
      {data && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-indigo-700 dark:text-gold-400 flex items-center">
                🖼️ Preview Poster (9:16)
              </h3>
              <button 
                onClick={downloadTikTokPoster} 
                disabled={isGeneratingPoster} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center transition shadow-sm active:scale-95"
              >
                {isGeneratingPoster ? 'Memproses...' : <><BiImageAdd size={20} className="mr-2" /> Download HD</>}
              </button>
            </div>
            
            <div className="bg-slate-900 text-white p-6 rounded-2xl border-4 border-gold-500/30">
              <p className="text-center text-gold-400 text-xs tracking-[0.2em] mb-4 uppercase">{getJudulPoster()}</p>
              <p className="text-center font-arab text-2xl leading-loose mb-4" dir="rtl">{data.arab}</p>
              <p className="text-center text-sm text-gray-300 italic mb-4">&quot;{data.terjemahan}&quot;</p>
              <p className="text-center text-xs text-gray-500 font-bold mb-6">— {data.sumber} —</p>
              <div className="bg-white/10 p-4 rounded-xl border-l-4 border-gold-500">
                <p className="font-bold text-gold-400 text-sm mb-1">✨ Hikmah Singkat:</p>
                <p className="text-sm text-gray-200">{data.hikmah}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-blue-600 dark:text-blue-400 flex items-center">
                📝 Caption YouTube Shorts
              </h3>
              <button 
                onClick={copyCaption}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-xl text-sm font-bold flex items-center transition active:scale-95"
              >
                {copied ? <><BiCheckCircle size={20} className="mr-2 text-green-500" /> Tersalin!</> : <><BiCopy size={20} className="mr-2" /> Copy Caption</>}
              </button>
            </div>
            <textarea 
              readOnly 
              value={data.caption} 
              className="w-full h-24 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm text-gray-700 dark:text-gray-300 focus:outline-none resize-none"
            />
            <p className="text-xs text-right mt-2 text-gray-500">
              {data.caption.length}/100 Karakter (Aman untuk layar HP)
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* KANVAS POSTER RAHASIA DENGAN SAFE ZONE YOUTUBE SHORTS    */}
      {/* ======================================================== */}
      {data && (
        <div 
          id="poster-studio" 
          style={{ 
            display: 'none', 
            justifyContent: 'center', 
            alignItems: 'center',
            width: '1080px', 
            height: '1920px', 
            backgroundColor: '#0f172a', 
            color: 'white', 
            fontFamily: 'sans-serif',
            padding: '160px 100px', 
            boxSizing: 'border-box',
            position: 'relative'
          }}
        >
          <div style={{
            width: '100%',
            height: '100%',
            border: '6px solid #fbbf24', 
            borderRadius: '60px',
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center',
            padding: '80px 60px', 
            boxSizing: 'border-box',
            gap: '50px', 
            position: 'relative',
            backgroundColor: 'rgba(255,255,255,0.02)'
          }}>
            
            <div style={{ position: 'absolute', top: '-45px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#0f172a', padding: '0 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <BsStars size={80} color="#fbbf24" />
            </div>
            
            <span style={{ fontSize: '32px', color: '#fbbf24', letterSpacing: '10px', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '30px', textAlign: 'center' }}>
              {getJudulPoster()}
            </span>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px' }}>
              <p style={{ textAlign: 'center', fontSize: data.arab.length > 100 ? '55px' : '75px', lineHeight: '1.9', margin: 0, fontFamily: 'serif', direction: 'rtl' }}>
                {data.arab}
              </p>
              
              <p style={{ textAlign: 'center', fontSize: '32px', color: '#cbd5e1', fontStyle: 'italic', margin: 0, lineHeight: '1.6' }}>
                &quot;{data.terjemahan}&quot;
              </p>
              
              <span style={{ fontSize: '26px', color: '#94a3b8', fontWeight: 'bold' }}>
                — {data.sumber} —
              </span>
            </div>

            <div style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '40px', borderLeft: '12px solid #fbbf24', boxSizing: 'border-box' }}>
              <h3 style={{ color: '#fbbf24', fontSize: '30px', margin: '0 0 15px 0', display: 'flex', alignItems: 'center' }}>
                 ✨ Hikmah Singkat
              </h3>
              <p style={{ fontSize: '28px', color: '#e2e8f0', lineHeight: '1.6', margin: 0 }}>
                {data.hikmah}
              </p>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <span style={{ color: '#fbbf24', fontSize: '24px', letterSpacing: '3px' }}>BACA TAFSIR LENGKAPNYA DI</span>
              <div style={{ border: '2px solid #fbbf24', padding: '15px 40px', borderRadius: '50px' }}>
                <span style={{ fontSize: '26px', fontWeight: 'bold', color: 'white' }}>quran-app-two-eta.vercel.app</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
