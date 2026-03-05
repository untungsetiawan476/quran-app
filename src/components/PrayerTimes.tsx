"use client";
import { useState, useEffect } from 'react';
import { BiTimeFive, BiMap } from 'react-icons/bi';

interface Timings {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

export default function PrayerTimes() {
  const [timings, setTimings] = useState<Timings | null>(null);
  const [city, setCity] = useState("Mencari Lokasi...");

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Ambil jadwal sholat berdasarkan koordinat
          const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=11`);
          const data = await res.json();
          setTimings(data.data.timings);
          
          // Ambil nama kota (Reverse Geocoding sederhana)
          setCity("Lokasi Saat Ini");
        } catch (error) {
          console.error("Gagal memuat jadwal sholat", error);
        }
      });
    }
  }, []);

  if (!timings) return null;

  const schedule = [
    { name: 'Subuh', time: timings.Fajr },
    { name: 'Dzuhur', time: timings.Dhuhr },
    { name: 'Ashar', time: timings.Asr },
    { name: 'Maghrib', time: timings.Maghrib },
    { name: 'Isya', time: timings.Isha },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800 dark:text-white flex items-center">
          <BiTimeFive className="mr-2 text-islamic-500" /> Jadwal Sholat
        </h3>
        <span className="text-[10px] bg-islamic-50 dark:bg-gray-700 text-islamic-700 dark:text-islamic-300 px-2 py-1 rounded-full flex items-center">
          <BiMap className="mr-1" /> {city}
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {schedule.map((item) => (
          <div key={item.name} className="text-center p-2 rounded-2xl bg-gray-50 dark:bg-gray-700/50 border border-transparent hover:border-islamic-200 transition">
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mb-1">{item.name}</p>
            <p className="text-sm font-bold text-islamic-700 dark:text-gold-400">{item.time}</p>
          </div>
        ))}
      </div>
    </div>
  );
}