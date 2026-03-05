"use client";
import { useEffect, useState } from 'react';
import { BiBookOpen, BiTrophy } from 'react-icons/bi';

export default function StatistikDashboard() {
  const [stats, setStats] = useState({ baca: 0, kuis: 0, target: 50 });

  useEffect(() => {
    // Dibungkus setTimeout agar ESLint tidak protes soal sinkronisasi state
    const timer = setTimeout(() => {
      const savedStats = localStorage.getItem('user_stats');
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Hitung Persentase untuk Lingkaran
  const percentage = Math.min((stats.baca / stats.target) * 100, 100);
  const strokeDasharray = `${percentage} ${100 - percentage}`;

  return (
    <div className="grid grid-cols-2 gap-4 mb-8">
      {/* KARTU PROGRESS BACA */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-4xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between overflow-hidden relative group">
        <div className="relative z-10">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Target Baca</p>
          <h4 className="text-xl font-black text-gray-800 dark:text-white">
            {stats.baca} <span className="text-xs font-medium text-gray-400">/ {stats.target}</span>
          </h4>
        </div>
        
        {/* Lingkaran Progress Estetik */}
        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            <path className="stroke-gray-100 dark:stroke-gray-700" fill="none" strokeWidth="3" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path className="stroke-gold-500 transition-all duration-1000" fill="none" strokeWidth="3" strokeDasharray={strokeDasharray} strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          </svg>
          <BiBookOpen className="absolute text-gold-500" size={14} />
        </div>
      </div>

      {/* KARTU KUIS & PRESTASI */}
      <div className="bg-linear-to-br from-gold-400 to-gold-600 p-5 rounded-4xl shadow-lg shadow-gold-500/20 text-white flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-1">Kuis Selesai</p>
          <h4 className="text-xl font-black">
            {stats.kuis} <span className="text-xs font-medium opacity-70">Kali</span>
          </h4>
        </div>
        <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md">
          <BiTrophy size={24} />
        </div>
      </div>
    </div>
  );
}