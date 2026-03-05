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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-[2.5rem] p-8 shadow-2xl animate-slide-up">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black text-gray-800 dark:text-white uppercase tracking-tighter">Pengaturan Bacaan</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-500"><BiX size={24}/></button>
        </div>

        <div className="space-y-8">
          {/* PENGATURAN UKURAN HURUF */}
          <div>
            <label className="flex items-center text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest">
              <BiFontSize className="mr-2" size={18}/> Ukuran Huruf Arab: {fontSize}px
            </label>
            <input 
              type="range" min="20" max="60" value={fontSize} 
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full h-2 bg-islamic-100 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-islamic-500"
            />
          </div>

          {/* PENGATURAN JENIS FONT */}
          <div>
            <label className="flex items-center text-xs font-bold text-gray-400 mb-4 uppercase tracking-widest">
              <BiFont className="mr-2" size={18}/> Gaya Penulisan
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setFontFamily('font-arab')}
                className={`p-3 rounded-2xl border-2 font-bold transition-all ${fontFamily === 'font-arab' ? 'border-islamic-500 bg-islamic-50 text-islamic-700' : 'border-gray-100 dark:border-gray-800 text-gray-400'}`}
              >
                Standar
              </button>
              <button 
                onClick={() => setFontFamily('font-quran-pake-font-khusus')}
                className={`p-3 rounded-2xl border-2 font-bold transition-all ${fontFamily !== 'font-arab' ? 'border-islamic-500 bg-islamic-50 text-islamic-700' : 'border-gray-100 dark:border-gray-800 text-gray-400'}`}
              >
                Kaligrafi
              </button>
            </div>
          </div>

          {/* TOGGLE FITUR POSTER */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
            <div className="flex items-center">
              <BiImage className="text-islamic-500 mr-3" size={24}/>
              <div>
                <p className="text-sm font-bold dark:text-white">Tombol Poster</p>
                <p className="text-[10px] text-gray-400">Tampilkan ikon buat gambar ayat</p>
              </div>
            </div>
            <button 
              onClick={() => setShowPosterBtn(!showPosterBtn)}
              className={`w-12 h-6 rounded-full transition-colors relative ${showPosterBtn ? 'bg-islamic-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${showPosterBtn ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-10 bg-islamic-700 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all"
        >
          Terapkan Perubahan
        </button>
      </div>
    </div>
  );
}