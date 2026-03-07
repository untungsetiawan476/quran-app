"use client";
import { useState, useEffect, useRef } from 'react';
import { BiMicrophone, BiMicrophoneOff, BiReset, BiXCircle } from 'react-icons/bi';
import { BsStars } from 'react-icons/bs';

// =====================================================================
// DEKLARASI TIPE (Agar TypeScript & ESLint Tidak Marah)
// =====================================================================
declare global {
  interface Window {
    SpeechRecognition: new () => ISpeechRecognition;
    webkitSpeechRecognition: new () => ISpeechRecognition;
  }
}

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionError) => void) | null;
  onend: (() => void) | null;
}

interface ISpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
}

interface ISpeechRecognitionError {
  error: string;
}

interface VoiceHafalanProps {
  teksArabAsli: string;
  onClose: () => void;
}

// =====================================================================
// KOMPONEN UTAMA
// =====================================================================
export default function VoiceHafalan({ teksArabAsli, onClose }: VoiceHafalanProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [score, setScore] = useState<number | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  
  // Ref dengan tipe data yang halal (Bukan 'any')
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  useEffect(() => {
    // Hindari error saat SSR di Next.js
    if (typeof window === 'undefined') return;

    // Mengecek apakah browser mendukung fitur Voice to Text
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ar-SA'; // Memaksa AI mengenali Bahasa Arab (Saudi)

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      setTranscript(currentTranscript);
    };

    recognition.onerror = (event: ISpeechRecognitionError) => {
      console.error("Error mikrofon:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      calculateScore(transcript, teksArabAsli);
    } else {
      setTranscript('');
      setScore(null);
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  // ALGORITMA SULTAN: Menyamakan teks suara dengan ayat Al-Qur'an
  const calculateScore = (spokenText: string, actualText: string) => {
    if (!spokenText.trim()) {
      setScore(0);
      return;
    }

    // 1. Fungsi rahasia menghapus Harakat/Tajwid agar pencocokan adil
    const normalizeArabic = (text: string) => {
      return text
        .replace(/[\u064B-\u065F]/g, '') // Hapus tanda baca (fathah, dammah, dll)
        .replace(/[ٱأإآ]/g, 'ا') // Samakan semua jenis huruf Alif
        .replace(/ة/g, 'ه') // Samakan Ta Marbuthoh dengan Ha
        .replace(/ى/g, 'ي') // Samakan Alif Maqsuroh dengan Ya
        .trim();
    };

    const spokenWords = normalizeArabic(spokenText).split(/\s+/);
    const actualWords = normalizeArabic(actualText).split(/\s+/);

    // 2. Logika Toleransi (Fuzzy Matching Sederhana)
    let matchCount = 0;
    actualWords.forEach((word) => {
      if (spokenWords.includes(word)) {
        matchCount++;
      }
    });

    const percentage = Math.round((matchCount / actualWords.length) * 100);
    // Batasi maksimal 100%
    setScore(percentage > 100 ? 100 : percentage);
  };

  const resetUjian = () => {
    setTranscript('');
    setScore(null);
  };

  if (!isSupported) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-3xl border border-red-200 dark:border-red-800 text-center relative mt-4">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500"><BiXCircle size={24} /></button>
        <BiMicrophoneOff size={48} className="mx-auto text-red-400 mb-3" />
        <h3 className="font-bold text-red-700 dark:text-red-400 mb-2">Browser Tidak Mendukung</h3>
        <p className="text-sm text-red-600 dark:text-red-300">Maaf, fitur deteksi suara ini hanya berfungsi maksimal di Google Chrome Android/Desktop.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl border-2 border-emerald-500/30 relative mt-4 overflow-hidden animate-fade-in-up">
      {/* Background Ornamen */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
      
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition z-10">
        <BiXCircle size={28} />
      </button>

      <div className="text-center mb-6 relative z-10">
        <span className="inline-block bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-widest border border-emerald-500/30">
          Ujian Hafalan Suara (BETA)
        </span>
        <h3 className="text-xl font-bold text-white flex items-center justify-center">
          <BsStars className="mr-2 text-gold-400" /> Cek Hafalan AI
        </h3>
        <p className="text-sm text-gray-400 mt-2">Tekan mikrofon dan bacalah ayat ini. AI akan menilai ketepatan hafalanmu.</p>
      </div>

      {/* Teks Arab Asli (Samar-samar sebagai contekan kalau lupa) */}
      <div className="bg-black/30 p-4 rounded-2xl border border-white/5 mb-6">
        <p className="text-right font-arab text-2xl leading-loose text-gray-600 select-none blur-[2px] hover:blur-none transition-all duration-300" dir="rtl" title="Sentuh untuk melihat contekan">
          {teksArabAsli}
        </p>
      </div>

      {/* Area Teks yang Ditangkap Suara - Sudah pakai min-h-25 sesuai standar Tailwind terbaru */}
      <div className="min-h-25 bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 flex items-center justify-center relative">
        {transcript ? (
          <p className="text-center font-arab text-3xl leading-loose text-emerald-300" dir="rtl">
            {transcript}
          </p>
        ) : (
          <p className="text-gray-500 text-sm italic animate-pulse">
            {isListening ? "Mendengarkan bacaanmu..." : "Menunggu suara..."}
          </p>
        )}
      </div>

      {/* Kontrol dan Hasil Score */}
      <div className="flex flex-col items-center justify-center relative z-10">
        {score === null ? (
          <button 
            onClick={toggleListening}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse ring-4 ring-red-500/30 shadow-red-500/50' 
                : 'bg-emerald-500 hover:bg-emerald-600 ring-4 ring-emerald-500/20 shadow-emerald-500/40 hover:scale-105'
            }`}
          >
            {isListening ? <BiMicrophoneOff size={36} className="text-white" /> : <BiMicrophone size={36} className="text-white" />}
          </button>
        ) : (
          <div className="w-full text-center animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 mb-4 shadow-lg bg-slate-800 relative
              ${score >= 80 ? 'border-emerald-400 text-emerald-400 shadow-emerald-400/20' : score >= 50 ? 'border-gold-400 text-gold-400' : 'border-red-400 text-red-400'}"
              style={{ borderColor: score >= 80 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171' }}
            >
              <span className="text-3xl font-black" style={{ color: score >= 80 ? '#34d399' : score >= 50 ? '#fbbf24' : '#f87171' }}>
                {score}%
              </span>
            </div>
            
            <h4 className="text-lg font-bold text-white mb-2">
              {score >= 80 ? '🎉 Masya Allah, Hafalan Kuat!' : score >= 50 ? '👍 Hampir Sempurna, Semangat!' : '💪 Ayo Ulangi Lagi Pelan-pelan'}
            </h4>
            
            <button 
              onClick={resetUjian}
              className="mt-4 flex items-center mx-auto bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition"
            >
              <BiReset size={20} className="mr-2" /> Coba Lagi
            </button>
          </div>
        )}
        
        {score === null && (
          <p className="text-xs text-gray-500 mt-4 font-bold uppercase tracking-wider">
            {isListening ? 'Ketuk untuk Berhenti & Cek Skor' : 'Ketuk untuk Mulai Bicara'}
          </p>
        )}
      </div>
    </div>
  );
}