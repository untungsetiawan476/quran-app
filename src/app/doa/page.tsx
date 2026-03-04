"use client";
import { useState } from 'react';
import { callGeminiAPI } from '@/lib/gemini';
import { BiMessageRoundedDots } from 'react-icons/bi';
import { BsStars } from 'react-icons/bs'; // Menggunakan icon BsStars sebagai pengganti

export default function DoaPage() {
  const [curhat, setCurhat] = useState('');
  const [nasihat, setNasihat] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCurhat = async () => {
    if (!curhat.trim()) return;
    setLoading(true);
    try {
      const prompt = `Saya sedang merasa: "${curhat}". Berikan saya nasihat Islami yang sangat menenangkan hati, beserta satu rekomendasi doa (lengkap dengan Arab, Latin, dan artinya) yang relevan dengan kondisi saya. Gunakan bahasa yang penuh empati.`;
      const response = await callGeminiAPI(prompt);
      setNasihat(response);
    } catch { // Variabel error dihapus karena tidak dipakai
      setNasihat("Koneksi AI sedang sibuk. Tarik napas, tenangkan diri, dan coba lagi ya.");
    }
    setLoading(false);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-islamic-900 dark:text-white mb-6">Doa & Wirid</h1>
      
      {/* Diupdate menjadi bg-linear-to-r */}
      <div className="bg-linear-to-r from-purple-500 to-indigo-600 rounded-2xl p-6 shadow-lg mb-8 text-white">
        <div className="flex items-center mb-4">
          <BiMessageRoundedDots size={28} className="mr-3" />
          <h2 className="text-xl font-bold">Curhat Doa AI ✨</h2>
        </div>
        <p className="text-sm mb-4 opacity-90">Ketikkan perasaan atau masalahmu saat ini. Dapatkan nasihat Islami dan rekomendasi doa khusus untukmu.</p>
        
        <textarea 
          value={curhat}
          onChange={(e) => setCurhat(e.target.value)}
          placeholder="Misal: Saya sedang cemas karena besok mau ujian..."
          className="w-full p-3 rounded-xl text-gray-800 mb-3 focus:outline-none focus:ring-2 focus:ring-gold-400"
          rows={3}
        />
        
        <button 
          onClick={handleCurhat}
          disabled={loading}
          className="w-full bg-gold-500 hover:bg-gold-400 text-white font-bold py-3 rounded-xl transition flex justify-center items-center"
        >
          {loading ? 'Menyusun Nasihat...' : <><BsStars className="mr-2" /> Dapatkan Nasihat & Doa</>}
        </button>

        {nasihat && (
          <div className="mt-4 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
            <div className="text-sm whitespace-pre-wrap leading-relaxed">{nasihat}</div>
          </div>
        )}
      </div>
    </div>
  );
}