"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BiHomeAlt, BiHeart, BiBookOpen, BiVideoPlus, BiBookmark } from 'react-icons/bi';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 w-full z-50">
      <nav className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 pb-safe rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.08)] relative">
        <div className="flex justify-between items-center h-16 px-6 max-w-md mx-auto">
          
          {/* ================== MENU KIRI ================== */}
          <div className="flex w-2/5 justify-between">
            <NavItem 
              href="/" 
              icon={<BiHomeAlt size={24} />} 
              label="Beranda" 
              isActive={pathname === '/'} 
            />
            <NavItem 
              href="/doa" 
              icon={<BiHeart size={24} />} 
              label="Doa" 
              isActive={pathname === '/doa'} 
            />
          </div>

          {/* ================== TOMBOL SULTAN DI TENGAH (AL-QUR'AN) ================== */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-7">
            <Link href="/quran" className="flex flex-col items-center justify-center group">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transform transition-all duration-300 group-hover:scale-110 group-active:scale-95 border-4 border-white dark:border-gray-800 ${
                pathname.startsWith('/quran') 
                  ? 'bg-amber-500 text-white shadow-amber-500/40' // Warna Emas saat aktif
                  : 'bg-emerald-600 text-white shadow-emerald-600/40' // Warna Hijau saat diam
              }`}>
                <BiBookOpen size={32} />
              </div>
              <span className={`text-[10px] mt-1.5 font-bold transition-colors ${
                pathname.startsWith('/quran') ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                Qur&apos;an
              </span>
            </Link>
          </div>

          {/* ================== MENU KANAN ================== */}
          <div className="flex w-2/5 justify-between">
            <NavItem 
              href="/studio" 
              icon={<BiVideoPlus size={24} />} 
              label="Studio" 
              isActive={pathname === '/studio'} 
            />
            <NavItem 
              href="/playlist" 
              icon={<BiBookmark size={24} />} 
              label="Koleksi" 
              isActive={pathname === '/playlist'} 
            />
          </div>

        </div>
      </nav>
    </div>
  );
}

// Sub-komponen warna juga saya ganti jadi Emerald & Amber
function NavItem({ href, icon, label, isActive }: { href: string, icon: React.ReactNode, label: string, isActive: boolean }) {
  return (
    <Link 
      href={href} 
      className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${
        isActive 
          ? 'text-emerald-600 dark:text-amber-400 font-bold scale-110' 
          : 'text-gray-400 dark:text-gray-500 hover:text-emerald-500'
      }`}
    >
      {icon}
      <span className="text-[10px] whitespace-nowrap">{label}</span>
    </Link>
  );
}
