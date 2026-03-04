"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BiHomeAlt, BiBookOpen, BiTrophy, BiHeart, BiWrench } from 'react-icons/bi';

export default function BottomNav() {
  const pathname = usePathname();

  const menus = [
    { name: 'Beranda', path: '/', icon: <BiHomeAlt size={24} /> },
    { name: "Al-Qur'an", path: '/quran', icon: <BiBookOpen size={24} /> },
    { name: 'Kuis', path: '/kuis', icon: <BiTrophy size={24} /> },
    { name: 'Doa', path: '/doa', icon: <BiHeart size={24} /> },
    { name: 'Tools', path: '/tools', icon: <BiWrench size={24} /> },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 pb-safe z-50 rounded-t-2xl shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {menus.map((menu) => (
          <Link href={menu.path} key={menu.path} className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${pathname === menu.path ? 'text-islamic-700 dark:text-gold-400 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
            {menu.icon}
            <span className="text-[10px]">{menu.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}