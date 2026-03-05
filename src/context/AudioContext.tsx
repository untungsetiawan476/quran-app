"use client";
import React, { createContext, useContext, useState, useRef } from 'react';
import { BiHeadphone, BiPauseCircle, BiPlayCircle, BiX } from 'react-icons/bi';

interface AudioContextType {
  playFullSurat: (audioUrl: string, surahName: string) => void;
  stopAudio: () => void;
  isPlaying: boolean;
  currentSurah: string;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio harus digunakan di dalam AudioProvider");
  return context;
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSurah, setCurrentSurah] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playFullSurat = (url: string, surahName: string) => {
    // Jika tombol play ditekan pada surat yang sama
    if (audioRef.current && audioUrl === url) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    // Jika sedang memutar surat lain, hentikan dulu
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Putar surat baru
    setAudioUrl(url);
    setCurrentSurah(surahName);
    audioRef.current = new Audio(url);
    audioRef.current.play();
    setIsPlaying(true);

    audioRef.current.onended = () => {
      setIsPlaying(false);
    };
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    setAudioUrl("");
    setCurrentSurah("");
  };

  return (
    <AudioContext.Provider value={{ playFullSurat, stopAudio, isPlaying, currentSurah }}>
      {children}
      
      {/* GLOBAL MINI PLAYER UI - Muncul Otomatis di Semua Halaman! */}
      {audioUrl && (
        <div className="fixed bottom-24 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-md bg-white dark:bg-gray-800 rounded-4xl p-4 shadow-2xl shadow-islamic-900/20 border border-gray-100 dark:border-gray-700 flex items-center justify-between z-999 animate-fade-in-up">
          <div className="flex items-center">
            <div className={`w-12 h-12 bg-islamic-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-islamic-600 dark:text-gold-400 mr-3 shadow-inner ${isPlaying ? 'animate-spin-slow' : ''}`}>
              <BiHeadphone size={24} className={isPlaying ? 'animate-pulse' : ''} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-islamic-500 dark:text-gold-400 uppercase tracking-widest mb-0.5">Murottal Full</p>
              <p className="text-sm font-black text-gray-800 dark:text-white leading-none">Surat {currentSurah}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button onClick={() => playFullSurat(audioUrl, currentSurah)} className="text-islamic-600 dark:text-gold-400 hover:scale-110 active:scale-95 transition-all p-1">
              {isPlaying ? <BiPauseCircle size={44} /> : <BiPlayCircle size={44} />}
            </button>
            <button onClick={stopAudio} className="text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-all p-2">
              <BiX size={24} />
            </button>
          </div>
        </div>
      )}
    </AudioContext.Provider>
  );
}