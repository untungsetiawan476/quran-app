"use client";
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { callGeminiAPI } from '@/lib/gemini';
import { BiArrowBack, BiSend, BiUser } from 'react-icons/bi';
import { BsStars } from 'react-icons/bs';

interface Message {
  id: string;
  role: 'user' | 'ai';
  content: string;
}

export default function KonsultasiPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'ai',
      content: 'Assalamu\'alaikum warahmatullah wabarakatuh. Saya adalah Asisten Ustadz AI. Ada yang bisa saya bantu atau ingin didiskusikan hari ini, saudaraku?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke pesan terbawah setiap kali ada pesan baru
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    
    // Tambahkan pesan user ke layar
    const newUserMsg: Message = { id: Date.now().toString(), role: 'user', content: userText };
    const newMessages = [...messages, newUserMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // 🧠 PROMPT ENGINEERING TINGKAT TINGGI
      // Kita "hipnotis" Gemini agar menjadi Ustadz, dan kita berikan riwayat chat-nya!
      const systemPrompt = `Anda adalah "Asisten Ustadz", seorang penasihat Islami virtual yang bijaksana, sabar, dan berpengetahuan luas tentang Al-Qur'an, Hadits, dan Fiqih sehari-hari. 
Tugas Anda:
1. Menjawab pertanyaan atau curhatan dengan bahasa Indonesia yang sangat santun, menenangkan hati, dan empatik.
2. Selalu sertakan dalil (Al-Qur'an atau Hadits) jika relevan, tapi jangan terlalu panjang.
3. Jangan gunakan format markdown yang rumit, gunakan paragraf biasa atau list sederhana.`;

      // Kita ambil 4 pesan terakhir agar AI ingat konteks obrolan (Memory)
      const historyContext = newMessages.slice(-4).map(m => `${m.role === 'user' ? 'Penanya' : 'Ustadz'}: ${m.content}`).join('\n\n');
      
      const fullPrompt = `${systemPrompt}\n\n--- RIWAYAT OBROLAN ---\n${historyContext}\n\nUstadz:`;

      const response = await callGeminiAPI(fullPrompt);
      
      // Bersihkan teks dari sisa-sisa markdown bold (**) jika ada agar rapi
      const cleanResponse = response.replace(/\*\*/g, '');

      // Tambahkan jawaban AI ke layar
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', content: cleanResponse }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'ai', 
        content: 'Mohon maaf, koneksi sedang sibuk. Silakan coba tanyakan kembali ya.' 
      }]);
    }
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col relative">
      {/* HEADER WA-STYLE */}
      <div className="fixed top-0 left-0 w-full z-40 bg-emerald-600 dark:bg-emerald-800 text-white p-4 flex items-center shadow-md">
        <button onClick={() => router.back()} className="mr-3 p-2 hover:bg-emerald-700 rounded-full transition-colors">
          <BiArrowBack size={24} />
        </button>
        <div className="flex items-center">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3 border border-white/30">
            <BsStars size={20} className="text-gold-300" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Asisten Ustadz</h1>
            <p className="text-[10px] text-emerald-200 flex items-center">
              <span className="w-2 h-2 bg-green-300 rounded-full mr-1.5 animate-pulse"></span> Online (AI)
            </p>
          </div>
        </div>
      </div>

      {/* AREA CHAT (Dengan Padding Bawah Ekstra agar tidak tertutup Bottom Nav & Input) */}
      <div className="flex-1 overflow-y-auto pt-24 pb-[160px] px-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
            {msg.role === 'ai' && (
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mr-2 shrink-0 self-end mb-1 border border-emerald-200 dark:border-emerald-700">
                <BsStars size={14} className="text-emerald-600 dark:text-gold-400" />
              </div>
            )}
            
            <div className={`max-w-[75%] rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white rounded-br-none' 
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-gray-700'
            }`}>
              {msg.content}
            </div>
            
            {msg.role === 'user' && (
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center ml-2 shrink-0 self-end mb-1">
                <BiUser size={14} className="text-gray-500 dark:text-gray-400" />
              </div>
            )}
          </div>
        ))}

        {/* ANIMASI TYPING (Saat Loading) */}
        {isLoading && (
          <div className="flex justify-start animate-fade-in-up">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mr-2 shrink-0 self-end mb-1 border border-emerald-200 dark:border-emerald-700">
              <BsStars size={14} className="text-emerald-600 dark:text-gold-400" />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-bl-none p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-1.5">
              <div className="w-2 h-2 bg-gray-300 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-300 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-300 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA (Melayang di atas Bottom Navigation) */}
      <div className="fixed bottom-[72px] left-0 w-full px-4 py-3 bg-transparent z-30">
        <div className="max-w-md mx-auto flex items-center bg-white dark:bg-gray-800 p-2 rounded-full shadow-xl border border-gray-200 dark:border-gray-700 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tulis pesan atau pertanyaan..."
            className="flex-1 bg-transparent px-4 py-2 text-sm text-gray-700 dark:text-gray-200 outline-none w-full"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 shadow-md"
          >
            <BiSend size={20} className={input.trim() ? "translate-x-0.5" : ""} />
          </button>
        </div>
      </div>
      
      {/* Background gradient agar area input tidak bertabrakan dengan chat yang di-scroll */}
      <div className="fixed bottom-[64px] left-0 w-full h-24 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent dark:from-gray-900 dark:via-gray-900/80 z-20 pointer-events-none"></div>
    </div>
  );
}