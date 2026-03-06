import { GoogleGenerativeAI } from "@google/generative-ai";

export const callGeminiAPI = async (prompt: string, retries = 3): Promise<string> => {
  // 1. Kumpulkan semua kunci dari Vercel / .env
  const apiKeys = [
    process.env.NEXT_PUBLIC_GEMINI_API_KEY,   // Kunci 1 (Utama)
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_2, // Kunci 2 (Cadangan 1)
    process.env.NEXT_PUBLIC_GEMINI_API_KEY_3, // Kunci 3 (Cadangan 2)
  ].filter(Boolean) as string[]; // filter(Boolean) membuang kunci yang kosong

  if (apiKeys.length === 0) {
    throw new Error("Tidak ada satupun API Key yang ditemukan!");
  }

  // 2. Pilih satu kunci secara ACAK setiap kali fungsi dipanggil
  const randomKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];
  
  const genAI = new GoogleGenerativeAI(randomKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  try {
    console.log(`Menggunakan kunci rahasia acak... Memanggil gemini-2.5-flash...`);
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text;
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    
    // Auto-Retry kalau kena limit (429)
    if (err?.status === 429 && retries > 0) {
      console.warn(`Satu API Key kena limit. Mencoba ulang dengan kunci lain dalam 2 detik... (Sisa retry: ${retries - 1})`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return callGeminiAPI(prompt, retries - 1); // Akan mengambil kunci acak baru saat dipanggil ulang!
    }
    
    console.error("Gemini API Error Akhir:", error);
    throw new Error("Gagal mengambil respons dari AI. Silakan coba lagi nanti.");
  }
};
