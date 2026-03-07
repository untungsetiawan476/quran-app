"use client";
import { useState, useEffect, useCallback } from 'react';
import { BiMapPin, BiCompass, BiErrorCircle, BiTargetLock, BiLeftArrowAlt } from 'react-icons/bi';
import { BsStars } from 'react-icons/bs';
import Link from 'next/link';

// =====================================================================
// DEKLARASI TIPE KHUSUS
// =====================================================================
interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

interface DeviceOrientationEventConstructor {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

const KAABA_LAT = 21.422487;
const KAABA_LNG = 39.826206;

// =====================================================================
// KOMPONEN UTAMA
// =====================================================================
export default function KiblatPage() {
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [qiblaAngle, setQiblaAngle] = useState<number>(0);
  const [heading, setHeading] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // 1. Fungsi Matematika
  const calculateQiblaAndDistance = useCallback((lat: number, lng: number) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const toDeg = (rad: number) => (rad * 180) / Math.PI;

    const myLat = toRad(lat);
    const myLng = toRad(lng);
    const kLat = toRad(KAABA_LAT);
    const kLng = toRad(KAABA_LNG);

    const y = Math.sin(kLng - myLng);
    const x = Math.cos(myLat) * Math.tan(kLat) - Math.sin(myLat) * Math.cos(kLng - myLng);
    let qibla = toDeg(Math.atan2(y, x));
    qibla = (qibla + 360) % 360;
    setQiblaAngle(qibla);

    const R = 6371; 
    const dLat = kLat - myLat;
    const dLon = kLng - myLng;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(myLat) * Math.cos(kLat) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    setDistance(Math.round(R * c));
  }, []);

