"use client";
import { useState, useEffect } from 'react';
import { BiTimeFive, BiMap } from 'react-icons/bi';

interface Timings {
  Imsak: string;
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export default function PrayerTimes() {
  const [timings, setTimings] = useState<Timings | null>(null);
  const [city, setCity] = useState("Mencari Lokasi...");
  const [nextPrayer, setNextPrayer] = useState<string>('');

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // API Aladhan Otomatis mengembalikan data Imsak juga
          const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=11`);
          const data = await res.json();
          setTimings(data.data.timings);
          setCity("Lokasi Saat Ini");
        } catch (error) {
          console.error("Gagal memuat jadwal sholat", error);
        }
      });
    }
  }, []);

  // Logika Pintar: Mengecek waktu sholat selanjutnya secara real-time
  useEffect(() => {
    if (!timings) return;

    const checkNextPrayer = () => {
      const now = new Date();
      // Format jam saat ini menjadi "HH:MM" (contoh: "14:05")
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const scheduleList = [
        { name: 'Imsak', time: timings.Imsak },
        { name: 'Subuh', time: timings.Fajr },
        { name: 'Dzuhur', time: timings.Dhuhr },
        { name: 'Ashar', time: timings.Asr },
        { name: 'Maghrib', time: timings.Maghrib },
        { name: 'Isya', time: timings.Isha },
      ];

      // Default jika sudah lewat Isya, maka selanjutnya adalah Imsak besok
      let next = 'Imsak'; 
      for (let i = 0; i < scheduleList.length; i++) {
        if (scheduleList[i].time > currentTime) {
          next = scheduleList[i].name;
          break;
        }
      }
      setNextPrayer(next);
    };

    checkNextPrayer(); // Cek saat pertama kali dimuat
    const interval = setInterval(checkNextPrayer, 60000); // Update otomatis setiap 1 menit

    return () => clearInterval(interval);
  }, [timings]);

  if (!timings) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-1/3 mb-4"></div>
        <div className="h-24 bg-gray-100 dark:bg-gray-700/50 rounded-2xl w-full"></div>
      </div>
    );
  }

  const schedule = [
    { name: 'Imsak', time: timings.Imsak },
    { name: 'Subuh', time: timings.Fajr },
    { name: 'Dzuhur', time: timings.Dhuhr },
    { name: 'Ashar', time: timings.Asr },
    { name: 'Maghrib', time: timings.Maghrib },
    { name: 'Isya', time: timings.Isha },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 relative overflow-hidden group">
      {/* Ornamen Latar */}
      <div className="absolute -right-6 -top-6 opacity-5 dark:opacity-10 transition-transform group-hover:scale-110 duration-700">
        <BiTimeFive size={150} className="text-islamic-500" />
      </div>

      <div className="relative z-10 flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-800 dark:text-white flex items-center text-lg">
          <BiTimeFive className="mr-2 text-islamic-500" size={22} /> Jadwal Sholat
        </h3>
        <span className="text-[10px] bg-islamic-50 dark:bg-gray-700 text-islamic-700 dark:text-islamic-300 px-3 py-1.5 rounded-full flex items-center font-medium shadow-inner">
          <BiMap className="mr-1" size={14} /> {city}
        </span>
      </div>
      
      {/* Diubah menjadi 3 Kolom agar Imsak muat dan simetris */}
      <div className="relative z-10 grid grid-cols-3 gap-3">
        {schedule.map((item) => {
          const isActive = item.name === nextPrayer;
          return (
            <div 
              key={item.name} 
              className={`text-center p-3 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                isActive 
                  ? 'bg-linear-to-br from-gold-400 to-gold-600 border-gold-400 shadow-lg shadow-gold-500/30 transform scale-105 z-10' 
                  : 'bg-gray-50 dark:bg-gray-700/50 border-transparent hover:border-islamic-200 dark:hover:border-gray-500'
              }`}
            >
              <p className={`text-[11px] font-bold mb-1 tracking-wider uppercase ${isActive ? 'text-gold-100' : 'text-gray-500 dark:text-gray-400'}`}>
                {item.name}
              </p>
              <p className={`text-lg font-bold ${isActive ? 'text-white' : 'text-islamic-700 dark:text-white'}`}>
                {item.time}
              </p>
              
              {/* Indikator Titik Menyala jika Aktif */}
              {isActive && (
                <span className="absolute top-2 right-2 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
