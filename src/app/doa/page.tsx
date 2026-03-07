"use client";
import { useState } from 'react';
import { callGeminiAPI } from '@/lib/gemini';
import { BiMessageRoundedDots, BiImageAdd, BiBookHeart } from 'react-icons/bi';
import { BsStars } from 'react-icons/bs';

interface DoaResponse {
  nasihat: string;
  arab: string;
  latin: string;
  arti: string;
  sumber: string;
}

export default function DoaPage() {
  const [curhat, setCurhat] = useState('');
  const [data, setData] = useState<DoaResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);

  const handleCurhat = async () => {
    if (!curhat.trim()) return;
    setLoading(true);
    try {
      const prompt = `Saya sedang merasa: "${curhat}". Berikan saya nasihat Islami yang sangat menenangkan hati, beserta satu rekomendasi doa pendek (maksimal 20 kata) yang relevan dengan kondisi saya. Balas HANYA dengan format JSON persis seperti ini tanpa tambahan teks/markdown apapun: {"nasihat": "1-2 paragraf nasihat penuh empati", "arab": "Teks Arab Doa", "latin": "Teks Latin", "arti": "Terjemahan", "sumber": "Sumber doa (misal: Q.S. Al-Baqarah: 286 atau HR. Bukhari)"}`;
      
      const response = await callGeminiAPI(prompt);
      
      console.log("BALASAN MENTAH GEMINI:", response); 
      
      const cleanedResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanedResponse);
      
      setData(parsedData);
    } catch (error) { 
      console.error("ERROR GEMINI TERDETEKSI:", error); 
      
      setData({
        nasihat: "Koneksi AI sedang sibuk. Tarik napas, tenangkan diri, dan bacalah doa ini agar hatimu lapang.",
        arab: "رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي",
        latin: "Rabbisyrah lii shadrii wa yassir lii amrii",
        arti: "Ya Tuhanku, lapangkanlah untukku dadaku, dan mudahkanlah untukku urusanku.",
        sumber: "Q.S. Thaha : 25-26"
      });
    }
    setLoading(false);
  };

  const downloadTikTokPoster = async () => {
    setIsGeneratingPoster(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const element = document.getElementById('poster-doa');
      
      if (element) {
        element.style.display = 'flex';
        const canvas = await html2canvas(element, { 
          scale: 2, 
          useCORS: true,
          // Background diubah ke Dark Navy sesuai Studio
          backgroundColor: '#0f172a' 
        });
        element.style.display = 'none';

        const image = canvas.toDataURL("image/jpeg", 0.9);
        const link = document.createElement('a');
        link.href = image;
        link.download = `Nasihat-Doa-QuranApp.jpg`;
        link.click();
      }
    } catch (error) {
      console.error("Gagal membuat poster", error);
      alert("Maaf, gagal membuat poster saat ini.");
    }
    setIsGeneratingPoster(false);
  };

  return (
    <div className="p-4 pt-8 pb-24 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Pusat Doa</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Temukan ketenangan dan doa yang tepat untuk setiap keluh kesahmu.</p>
      </div>
      
      {/* KARTU INPUT CURHAT */}
      <div className="bg-linear-to-br from-emerald-500 to-teal-700 rounded-3xl p-6 shadow-xl mb-8 text-white relative overflow-hidden border border-emerald-400/50">
        <div className="absolute -right-4 -bottom-4 opacity-10">
           <BiMessageRoundedDots size={120} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center mb-4">
            <BiMessageRoundedDots size={28} className="mr-3 text-gold-300" />
            <h2 className="text-xl font-bold tracking-wide">Curhat Doa AI ✨</h2>
          </div>
          <p className="text-sm mb-5 opacity-90 leading-relaxed text-emerald-50">Ketikkan perasaan atau masalahmu saat ini. Dapatkan nasihat Islami dan rekomendasi doa khusus untukmu.</p>
          
          <textarea 
            value={curhat}
            onChange={(e) => setCurhat(e.target.value)}
            placeholder="Misal: Saya sedang cemas karena besok mau ujian..."
            className="w-full p-4 rounded-2xl text-gray-800 dark:text-gray-100 dark:bg-gray-800/90 mb-4 focus:outline-none focus:ring-4 focus:ring-gold-400/50 transition-all border-none shadow-inner resize-none placeholder-gray-400"
            rows={3}
          />
          
          <button 
            onClick={handleCurhat}
            disabled={loading}
            className="w-full bg-gold-500 hover:bg-gold-400 text-emerald-900 font-bold py-3.5 rounded-2xl transition-all shadow-lg active:scale-95 flex justify-center items-center"
          >
            {loading ? (
              <span className="flex items-center"><span className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-900 mr-2"></span> Menyusun Nasihat...</span>
            ) : (
              <><BsStars className="mr-2" size={20} /> Dapatkan Nasihat & Doa</>
            )}
          </button>
        </div>
      </div>

      {/* HASIL DOA */}
      {data && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-md border border-gray-100 dark:border-gray-700 relative overflow-hidden group animate-fade-in-up">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
            <h3 className="flex items-center text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              <BiBookHeart className="mr-2 text-gold-500" size={20} /> Jawaban Untukmu
            </h3>
            
            <button 
              onClick={downloadTikTokPoster} 
              disabled={isGeneratingPoster} 
              className="bg-emerald-50 dark:bg-gray-700 text-emerald-600 dark:text-gold-400 p-2.5 rounded-full hover:bg-emerald-100 transition-colors shadow-sm border border-emerald-100 dark:border-gray-600"
              title="Bagikan ke Sosial Media"
            >
              {isGeneratingPoster ? (
                <span className="flex h-5 w-5 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-500"></span></span>
              ) : (
                <BiImageAdd size={24} />
              )}
            </button>
          </div>

          <div className="space-y-6">
            <div className="bg-emerald-50/80 dark:bg-gray-700/50 p-5 rounded-2xl text-sm text-gray-700 dark:text-gray-300 leading-relaxed border-l-4 border-emerald-500 shadow-inner">
               {data.nasihat}
            </div>

            <div className="text-center pt-2">
              <span className="inline-block bg-gold-100/50 dark:bg-gray-700 text-gold-600 dark:text-gold-400 text-[10px] font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest border border-gold-200 dark:border-gray-600">
                Rekomendasi Doa
              </span>
              <p className="font-arab text-3xl text-gray-800 dark:text-white leading-loose mb-3" dir="rtl">{data.arab}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-4 tracking-wide">{data.latin}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">&quot;{data.arti}&quot;</p>
              <p className="text-xs font-bold text-gray-400 bg-gray-50 dark:bg-gray-800/50 inline-block px-3 py-1 rounded-lg">— {data.sumber}</p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* KANVAS POSTER TIKTOK - SINKRON DENGAN STUDIO AYAT        */}
      {/* ======================================================== */}
      {data && (
        <div 
          id="poster-doa" 
          style={{ 
            display: 'none', 
            flexDirection: 'column',
            justifyContent: 'space-between', 
            alignItems: 'center',
            width: '1080px', 
            height: '1920px', 
            backgroundColor: '#0f172a', // <-- Dark Navy Sesuai Studio
            color: 'white', 
            fontFamily: 'sans-serif',
            padding: '120px 100px', 
            boxSizing: 'border-box',
            position: 'relative'
          }}
        >
          {/* Ornamen Latar */}
          <div style={{ position: 'absolute', top: '5%', right: '5%', opacity: '0.05' }}>
            <BiMessageRoundedDots size={400} color="#fbbf24" />
          </div>
          
          {/* KOTAK KONTEN TENGAH */}
          {/* Border disamakan solid #fbbf24 (Gold) seperti Studio */}
          <div style={{ width: '100%', zIndex: 10, border: '4px solid #fbbf24', borderRadius: '60px', padding: '80px', backgroundColor: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(10px)' }}>
            
            {/* Nasihat Section */}
            <div style={{ marginBottom: '60px', borderBottom: '2px dashed rgba(255,255,255,0.2)', paddingBottom: '50px' }}>
              <h2 style={{ color: '#fbbf24', fontSize: '30px', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '30px', display: 'flex', alignItems: 'center' }}>
                <BsStars size={40} color="#fbbf24" style={{ marginRight: '15px' }} /> Nasihat Untukmu
              </h2>
              {/* Teks tidak dipotong lagi */}
              <p style={{ fontSize: '30px', color: '#e2e8f0', lineHeight: '1.8', margin: 0, fontStyle: 'italic' }}>
                &quot;{data.nasihat}&quot;
              </p>
            </div>

            {/* Doa Section */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ display: 'inline-block', backgroundColor: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', padding: '10px 30px', borderRadius: '50px', fontSize: '24px', fontWeight: 'bold', marginBottom: '50px', letterSpacing: '2px' }}>
                DOA HARI INI
              </span>
              
              <p style={{ textAlign: 'center', fontSize: '80px', lineHeight: '2.2', marginBottom: '50px', fontFamily: 'serif', direction: 'rtl', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                {data.arab}
              </p>
              
              <p style={{ textAlign: 'center', fontSize: '34px', color: '#e2e8f0', marginBottom: '60px', lineHeight: '1.6' }}>
                &quot;{data.arti}&quot;
              </p>

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '28px', color: '#94a3b8', fontWeight: 'bold' }}>Sumber: {data.sumber}</span>
              </div>
            </div>
          </div>

          {/* WATERMARK PROMOSI TIKTOK DI BAWAH */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10, marginTop: '40px' }}>
            <p style={{ color: '#fbbf24', fontSize: '36px', fontWeight: 'bold', margin: '0 0 15px 0', letterSpacing: '2px', textAlign: 'center' }}>
              TEMUKAN DOA UNTUK MASALAHMU
            </p>
            <div style={{ backgroundColor: 'white', padding: '20px 50px', borderRadius: '50px', border: '4px solid #fbbf24', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
              <span style={{ color: '#0f172a', fontSize: '34px', fontWeight: 'bold' }}>
                quran-app-two-eta.vercel.app
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