  // 2. Dapatkan Lokasi GPS Pengguna (SUDAH DIPERBAIKI ANTI-ERROR)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Dibungkus function agar ESLint tidak protes synchronous update
    const initGPS = () => {
      if (!navigator.geolocation) {
        // Pakai setTimeout agar tidak men-trigger cascading render
        setTimeout(() => setError("Browser tidak mendukung fitur GPS."), 0);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ lat: latitude, lng: longitude });
          calculateQiblaAndDistance(latitude, longitude);
        },
        (err) => {
          setError("Gagal akses GPS. Pastikan GPS/Lokasi HP menyala dan diizinkan.");
          console.error("GPS Error:", err);
        },
        { enableHighAccuracy: true }
      );
    };

    initGPS();
  }, [calculateQiblaAndDistance]);

  // 3. Fungsi Sensor Kompas (Device Orientation)
  const handleOrientation = useCallback((event: Event) => {
    const orientEvent = event as DeviceOrientationEventiOS;
    let compassHeading: number | null = null;
    
    if (orientEvent.webkitCompassHeading !== undefined) {
      compassHeading = orientEvent.webkitCompassHeading;
    } 
    else if (orientEvent.absolute && orientEvent.alpha !== null) {
      compassHeading = 360 - orientEvent.alpha;
    }

    if (compassHeading !== null) {
      setHeading(Math.round(compassHeading));
    }
  }, []);

  // 4. Tombol Minta Izin Sensor
  const requestCompassPermission = async () => {
    const DOMEvent = DeviceOrientationEvent as unknown as DeviceOrientationEventConstructor;

    if (typeof DOMEvent.requestPermission === 'function') {
      try {
        const permission = await DOMEvent.requestPermission();
        if (permission === 'granted') {
          setPermissionGranted(true);
          window.addEventListener('deviceorientation', handleOrientation, true);
        } else {
          setError("Izin sensor kompas ditolak oleh perangkat.");
        }
      } catch (err) {
        console.error("Permission Error:", err);
        setError("Gagal meminta izin sensor kompas.");
      }
    } else {
      setPermissionGranted(true);
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
        window.removeEventListener('deviceorientation', handleOrientation, true);
      }
    };
  }, [handleOrientation]);

  const isFacingQibla = Math.abs(heading - qiblaAngle) < 5 || Math.abs(heading - qiblaAngle) > 355;

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col relative overflow-hidden pb-10">
      <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 rounded-full blur-[100px] transition-all duration-1000 ${isFacingQibla ? 'bg-emerald-500/30' : 'bg-indigo-500/10'}`}></div>

      <div className="p-6 relative z-10 flex items-center">
        <Link href="/" className="bg-white/10 p-2 rounded-full hover:bg-white/20 transition backdrop-blur-md">
          <BiLeftArrowAlt size={24} />
        </Link>
        <h1 className="text-xl font-bold ml-4 flex items-center tracking-wider">
          <BiCompass className="mr-2 text-gold-400" size={24} /> Arah Kiblat
        </h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        
        {error ? (
          <div className="bg-red-500/20 border border-red-500/50 p-6 rounded-3xl text-center max-w-sm">
            <BiErrorCircle size={48} className="mx-auto mb-3 text-red-400" />
            <h2 className="font-bold text-lg mb-2">Oops, Ada Kendala</h2>
            <p className="text-sm text-red-200">{error}</p>
          </div>
        ) : !location ? (
          <div className="text-center animate-pulse">
            <BiMapPin size={48} className="mx-auto mb-4 text-emerald-400" />
            <p className="text-gray-400">Mencari lokasimu dari satelit...</p>
          </div>
        ) : !permissionGranted ? (
          <div className="bg-slate-800/80 backdrop-blur-md p-8 rounded-3xl text-center max-w-sm border border-slate-700 shadow-2xl">
            <BiTargetLock size={64} className="mx-auto mb-4 text-gold-400" />
            <h2 className="text-xl font-bold mb-3">Aktifkan Kompas</h2>
            <p className="text-sm text-gray-400 mb-6">Kami membutuhkan izin untuk mengakses sensor gerak (Gyroscope) agar kompas bisa berputar secara langsung.</p>
            <button 
              onClick={requestCompassPermission}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-emerald-500/30"
            >
              Mulai Pindai Arah
            </button>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center animate-fade-in-up">
            
            <div className={`px-6 py-2 rounded-full border mb-8 transition-all duration-500 ${isFacingQibla ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.4)]' : 'bg-slate-800 border-slate-600 text-gray-300'}`}>
              <h2 className="font-bold text-sm tracking-widest uppercase flex items-center">
                {isFacingQibla ? <><BsStars className="mr-2" size={16}/> Sempurna Menghadap Kiblat</> : "Putar HP-mu perlahan..."}
              </h2>
            </div>

            <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center mb-12">
              
              <div 
                className="absolute inset-0 rounded-full border-8 border-slate-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] transition-transform duration-400 ease-out"
                style={{ transform: `rotate(${-heading}deg)` }}
              >
                <div className="absolute top-2 left-1/2 -translate-x-1/2 font-black text-red-500 text-lg">N</div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 font-bold text-slate-500">S</div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">E</div>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-500">W</div>
                
                <div 
                  className="absolute inset-0 flex justify-center z-10"
                  style={{ transform: `rotate(${qiblaAngle}deg)` }}
                >
                  <div className="w-1.5 h-1/2 bg-linear-to-t from-transparent to-gold-500 origin-bottom relative">
                     <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 bg-black border-t-4 border-gold-400 rounded-sm flex items-center justify-center shadow-[0_0_15px_rgba(251,191,36,0.6)]">
                        <span className="w-1.5 h-1 bg-gold-600"></span>
                     </div>
                  </div>
                </div>
              </div>

              <div className="w-4 h-4 bg-white rounded-full z-20 shadow-lg relative">
                <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-0.5 h-32 bg-white/30 rounded-t-full -z-10"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 text-center">
                <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Sudut Kiblat</p>
                <p className="text-2xl font-black text-gold-400">{Math.round(qiblaAngle)}°</p>
              </div>
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 text-center">
                <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">Arah HP</p>
                <p className="text-2xl font-black text-white">{heading}°</p>
              </div>
              <div className="col-span-2 bg-emerald-900/20 p-4 rounded-2xl border border-emerald-500/20 text-center flex flex-col items-center">
                <p className="text-xs text-emerald-400/80 mb-1 uppercase tracking-wider">Jarak ke Ka&apos;bah</p>
                <p className="text-xl font-bold text-emerald-300">{distance.toLocaleString("id-ID")} KM</p>
              </div>
            </div>

          </div>
        )}
      </div>

      {permissionGranted && (
        <p className="text-center text-[10px] text-gray-500 px-8 pb-4">
          *Penting: Jauhkan HP dari benda magnetik. Putar HP membentuk angka 8 di udara jika jarum kompas terasa kurang akurat.
        </p>
      )}
    </div>
  );
}