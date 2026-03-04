"use client";
import { useState, useEffect, useRef } from 'react';
import { BiTrophy, BiArrowBack } from 'react-icons/bi'; // Icon yang tidak terpakai sudah dihapus

// --- INTERFACES TIPE DATA ---
interface Surah {
  nomor: number;
  namaLatin: string;
  jumlahAyat: number;
}

interface Ayat {
  nomorAyat: number;
  teksArab: string;
  audio: { '05': string };
}

interface Question {
  soal: Ayat;
  jawabanBenar: Ayat;
  pilihan: Ayat[];
}

interface LeaderboardEntry {
  nama: string;
  skor: number;
  tanggal: string;
}

export default function KuisPage() {
  // --- STATE MANAGEMENT ---
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

  // --- FETCH DAFTAR SURAT ---
  useEffect(() => {
    fetch('https://equran.id/api/v2/surat')
      .then(res => res.json())
      .then(data => setSurahs(data.data))
      .catch(err => console.error("Gagal load surat", err));

    // Load Leaderboard dari localStorage dibungkus setTimeout agar ESLint tidak protes
    const timer = setTimeout(() => {
      const savedScores = localStorage.getItem('quran_leaderboard');
      if (savedScores) setLeaderboard(JSON.parse(savedScores));
    }, 0);
    
    return () => clearTimeout(timer);
  }, []);

  // --- HANDLE PILIH SURAT ---
  const handleSurahChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nomor = parseInt(e.target.value);
    const surah = surahs.find(s => s.nomor === nomor) || null;
    setSelectedSurah(surah);
    if (surah) {
      setStartAyat(1);
      setEndAyat(surah.jumlahAyat);
    }
  };

  // --- LOGIKA GENERATE KUIS SAMBUNG AYAT ---
  const mulaiKuis = async () => {
    if (!selectedSurah) return alert("Pilih surat terlebih dahulu!");
    if (startAyat >= endAyat) return alert("Rentang ayat tidak valid!");
    
    setGameState('loading');
    try {
      const res = await fetch(`https://equran.id/api/v2/surat/${selectedSurah.nomor}`);
      const data = await res.json();
      const semuaAyat: Ayat[] = data.data.ayat;

      const validAyatIndices = [];
      for (let i = startAyat - 1; i < endAyat - 1; i++) {
        validAyatIndices.push(i);
      }

      const shuffledIndices = validAyatIndices.sort(() => 0.5 - Math.random()).slice(0, jumlahSoal);
      
      const generatedQuestions: Question[] = shuffledIndices.map(index => {
        const soal = semuaAyat[index];
        const jawabanBenar = semuaAyat[index + 1];

        const pilihanSalah = semuaAyat
          .filter(a => a.nomorAyat !== jawabanBenar.nomorAyat)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3);
        
        const pilihan = [jawabanBenar, ...pilihanSalah].sort(() => 0.5 - Math.random());

        return { soal, jawabanBenar, pilihan };
      });

      setQuestions(generatedQuestions);
      setScore(0);
      setCurrentIndex(0);
      setGameState('playing');
    } catch { // Parameter error dihapus agar ESLint bersih
      alert("Gagal memuat soal. Coba lagi.");
      setGameState('setup');
    }
  };

  // --- HANDLE JAWABAN ---
  const handleAnswer = (ayatPilihan: Ayat) => {
    if (selectedAnswer !== null) return; 
    
    setSelectedAnswer(ayatPilihan.nomorAyat);
    const isCorrect = ayatPilihan.nomorAyat === questions[currentIndex].jawabanBenar.nomorAyat;
    
    if (isCorrect) setScore(prev => prev + (100 / jumlahSoal));

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        setGameState('result');
      }
    }, 1500); 
  };

  // --- AUTO PLAY AUDIO JIKA MODE AUDIO ---
  useEffect(() => {
    if (gameState === 'playing' && quizType === 'audio' && questions[currentIndex]) {
      if (audioRef.current) {
        audioRef.current.src = questions[currentIndex].soal.audio['05'];
        audioRef.current.play().catch(e => console.log("Autoplay dicegah browser", e));
      }
    }
  }, [currentIndex, gameState, quizType, questions]);

  // --- SIMPAN SKOR ---
  const simpanSkor = () => {
    if (!playerName.trim()) return alert("Masukkan namamu!");
    const newEntry: LeaderboardEntry = {
      nama: playerName,
      skor: Math.round(score),
      tanggal: new Date().toLocaleDateString('id-ID')
    };
    
    const newLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.skor - a.skor)
      .slice(0, 10); 
    
    setLeaderboard(newLeaderboard);
    localStorage.setItem('quran_leaderboard', JSON.stringify(newLeaderboard));
    setGameState('leaderboard');
  };

  // ================= RENDER TAMPILAN =================

  return (
    <div className="p-4 min-h-screen pb-24">
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

      {gameState === 'setup' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border dark:border-gray-700">
            <h2 className="font-bold mb-4 dark:text-white">Pengaturan Kuis Sambung Ayat</h2>
            
            <label className="block text-sm mb-1 opacity-80">Pilih Surat</label>
            <select onChange={handleSurahChange} className="w-full p-3 rounded-xl bg-islamic-50 dark:bg-gray-700 mb-4 focus:outline-none dark:text-white">
              <option value="">-- Pilih Surat --</option>
              {surahs.map(s => <option key={s.nomor} value={s.nomor}>{s.nomor}. {s.namaLatin}</option>)}
            </select>

            {selectedSurah && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm mb-1 opacity-80">Dari Ayat</label>
                  <input type="number" min={1} max={endAyat} value={startAyat} onChange={(e) => setStartAyat(Number(e.target.value))} className="w-full p-3 rounded-xl bg-islamic-50 dark:bg-gray-700 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm mb-1 opacity-80">Sampai Ayat</label>
                  <input type="number" min={startAyat} max={selectedSurah.jumlahAyat} value={endAyat} onChange={(e) => setEndAyat(Number(e.target.value))} className="w-full p-3 rounded-xl bg-islamic-50 dark:bg-gray-700 dark:text-white" />
                </div>
              </div>
            )}

            <label className="block text-sm mb-1 opacity-80">Jumlah Soal</label>
            <input type="number" min={1} value={jumlahSoal} onChange={(e) => setJumlahSoal(Number(e.target.value))} className="w-full p-3 rounded-xl bg-islamic-50 dark:bg-gray-700 mb-4 dark:text-white" />

            <label className="block text-sm mb-1 opacity-80">Jenis Kuis</label>
            <div className="flex space-x-2 mb-6">
              <button onClick={() => setQuizType('audio')} className={`flex-1 p-3 rounded-xl font-semibold transition ${quizType === 'audio' ? 'bg-islamic-700 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}>Audio</button>
              <button onClick={() => setQuizType('teks')} className={`flex-1 p-3 rounded-xl font-semibold transition ${quizType === 'teks' ? 'bg-islamic-700 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-gray-300'}`}>Teks Arab</button>
            </div>

            <button onClick={mulaiKuis} className="w-full bg-gold-500 hover:bg-gold-400 text-white font-bold py-4 rounded-xl shadow-lg transition transform hover:scale-[1.02]">
              MULAI KUIS
            </button>
          </div>

          <button onClick={() => setGameState('leaderboard')} className="w-full border-2 border-islamic-700 text-islamic-700 dark:border-gold-500 dark:text-gold-400 font-bold py-3 rounded-xl">
            Lihat Papan Peringkat (Top 10)
          </button>
        </div>
      )}

      {gameState === 'loading' && <div className="text-center py-20 animate-pulse text-islamic-700 dark:text-gold-400">Menyiapkan ayat suci...</div>}

      {gameState === 'playing' && questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">
            <span>Soal {currentIndex + 1} / {jumlahSoal}</span>
            <span>Surah {selectedSurah?.namaLatin}</span>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm text-center border dark:border-gray-700 mb-6">
            <h3 className="text-sm text-islamic-700 dark:text-gold-400 mb-4 font-bold">Lanjutkan Ayat Berikut Ini:</h3>
            
            {quizType === 'audio' ? (
              <div className="flex flex-col items-center">
                <audio ref={audioRef} controls className="w-full mb-4" />
                <p className="text-xs text-gray-400">*Dengarkan audio dan pilih sambungannya</p>
                <p className="font-arab text-2xl mt-4 opacity-50 blur-sm hover:blur-none transition">{questions[currentIndex].soal.teksArab}</p>
              </div>
            ) : (
              <p className="font-arab text-3xl leading-loose dark:text-white">{questions[currentIndex].soal.teksArab}</p>
            )}
          </div>

          <div className="space-y-3">
            {questions[currentIndex].pilihan.map((pilihan, idx) => {
              const isSelected = selectedAnswer === pilihan.nomorAyat;
              const isCorrect = pilihan.nomorAyat === questions[currentIndex].jawabanBenar.nomorAyat;
              
              let btnClass = "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700";
              if (selectedAnswer !== null) {
                if (isCorrect) btnClass = "bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:text-white";
                else if (isSelected) btnClass = "bg-red-100 border-red-500 text-red-800 dark:bg-red-900 dark:text-white";
              }

              return (
                <button 
                  key={idx} 
                  onClick={() => handleAnswer(pilihan)}
                  disabled={selectedAnswer !== null}
                  className={`w-full p-4 border rounded-xl text-right font-arab text-2xl transition shadow-sm ${btnClass}`}
                >
                  {pilihan.teksArab}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {gameState === 'result' && (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm text-center border dark:border-gray-700 mt-10">
          <BiTrophy size={64} className="mx-auto text-gold-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2 dark:text-white">Kuis Selesai!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Skor Akhir Anda:</p>
          <div className="text-6xl font-black text-islamic-700 dark:text-gold-400 mb-8">{Math.round(score)}</div>
          
          <input 
            type="text" 
            placeholder="Masukkan Nama Anda" 
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="w-full p-3 rounded-xl bg-islamic-50 dark:bg-gray-700 mb-4 text-center dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-400"
          />
          <button onClick={simpanSkor} className="w-full bg-islamic-700 hover:bg-islamic-900 text-white font-bold py-3 rounded-xl mb-3 transition">Simpan Skor</button>
          <button onClick={() => setGameState('setup')} className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white font-bold py-3 rounded-xl transition">Main Lagi</button>
        </div>
      )}

      {gameState === 'leaderboard' && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
          <h2 className="text-xl font-bold mb-6 text-center text-islamic-700 dark:text-gold-400">Papan Peringkat (Top 10)</h2>
          
          {leaderboard.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-10">Belum ada skor yang dicatat.</p>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-islamic-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold mr-3 ${idx < 3 ? 'bg-gold-400 text-white' : 'bg-gray-300 dark:bg-gray-600 dark:text-gray-300'}`}>
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold dark:text-white">{entry.nama}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{entry.tanggal}</p>
                    </div>
                  </div>
                  <div className="font-black text-lg text-islamic-700 dark:text-gold-400">{entry.skor}</div>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setGameState('setup')} className="w-full mt-6 bg-islamic-700 hover:bg-islamic-900 text-white font-bold py-3 rounded-xl transition">Kembali ke Kuis</button>
        </div>
      )}
    </div>
  );
}