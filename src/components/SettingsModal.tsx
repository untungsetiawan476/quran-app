"use client";
import { BiX, BiFontSize, BiFont, BiImage } from 'react-icons/bi';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  fontSize: number;
  setFontSize: (s: number) => void;
  fontFamily: string;
  setFontFamily: (f: string) => void;
  showPosterBtn: boolean;
  setShowPosterBtn: (v: boolean) => void;
}

export default function SettingsModal({ 
  isOpen, onClose, fontSize, setFontSize, fontFamily, setFontFamily, showPosterBtn, setShowPosterBtn 
}: SettingsProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm transition-opacity p-4">
      {/* Container Modal dengan Animasi Slide Up */}
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-300">
        
        {/* Header Modal */}
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Pengaturan Bacaan</h3>
          <button 
            onClick={onClose} 
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          >
            <BiX size={24}/>
          </button>
        </div>

        <div className="space-y-8">
          {/* 1. PENGATURAN UKURAN HURUF */}
          <div>
            <label className="flex items-center text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest">
              <BiFontSize className="mr-2 text-islamic-500" size={18}/> Ukuran Huruf: {fontSize}px
            </label>
            <input 
              type="range" 
              min="20" 
              max="60" 
              value={fontSize} 
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full h-2 bg-islamic-100 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-islamic-500"
            />
            <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400 uppercase">
              <span>Kecil</span>
              <span>Besar</span>
            </div>
          </div>

          {/* 2. PENGATURAN JENIS FONT */}
          <div>
            <label className="flex items-center text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest">
              <BiFont className="mr-2 text-islamic-500" size={18}/> Gaya Penulisan
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setFontFamily('font-arab')}
                className={`p-4 rounded-2xl border-2 font-bold transition-all text-sm ${fontFamily === 'font-arab' ? 'border-islamic-500 bg-islamic-50 text-islamic-700 dark:bg-islamic-900/20' : 'border-gray-100 dark:border-gray-800 text-gray-400'}`}
              >
                Standard
              </button>
              <button 
                onClick={() => setFontFamily('font-quran')}
                className={`p-4 rounded-2xl border-2 font-bold transition-all text-sm ${fontFamily !== 'font-arab' ? 'border-islamic-500 bg-islamic-50 text-islamic-700 dark:bg-islamic-900/20' : 'border-gray-100 dark:border-gray-800 text-gray-400'}`}
              >
                Kaligrafi
              </button>
            </div>
          </div>

          {/* 3. TOGGLE FITUR POSTER */}
          <div className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800 rounded-4xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-white dark:bg-gray-700 rounded-xl shadow-sm mr-4 text-islamic-500">
                <BiImage size={24}/>
              </div>
              <div>
                <p className="text-sm font-bold dark:text-white">Fitur Poster</p>
                <p className="text-[10px] text-gray-400 font-medium">Tampilkan tombol bagikan ayat</p>
              </div>
            </div>
            <button 
              onClick={() => setShowPosterBtn(!showPosterBtn)}
              className={`w-14 h-7 rounded-full transition-all relative ${showPosterBtn ? 'bg-islamic-500 shadow-lg shadow-islamic-500/30' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${showPosterBtn ? 'left-8' : 'left-1'}`}></div>
            </button>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-10 bg-islamic-700 hover:bg-islamic-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-islamic-700/20 active:scale-95 transition-all tracking-widest uppercase text-sm"
        >
          Simpan Pengaturan
        </button>
      </div>
    </div>
  );
}
