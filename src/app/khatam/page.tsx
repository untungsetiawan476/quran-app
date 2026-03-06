"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BiArrowBack, BiTargetLock, BiCheckCircle, BiReset, BiBookOpen } from 'react-icons/bi';
import { BsStars } from 'react-icons/bs';

interface KhatamPlan {
  startDate: string;
  targetDays: number;
  itemsPerDay: number; // Sekarang ini adalah jumlah AYAT per hari
  currentDay: number;
  completedItems: number; // Jumlah ayat yang sudah dibaca
  isTodayDone: boolean;
  lastReadDate: string;
}

interface ConfettiPiece {
  left: string;
  color: string;
  duration: string;
  delay: string;
  rotation: string;
}

// ==========================================================
// DATA KAMUS AL-QUR'AN (Untuk konversi Ayat Global ke Surat)
// ==========================================================
const TOTAL_AYAHS = 6236; 

const surahNames = [
  "Al-Fatihah","Al-Baqarah","Ali 'Imran","An-Nisa'","Al-Ma'idah","Al-An'am","Al-A'raf","Al-Anfal","At-Taubah","Yunus","Hud","Yusuf","Ar-Ra'd","Ibrahim","Al-Hijr","An-Nahl","Al-Isra'","Al-Kahf","Maryam","Taha","Al-Anbiya'","Al-Hajj","Al-Mu'minun","An-Nur","Al-Furqan","Asy-Syu'ara'","An-Naml","Al-Qasas","Al-'Ankabut","Ar-Rum","Luqman","As-Sajdah","Al-Ahzab","Saba'","Fatir","Yasin","As-Saffat","Sad","Az-Zumar","Ghafir","Fussilat","Asy-Syura","Az-Zukhruf","Ad-Dukhan","Al-Jasiyah","Al-Ahqaf","Muhammad","Al-Fath","Al-Hujurat","Qaf","Az-Zariyat","At-Tur","An-Najm","Al-Qamar","Ar-Rahman","Al-Waqi'ah","Al-Hadid","Al-Mujadilah","Al-Hasyr","Al-Mumtahanah","As-Saff","Al-Jumu'ah","Al-Munafiqun","At-Taghabun","At-Talaq","At-Tahrim","Al-Mulk","Al-Qalam","Al-Haqqah","Al-Ma'arij","Nuh","Al-Jinn","Al-Muzzammil","Al-Muddassir","Al-Qiyamah","Al-Insan","Al-Mursalat","An-Naba'","An-Nazi'at","'Abasa","At-Takwir","Al-Infitar","Al-Mutaffifin","Al-Insyiqaq","Al-Buruj","At-Tariq","Al-A'la","Al-Ghasyiyah","Al-Fajr","Al-Balad","Asy-Syams","Al-Lail","Ad-Duha","Asy-Syarh","At-Tin","Al-'Alaq","Al-Qadr","Al-Bayyinah","Az-Zalzalah","Al-'Adiyat","Al-Qari'ah","At-Takasur","Al-'Asr","Al-Humazah","Al-Fil","Quraisy","Al-Ma'un","Al-Kausar","Al-Kafirun","An-Nasr","Al-Lahab","Al-Ikhlas","Al-Falaq","An-Nas"
];

const ayahCounts = [
  7,286,200,176,120,165,206,75,129,109,111,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6
];

// Fungsi cerdas mengubah "Ayat ke-250" menjadi "Surat Al-Baqarah ayat 243"
function getSurahAyah(globalIndex: number) {
  if (globalIndex <= 0) return { surahName: "Al-Fatihah", ayat: 1 };
  if (globalIndex > TOTAL_AYAHS) return { surahName: "An-Nas", ayat: 6 };
  
  let current = globalIndex;
  for (let i = 0; i < 114; i++) {
    if (current <= ayahCounts[i]) {
      return { surahName: surahNames[i], ayat: current };
    }
    current -= ayahCounts[i];
  }
  return { surahName: "An-Nas", ayat: 6 };
}

