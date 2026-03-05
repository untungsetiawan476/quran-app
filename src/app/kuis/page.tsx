"use client";
import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BiTrophy, BiArrowBack, BiShareAlt, BiRocket } from 'react-icons/bi';

// --- INTERFACES TIPE DATA ---
interface Surah { nomor: number; namaLatin: string; jumlahAyat: number; }
interface Ayat { nomorAyat: number; teksArab: string; audio: { '05': string }; }
interface Question { soal: Ayat; jawabanBenar: Ayat; pilihan: Ayat[]; }
interface LeaderboardEntry { nama: string; skor: number; tanggal: string; }

// Komponen Pembungkus untuk menangani searchParams di Next.js
function KuisContent() {
  const searchParams = useSearchParams();
  const challengerName = searchParams.get('challenger');
  const challengerScore = searchParams.get('score');

  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [startAyat, setStartAyat] = useState(1);
  const [endAyat, setEndAyat] = useState(1);
  const [jumlahSoal, setJumlahSoal] = useState(5);
  const [quizType, setQuizType] = useState<'teks' | 'audio'>('audio');
  
  const [gameState, setGameState] = useState<'setup' | 'loading' | 'playing' | 'result' | 'leaderboard'>('setup');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch('https://equran.id/api/v2/surat')
      .then(res => res.json())
      .then(data => setSurahs(data.data))
      .catch(err => console.error("Gagal load surat", err));

    const timer = setTimeout(() => {
      const savedScores = localStorage.getItem('quran_leaderboard');
      if (savedScores) setLeaderboard(JSON.parse(savedScores));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSurahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nomor = parseInt(e.target.value);
    const surah = surahs.find(s => s.nomor === nomor) || null;
    setSelectedSurah(surah);
    if (surah) { setStartAyat(1); setEndAyat(surah.jumlahAyat); }
  };

  const mulaiKuis = async () => {
    if (!selectedSurah) return alert("Pilih surat terlebih dahulu!");
    setGameState('loading');
    try {
      const res = await fetch(`https://equran.id/api/v2/surat/${selectedSurah.nomor}`);
      const data = await res.json();
      const semuaAyat: Ayat[] = data.data.ayat;
      const validAyatIndices = [];
      for (let i = startAyat - 1; i < endAyat - 1; i++) validAyatIndices.push(i);
      const shuffledIndices = validAyatIndices.sort(() => 0.5 - Math.random()).slice(0, jumlahSoal);
      
      const generatedQuestions: Question[] = shuffledIndices.map(index => {
        const soal = semuaAyat[index];
        const jawabanBenar = semuaAyat[index + 1];
        const pilihanSalah = semuaAyat.filter(a => a.nomorAyat !== jawabanBenar.nomorAyat).sort(() => 0.5 - Math.random()).slice(0, 3);
        const pilihan = [jawabanBenar, ...pilihanSalah].sort(() => 0.5 - Math.random());
        return { soal, jawabanBenar, pilihan };
      });

      setQuestions(generatedQuestions);
      setScore(0);
      setCurrentIndex(0);
      setGameState('playing');
    } catch {
      alert("Gagal memuat soal. Coba lagi.");
      setGameState('setup');
    }
  };

  const handleAnswer = (ayatPilihan: Ayat) => {
    if (selectedAnswer !== null) return; 
    setSelectedAnswer(ayatPilihan.nomorAyat);
    const isCorrect = ayatPilihan.nomorAyat === questions[currentIndex].jawabanBenar.nomorAyat;
    if (isCorrect) setScore(prev => prev + (100 / jumlahSoal));

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
      } else { setGameState('result'); }
    }, 1500); 
  };

  useEffect(() => {
    if (gameState === 'playing' && quizType === 'audio' && questions[currentIndex]) {
      if (audioRef.current) {
        audioRef.current.src = questions[currentIndex].soal.audio['05'];
        audioRef.current.play().catch(e => console.log("Autoplay dicegah browser", e));
      }
    }
  }, [currentIndex, gameState, quizType, questions]);

  const simpanSkor = () => {
    if (!playerName.trim()) return alert("Masukkan namamu!");
    const newEntry: LeaderboardEntry = {
      nama: playerName,
      skor: Math.round(score),
      tanggal: new Date().toLocaleDateString('id-ID')
    };
    const newLeaderboard = [...leaderboard, newEntry].sort((a, b) => b.skor - a.skor).slice(0, 10); 
    setLeaderboard(newLeaderboard);
    localStorage.setItem('quran_leaderboard', JSON.stringify(newLeaderboard));
    setGameState('leaderboard');
  };

  // --- LOGIKA VIRAL SHARE ---
  const handleViralShare = () => {
    if (!playerName.trim()) return alert("Masukkan namamu dulu sebelum menantang teman!");
    
    const finalScore = Math.round(score);
    const surahName = selectedSurah?.namaLatin || "Al-Qur'an";
    const linkWebsite = "https://quran-app-two-eta.vercel.app/kuis";
    
    // Link ajaib yang membawa nama penantang dan skornya
    const linkTantangan = `${linkWebsite}?challenger=${encodeURIComponent(playerName)}&score=${finalScore}`;
    
    let pesan = "";
    if (challengerName && finalScore > Number(challengerScore)) {
      pesan = `*SAYA MENANG!* 🏆\n\nBerhasil mengalahkan tantangan *${challengerName}*! \nSkor saya: ${finalScore} di Kuis Surah ${surahName}.\n\nKamu berani coba kalahkan saya? 😎\nKlik: ${linkTantangan}`;
    } else {
      pesan = `*TANTANGAN KUIS QUR'AN* 🏆\n\n*${playerName}* menantang kamu!\nSkor saya: ${finalScore} di Kuis Surah ${surahName}.\n\nBisakah kamu mengalahkan skor saya? 😎\nMainkan di sini: ${linkTantangan}`;
    }

    if (navigator.share) {
      navigator.share({ title: 'Tantangan Kuis', text: pesan }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(pesan)}`, '_blank');
    }
  };

  return (
    <div className="p-4 min-h-screen pb-24 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-islamic-900 dark:text-white flex items-center">
          <BiTrophy className="mr-2 text-gold-500" /> Kuis & Peringkat
        </h1>
        {gameState !== 'setup' && (
          <button onClick={() => setGameState('setup')} className="text-islamic-700 dark:text-islamic-400 text-sm flex items-center">
            <BiArrowBack className="mr-1"/> Batal
          </button>
        )}
      </div>

      {/* ALERT TANTANGAN (Hanya muncul jika buka dari link teman) */}
      {gameState === 'setup' && challengerName && (
        <div className="bg-linear-to-r from-gold-50 to-white dark:from-gray-800 dark:to-gray-900 border-2 border-dashed border-gold-400 p-5 rounded-3xl mb-8 animate-bounce shadow-lg">
          <div className="flex items-center">
            <div className="bg-gold-500 text-white p-2 rounded-full mr-4 shadow-md">
               <BiRocket size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gold-600 dark:text-gold-400 uppercase tracking-widest">Tantangan Aktif!</p>
              <p className="text-sm font-bold text-gray-800 dark:text-white">
                <span className="text-islamic-600 dark:text-gold-400">{challengerName}</span> menantangmu kalahkan skor <span className="text-islamic-600 dark:text-gold-400">{challengerScore}</span>!
              </p>
            </div>
          </div>
        </div>
      )}

      {gameState === 'setup' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-sm border dark:border-gray-700">
            <h2 className="font-bold mb-4 dark:text-white">Pengaturan Kuis</h2>
            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Pilih Surat</label>
            <select onChange={handleSurahChange} className="w-full p-3.5 rounded-2xl bg-islamic-50 dark:bg-gray-700 mb-4 focus:outline-none dark:text-white border-none shadow-inner">
              <option value="">-- Pilih Surat --</option>
              {surahs.map(s => <option key={s.nomor} value={s.nomor}>{s.nomor}. {s.namaLatin}</option>)}
            </select>
            {selectedSurah && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Dari Ayat</label>
                  <input type="number" min={1} max={endAyat} value={startAyat} onChange={(e) => setStartAyat(Number(e.target.value))} className="w-full p-3 rounded-2xl bg-islamic-50 dark:bg-gray-700 dark:text-white shadow-inner" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">Sampai Ayat</label>
                  <input type="number" min={startAyat} max={selectedSurah.jumlahAyat} value={endAyat} onChange={(e) => setEndAyat(Number(e.target.value))} className="w-full p-3 rounded-2xl bg-islamic-50 dark:bg-gray-700 dark:text-white shadow-inner" />
                </div>
              </div>
            )}
            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Jumlah Soal</label>
            <input type="number" min={1} value={jumlahSoal} onChange={(e) => setJumlahSoal(Number(e.target.value))} className="w-full p-3.5 rounded-2xl bg-islamic-50 dark:bg-gray-700 mb-4 dark:text-white shadow-inner" />
            <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Jenis Kuis</label>
            <div className="flex space-x-2 mb-8">
              <button onClick={() => setQuizType('audio')} className={`flex-1 p-3 rounded-2xl font-bold transition-all ${quizType === 'audio' ? 'bg-islamic-700 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>Audio</button>
              <button onClick={() => setQuizType('teks')} className={`flex-1 p-3 rounded-2xl font-bold transition-all ${quizType === 'teks' ? 'bg-islamic-700 text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}>Teks</button>
            </div>
            <button onClick={mulaiKuis} className="w-full bg-linear-to-br from-gold-400 to-gold-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-gold-500/20 active:scale-95 transition-all tracking-widest">MULAI KUIS</button>
          </div>
        </div>
      )}

      {gameState === 'loading' && <div className="text-center py-20 animate-pulse text-islamic-700 dark:text-gold-400 font-bold">Menyiapkan ayat suci...</div>}

      {gameState === 'playing' && questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">
            <span>Soal {currentIndex + 1} / {jumlahSoal}</span>
            <span>Surah {selectedSurah?.namaLatin}</span>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-sm text-center border dark:border-gray-700 mb-6 relative overflow-hidden">
             {quizType === 'audio' ? (
              <div className="flex flex-col items-center">
                <audio ref={audioRef} controls className="w-full mb-6" />
                <p className="font-arab text-2xl mt-4 opacity-50 blur-sm">Pilih sambungan ayat di atas...</p>
              </div>
            ) : (
              <p className="font-arab text-3xl leading-loose dark:text-white">{questions[currentIndex].soal.teksArab}</p>
            )}
          </div>
          <div className="space-y-3">
            {questions[currentIndex].pilihan.map((pilihan, idx) => {
              const isSelected = selectedAnswer === pilihan.nomorAyat;
              const isCorrect = pilihan.nomorAyat === questions[currentIndex].jawabanBenar.nomorAyat;
              let btnClass = "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700";
              if (selectedAnswer !== null) {
                if (isCorrect) btnClass = "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/30 scale-105 z-10";
                else if (isSelected) btnClass = "bg-red-500 border-red-500 text-white shadow-lg shadow-red-500/30";
              }
              return (
                <button key={idx} onClick={() => handleAnswer(pilihan)} disabled={selectedAnswer !== null} className={`w-full p-5 border rounded-2xl text-right font-arab text-2xl transition-all duration-300 shadow-sm ${btnClass}`}>
                  {pilihan.teksArab}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {gameState === 'result' && (
        <div className="bg-white dark:bg-gray-800 p-10 rounded-[3rem] shadow-xl text-center border dark:border-gray-700 mt-6 relative overflow-hidden">
          <BiTrophy size={80} className="mx-auto text-gold-500 mb-4 animate-bounce" />
          <h2 className="text-2xl font-black mb-1 dark:text-white uppercase tracking-tighter">Mabruk!</h2>
          <p className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest">Skor Akhir Anda</p>
          <div className="text-7xl font-black text-islamic-700 dark:text-gold-400 mb-8">{Math.round(score)}</div>
          
          <input type="text" placeholder="Masukkan Namamu" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="w-full p-4 rounded-2xl bg-islamic-50 dark:bg-gray-700 mb-4 text-center dark:text-white focus:outline-none focus:ring-4 focus:ring-gold-400/50 shadow-inner font-bold" />
          
          <div className="space-y-3">
            <button onClick={simpanSkor} className="w-full bg-islamic-700 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all">Simpan di Peringkat</button>
            <button onClick={handleViralShare} className="w-full bg-linear-to-r from-green-500 to-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex justify-center items-center">
              <BiShareAlt className="mr-2" size={20} /> Tantang Teman di WA
            </button>
            <button onClick={() => setGameState('setup')} className="w-full text-gray-400 font-bold py-3">Main Lagi</button>
          </div>
        </div>
      )}

      {gameState === 'leaderboard' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-[2.5rem] shadow-sm border dark:border-gray-700">
          <h2 className="text-xl font-black mb-6 text-center text-islamic-700 dark:text-gold-400 uppercase tracking-widest">Top 10 Penghafal</h2>
          <div className="space-y-3">
            {leaderboard.length === 0 ? <p className="text-center text-gray-400 py-10">Belum ada skor.</p> : 
              leaderboard.map((entry, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                  <div className="flex items-center">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold mr-3 ${idx < 3 ? 'bg-gold-400 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-600 text-gray-500'}`}>{idx + 1}</span>
                    <div><p className="font-bold dark:text-white text-sm">{entry.nama}</p><p className="text-[10px] text-gray-400">{entry.tanggal}</p></div>
                  </div>
                  <div className="font-black text-xl text-islamic-700 dark:text-gold-400">{entry.skor}</div>
                </div>
              ))}
          </div>
          <button onClick={() => setGameState('setup')} className="w-full mt-8 bg-islamic-700 text-white font-bold py-4 rounded-2xl">Kembali</button>
        </div>
      )}
    </div>
  );
}

// Wrapper utama dengan Suspense untuk Next.js
export default function KuisPageWrapper() {
  return (
    <Suspense fallback={<div>Memuat Kuis...</div>}>
      <KuisContent />
    </Suspense>
  );
}
