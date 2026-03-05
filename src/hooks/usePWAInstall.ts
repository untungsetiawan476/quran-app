"use client";
import { useState, useEffect } from 'react';

// Membuat interface untuk event agar TypeScript tidak protes
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Mencegah pop-up bawaan browser muncul secara otomatis
      e.preventDefault();
      // Simpan event-nya untuk dipanggil nanti dari tombol kita
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    
    // Munculkan notifikasi install NATIVE saat tombol kita diklik
    deferredPrompt.prompt();
    
    // Tunggu respon user (apakah mereka klik "Install" atau "Batal")
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false); // Sembunyikan banner kita kalau sukses install
    }
    
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setIsInstallable(false); // Sembunyikan jika user meng-klik tanda X
  };

  return { isInstallable, installApp, dismiss };
}