export default function KhatamPlannerPage() {
  const [plan, setPlan] = useState<KhatamPlan | null>(null);
  const [targetDays, setTargetDays] = useState<number>(30);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState<ConfettiPiece[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedPlan = localStorage.getItem('quran_khatam_plan_v2'); // Ganti key agar target lama yg pakai halaman kerefresh
    
    setTimeout(() => {
      if (savedPlan) {
        const parsed: KhatamPlan = JSON.parse(savedPlan);
        
        const today = new Date().toDateString();
        if (parsed.lastReadDate !== today && parsed.isTodayDone) {
          parsed.isTodayDone = false;
          parsed.currentDay += 1; 
          localStorage.setItem('quran_khatam_plan_v2', JSON.stringify(parsed));
        }
        setPlan(parsed);
      }
      setIsLoaded(true);
    }, 0);
  }, []);

  const handleCreatePlan = () => {
    const itemsPerDay = Math.ceil(TOTAL_AYAHS / targetDays);
    const newPlan: KhatamPlan = {
      startDate: new Date().toDateString(),
      targetDays,
      itemsPerDay,
      currentDay: 1,
      completedItems: 0,
      isTodayDone: false,
      lastReadDate: ''
    };
    setPlan(newPlan);
    localStorage.setItem('quran_khatam_plan_v2', JSON.stringify(newPlan));
  };

  const handleCompleteToday = () => {
    if (!plan) return;
    
    const pieces = Array.from({ length: 50 }).map(() => ({
      left: `${Math.random() * 100}%`,
      color: ['#fbbf24', '#34d399', '#f87171', '#60a5fa', '#a78bfa'][Math.floor(Math.random() * 5)],
      duration: `${Math.random() * 2 + 1}s`,
      delay: `${Math.random() * 0.2}s`,
      rotation: `rotate(${Math.random() * 360}deg)`
    }));
    
    setConfettiPieces(pieces);
    setShowConfetti(true);
    
    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    const updatedPlan = {
      ...plan,
      completedItems: Math.min(plan.completedItems + plan.itemsPerDay, TOTAL_AYAHS),
      isTodayDone: true,
      lastReadDate: new Date().toDateString()
    };
    
    setPlan(updatedPlan);
    localStorage.setItem('quran_khatam_plan_v2', JSON.stringify(updatedPlan));
  };

  const handleReset = () => {
    if(confirm('Yakin ingin mereset dan mengulang target Khatam dari awal?')) {
      setPlan(null);
      localStorage.removeItem('quran_khatam_plan_v2');
    }
  };

  if (!isLoaded) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900"></div>;

  const progressPercent = plan ? Math.min(Math.round((plan.completedItems / TOTAL_AYAHS) * 100), 100) : 0;
  const sisaAyat = plan ? TOTAL_AYAHS - plan.completedItems : TOTAL_AYAHS;
  
  // Hitung detail surat dan ayat untuk dibaca hari ini
  const startRead = plan ? getSurahAyah(plan.completedItems + 1) : null;
  const endRead = plan ? getSurahAyah(Math.min(plan.completedItems + plan.itemsPerDay, TOTAL_AYAHS)) : null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32 relative overflow-hidden">
      
      {/* --- EFEK CONFETTI SULTAN --- */}
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
          {confettiPieces.map((piece, i) => (
            <div 
              key={i} 
              className="absolute w-3 h-3 rounded-sm animate-confetti"
              style={{
                left: piece.left,
                top: `-5%`,
                backgroundColor: piece.color,
                animationDuration: piece.duration,
                animationDelay: piece.delay,
                transform: piece.rotation
              }}
            ></div>
          ))}
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-8 rounded-3xl text-center shadow-2xl animate-fade-in-up border-2 border-gold-400 scale-110">
            <div className="text-6xl mb-4 animate-bounce">🏆</div>
            <h2 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mb-2">Alhamdulillah!</h2>
            <p className="text-gray-600 dark:text-gray-300 font-medium">Target hari ini selesai. Istiqomah terus ya!</p>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-emerald-600 dark:bg-emerald-800 pt-12 pb-24 px-6 rounded-b-[2.5rem] shadow-lg relative overflow-hidden">
        <Link href="/" className="absolute top-12 left-6 text-white p-2 hover:bg-white/20 rounded-full transition z-20">
          <BiArrowBack size={24} />
        </Link>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex flex-col items-center text-center mt-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 border border-white/30 shadow-inner">
            <BiTargetLock size={36} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Rencana Khatam</h1>
          <p className="text-emerald-100 text-sm">Target jelas, ibadah tuntas.</p>
        </div>
      </div>

      <div className="p-5 -mt-16 relative z-20 max-w-md mx-auto">
        
        {!plan ? (
          /* ========================================== */
          /* TAMPILAN SETUP (BUAT RENCANA BARU)         */
          /* ========================================== */
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 animate-fade-in-up">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <BsStars className="text-gold-500 mr-2" size={20} /> Target Khatam Anda
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Pilih dalam berapa hari Anda ingin menyelesaikan bacaan 30 Juz (6.236 Ayat).
            </p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[15, 30, 60, 90].map((hari) => (
                <button 
                  key={hari}
                  onClick={() => setTargetDays(hari)}
                  className={`py-4 rounded-2xl border-2 font-bold transition-all ${
                    targetDays === hari 
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : 'border-gray-100 dark:border-gray-700 bg-transparent text-gray-500 hover:border-emerald-200'
                  }`}
                >
                  {hari} Hari
                  <div className="text-xs font-normal mt-1 opacity-70">~{Math.ceil(TOTAL_AYAHS/hari)} ayat/hari</div>
                </button>
              ))}
            </div>

            <button 
              onClick={handleCreatePlan}
              className="w-full bg-linear-to-r from-emerald-500 to-teal-600 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center text-lg"
            >
              Mulai Perjalanan Khatam
            </button>
          </div>
        ) : (
          /* ========================================== */
          /* TAMPILAN DASHBOARD (PROGRESS KHATAM)       */
          /* ========================================== */
          <div className="space-y-6">
            
            {/* KARTU PROGRESS LINGKARAN */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center relative overflow-hidden animate-fade-in-up">
              <div className="absolute top-0 right-0 p-4">
                <button onClick={handleReset} className="text-gray-400 hover:text-red-500 transition-colors" title="Reset Rencana">
                  <BiReset size={24} />
                </button>
              </div>

              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-6">
                Progress Keseluruhan
              </h3>

              {/* Progress Ring SVG */}
              <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="transparent" strokeWidth="8" className="stroke-gray-100 dark:stroke-gray-700" />
                  <circle 
                    cx="50" cy="50" r="45" fill="transparent" strokeWidth="8" 
                    className="stroke-gold-400 transition-all duration-1000 ease-out"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progressPercent / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-black text-gray-800 dark:text-white">{progressPercent}%</span>
                  <span className="text-[10px] text-gray-500 uppercase font-bold mt-1">Selesai</span>
                </div>
              </div>

              <div className="flex w-full justify-between text-center divide-x divide-gray-100 dark:divide-gray-700 border-t border-gray-100 dark:border-gray-700 pt-4 mt-2">
                <div className="flex-1">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Sudah Dibaca</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">{plan.completedItems} Ayat</p>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Sisa Target</p>
                  <p className="font-bold text-amber-500">{sisaAyat} Ayat</p>
                </div>
              </div>
            </div>

            {/* KARTU TARGET HARI INI */}
            <div className="bg-linear-to-br from-islamic-700 to-islamic-900 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                <BiBookOpen size={120} />
              </div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-5">
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Hari ke-{plan.currentDay} dari {plan.targetDays}
                  </span>
                  {plan.isTodayDone && <BiCheckCircle size={28} className="text-gold-400" />}
                </div>

                {progressPercent === 100 ? (
                   <h2 className="text-3xl font-black mb-6">Khatam!</h2>
                ) : (
                  <>
                    <p className="text-islamic-100 text-xs font-medium uppercase tracking-widest mb-2">BACAAN HARI INI:</p>
                    <div className="mb-6 space-y-1">
                      <h2 className="text-xl font-bold leading-snug">
                         Mulai: <span className="text-gold-300">{startRead?.surahName} (Ayat {startRead?.ayat})</span>
                      </h2>
                      <h2 className="text-xl font-bold leading-snug">
                         Selesai: <span className="text-gold-300">{endRead?.surahName} (Ayat {endRead?.ayat})</span>
                      </h2>
                    </div>
                  </>
                )}

                {progressPercent === 100 ? (
                  <div className="bg-gold-500 text-white font-bold py-4 rounded-2xl text-center shadow-lg border-2 border-gold-400">
                    🎉 Masya Allah, Anda telah Khatam!
                  </div>
                ) : plan.isTodayDone ? (
                  <div className="bg-white/20 text-white font-bold py-4 rounded-2xl text-center border border-white/30 flex items-center justify-center">
                    <BiCheckCircle size={24} className="mr-2 text-gold-400" /> Target Hari Ini Selesai
                  </div>
                ) : (
                  <button 
                    onClick={handleCompleteToday}
                    className="w-full bg-gold-500 hover:bg-gold-400 text-islamic-900 font-black py-4 rounded-2xl shadow-lg hover:shadow-gold-500/50 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center text-lg"
                  >
                    Tandai Selesai Hari Ini
                  </button>
                )}
              </div>
            </div>
            
            <Link href="/quran" className="w-full bg-white dark:bg-gray-800 text-islamic-600 dark:text-emerald-400 font-bold py-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center transition-all hover:bg-gray-50 dark:hover:bg-gray-700">
              <BiBookOpen size={20} className="mr-2" /> Buka Al-Qur&apos;an Sekarang
            </Link>

          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti { animation: confetti linear forwards; }
      `}} />
    </div>
  );
}
