"use client";
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { BiDownload, BiX } from 'react-icons/bi';
import { BsStars } from 'react-icons/bs';

export default function InstallBanner() {
  const { isInstallable, installApp, dismiss } = usePWAInstall();

  if (!isInstallable) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-md z-1000 animate-fade-in-down">
      <div className="bg-linear-to-r from-gray-900 to-islamic-900 rounded-3xl p-4 shadow-2xl border border-gold-500/30 flex items-center justify-between relative overflow-hidden">
        
        {/* Efek Cahaya */}
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-gold-500/20 blur-2xl rounded-full pointer-events-none"></div>

        <div className="flex items-center">
          <div className="bg-gold-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center mr-4 shadow-lg shrink-0">
            <BsStars size={24} className="animate-pulse" />
          </div>
          <div>
            {/* Menggunakan &apos; pengganti tanda petik tunggal */}
            <h4 className="text-white font-bold text-sm leading-tight">Install Qur&apos;an App</h4>
            <p className="text-gold-100 text-[10px] mt-0.5 opacity-80">Lebih cepat & hemat kuota!</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 relative z-10">
          <button 
            onClick={installApp}
            className="bg-gold-500 hover:bg-gold-400 text-gray-900 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md active:scale-95 flex items-center"
          >
            <BiDownload className="mr-1" size={16} /> Install
          </button>
          <button 
            onClick={dismiss}
            className="text-gray-400 hover:text-white p-1 rounded-full transition-colors"
          >
            <BiX size={22} />
          </button>
        </div>
      </div>
    </div>
  );
}