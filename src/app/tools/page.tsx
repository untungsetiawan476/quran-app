"use client";
import { useState, useEffect } from 'react';
import { BiReset, BiCompass, BiFingerprint, BiTargetLock } from 'react-icons/bi';

export default function ToolsPage() {
  // --- STATE TASBIH ---
  const [count, setCount] = useState(0);

  // --- STATE KIBLAT ---
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [qiblaDir, setQiblaDir] = useState<number | null>(null);
  const [locError, setLocError] = useState<string | null>(null);

  // --- LOGIKA TASBIH (Load & Save) ---
  useEffect(() => {
    const timer = setTimeout(() => {
      const savedCount = localStorage.getItem('quran_tasbih_count');
      if (savedCount) setCount(parseInt(savedCount));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleIncrement = () => {
    const newCount = count + 1;
    setCount(newCount);
    localStorage.setItem('quran_tasbih_count', newCount.toString());
    
    // Fitur Getar (Haptic Feedback) jika didukung browser HP
    if (typeof window !== 'undefined' && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  };

  const handleReset = () => {
    if (confirm("Reset hitungan tasbih?")) {
      setCount(0);
      localStorage.setItem('quran_tasbih_count', '0');
    }
  };

  // --- LOGIKA HITUNG ARAH KIBLAT ---
  const calculateQibla = (lat: number, lng: number) => {
    const phiK = 21.4225 * (Math.PI / 180); // Lat Ka'bah
    const lambdaK = 39.8262 * (Math.PI / 180); // Lng Ka'bah
    const phi = lat * (Math.PI / 180);
    const lambda = lng * (Math.PI / 180);

    const qibla = Math.atan2(
      Math.sin(lambdaK - lambda),
      Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda)
    );

    const result = (qibla * 180) / Math.PI;
    setQiblaDir(result < 0 ? result + 360 : result);
  };

  const getLocation = () => {
    setLocError(null);
    if (!navigator.geolocation) {
      setLocError("Geolocation tidak didukung browser Anda.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(coords);
        calculateQibla(coords.lat, coords.lng);
      },
      () => {
        setLocError("Izin lokasi ditolak. Aktifkan GPS untuk cek kiblat.");
      }
    );
  };

  return (
    <div className="p-4 pt-6 pb-24 min-h-screen">
      <h1 className="text-2xl font-bold text-islamic-900 dark:text-white mb-6 flex items-center">
        <BiCompass className="mr-2 text-gold-500" /> Tools Islami
      </h1>

      {/* --- SEKSI 1: TASBIH DIGITAL --- */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6 text-center">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold dark:text-white flex items-center">
            <BiFingerprint className="mr-2 text-islamic-500" /> Tasbih Digital
          </h2>
          <button onClick={handleReset} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition">
            <BiReset size={24} />
          </button>
        </div>

        {/* Tombol Klik Tasbih */}
        <div className="relative inline-block">
          <button 
            onClick={handleIncrement}
            className="w-48 h-48 rounded-full bg-linear-to-br from-islamic-500 to-islamic-700 shadow-xl shadow-islamic-500/30 flex items-center justify-center text-white active:scale-95 transition-transform"
          >
            <div className="text-center">
              <span className="block text-5xl font-black mb-1">{count}</span>
              <span className="text-[10px] uppercase tracking-widest opacity-80 font-bold">Klik untuk Dzikir</span>
            </div>
          </button>
        </div>
        
        <p className="mt-6 text-xs text-gray-400">
          Hitungan otomatis tersimpan di perangkat Anda.
        </p>
      </div>

      {/* --- SEKSI 2: ARAH KIBLAT --- */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 mb-6 text-center">
        <h2 className="font-bold dark:text-white flex items-center mb-6 text-left">
          <BiCompass className="mr-2 text-gold-500" /> Cek Arah Kiblat
        </h2>

        {!location ? (
          <div className="py-6">
            <button 
              onClick={getLocation}
              className="bg-gold-500 hover:bg-gold-400 text-white font-bold py-3 px-8 rounded-2xl shadow-lg transition flex items-center mx-auto"
            >
              <BiTargetLock className="mr-2" size={20} /> Cari Lokasi Saya
            </button>
            {locError && <p className="text-red-500 text-xs mt-4">{locError}</p>}
          </div>
        ) : (
          <div className="py-4">
            <div className="relative w-40 h-40 mx-auto mb-6">
              {/* Lingkaran Kompas Sederhana */}
              <div className="absolute inset-0 rounded-full border-4 border-islamic-100 dark:border-gray-700"></div>
              {/* Jarum Kiblat */}
              <div 
                className="absolute inset-0 flex items-center justify-center transition-transform duration-1000"
                style={{ transform: `rotate(${qiblaDir}deg)` }}
              >
                <div className="w-1 h-20 bg-linear-to-t from-transparent via-gold-500 to-gold-500 rounded-full relative">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-gold-500 rotate-45 border-t border-l border-gold-300"></div>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 bg-islamic-700 rounded-full border-2 border-white shadow-sm"></div>
              </div>
            </div>
            
            <h3 className="text-2xl font-black text-islamic-700 dark:text-gold-400">
              {qiblaDir?.toFixed(1)}&deg;
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Derajat dari arah Utara ke arah Ka&apos;bah
            </p>
            <p className="text-[10px] text-gray-400 mt-4 italic">
              *Pastikan HP dalam posisi datar (horizontal) saat menghadap.
            </p>
            <button onClick={() => setLocation(null)} className="mt-4 text-xs text-islamic-600 underline">Refresh Lokasi</button>
          </div>
        )}
      </div>
    </div>
  );
}